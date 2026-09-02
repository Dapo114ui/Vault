# Vault — X1 EcoChain DeFi Grant Scope

A single-strategy, factory-deployed vault product being scoped for the
[X1 EcoChain Grant Program](https://grant.x1ecochain.com/) ($5M pool,
$25K–$400K per project, 90–120 day deployment window). Depositors buy
pro-rata shares in a vault; a designated trader/strategy trades the vault's
own funds through [Ecodex](https://x1ecochain.com/) (X1's native DEX);
profit above the vault's all-time-high NAV/share is charged a performance
fee at withdrawal, with hard, on-chain risk caps enforced on every trade.

A deposit-and-withdraw-only v1 is **live on X1's Maculatus testnet**
(chain ID `10778`) — addresses in `docs/DEPLOYMENTS.md`. Trading through
Ecodex is not enabled yet; see "What's intentionally not here yet" below.

See `docs/RESEARCH_NOTES.md` for the market research behind the scoping
decisions and `docs/NEXT_STEPS.md` for the live status of the plan's open
items.

## Architecture

```
VaultFactory
  └─ deployVault(...) per strategy
       ├─ ShareToken     ERC-20 pro-rata ownership, mint/burn gated to its Vault
       ├─ RiskManager    hardcoded position/exposure/drawdown caps, reverts on breach
       ├─ Vault          deposit/withdraw, NAV accounting, HWM performance fee, swap entrypoint
       └─ StrategyExecutor  onlyTrader entrypoint that calls back into the Vault to trade
```

- **`contracts/Vault.sol`** — holds all vault funds directly (the trader
  never receives custody). `deposit`/`withdraw` mint/burn `ShareToken`
  pro-rata to NAV. `executeSwap` (callable only by the vault's
  `StrategyExecutor`) routes a trade through Ecodex's router and then runs
  the RiskManager's post-trade checks. `nav()` prices idle base asset plus
  any tracked non-base asset via DIA Oracle feeds. `crystallizePerformanceFee()`
  mints fee shares to `feeRecipient` only for NAV/share above the prior
  high-water mark, so a drawdown recovery is never double-charged.
- **`contracts/ShareToken.sol`** — plain ERC-20, mint/burn restricted to
  its Vault.
- **`contracts/RiskManager.sol`** — `Caps { maxPositionSize,
  maxSingleAssetBps, maxDrawdownBps }`, each enforced as a revert
  (`PositionTooLarge`, `AssetExposureTooHigh`, `DrawdownExceeded`), not a
  soft warning.
- **`contracts/StrategyExecutor.sol`** — the only address the designated
  trader can call; forwards to `Vault.executeSwap`.
- **`contracts/VaultFactory.sol`** — deploys a `ShareToken` + `RiskManager`
  + `Vault` + `StrategyExecutor` as one unit per strategy, so each vault's
  risk caps and trader are isolated from every other vault. Deployment is
  gated to the owner plus an owner-curated allowlist
  (`setDeployer`/`isApprovedDeployer`), and every parameter is bounded:
  the performance fee cannot exceed `MAX_PERFORMANCE_FEE_BPS` (30%), the
  basis-point caps cannot exceed 100%, a zero position cap (which would
  revert every trade) is rejected, and the trader, fee recipient and base
  asset cannot be the zero address. Approved operators deploy vaults they
  trade, but the factory owner owns the resulting Vault, RiskManager and
  StrategyExecutor — so **an operator cannot widen their own risk caps or
  reassign their own trader**. `vaultDeployer` records who deployed each
  vault.
- **`contracts/interfaces/`** — `IEcodexRouter` (assumed Uniswap-V2-style
  router surface — **unverified against Ecodex's actual deployed ABI**,
  see research notes), `IDIAOracle` (DIA's standard `getValue(key)`
  key/value feed interface).
- **`contracts/mocks/`** — test doubles for the router, oracle and ERC-20
  base/quote assets, used only by the test suite (and `scripts/deploy-local.js`,
  below).
- **`frontend/`** — Next.js + wagmi/viem dashboard: connect a wallet, browse
  deployed vaults, deposit/withdraw. See `frontend/README.md` for local
  development (against a Hardhat node, since nothing's on X1 yet) and
  Vercel deployment setup.

## Deploying

`scripts/deploy-x1.js` deploys the factory (and a first vault) to a real
network. It takes every external address from the environment and deploys
no mocks:

```bash
BASE_ASSET_ADDRESS=0x…            # required: the ERC-20 the vault accounts in
ROUTER_ADDRESS=0x…                # optional: Ecodex router
ORACLE_ADDRESS=0x…                # optional: DIA oracle
npx hardhat run scripts/deploy-x1.js --network x1Testnet
```

A vault that only ever holds its base asset never calls the router or the
oracle, so both may be omitted for a **deposit-and-withdraw-only v1** while
Ecodex's and DIA's addresses on X1 are still unconfirmed. The script wires
`address(0)` in that case and says so loudly, rather than pointing at a
placeholder. It prints the three `NEXT_PUBLIC_*` values to set in Vercel;
setting them takes the frontend out of preview mode.

## What's intentionally not here yet

- **Ecodex router and DIA oracle addresses on X1**, and with them the real
  router ABI — `IEcodexRouter` still assumes a Uniswap-V2 shape. Trading
  is blocked on these; deposits and withdrawals are not.
- **Audit** — flagged in the grant plan as the likely long pole against the
  90–120 day window; not started.

## Development

```bash
npm install
npx hardhat compile
npx hardhat test
```

`scripts/deploy-local.js` deploys the full mock stack (base asset, WX1,
DIA oracle mock, Ecodex router mock, factory, one vault) to a local Hardhat
node — useful for exercising `frontend/` against real contract calls
before anything is deployed to X1 itself:

```bash
npx hardhat node                                          # separate terminal
npx hardhat run scripts/deploy-local.js --network localhost
```

Requires Node.js and npm. Solidity 0.8.24, OpenZeppelin Contracts v5,
Hardhat 2 + ethers v6 + Mocha/Chai (via `@nomicfoundation/hardhat-toolbox`).

Note for anyone compiling in a network-restricted environment: this
repo's `hardhat.config.js` overrides Hardhat's solc download to load the
compiler from the locally npm-installed `solc` package instead of fetching
a binary from `binaries.soliditylang.org`, which some sandboxes block.

Network config for `x1Testnet` / `x1Mainnet` in `hardhat.config.js` reads
`X1_TESTNET_RPC_URL`, `X1_TESTNET_CHAIN_ID`, `X1_MAINNET_RPC_URL`,
`X1_MAINNET_CHAIN_ID` and `DEPLOYER_PRIVATE_KEY` from a local `.env` file
(not committed). The testnet defaults are confirmed — they are what the
deployment in `docs/DEPLOYMENTS.md` was made through. The mainnet ones are
not; X1 mainnet is not live (see `docs/RESEARCH_NOTES.md`).
