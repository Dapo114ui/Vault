// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Test-only mintable ERC20 standing in for USDT/WX1/etc.
contract MockERC20 is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @dev Test-only: lets tests simulate a losing trade's NAV impact
    /// directly, without routing it through the risk-checked swap path.
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
