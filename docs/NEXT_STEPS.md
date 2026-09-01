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

## 3. Remaining work

**Blocker:** find Ecodex's router and DIA's oracle addresses on X1,
verify the real router ABI against `IEcodexRouter`'s assumed Uniswap-V2 shape,
then redeploy with trading enabled.

## 4. Draft grant application once MVP scope and timeline are firm

**Not started — blocked on #1's mainnet-timeline follow-up.** The
application form is at
`airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`. Worth drafting
once the mainnet-timeline question from #1 is resolved, since the
90–120 day delivery plan the application asks for should be phased against
Ecodex's actual mainnet availability (testnet-first delivery, mainnet
trading gated on Ecodex's own launch) rather than assumed concurrent.
