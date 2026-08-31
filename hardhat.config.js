const path = require("path");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;

// This sandbox's network egress policy blocks binaries.soliditylang.org, so
// Hardhat's default compiler download fails. The `solc` npm package ships
// the same compiler as a local soljson build reachable via the (allowed)
// npm registry -- use that instead of letting Hardhat try to fetch one.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion === "0.8.24") {
    const compilerPath = require.resolve("solc/soljson.js");
    return {
      compilerPath,
      isSolcJs: true,
      version: args.solcVersion,
      longVersion: args.solcVersion,
    };
  }
  return runSuper(args);
});

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    // X1 EcoChain testnet (Maculatus). RPC/chainId per the public docs at
    // x1ecochain.gitbook.io — confirm against the live docs before deploying,
    // network parameters change during testnet phases.
    x1Testnet: {
      url: process.env.X1_TESTNET_RPC_URL || "https://testnet-rpc.x1ecochain.com",
      chainId: process.env.X1_TESTNET_CHAIN_ID ? Number(process.env.X1_TESTNET_CHAIN_ID) : undefined,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
    },
    x1Mainnet: {
      url: process.env.X1_MAINNET_RPC_URL || "",
      chainId: process.env.X1_MAINNET_CHAIN_ID ? Number(process.env.X1_MAINNET_CHAIN_ID) : undefined,
      accounts: DEPLOYER_KEY ? [DEPLOYER_KEY] : [],
    },
  },
};
