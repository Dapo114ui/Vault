// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice DIA Oracle's standard key-value price feed interface. `value` is
/// 1e8-scaled USD price, `timestamp` is the last update time (seconds).
/// Callers should check staleness against `timestamp` before trusting a
/// price -- this draft does not yet enforce a max staleness window.
interface IDIAOracle {
    function getValue(string memory key) external view returns (uint128 value, uint128 timestamp);
}
