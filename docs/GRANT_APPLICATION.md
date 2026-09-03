# X1 Vault — X1 EcoChain Grant Application (draft)

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
| Applicant | `[TO FILL]` — your name and your designer's; two people, no entity |
| Contact | `[TO FILL]` — email, Telegram or X handle |
| Payout address | `[TO FILL]` — **a fresh wallet**, not the testnet deployer |
| Amount requested | `[TO FILL]` — see *Budget*, which proposes $68,000 |

---

## One-line summary

**X1 Vault** — a vault protocol for X1: depositors buy pro-rata shares in a strategy vault,
a designated trader trades the pooled funds through Ecodex without ever
taking custody, and hard risk caps enforced in the contract revert any trade
that breaches them.

## What already exists

This is not a proposal for something unbuilt. A working version is deployed
and usable today on the Maculatus testnet:

| | |
|---|---|
| Live application | https://x1vault.xyz |
| Source | https://github.com/Dapo114ui/Vault |
| VaultFactory | `0x76830898D4deC2E2D71055a553896FDECA29B070` |
| Vault (vUSDT) | `0x323fa03BB4437A0962131a405102A37D570A05FD` |
| First deposit | block 10310728 |

A real deposit and a real withdrawal have run end-to-end through the deployed
frontend against these contracts — USDT in, shares minted pro-rata to net
asset value, shares burned, USDT out, balances reconciling exactly. The
activity feed reads those events straight back off-chain.

**40 passing tests** cover pro-rata accounting, all three risk caps reverting
on breach, high-water-mark fee behaviour through a full drawdown-and-recovery
cycle, decimal handling across mixed-decimal assets, the deployer allowlist,
every deploy-parameter bound, and both operational guards.

Delivered beyond the core protocol, all of it in the repository:

- **Operator allowlist and deploy-parameter bounds.** Vault creation is
  curated while the protocol is unaudited, and the factory rejects a
  confiscatory fee, a zero position cap, or a zero trader address outright.
  An approved operator deploys and trades a vault but does **not** own it, so
  they cannot widen their own risk caps.
- **Deposit cap and pause.** A NAV ceiling for a guarded launch, and an
  emergency stop that halts deposits and trading — but never withdrawals,
  because a pause that stranded depositors would contradict the reason the
  vault holds its own funds.
- **Vault creation and trader interfaces.** An operator deploys a vault from
  the browser; a vault's designated trader routes swaps from a console that
  **simulates each trade against the deployed contracts** and refuses one
  that would breach a risk cap, before any gas is spent.
- **Disclosure.** Every vault names its trader, what that address can and
  cannot do, and who receives the performance fee — including that the fee is
  charged by minting shares, which dilutes holders rather than deducting from
  a balance.

**What is deliberately not done:** no security audit, and trading is not
switched on. Both are scoped below, and they are what the grant is for.

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

## Delivery plan — what is left

Deliberately phased, and deliberately honest about how much is already done.
X1's Q1 2026 mainnet target has slipped by two to three quarters with no new
public date, so any plan promising mainnet trading on a fixed calendar date
is promising something the applicant does not control. Everything dated below
is within our control; the one thing that is not is expressed relative to X1's
own launch.

**Phase 0 — complete, and unfunded.** The protocol, its test suite, the
deployed testnet contracts, the frontend, both operational guards, the
allowlist, and the creation and trading interfaces. Delivered before applying
and at our own cost. This is the evidence the rest of the plan is credible.

**Phase 1, days 1–25 — trading live.** The integration code exists; what does
not exist is confirmation of the external interface. Verify Ecodex's deployed
router ABI against ours and correct it if it differs, wire DIA price feeds
with the staleness rejection already implemented, redeploy the factory
carrying the allowlist, bounds and guards, and demonstrate a strategy trade
with a risk cap firing on a deliberate breach. *Milestone: a public testnet
vault that trades.*

**Phase 2, days 15–70 — audit.** The dominant cost and the long pole. Engage
a firm, remediate findings, publish the report in the repository. Starts in
parallel with Phase 1 because the contracts under audit are already written.
*Milestone: published report and remediation commits.*

**Phase 3, days 60–100 — indexing and operator onboarding.** A subgraph or
indexer so performance history survives beyond an RPC's log window — the one
substantial piece of product work still outstanding. Then operator
documentation and onboarding for the first external strategy operators.
*Milestone: two external operators running testnet vaults.*

**Phase 4 — mainnet, gated on X1.** Deployment within three weeks of Ecodex
having live mainnet liquidity. Stated as a dependency rather than a date,
because it is one.

## Budget — $68,000, structured against four milestones

`[TO FILL: adjust to your actual costs and time]`

The program pays up to 20% on signature with the remainder tied to
milestones, so the request is structured that way rather than as line items.

| | Target | Amount |
|---|---|---|
| Upfront on signature (20%) | day 0 | $13,600 |
| **M1** — Trading live on testnet | day 25 | $12,000 |
| **M2** — Audit engaged, draft report received | day 55 | $16,000 |
| **M3** — Findings remediated, report published | day 80 | $14,400 |
| **M4** — Indexer live, two external operators, activity targets met | day 100 | $12,000 |
| **Total** | | **$68,000** |

Every milestone's success criteria are verifiable on-chain by anyone, from
the factory's `VaultDeployed` events and each vault's `Deposit`, `Withdraw`
and `SwapExecuted` events. None depend on our own reporting. The full
criteria are in `GRANT_FORM_ANSWERS.md`.

The audit is roughly 59% of the request across M2 and M3, and it is the
reason for the request. The engineering it reviews is already written and
deployed — this budget is not asking to build the protocol, but to get it
independently reviewed, switched on, and put in front of users.

The ask is lower than this project would have made a month ago, because a
month ago the engineering had not been done. The floor that still produces
something worth having is **$42,000** — audit and remediation alone, with
Phase 1 absorbed by us as Phase 0 was. Below that the audit cannot be paid
for, and shipping an unaudited vault that holds other people's money is not
something we are willing to do.

**On cash flow, stated plainly:** audit firms take a deposit at engagement,
and 80% of this grant arrives only on completion. The upfront is sized to
cover that deposit plus Phase 1. If a firm's terms require more, we would
rather raise it in the application than miss M2 on timing.

No milestone is gated on X1 mainnet. Its target has moved, and tying a
payment schedule to a date outside our control would be dishonest.

## Go-to-market

The honest position: this is the weakest part of the application, and it is
the part no amount of engineering fixes. The contracts work; what they need
is depositors.

**The lever we intend to use is X1's own.** The $100K Galxe Starboard
campaign was announced alongside this grant program specifically to drive
community engagement. A quest that requires depositing into a vault and
holding shares would put real testnet users through the contracts and produce
exactly the measurable on-chain activity this program asks to see — using
X1's existing distribution rather than asking a new project to build an
audience from nothing. `[TO FILL: confirm Starboard quests are open to
ecosystem projects, and who to approach.]`

**Operators before depositors.** Each approved strategy operator arrives with
their own following, so onboarding two operators is a cheaper route to
depositor count than acquiring depositors directly. That is why the allowlist
and the self-serve creation flow were built before applying.

**What the budget line pays for:** quest design and rewards, operator
outreach, and documentation good enough that an operator can run a vault
without us.

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

Two people, no company. `[TO FILL — applicant name]` writes the contracts,
the test suite and the application; `[TO FILL — designer name]` handles
design and interface work. Everything below the surface of this application
was built by the two of us before applying and at our own cost.

Stated plainly because it is checkable: neither of us arrives with an
audited protocol behind us. What we bring instead is this one — deployed,
public, and reconciling on-chain — which is a stronger claim than a résumé
about work nobody can inspect.
