// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Vault.sol";
import "./ShareToken.sol";
import "./RiskManager.sol";
import "./StrategyExecutor.sol";
import "./interfaces/IEcodexRouter.sol";
import "./interfaces/IDIAOracle.sol";

/// @notice Deploys a Vault plus its ShareToken, RiskManager and
/// StrategyExecutor as one unit, so each strategy gets an isolated,
/// independently risk-capped vault instance sharing one Ecodex router and
/// DIA oracle.
contract VaultFactory is Ownable {
    IEcodexRouter public immutable router;
    IDIAOracle public immutable oracle;

    address[] public vaults;

    event VaultDeployed(
        address indexed vault,
        address indexed shareToken,
        address indexed strategyExecutor,
        address riskManager,
        address trader
    );

    struct DeployParams {
        IERC20 baseAsset;
        string shareName;
        string shareSymbol;
        address trader;
        address feeRecipient;
        uint256 performanceFeeBps;
        uint256 maxOracleAge;
        RiskManager.Caps caps;
    }

    constructor(address owner_, IEcodexRouter router_, IDIAOracle oracle_) Ownable(owner_) {
        router = router_;
        oracle = oracle_;
    }

    function deployVault(DeployParams calldata p) external onlyOwner returns (address vaultAddr) {
        address realOwner = owner();

        ShareToken shareToken = new ShareToken(p.shareName, p.shareSymbol, address(this));
        RiskManager riskManager = new RiskManager(realOwner, p.caps);

        // Vault is temporarily owned by the factory so it can wire up the
        // strategy executor below, then ownership moves to realOwner.
        Vault vault = new Vault(
            address(this),
            p.baseAsset,
            shareToken,
            riskManager,
            router,
            oracle,
            p.feeRecipient,
            p.performanceFeeBps,
            p.maxOracleAge
        );
        vaultAddr = address(vault);

        shareToken.setVault(vaultAddr);

        StrategyExecutor executor = new StrategyExecutor(realOwner, vaultAddr, p.trader);
        vault.setStrategyExecutor(address(executor));
        vault.transferOwnership(realOwner);

        vaults.push(vaultAddr);
        emit VaultDeployed(vaultAddr, address(shareToken), address(executor), address(riskManager), p.trader);
    }

    function vaultsCount() external view returns (uint256) {
        return vaults.length;
    }
}
