# X1 EcoChain Grant Application — draft

Category: **Finance & Commerce (DeFi)** · Form:
`airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`

> **Before submitting**, fill the four `[TO FILL]` items below, and confirm
> the program is still accepting applications — it was announced October 2025
> and no deadline is published either way.
>
> This draft is organised around what the program says it evaluates on
> (90–120 day delivery, security and code quality, GTM, measurable on-chain
> activity, sustainability). The live form may slice the same material
> differently; the content should transfer.

| | |
|---|---|
| Applicant | `[TO FILL]` — name / entity, and whether solo or a team |
| Contact | `[TO FILL]` — email, Telegram or X handle |
| Payout address | `[TO FILL]` — **a fresh wallet**, not the testnet deployer |
| Amount requested | `[TO FILL]` — see *Budget*, which proposes $85,000 |

---

## One-line summary

A vault protocol for X1: depositors buy pro-rata shares in a strategy vault,
a designated trader trades the pooled funds through Ecodex without ever
taking custody, and hard risk caps enforced in the contract revert any trade
that breaches them.

## What already exists

This is not a proposal for something unbuilt. A working version is deployed
and usable today on the Maculatus testnet:

| | |
|---|---|
| Live app | https://x1vault.vercel.app |
| Source | https://github.com/Dapo114ui/Vault |
| VaultFactory | `0x76830898D4deC2E2D71055a553896FDECA29B070` |
| Vault (vUSDT) | `0x323fa03BB4437A0962131a405102A37D570A05FD` |
| First deposit | block 10310728 |

A real deposit and a real withdrawal have been executed end-to-end through
the deployed frontend against these contracts — USDT in, shares minted
pro-rata to NAV, shares burned, USDT out, balances reconciling exactly. The
activity feed in the app reads those events straight back off-chain.

The contract suite has 20 passing tests covering pro-rata accounting, all
three risk caps reverting on breach, high-water-mark fee behaviour through a
drawdown-and-recovery cycle, and decimal handling across mixed-decimal
assets.

**What is deliberately not done yet:** no security audit, and trading is not
switched on — the deployed vault holds only its base asset. Both are scoped
below.

## The problem

X1 will have a DEX at mainnet. What it will not automatically have is a way
for someone who is not a trader to get exposure to someone who is, without
handing over their coins.

Today the options on any young chain are: trade yourself, or send funds to
someone who promises to trade them for you. The first excludes most people.
The second is how most retail losses happen — not through bad trades, but
through custody.

## How this solves it

Four properties, each enforced by the contract rather than by policy:

**The trader never holds the money.** Funds sit in the Vault contract. The
designated trader can call exactly one function — a swap through the Ecodex
router — and there is no code path by which they can withdraw to their own
address. Custody risk is removed structurally, not promised.

**Ownership is pro-rata and continuous.** Depositors mint ERC-20 share
tokens against the vault's live NAV and burn them to redeem. No lockups, no
queue, no manual settlement. Someone depositing after the vault has grown
pays the higher NAV/share and is not diluted by earlier gains.

**Risk caps revert trades.** A RiskManager holds three limits — maximum
position size per trade, maximum share of NAV in any single non-base asset,
and maximum drawdown from the high-water mark. Each is checked around every
trade and reverts on breach. A trader cannot exceed a cap by mistake or on
purpose; the transaction simply fails.

**Fees only on genuine new profit.** The performance fee crystallises only
on NAV/share above the vault's all-time high. A vault that falls and recovers
charges nothing for the recovery — the depositor is not billed twice for the
same gain.

Each strategy gets its own vault, share token, risk caps and trader,
deployed as one unit by the factory. One strategy blowing up cannot touch
another's funds.

## Why X1, specifically

**It routes volume to Ecodex.** Every strategy trade is a swap through the
Ecodex router. A vault with meaningful TVL is a persistent, non-speculative
source of DEX volume rather than a one-off user.

**It is a primitive, not just an app.** The factory means other teams can
deploy their own strategy vaults on top of it without writing accounting or
risk code. That compounds into the 15+ dApps already building on X1 instead
of competing with them.

**It gives testnet users something to do that produces real state.** The
deposit/withdraw vault works today without a DEX, so it generates on-chain
activity during the testnet phase rather than waiting for mainnet.

## Sustainability

Stated plainly, because the honest version is more credible than the
alternative: a vault contract is not a green technology in itself. What can
be said accurately is that it is **computationally light by design**, which
matters on a chain whose validator set is 3 Wh X1Nodes.

There are no keeper bots, no off-chain solver network, and no scheduled
rebalancing. NAV is computed on read rather than maintained by a background
process. Fees crystallise only when someone interacts with the vault. The
only transactions the protocol generates are the ones users and the trader
actually initiate. Compared with the yield protocols this competes with
architecturally — which typically run continuous off-chain infrastructure —
it adds TVL and useful transaction volume to X1's low-energy validator set
without adding an always-on compute load beside it.

## Delivery plan — 90 to 120 days

Deliberately phased. X1's mainnet target of Q1 2026 has slipped by two to
three quarters with no new public date, so any plan promising mainnet
trading on a fixed calendar date is promising something the applicant does
not control. Everything below that carries a date is within our control;
the one thing that is not is expressed relative to X1's own launch.

**Phase 0 — complete.** Contracts, tests, frontend, testnet deployment, and a
verified deposit/withdraw round-trip on-chain. Delivered before applying.

**Phase 1, days 1–30 — trading on testnet.** Verify Ecodex's deployed router
ABI against our interface and correct it if it differs; integrate DIA price
feeds for non-base assets with staleness rejection; deploy a trading-enabled
vault to Maculatus and demonstrate a strategy trade with the risk caps
firing on a deliberate breach. *Milestone: a public testnet vault that
trades.*

**Phase 2, days 30–75 — audit.** Engage an audit firm, remediate findings,
publish the report in the repository. This is the long pole and the reason
the grant is worth more than the code. *Milestone: published audit report
and remediation commits.*

**Phase 3, days 75–110 — production hardening and GTM.** Deposit caps for a
guarded launch, an emergency pause, subgraph or indexer for historical
performance, strategy operator documentation, and onboarding for the first
external strategy operators. *Milestone: two external operators running
testnet vaults.*

**Phase 4 — mainnet, gated on X1.** Mainnet deployment within **three weeks
of Ecodex having live mainnet liquidity**. Stated as a dependency rather
than a date, because it is one.

## Budget — proposed $85,000

`[TO FILL: adjust to your actual costs and time]`

| Line | Amount | Note |
|---|---|---|
| Security audit | $35,000 | The single largest item and the main reason to fund this rather than let it ship unaudited |
| Engineering, ~3.5 months | $34,000 | Phases 1–3 |
| Frontend, indexing, infrastructure | $9,000 | Subgraph/indexer, hosting, monitoring |
| Contingency | $7,000 | Audit remediation overrun |

The floor that still produces something worth having is **$45,000** — audit
plus Phase 1 only, dropping the operator-onboarding work. Below that the
audit cannot be paid for, and an unaudited vault holding other people's
money is not something worth shipping.

## Metrics we will be judged on

Offered as commitments, measurable on-chain by anyone:

| Metric | Target by day 120 |
|---|---|
| Vaults deployed by the factory | ≥ 5 |
| Distinct depositor addresses | ≥ 100 |
| Cumulative deposit transactions | ≥ 400 |
| Strategy trades routed through Ecodex | ≥ 250 |
| Independent strategy operators | ≥ 2 |
| Published audit | 1, with remediation commits |

All verifiable from the factory's `VaultDeployed` events and each vault's
`Deposit` / `Withdraw` / `SwapExecuted` events.

## Risks, stated plainly

**The Ecodex router ABI is not yet verified.** Our interface assumes a
Uniswap-V2-shaped router, which is the common pattern, but this has not been
confirmed against Ecodex's deployed contract. If it differs, the integration
layer changes — Phase 1 is scoped to absorb that.

**No audit yet.** The protocol handles other people's funds and has not been
independently reviewed. This is why no mainnet deployment is proposed before
Phase 2, and why the app carries a visible "Not audited" notice today.

**Mainnet timing is outside our control.** Phase 4 depends on X1 and Ecodex
reaching mainnet with real liquidity. Phases 0–3 do not, which is why the
grant's deliverables are structured to complete regardless.

**A vault is only as good as its strategy.** The protocol guarantees custody
safety, honest accounting and enforced risk caps. It does not guarantee
returns, and the interface says so rather than advertising a projected APY.

## Team

`[TO FILL]` — who is building this, relevant background, and prior shipped
work. If solo, say so: a working deployed protocol with a passing test suite
is itself the strongest evidence available, and reviewers respond better to
a straightforward account than to an inflated one.
