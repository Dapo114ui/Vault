// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IDIAOracle.sol";

/// @notice Test-only stand-in for DIA's oracle, with owner-settable prices.
contract MockDIAOracle is IDIAOracle {
    mapping(string => uint128) public prices;

    function setPrice(string calldata key, uint128 price) external {
        prices[key] = price;
    }

    function getValue(string memory key) external view returns (uint128 value, uint128 timestamp) {
        return (prices[key], uint128(block.timestamp));
    }
}
