// Same local stack as deploy-local.js, but with a 6-decimal base asset, so
// the frontend can be exercised against the decimal handling that a real
// USDT deployment will hit.
const { ethers } = require("hardhat");

async function main() {
  const [deployer, trader, feeRecipient, demoUser] = await ethers.getSigners();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const baseAsset = await MockERC20.deploy("Mock USDT", "mUSDT", 6);
  const wx1 = await MockERC20.deploy("Mock Wrapped X1", "mWX1", 18);
  await baseAsset.waitForDeployment();
  await wx1.waitForDeployment();

  const MockDIAOracle = await ethers.getContractFactory("MockDIAOracle");
  const oracle = await MockDIAOracle.deploy();
  await oracle.waitForDeployment();
  await oracle.setPrice("WX1/USD", 100_000_000n);

  const MockEcodexRouter = await ethers.getContractFactory("MockEcodexRouter");
  const router = await MockEcodexRouter.deploy();
  await router.waitForDeployment();

  const VaultFactory = await ethers.getContractFactory("VaultFactory");
  const factory = await VaultFactory.deploy(
    deployer.address,
    await router.getAddress(),
    await oracle.getAddress()
  );
  await factory.waitForDeployment();

  const tx = await factory.deployVault({
    baseAsset: await baseAsset.getAddress(),
    shareName: "USDT Vault Share",
    shareSymbol: "vUSDT",
    trader: trader.address,
    feeRecipient: feeRecipient.address,
    performanceFeeBps: 2_000,
    maxOracleAge: 3600,
    depositCap: 0n, // uncapped in tests/scripts unless set explicitly
    caps: {
      maxPositionSize: 25_000n * 10n ** 6n,
      maxSingleAssetBps: 4_000,
      maxDrawdownBps: 1_500,
    },
  });
  const receipt = await tx.wait();
  const deployed = receipt.logs
    .map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((p) => p && p.name === "VaultDeployed");

  const vault = await ethers.getContractAt("Vault", deployed.args.vault);
  await vault.connect(deployer).trackAsset(await wx1.getAddress(), "WX1/USD");
  await baseAsset.mint(demoUser.address, 10_000n * 10n ** 6n);

  console.log("\n--- 6-decimal local deployment ---");
  console.log("baseAsset (6dp):", await baseAsset.getAddress());
  console.log("vault:          ", deployed.args.vault);
  console.log("factory:        ", await factory.getAddress());
  console.log("demo user:      ", demoUser.address);
  console.log(`\nNEXT_PUBLIC_VAULT_FACTORY_ADDRESS=${await factory.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
