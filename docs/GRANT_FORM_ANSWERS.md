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
Maculatus testnet; a live frontend at x1vault.vercel.app; a verified
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
https://x1vault.vercel.app
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

## Still needed from you

- **Project X handle** — required field, see above.
- **Everything below the fold.** The form continues past "Project X"; send a
  screenshot of the remaining fields and I will draft those too. Expect team
  background, requested amount, wallet address, and possibly KYC questions.

## Facts to have ready for later fields

| | |
|---|---|
| Amount requested | $68,000 (floor $42,000 — audit only) |
| Payout wallet | A **fresh** address. Not the testnet deployer, and not any account whose key has been shared anywhere. |
| Live app | https://x1vault.vercel.app |
| Repository | https://github.com/Dapo114ui/Vault |
| VaultFactory | `0x76830898D4deC2E2D71055a553896FDECA29B070` |
| Vault (vUSDT) | `0x323fa03BB4437A0962131a405102A37D570A05FD` |
| Network | X1 EcoChain Maculatus, chain ID 10778 |
| First deposit | block 10310728 |
| Tests | 40 passing |
| Delivery window | 100 days, 1 Oct 2026 – 8 Jan 2027 |
