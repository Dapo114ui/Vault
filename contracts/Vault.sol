// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./ShareToken.sol";
import "./RiskManager.sol";
import "./interfaces/IEcodexRouter.sol";
import "./interfaces/IDIAOracle.sol";

/// @title Vault
/// @notice Single-strategy vault: users deposit `baseAsset` for pro-rata
/// shares, the designated StrategyExecutor trades vault-held funds through
/// Ecodex, and profit above the vault's all-time-high NAV/share is charged
/// a performance fee at crystallization. One instance per strategy,
/// deployed by VaultFactory.
contract Vault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable baseAsset;
    ShareToken public immutable shareToken;
    RiskManager public immutable riskManager;
    IEcodexRouter public immutable router;
    IDIAOracle public immutable oracle;

    address public strategyExecutor;
    address public feeRecipient;
    uint256 public performanceFeeBps; // e.g. 2000 = 20%
    uint256 public highWaterMark; // NAV per share, 1e18-scaled

    /// @notice Decimals of `baseAsset`. NAV and withdrawals are denominated in
    /// this asset's own units (USDT's 6, not 18), while shares are always
    /// 18-decimal, so the two scales must be converted between explicitly.
    uint8 public immutable baseDecimals;

    // Non-base assets the vault may hold after swaps, tracked so NAV can
    // price them via the oracle without scanning arbitrary balances.
    address[] public trackedAssets;
    mapping(address => bool) public isTrackedAsset;
    mapping(address => string) public oracleKeys; // asset => DIA oracle key, e.g. "X1/USD"
    mapping(address => uint8) public assetDecimals;

    /// @notice Max age of a DIA price before NAV reverts. A stale feed makes
    /// every share price wrong, so the vault refuses to quote rather than
    /// mint or burn against a price it cannot trust.
    uint256 public maxOracleAge;

    /// @notice Ceiling on the vault's NAV. Zero means no ceiling, matching
    /// how maxOracleAge treats zero. Used to guard a launch while the
    /// protocol is unaudited.
    uint256 public depositCap;

    uint256 private constant PRECISION = 1e18;
    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant ORACLE_SCALE = 1e8; // DIA prices are 1e8-scaled USD

    event Deposit(address indexed user, uint256 assetsIn, uint256 sharesOut);
    event Withdraw(address indexed user, uint256 sharesIn, uint256 assetsOut);
    event PerformanceFeeCharged(uint256 feeShares, uint256 navPerShareAtCharge);
    event SwapExecuted(address[] path, uint256 amountIn, uint256 amountOut);
    event StrategyExecutorUpdated(address indexed strategyExecutor);
    event AssetTracked(address indexed asset, string oracleKey);

    event MaxOracleAgeUpdated(uint256 maxOracleAge);
    event DepositCapUpdated(uint256 depositCap);

    error OnlyStrategyExecutor();
    error ZeroAmount();
    error InsufficientShares();
    error AssetNotTracked(address asset);
    error AssetAlreadyTracked(address asset);
    error InvalidPath();
    error UnsupportedDecimals(address token, uint8 decimals);
    error StalePrice(address asset, uint256 updatedAt);
    error InvalidPrice(address asset);
    error DepositCapExceeded(uint256 attemptedNav, uint256 cap);

    modifier onlyStrategyExecutor() {
        if (msg.sender != strategyExecutor) revert OnlyStrategyExecutor();
        _;
    }

    constructor(
        address owner_,
        IERC20 baseAsset_,
        ShareToken shareToken_,
        RiskManager riskManager_,
        IEcodexRouter router_,
        IDIAOracle oracle_,
        address feeRecipient_,
        uint256 performanceFeeBps_,
        uint256 maxOracleAge_,
        uint256 depositCap_
    ) Ownable(owner_) {
        baseAsset = baseAsset_;
        shareToken = shareToken_;
        riskManager = riskManager_;
        router = router_;
        oracle = oracle_;
        feeRecipient = feeRecipient_;
        performanceFeeBps = performanceFeeBps_;
        maxOracleAge = maxOracleAge_;
        depositCap = depositCap_;
        highWaterMark = PRECISION; // starts at 1.0 baseAsset per share

        uint8 d = IERC20Metadata(address(baseAsset_)).decimals();
        // Scaling to 18-decimal share terms multiplies up, so a base asset
        // with more than 18 decimals is out of range rather than merely lossy.
        if (d > 18) revert UnsupportedDecimals(address(baseAsset_), d);
        baseDecimals = d;
    }

    // --- admin ---

    function setStrategyExecutor(address executor) external onlyOwner {
        strategyExecutor = executor;
        emit StrategyExecutorUpdated(executor);
    }

    function trackAsset(address asset, string calldata oracleKey) external onlyOwner {
        if (isTrackedAsset[asset]) revert AssetAlreadyTracked(asset);
        uint8 d = IERC20Metadata(asset).decimals();
        if (d > 18) revert UnsupportedDecimals(asset, d);
        isTrackedAsset[asset] = true;
        oracleKeys[asset] = oracleKey;
        assetDecimals[asset] = d;
        trackedAssets.push(asset);
        emit AssetTracked(asset, oracleKey);
    }

    function setDepositCap(uint256 newCap) external onlyOwner {
        depositCap = newCap;
        emit DepositCapUpdated(newCap);
    }

    /// @notice Halt deposits and trading. Withdrawals are deliberately left
    /// open: a pause that stranded depositors would contradict the whole
    /// point of the vault holding its own funds.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setMaxOracleAge(uint256 newMaxAge) external onlyOwner {
        maxOracleAge = newMaxAge;
        emit MaxOracleAgeUpdated(newMaxAge);
    }

    // --- accounting ---

    /// @notice Vault NAV denominated in `baseAsset`'s own units: idle
    /// baseAsset plus the priced value of every tracked non-base asset.
    /// @dev `baseAsset` is assumed to be USD-denominated (a USD stablecoin),
    /// since DIA quotes assets in USD and NAV is reported in base units. A
    /// non-USD base asset would need its own feed to convert through.
    function nav() public view returns (uint256 totalNav) {
        totalNav = baseAsset.balanceOf(address(this));
        uint256 len = trackedAssets.length;
        for (uint256 i = 0; i < len; i++) {
            address asset = trackedAssets[i];
            uint256 bal = IERC20(asset).balanceOf(address(this));
            if (bal == 0) continue;
            totalNav += _valueInBase(asset, bal);
        }
    }

    /// @notice Value of `amount` of `asset` in baseAsset units, converting
    /// across both tokens' decimals and the oracle's 1e8 USD scale.
    function _valueInBase(address asset, uint256 amount) internal view returns (uint256) {
        (uint128 price, uint128 updatedAt) = oracle.getValue(oracleKeys[asset]);
        if (price == 0) revert InvalidPrice(asset);
        if (maxOracleAge != 0 && block.timestamp > uint256(updatedAt) + maxOracleAge) {
            revert StalePrice(asset, updatedAt);
        }
        // amount is in 10**assetDecimals; price is USD * 1e8; the result must
        // land in 10**baseDecimals.
        return
            (amount * uint256(price) * (10 ** baseDecimals)) /
            (10 ** assetDecimals[asset] * ORACLE_SCALE);
    }

    /// @notice NAV restated in 18-decimal terms, which is the scale shares are
    /// minted in. Keeps NAV/share near 1.0 regardless of the base asset's own
    /// decimals, so the high-water mark stays comparable across vaults.
    function _navScaled() internal view returns (uint256) {
        return nav() * (10 ** (18 - baseDecimals));
    }

    function navPerShare() public view returns (uint256) {
        uint256 supply = shareToken.totalSupply();
        if (supply == 0) return PRECISION;
        return (_navScaled() * PRECISION) / supply;
    }

    /// @notice Mints performance-fee shares to `feeRecipient` for any profit
    /// above the previous high-water mark, then ratchets the mark up.
    /// Skipped entirely while NAV/share sits below a prior peak, so a
    /// drawdown recovery is never double-charged.
    function crystallizePerformanceFee() public {
        uint256 currentNavPerShare = navPerShare();
        if (currentNavPerShare <= highWaterMark) return;

        uint256 supply = shareToken.totalSupply();
        if (supply > 0) {
            uint256 profitPerShare = currentNavPerShare - highWaterMark;
            uint256 feeValue = (profitPerShare * supply * performanceFeeBps) / (PRECISION * BPS_DENOMINATOR);
            if (feeValue > 0) {
                uint256 feeShares = (feeValue * PRECISION) / currentNavPerShare;
                if (feeShares > 0) {
                    shareToken.mint(feeRecipient, feeShares);
                    emit PerformanceFeeCharged(feeShares, currentNavPerShare);
                }
            }
        }
        highWaterMark = currentNavPerShare;
    }

    // --- deposits / withdrawals ---

    function deposit(uint256 amount) external nonReentrant whenNotPaused returns (uint256 sharesOut) {
        if (amount == 0) revert ZeroAmount();
        crystallizePerformanceFee();

        uint256 supply = shareToken.totalSupply();
        uint256 navBefore = nav();
        // navBefore is measured before the transfer, so this is the NAV the
        // vault would hold once the deposit lands.
        if (depositCap != 0 && navBefore + amount > depositCap) {
            revert DepositCapExceeded(navBefore + amount, depositCap);
        }
        baseAsset.safeTransferFrom(msg.sender, address(this), amount);

        // Seed the vault at 1.0 NAV/share in 18-decimal terms; afterwards the
        // ratio amount/navBefore is unitless, so supply's scale carries over.
        sharesOut = supply == 0
            ? amount * (10 ** (18 - baseDecimals))
            : (amount * supply) / navBefore;
        shareToken.mint(msg.sender, sharesOut);
        emit Deposit(msg.sender, amount, sharesOut);
    }

    function withdraw(uint256 shares) external nonReentrant returns (uint256 assetsOut) {
        if (shares == 0) revert ZeroAmount();
        if (shares > shareToken.balanceOf(msg.sender)) revert InsufficientShares();
        crystallizePerformanceFee();

        uint256 supply = shareToken.totalSupply();
        assetsOut = (shares * nav()) / supply;
        shareToken.burn(msg.sender, shares);
        baseAsset.safeTransfer(msg.sender, assetsOut);
        emit Withdraw(msg.sender, shares, assetsOut);
    }

    // --- strategy execution ---

    /// @notice Routes a swap through Ecodex using vault-held funds. Only the
    /// vault's StrategyExecutor may call this -- the trader never receives
    /// custody. Risk caps are enforced immediately after the swap so a
    /// breach reverts the trade itself.
    function executeSwap(
        address[] calldata path,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external onlyStrategyExecutor nonReentrant whenNotPaused returns (uint256[] memory amounts) {
        if (path.length < 2) revert InvalidPath();
        address tokenOut = path[path.length - 1];
        if (tokenOut != address(baseAsset) && !isTrackedAsset[tokenOut]) {
            revert AssetNotTracked(tokenOut);
        }

        riskManager.checkTradeSize(amountIn);

        IERC20(path[0]).forceApprove(address(router), amountIn);
        amounts = router.swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), deadline);

        uint256 navAfterTrade = nav();
        if (tokenOut != address(baseAsset)) {
            uint256 outBal = IERC20(tokenOut).balanceOf(address(this));
            uint256 exposureValue = _valueInBase(tokenOut, outBal);
            riskManager.checkAssetExposure(exposureValue, navAfterTrade);
        }
        riskManager.checkDrawdown(navPerShare(), highWaterMark);

        emit SwapExecuted(path, amountIn, amounts[amounts.length - 1]);
    }
}
