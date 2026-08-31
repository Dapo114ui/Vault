// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal Uniswap-V2-style router interface for Ecodex, X1
/// EcoChain's native swap/pool/farm DEX. Confirm the exact ABI against
/// Ecodex's deployed router before mainnet integration -- this assumes a
/// standard AMM router surface, which has not yet been verified against
/// Ecodex's actual contracts (see docs/RESEARCH_NOTES.md).
interface IEcodexRouter {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts);
}
