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

## 3. Draft grant application once MVP scope and timeline are firm

**Not started — blocked on #1's mainnet-timeline follow-up.** The
application form is at
`airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`. Worth drafting
once the mainnet-timeline question from #1 is resolved, since the
90–120 day delivery plan the application asks for should be phased against
Ecodex's actual mainnet availability (testnet-first delivery, mainnet
trading gated on Ecodex's own launch) rather than assumed concurrent.
