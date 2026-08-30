// Deploys the full mock + vault stack to a local Hardhat node, for
// exercising the frontend against real contract calls without depending on
// an X1 EcoChain RPC/address that isn't confirmed yet (see
// docs/RESEARCH_NOTES.md). Not used for testnet/mainnet deployment.
const { ethers } = require("hardhat");

async function main() {
  const [deployer, trader, feeRecipient, demoUser] = await ethers.getSigners();

  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const baseAsset = await MockERC20.deploy("Mock USDT", "mUSDT");
  const wx1 = await MockERC20.deploy("Mock Wrapped X1", "mWX1");
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
    shareName: "Demo Vault Share",
    shareSymbol: "dvSHARE",
    trader: trader.address,
    feeRecipient: feeRecipient.address,
    performanceFeeBps: 2_000,
    caps: {
      maxPositionSize: ethers.parseEther("10000"),
      maxSingleAssetBps: 10_000,
      maxDrawdownBps: 1_000,
    },
  });
  const receipt = await tx.wait();
  const deployedEvent = receipt.logs
    .map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === "VaultDeployed");
  const vaultAddress = deployedEvent.args.vault;
  const vault = await ethers.getContractAt("Vault", vaultAddress);
  await vault.connect(deployer).trackAsset(await wx1.getAddress(), "WX1/USD");

  // Fund the demo account (Hardhat's default account #3) so the frontend has
  // something to deposit/approve immediately.
  await baseAsset.mint(demoUser.address, ethers.parseEther("10000"));

  console.log("\n--- Local deployment complete ---");
  console.log("baseAsset (mUSDT):     ", await baseAsset.getAddress());
  console.log("wx1 (mWX1):            ", await wx1.getAddress());
  console.log("oracle:                ", await oracle.getAddress());
  console.log("router:                ", await router.getAddress());
  console.log("factory:               ", await factory.getAddress());
  console.log("vault:                 ", vaultAddress);
  console.log("demo user (funded):    ", demoUser.address);
  console.log("\nfrontend/.env.local:");
  console.log(`NEXT_PUBLIC_CHAIN_ID=31337`);
  console.log(`NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545`);
  console.log(`NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=${await factory.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
