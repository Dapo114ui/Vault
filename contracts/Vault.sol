// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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
contract Vault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable baseAsset;
    ShareToken public immutable shareToken;
    RiskManager public immutable riskManager;
    IEcodexRouter public immutable router;
    IDIAOracle public immutable oracle;

    address public strategyExecutor;
    address public feeRecipient;
    uint256 public performanceFeeBps; // e.g. 2000 = 20%
    uint256 public highWaterMark; // NAV per share, 1e18-scaled, in baseAsset terms

    // Non-base assets the vault may hold after swaps, tracked so NAV can
    // price them via the oracle without scanning arbitrary balances.
    address[] public trackedAssets;
    mapping(address => bool) public isTrackedAsset;
    mapping(address => string) public oracleKeys; // asset => DIA oracle key, e.g. "X1/USD"

    uint256 private constant PRECISION = 1e18;
    uint256 private constant BPS_DENOMINATOR = 10_000;

    event Deposit(address indexed user, uint256 assetsIn, uint256 sharesOut);
    event Withdraw(address indexed user, uint256 sharesIn, uint256 assetsOut);
    event PerformanceFeeCharged(uint256 feeShares, uint256 navPerShareAtCharge);
    event SwapExecuted(address[] path, uint256 amountIn, uint256 amountOut);
    event StrategyExecutorUpdated(address indexed strategyExecutor);
    event AssetTracked(address indexed asset, string oracleKey);

    error OnlyStrategyExecutor();
    error ZeroAmount();
    error InsufficientShares();
    error AssetNotTracked(address asset);
    error AssetAlreadyTracked(address asset);
    error InvalidPath();

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
        uint256 performanceFeeBps_
    ) Ownable(owner_) {
        baseAsset = baseAsset_;
        shareToken = shareToken_;
        riskManager = riskManager_;
        router = router_;
        oracle = oracle_;
        feeRecipient = feeRecipient_;
        performanceFeeBps = performanceFeeBps_;
        highWaterMark = PRECISION; // starts at 1.0 baseAsset per share
    }

    // --- admin ---

    function setStrategyExecutor(address executor) external onlyOwner {
        strategyExecutor = executor;
        emit StrategyExecutorUpdated(executor);
    }

    function trackAsset(address asset, string calldata oracleKey) external onlyOwner {
        if (isTrackedAsset[asset]) revert AssetAlreadyTracked(asset);
        isTrackedAsset[asset] = true;
        oracleKeys[asset] = oracleKey;
        trackedAssets.push(asset);
        emit AssetTracked(asset, oracleKey);
    }

    // --- accounting ---

    /// @notice Vault NAV in baseAsset terms: idle baseAsset plus the priced
    /// value of every tracked non-base asset the vault currently holds.
    function nav() public view returns (uint256 totalNav) {
        totalNav = baseAsset.balanceOf(address(this));
        uint256 len = trackedAssets.length;
        for (uint256 i = 0; i < len; i++) {
            address asset = trackedAssets[i];
            uint256 bal = IERC20(asset).balanceOf(address(this));
            if (bal == 0) continue;
            (uint128 price, ) = oracle.getValue(oracleKeys[asset]);
            // DIA prices are 1e8-scaled; this draft assumes both the priced
            // asset and baseAsset use 18 decimals. Revisit before
            // supporting non-18-decimal tokens (e.g. USDT's 6).
            totalNav += (bal * price) / 1e8;
        }
    }

    function navPerShare() public view returns (uint256) {
        uint256 supply = shareToken.totalSupply();
        if (supply == 0) return PRECISION;
        return (nav() * PRECISION) / supply;
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

    function deposit(uint256 amount) external nonReentrant returns (uint256 sharesOut) {
        if (amount == 0) revert ZeroAmount();
        crystallizePerformanceFee();

        uint256 supply = shareToken.totalSupply();
        uint256 navBefore = nav();
        baseAsset.safeTransferFrom(msg.sender, address(this), amount);

        sharesOut = supply == 0 ? amount : (amount * supply) / navBefore;
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
    ) external onlyStrategyExecutor nonReentrant returns (uint256[] memory amounts) {
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
            (uint128 price, ) = oracle.getValue(oracleKeys[tokenOut]);
            uint256 exposureValue = (outBal * price) / 1e8;
            riskManager.checkAssetExposure(exposureValue, navAfterTrade);
        }
        riskManager.checkDrawdown(navPerShare(), highWaterMark);

        emit SwapExecuted(path, amountIn, amounts[amounts.length - 1]);
    }
}
