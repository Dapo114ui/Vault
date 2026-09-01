// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IDIAOracle.sol";

/// @notice Test-only stand-in for DIA's oracle, with owner-settable prices and
/// an overridable update time so staleness handling can be exercised.
contract MockDIAOracle is IDIAOracle {
    mapping(string => uint128) public prices;
    mapping(string => uint128) public timestamps;

    function setPrice(string calldata key, uint128 price) external {
        prices[key] = price;
        timestamps[key] = uint128(block.timestamp);
    }

    function setPriceAt(string calldata key, uint128 price, uint128 updatedAt) external {
        prices[key] = price;
        timestamps[key] = updatedAt;
    }

    function getValue(string memory key) external view returns (uint128 value, uint128 timestamp) {
        return (prices[key], timestamps[key]);
    }
}
