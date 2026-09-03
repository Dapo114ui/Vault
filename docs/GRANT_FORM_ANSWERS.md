# Grant form — answers to paste

For `airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`, confirmed open
on 2 September 2026. Copy each block into the matching field.

Anything in `[TO FILL]` needs a fact only you have.

---

## Project Name

```
X1 Vault
```

> **Worth a moment's thought.** "X1" is the chain's own name. A reviewer may
> read a third-party project using it as implying official affiliation, and
> some ecosystems reject that on trademark grounds. If you would rather not
> risk it, `Vault Protocol` or a distinct name works everywhere the deployed
> app currently says X1 Vault, and is a rename we can do in one pass. Your
> call — it is a brand decision, not a technical one.

## Project Type

Likely a dropdown. The program's own categories are DePIN,
Infrastructure/Tooling, Finance & Commerce, Consumer/Social and Gaming.

```
DeFi — Finance & Commerce
```

## Project Abstract and Objective

```
X1 Vault lets people who are not traders get exposure to people who are,
without ever handing over their coins.

Depositors buy pro-rata ERC-20 shares in a strategy vault. A designated
trader routes the pooled funds through Ecodex, but the funds never leave the
vault contract: the trader can call exactly one function, a swap, and there
is no code path by which they can withdraw to their own address. Custody risk
is removed structurally rather than promised. Three risk limits — maximum
position size per trade, maximum share of NAV in any one non-base asset, and
maximum drawdown from the high-water mark — are checked around every trade
and revert it on breach. The performance fee is charged only on NAV per share
above the vault's all-time high, so a depositor is never billed twice for the
same gain.

Primary objectives:
1. Make managed on-chain exposure available on X1 without custodial risk.
2. Give strategy operators a deployable venue: the factory issues an isolated
   vault, share token, risk manager and executor per strategy, so operators
   need write no accounting or risk code of their own.
3. Route sustained, non-speculative volume to Ecodex.

Key use cases: a depositor who wants exposure to a strategy without running
it; an operator who has a strategy but no infrastructure; a treasury that
wants a capped, auditable mandate with enforced limits rather than a
handshake.

How this enhances X1: it is a primitive rather than a single application. The
factory means other teams build strategies on top of it instead of rebuilding
vault accounting, which compounds with the 15+ dApps already on X1. Every
strategy trade is a swap through Ecodex, so a vault with real TVL is a
persistent source of DEX volume. And because a vault holding only its base
asset needs neither a DEX nor an oracle, it produces genuine on-chain
activity during the testnet phase rather than waiting for mainnet.

Why it suits emerging market conditions: the failure mode this removes —
sending money to someone who promises to trade it — is precisely the one that
does most damage where trust in intermediaries is lowest and recourse is
weakest. X1's node network already spans 65+ countries; a product whose
central guarantee is "the operator can move the money but can never take it"
is worth more in those markets than in ones with deep institutional
protection. The guarantee is enforced by the contract, so it holds
identically in every jurisdiction.

It is also computationally light, which matters on a chain validated by 3 Wh
X1Nodes. There are no keeper bots, no off-chain solver network and no
scheduled rebalancing: NAV is computed on read, fees crystallise only on
interaction, and the only transactions the protocol generates are ones users
and the trader actually initiate. It adds TVL and useful volume to X1's
low-energy validator set without adding an always-on compute load beside it.

Status: deployed and working on the Maculatus testnet today, with a real
deposit and withdrawal verified on-chain and 40 passing tests. Not yet
audited, and trading is not switched on — which is what this grant is for.
```

## Technical Roadmap

```
Dates assume a start of 1 October 2026. Each phase is also given as days from
funding, so the schedule shifts cleanly if the decision lands later.

PHASE 0 — COMPLETE BEFORE APPLYING, SELF-FUNDED
Ended 2 September 2026.
Delivered: the full contract suite (Vault, ShareToken, RiskManager,
StrategyExecutor, VaultFactory) with 40 passing tests; deployment to X1
Maculatus testnet; a live frontend at x1vault.xyz; a verified
deposit-and-withdrawal round-trip on-chain at block 10310728; an operator
allowlist with bounds on every deploy parameter; a deposit cap and an
emergency pause that never blocks withdrawals; a browser vault-creation flow;
and a trader console that simulates each swap against the deployed contracts
and refuses one that would breach a risk cap before any gas is spent.
This phase is evidence, not a request — it is already done.

PHASE 1 — TRADING LIVE
1–25 October 2026 (days 1–25).
The integration code is written; what is missing is confirmation of an
external interface. Activities: verify Ecodex's deployed router ABI against
our IEcodexRouter interface and correct it if it differs; wire DIA price
feeds for non-base assets using the staleness rejection already implemented;
redeploy the factory carrying the allowlist, parameter bounds, deposit cap
and pause; demonstrate a strategy trade on testnet and a deliberate breach
reverting on each of the three risk caps.
Deliverable: a public testnet vault that trades.

PHASE 2 — SECURITY AUDIT
15 October – 20 December 2026 (days 15–80).
Starts in parallel with Phase 1 because the contracts under review are
already written. Activities: engage an audit firm, support the review,
remediate findings, publish the report and the remediation commits in the
public repository.
Deliverable: a published audit report with fixes merged.

PHASE 3 — INDEXING AND OPERATOR ONBOARDING
1 December 2026 – 8 January 2027 (days 60–100).
Activities: build a subgraph/indexer so performance history survives beyond
an RPC's log window, which is the one substantial piece of product work still
outstanding; write operator documentation; onboard the first external
strategy operators onto the allowlist.
Deliverable: two independent operators running testnet vaults.

PHASE 4 — MAINNET
Within three weeks of Ecodex having live mainnet liquidity.
Stated as a dependency rather than a date, deliberately. X1's mainnet target
has moved, and we will not promise a calendar date for something outside our
control. Everything above is inside it. Activities: mainnet deployment behind
a deposit cap, a guarded ramp as the cap is raised, and monitoring.
```

## Project website

```
https://x1vault.xyz
```

Consider also giving the repository, since the code is the strongest part of
this application: `https://github.com/Dapo114ui/Vault`

## Project X

```
[TO FILL] — your X / Twitter handle
```

> The field is required. If there is no account yet, make one before
> submitting: an empty or missing handle on a grant application reads as an
> abandoned project, and it costs ten minutes. Even a single pinned post with
> the live app link and the testnet contract address is better than nothing.

---

## Previous Funding

Dropdown. Choose:

```
Self-Funding
```

Accurate, and it does not trigger the follow-up detail prompt (only Grant,
Angel Investment, Pre-Seed, Seed and Series A do). Everything so far —
contracts, tests, deployment, frontend — was built and paid for by you, with
no outside money. "No Funding" is also literally true but reads as *nobody
has ever backed this*; "Self-Funding" says *I put my own resources in*, which
is the same fact framed as commitment.

If a follow-up field appears anyway, the answer is: no external entity, no
round, $0 raised; development to date funded personally.

## Funding Details

Not required, and with Self-Funding selected there is no round to describe.
Leave blank, or a single line is tidier than an empty box:

```
No external funding raised. Development to date — contracts, test suite,
testnet deployment and frontend — was funded personally. No entity, no round,
$0 raised.
```

## Requested Funding Range

Dropdown: `$1-$50K` / `$50k-$100k` / `$100k+`. For a $68,000 request:

```
$50k-$100k
```

> **An option worth a moment.** The lower bracket usually attracts less
> scrutiny, and $50,000 would still cover the audit ($40,000) plus a small
> contingency. But it would mean dropping the indexer and the operator
> onboarding — real scope, and the two things that produce the adoption
> numbers the program says it measures. $68,000 is modest against a
> $25K–$400K programme and every dollar is attached to a milestone, so I
> would ask for it rather than shrink the plan to fit a bracket.

## Grant Budget Structure & Milestones (the box above Milestone 1)

```
TOTAL REQUESTED: $68,000
  Upfront on signature (20%):            $13,600
  Milestone 1 — Trading integration:     $12,000
  Milestone 2 — Audit engagement:        $16,000
  Milestone 3 — Audit remediation:       $14,400
  Milestone 4 — Indexing and adoption:   $12,000
  Milestones subtotal (80%):             $54,400
  TOTAL:                                 $68,000

Allocation by purpose:
  Security audit and remediation    $40,000   59%
  Engineering (integration, indexer) $12,000  18%
  Indexing and infrastructure        $6,000    9%
  Go-to-market and operator onboarding $10,000 14%

The audit is the majority of this request and the reason for it. The
engineering it reviews is already written, deployed and public — a full
contract suite with 40 passing tests, live on the Maculatus testnet with a
verified deposit and withdrawal on-chain. This budget is not asking to build
the protocol. It is asking to have it independently reviewed, switched on,
and put in front of users.

The upfront is sized deliberately: audit firms take a deposit at engagement,
and it is what makes Milestone 2 startable rather than profit taken early.

Every success criterion below is verifiable on-chain by anyone, from the
factory's VaultDeployed events and each vault's Deposit, Withdraw and
SwapExecuted events. None of them depend on our own reporting.

No milestone is gated on X1 mainnet. Its target has moved, and tying a
payment schedule to a date outside our control would not be honest.
```

## Milestone 1

Format matched to the form: Name, Description, Deliverables & Success
Metrics/KPIs, Estimated Completion Date, Amount Requested.

```
Milestone Name: Trading Integration & Testnet Launch

Description: Switch trading on. The integration code is already written; what
is missing is confirmation of an external interface. We verify Ecodex's
deployed router ABI against our IEcodexRouter interface and correct it if it
differs, integrate DIA price feeds for non-base assets using the oracle
staleness rejection already implemented in the contracts, and redeploy the
factory carrying the operator allowlist, deploy-parameter bounds, deposit cap
and emergency pause. The goal is a vault that trades through Ecodex with its
risk caps demonstrably enforcing.

Deliverables & Success Metrics/KPIs:
- A trading-enabled vault live on the Maculatus testnet, address published in
  the public repository.
- >= 25 SwapExecuted events emitted by that vault.
- All three risk caps — position size, single-asset exposure, drawdown —
  each shown reverting a deliberate breach, with a linkable transaction hash
  for each.
- Ecodex router interface either confirmed unchanged or corrected, with the
  diff public.
Every metric above is verifiable on-chain by a reviewer; none depends on our
own reporting.

Estimated Completion Date: 25 October 2026

Amount Requested: $12,000
```

## Milestone 2

```
Milestone Name: Security Audit — Engagement & Review

Description: Put the contracts in front of an independent firm. We engage a
named auditor scoped to all five contracts — Vault, ShareToken, RiskManager,
StrategyExecutor and VaultFactory — freeze the code at the audited commit and
publish its hash, then support the review through to a draft report. This is
the largest single cost in the request and the main reason for it: the
protocol holds other people's money and has not yet been independently
reviewed.

Deliverables & Success Metrics/KPIs:
- Signed engagement with a named audit firm, letter published.
- Audited commit hash published in the repository, so the reviewed code is
  identifiable and frozen.
- Draft report received, with findings counted by severity.
- Scope confirmed as all five contracts rather than a subset.

Estimated Completion Date: 25 November 2026

Amount Requested: $16,000
```

## Milestone 3

```
Milestone Name: Audit Remediation & Publication

Description: Fix what the audit finds, in public. Every critical and high
finding is addressed as a discrete commit referencing the finding it fixes,
each with a regression test added to the suite, and the firm signs off on the
remediation. The final report is published in the public repository rather
than summarised — a report nobody can read is not an audit anyone should
trust.

Deliverables & Success Metrics/KPIs:
- Final audit report published in the public repository and linkable.
- Zero unresolved critical or high findings at sign-off.
- One remediation commit per finding, each referencing it.
- Test suite expanded with a named regression test per finding; current
  count is 40 passing tests.

Estimated Completion Date: 20 December 2026

Amount Requested: $14,400
```

## Milestone 4

```
Milestone Name: Indexing, Operator Onboarding & Adoption

Description: Turn a working protocol into a used one. We build a subgraph or
indexer so vault performance history survives beyond an RPC's log window,
write operator documentation good enough to run a vault unaided, onboard
external strategy operators to the allowlist, and run a depositor acquisition
campaign — ideally as an X1 Galxe Starboard quest, which puts real testnet
users through the contracts using X1's own distribution. Operators are the
efficient path here: each arrives with their own following, so onboarding
operators is cheaper than acquiring depositors one at a time.

Deliverables & Success Metrics/KPIs:
- >= 2 independent operators running vaults they deployed themselves.
- >= 5 vaults deployed by the factory.
- >= 100 distinct depositor addresses.
- >= 400 cumulative deposit transactions.
- Indexed performance history queryable for every vault from its deployment
  block onward.
- Public operator documentation.
All adoption metrics are countable from the factory's VaultDeployed events
and each vault's Deposit, Withdraw and SwapExecuted events.

Estimated Completion Date: 8 January 2027

Amount Requested: $12,000
```

> **Cash flow, worth raising in the application rather than discovering at
> Milestone 2.** The audit deposit falls at engagement, but 80% of the grant
> arrives on completion. The $13,600 upfront is sized to cover a deposit plus
> the Phase 1 work. If the firm you approach wants more up front, say so in
> the application and ask for a higher upfront — that is a normal negotiation
> and far better than missing a milestone on timing.

## Current Development Stage

```
Mid-Stage (product on testnet closed beta)
```

> **Not Late-Stage, and the distinction matters.** "Late-Stage (product live
> with onchain metrics)" is tempting — it *is* live and there *are* onchain
> metrics. But the metrics are one deposit and one withdrawal, both yours,
> and vault creation is allowlisted. That is a closed beta by any honest
> reading. The rest of this application is scrupulously accurate about what
> exists and what does not; overclaiming in a dropdown is exactly the
> inconsistency a reviewer would notice and then re-read everything else
> looking for.

## Duration working on the project

```
0-3 months
```

> **Be ready for this one.** The public repository's first commit is
> 30 August 2026. A reviewer who opens GitHub sees a project a few days old,
> so the honest answer is the only workable one — and it is also a strong
> one, if you frame it. In four days this went from nothing to a five-contract
> suite with 40 passing tests, a testnet deployment, a live frontend, and a
> verified on-chain deposit and withdrawal. Say that in the bio rather than
> hoping nobody checks the commit dates. Velocity is a real signal; a project
> that claims a year of work with a four-day-old repository is a dead
> application.

## Project live status

```
Live on Testnet
```

## Applicant Full Name

```
[TO FILL] — your legal name, matching whatever ID you would use for KYC
```

## Applicant Email

```
[TO FILL]
```

> If you have a project or professional address, use it. A personal one is
> fine too — grant committees care far more that it is monitored than what
> the domain is. Use an address you will actually check daily for the next
> three months.

## Applicant Job Title

```
Founder & Developer
```

> Accurate for a solo builder, and better than inflating to "CEO" for a
> one-person project — reviewers read that as a signal about judgement.
> If someone is working with you, say "Founder" and cover the split in the
> bio.

## Applicant Bio

**I cannot write this one for you, and you should not let me.** I do not know
your background, and a fabricated bio in a funding application is fraud, not
positioning. What follows is a structure with your facts left blank.

```
[TO FILL — your background: what you have built or worked on before, your
technical or professional experience, and anything that makes you credible
as the person who will ship this. Two or three sentences.]

I built X1 Vault as a solo project, starting from a blank repository on
30 August 2026. In that time it has gone from nothing to a five-contract
suite with 40 passing tests, deployed to the X1 Maculatus testnet, with a
public frontend and a verified deposit-and-withdrawal round-trip on-chain
at block 10310728. Everything is public at
github.com/Dapo114ui/Vault and x1vault.xyz.

[TO FILL — why this problem, in one or two sentences. What drew you to
custody-free managed exposure specifically? A reviewer is deciding whether
you will still be working on this in six months, and the honest reason is
more persuasive than a market-size argument.]

I am not asking this grant to build the protocol — that part is done and
public. I am asking for what I cannot do alone: an independent security
audit before anyone else's money goes in.
```

> Two notes. First, the middle paragraph is the strongest thing you can say
> and it is entirely verifiable, so lead with substance rather than
> adjectives. Second, if you are not solo, say who else and what they do —
> a two-person team with named roles reads better than a vague "we".

## Still needed from you

- **Project X handle** — required field, still blank.
- **Applicant name, email and bio** — only you have these. The bio scaffold
  above marks exactly what is missing.
- **Anything after Applicant Bio.** A payout wallet and possibly KYC
  questions are likely still below. Screenshot and I will finish the set.

## Facts to have ready for later fields

| | |
|---|---|
| Amount requested | $68,000 (floor $42,000 — audit only) |
| Payout wallet | A **fresh** address. Not the testnet deployer, and not any account whose key has been shared anywhere. |
| Live app | https://x1vault.xyz |
| Repository | https://github.com/Dapo114ui/Vault |
| VaultFactory | `0x76830898D4deC2E2D71055a553896FDECA29B070` |
| Vault (vUSDT) | `0x323fa03BB4437A0962131a405102A37D570A05FD` |
| Network | X1 EcoChain Maculatus, chain ID 10778 |
| First deposit | block 10310728 |
| Tests | 40 passing |
| Delivery window | 100 days, 1 Oct 2026 – 8 Jan 2027 |
