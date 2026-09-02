# Immediate next steps — status

Tracks the three next steps from the original project brief.

## 1. Check Ecodex TVL/volume to validate liquidity assumption

**Partially done, revised.** Direct TVL/volume figures could not be pulled
in this session (DeFiLlama and X1's own site are blocked by this sandbox's
network egress policy — see `docs/RESEARCH_NOTES.md`). What search-engine
research did surface is more significant than a depth number: **Ecodex is
currently testnet-only** (launched on the Maculatus Testnet), not "already
live" on mainnet as the original brief assumed. The open question isn't
"how deep is Ecodex's liquidity" so much as "does Ecodex have mainnet
liquidity yet at all."

**Follow-up:** pull `defillama.com`'s X1 EcoChain chain page and/or
Ecodex's own app directly (not blocked outside this sandbox) for current
TVL/volume, and re-confirm the mainnet timeline directly against
`x1ecochain.gitbook.io` or X1's official channels before finalizing the
grant application's GTM/timeline sections.

## 2. Scope contract modules against the 90–120 day grant deployment window

**Done, as a draft.** `contracts/` now has a compiling, tested skeleton for
all four modules from the spec (`Vault`, `ShareToken`, `StrategyExecutor`,
`RiskManager`) plus a `VaultFactory` that wires them together per-strategy.
10 Hardhat tests cover pro-rata deposit/withdraw accounting, all three risk
caps (position size, single-asset exposure, drawdown) reverting on breach,
and the high-water-mark performance fee not double-charging through a
drawdown/recovery cycle. See `README.md` for the "what's intentionally not
here yet" list (deployment scripts, decimal handling beyond 18, oracle
staleness checks, audit) — those are the real scope items to size against
the 90–120 day window, now that the core accounting logic exists to size
them against.

**Follow-up:** get an actual audit-firm quote/timeline (flagged in the
brief as the likely long pole) now that there's a concrete, scoped codebase
to send them rather than a description.

## 2b. Deployment readiness (added after the frontend went live)

**Done.** Two deployment-blocking correctness issues in the contracts are
fixed and covered by tests:

- **Decimal handling.** `nav()` assumed 18 decimals for every asset. With a
  6-decimal base asset (as USDT actually is), it added a 6-decimal balance
  to an 18-decimal priced value, putting NAV out by ~10¹² and mispricing
  every deposit and withdrawal. NAV is now denominated in the base asset's
  own units, shares are always 18-decimal, and conversions are explicit.
  `test/Decimals.test.js` pins the exact failure case.
- **Oracle safety.** A stale or zero DIA price now reverts NAV rather than
  silently mispricing shares, with the max age owner-configurable. A vault
  holding only its base asset never consults the oracle at all — which is
  what makes a deposit-only v1 possible before DIA integration exists.

Also added `scripts/deploy-x1.js` for real-network deployment.

**Blockers 1–3 are now done.** X1's testnet chain ID (`10778`) and RPC are
confirmed by a live deployment; a factory and a base-asset-only vault are
deployed and the Vercel app is out of preview mode, reading them. Addresses
are in `DEPLOYMENTS.md`.

## 2c. Frontend was reading the wrong chain

**Fixed.** With the three `NEXT_PUBLIC_*` vars set, the live app still showed
"Strategies 0" and an empty strategies page. Cause: wagmi's config listed the
local Hardhat chain first, and contract reads that don't name a chain fall
back to the config's first chain — so every read in the deployed app went to
`http://127.0.0.1:8545` in the visitor's own browser. Two changes:

- The configured chain is now first whenever `NEXT_PUBLIC_CHAIN_ID` is set,
  and every read names `ACTIVE_CHAIN_ID` explicitly rather than inheriting
  one.
- A wallet on a different network is now visible: a banner offering to switch,
  a sidebar chip that says so, and disabled deposit/withdraw buttons. Reads no
  longer depend on where the wallet is pointed, so vault data loads either way.

Reproduced against a local node before fixing and re-checked after, plus a
deposit and withdraw driven through the browser (NAV 0 → 250 → 150, shares
reconciling exactly on-chain).

## 2d. First real on-chain round-trip

**Deposit done.** A 0.5 USDT deposit into the vault at
`0x323fa03BB4437A0962131a405102A37D570A05FD` was made through the deployed
frontend at block **10310728** by `0x5704…5c2E`: 0.5 USDT in, 0.5 vUSDT
minted at a NAV/share of 1.0, wallet balance 0.853 → 0.353. The activity
feed reads it straight back out of the chain's `Deposit` event.

This is the first measurable on-chain activity, and it exercises the whole
path end to end on a real network — ERC-20 approval, pro-rata share minting,
NAV accounting against an 18-decimal base asset, and the risk caps rendering
in the base asset's own units.

**Still to exercise:** a withdrawal. The burn path has been tested locally
(and in `test/Vault.test.js`) but not yet on X1, so the vault currently holds
real testnet funds through a path that hasn't been proven on this network.
Worth doing before the vault holds anything anyone cares about.

## 2e. Who can create a vault, and with what parameters

**Done in code, pending a redeploy.** The factory premise is that each
strategy is an isolated vault, but `deployVault` was `onlyOwner` with no
interface, so in practice a vault required the owner to run a script. That
caps the on-chain activity the grant is evaluated on at whatever one person
can deploy by hand.

Fully permissionless was rejected for now, for two reasons found by reading
the code rather than assumed:

- `deployVault` validated **nothing** — a 100% performance fee, a zero
  position cap that bricks trading, or a zero trader address all deployed
  happily. On an open factory that means anyone could publish a
  confiscatory vault into the same interface as reviewed ones.
- Every vault is owned by `owner()`, not the caller. Opening the factory
  as-is would have made the protocol owner the governance authority for
  strangers' vaults — liability without any control of the strategy.

So: an owner-curated allowlist, with permissionless deferred until after the
audit (it needs a per-vault ownership redesign, which is a bigger change than
removing a modifier). What shipped:

- `setDeployer` / `isApprovedDeployer`, with the owner always permitted.
  Revoking is forward-looking: vaults already deployed keep working, so a
  policy change never strands depositors.
- Bounds on every deploy parameter — fee ceiling of 30%, basis-point caps
  capped at 100%, non-zero position cap, non-zero trader/fee-recipient/base
  asset. A non-token base asset was already rejected by `Vault`'s
  constructor reading `decimals()` off it.
- `vaultDeployer` plus a `deployer` field on `VaultDeployed`, so the
  interface can name the operator behind a strategy.

The deliberate part worth keeping: an approved operator trades their vault
but does **not** own it, so they cannot widen their own risk caps or
reassign their own trader. The caps stay a protocol guarantee rather than an
operator preference. Verified end-to-end on a node, not just in unit tests.

**The interface caught up too.** `/strategies/new` deploys a vault from the
browser: it resolves the base asset to confirm it is really an ERC-20 and to
learn its decimals (the position cap is denominated in them), mirrors every
one of the factory's bounds client-side so an operator sees the problem
before paying gas, and redirects to the new vault on success. The page reads
the factory to decide what to show — the owner and approved operators get
the form, everyone else gets an explanation and disabled fields. Against the
older factory now live on X1, where `isApprovedDeployer` does not exist,
it falls back to owner-only and says the bounds are advisory rather than
enforced.

The vault page also names the trader, read from `StrategyExecutor.trader()`,
alongside what that address can and cannot do.

## 2f. Trader console

**Done.** `/vault/<address>/trade` lets a vault's designated trader route a
swap, reachable from the vault page by that wallet only.

The design decision worth recording: rather than reimplementing the risk
checks in JavaScript to warn before submitting, the form **simulates the real
call** (`eth_call` against the deployed executor) and reports what the
contract says. Duplicating NAV, oracle and decimal maths in the frontend is
precisely the code path that produced the decimals bug in 2b, and any copy
would drift from the contract over time. Simulation cannot drift.

That distinction is not academic. In testing, a 9,000-unit swap sat well
under the position cap and well under the vault's balance — every check the
frontend could make itself passed — and the simulation still rejected it with
`DrawdownExceeded(3250, 1000)`, because the resulting NAV would have breached
the 10% drawdown cap. No local check could have known that without pricing
the position.

Cheap local checks still run first, for fast feedback: unusable pair, zero
amount, more than the vault holds, above the position cap. A quote comes from
the router's `getAmountsOut` and sets the minimum received from a slippage
tolerance.

Two router conditions are handled explicitly rather than as errors, because
`IEcodexRouter`'s shape is still unverified against Ecodex: a router that
does not answer at all (the trader sets the floor by hand, and the page says
why), and one that quotes zero out (no route or no liquidity — a swap would
return nothing). A vault deployed with no router says trading is impossible
by construction instead of offering a form that cannot work.

## 3. Remaining work

**Blocker:** find Ecodex's router and DIA's oracle addresses on X1,
verify the real router ABI against `IEcodexRouter`'s assumed Uniswap-V2 shape,
then redeploy with trading enabled.

## 4. Draft grant application

**Unblocked.** The mainnet-timeline question that was holding this up is
answered: X1's Q1 2026 mainnet target has slipped by two to three quarters
and no new date is public (see `RESEARCH_NOTES.md`). The delivery plan is
therefore phased — a fixed testnet date the applicant controls, and mainnet
trading expressed relative to Ecodex's own launch rather than a calendar
quarter.

Draft lives in `GRANT_APPLICATION.md`. The form is at
`airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`.

Two things to confirm before submitting:

1. **That the program is still accepting applications.** It was announced in
   October 2025 — about eleven months ago — and while the page still shows
   "Apply Now", no deadline is published either way.
2. **The form's actual field list.** The draft is organised around what the
   program says it evaluates on, not around fields anyone has read; the live
   form may ask for different cuts of the same material.
