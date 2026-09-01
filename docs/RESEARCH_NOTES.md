# Research notes — X1 EcoChain / Ecodex / Grant Program

Findings from live web research done while scoping this vault, dated
2026-08-30. These update or correct a few assumptions in the original
project brief; treat anything below marked "unverified" as still needing a
direct check against X1's own dashboards before the grant application or
any deployment plan is finalized.

## Ecodex is not yet live on mainnet — correction to the original brief

The original brief described Ecodex as "already live, the chain's flagship
DeFi product." Current public information says otherwise: X1 EcoChain's own
announcements describe Ecodex as launched on the **Maculatus Testnet**,
explicitly positioned as a way to "test Ecodex before its official mainnet
launch." X1 EcoChain overall is still in its testnet phase, preparing for a
mainnet transition, with 15+ dApps (including DeFi protocols) in
development alongside it.

**Impact on this vault's plan:** the liquidity-risk item in the original
brief ("Ecodex liquidity depth is unverified... pull Ecodex's actual TVL and
volume before finalizing scope") is more fundamental than a depth question —
there is likely no meaningful mainnet TVL/volume to pull yet, because Ecodex
itself hasn't reached mainnet. This vault's 90–120 day delivery plan should
be written against **testnet-first delivery**, with mainnet trading gated on
Ecodex's own mainnet launch and real liquidity materializing — not assumed
concurrent with this vault's own contract readiness.

## Mainnet timeline: resolved — it has slipped, and that is the plan's anchor

**Re-checked 2026-09-01.** X1's stated mainnet target was **Q1 2026**. It is
now September 2026 and the chain is still in its Maculatus testnet phase:
X1's own messaging continues to describe Ecodex as something to "test before
its official mainnet launch," and coverage still describes X1 as "preparing
for its mainnet launch" with 15+ dApps in development. A partnership
announcement with Symbiosis is likewise framed as "ahead of mainnet launch."

So mainnet is roughly **two to three quarters past its own target**, with no
new public date. This settles the open question from the original brief, and
it settles it in the direction the plan already assumed:

- **A testnet-first delivery plan is not a hedge, it is the only honest one.**
  Any application promising mainnet trading inside 90–120 days is promising
  something gated on X1's schedule, not the applicant's.
- **A vault that works without a DEX is the right v1.** The deposit/withdraw
  vault already deployed needs neither Ecodex nor DIA, so delivery is not
  blocked on either. That is a genuine scoping advantage to state plainly in
  the application rather than paper over.
- Do not commit this vault's plan to any specific mainnet quarter. Phase it:
  testnet delivery on a fixed date, mainnet trading "within N weeks of
  Ecodex mainnet liquidity being live," which is verifiable and honest.

## Grant Program — confirmed details

- **Size:** individual grants $25,000–$400,000 per project (multiple
  independent press sources agree on this range; the brief's "$10,000–
  $100,000... up to $400,000" is close but the $25K floor is worth using in
  the application instead of $10K).
- **Categories funded:** DePIN, DeFi, decentralized data storage/computing,
  identity, and gaming/metaverse — DeFi (this vault's category) is
  explicitly in scope.
- **Delivery expectation:** "scalable, EVM-compatible applications" within
  90–120 days — matches the brief.
- **Sustainability is a stated application requirement, not just framing.**
  Coverage of the program says every application "must be designed with
  sustainability in mind — leveraging X1Nodes, ultra-low-energy devices
  (3 Wh) already deployed in more than 65 countries." This is awkward for a
  DeFi vault and should be answered honestly rather than greenwashed: the
  defensible line is that the vault is *computationally* cheap (no
  keeper bots, no off-chain solvers, no perpetual rebalancing — NAV is
  computed on read, fees crystallize only on interaction), so it adds
  TVL and transaction volume to X1Nodes' low-energy validator set without
  adding a heavy always-on compute load. Claiming more than that would
  invite a reviewer to check.
- **Evaluation priorities**, per the program's own description: 90–120 days
  to deploy (testnet **or** mainnet — testnet counts), strong security and
  code quality, clear GTM, and **measurable on-chain activity**.
- **Category:** the program buckets projects as DePIN, Infrastructure/
  Tooling, Finance & Commerce, Consumer/Social, and Gaming. This vault is
  Finance & Commerce (DeFi).
- **Still open (2026-09-01):** the program page still shows "Apply Now" and
  no deadline was found in any source, but the program was announced in
  October 2025 — roughly eleven months ago. Confirm it is still accepting
  applications before investing in a submission.
- Could not fetch `grant.x1ecochain.com` directly in this session (see
  "What couldn't be verified" below) — the specific application-form
  questions, evaluation rubric weighting, and payout-tranche mechanics
  should be re-confirmed against the live form
  (`airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form`) before
  submitting.

## What couldn't be verified in this session

This session's network egress policy blocks direct fetches to
`grant.x1ecochain.com`, `x1ecochain.com`, and `defillama.com` (fetch tool
reports `EGRESS_BLOCKED`). Search-engine results (not direct page fetches)
were used instead, so treat the above as directionally reliable but not a
substitute for pulling the pages directly. Specifically still unverified:

- **Ecodex TVL and daily volume** — could not be pulled from DeFiLlama or
  Ecodex's own interface. Given Ecodex's testnet-only status (above), this
  may simply be near-zero/not-yet-tracked rather than unavailable — check
  DeFiLlama's chain page for "X1 EcoChain" and/or Ecodex's own testnet app
  directly.
- **Ecodex's actual router contract ABI** — `contracts/interfaces/
  IEcodexRouter.sol` in this repo assumes a standard Uniswap-V2-style
  `swapExactTokensForTokens`/`getAmountsOut` surface, which is the common
  shape for AMM forks but has not been confirmed against Ecodex's deployed
  bytecode or docs.
- **DIA Oracle feed keys and deployed oracle contract address on X1** —
  `IDIAOracle.getValue(string key)` matches DIA's standard interface, but
  the exact price feed keys (e.g. whether it's `"WX1/USD"` or a different
  naming convention) and the oracle contract's address on X1 testnet/mainnet
  need to come from DIA's own X1 integration docs.
- ~~**X1 testnet RPC URL and chain ID**~~ — **resolved.** Chain ID `10778`
  and `https://maculatus-rpc.x1eco.com` are confirmed by a live deployment;
  see `DEPLOYMENTS.md`. Mainnet parameters remain unknown because mainnet
  does not exist yet.

## Sources consulted

- X1 EcoChain — https://x1ecochain.com/
- X1 Grant Program — https://grant.x1ecochain.com/ (search-indexed content only, direct fetch blocked)
- X1 EcoChain announcement of Ecodex on Maculatus Testnet — https://x.com/X1_EcoChain/status/2024077335826210910
- X1 EcoChain Tech Whitepaper, testnet page — https://x1ecochain.gitbook.io/x1-ecochain-tech-whitepaper/development-environment/testnet
- Invezz — https://invezz.com/news/2025/10/03/x1-ecochain-launches-5m-grant-program-and-100k-galxe-starboard-to-boost-web4-growth/
- Bitcoin.com News — https://news.bitcoin.com/x1-ecochain-unveils-5m-grant-program-and-galxe-starboard/
- CoinJournal — https://coinjournal.net/news/x1-ecochain-introduces-5m-grant-program-and-100k-galxe-starboard-campaign/
- CaptainAltcoin — https://captainaltcoin.com/x1-ecochain-launches-5m-grant-program-and-100k-galxe-starboard-for-global-builders-and-community/
- crypto.news overview — https://crypto.news/x1-ecochain-the-green-pulse-of-decentralized-reality/
- cryptobriefing.com overview — https://cryptobriefing.com/sustainable-depin-infrastructure-x1-ecochain/
- MEXC News, grant program details — https://www.mexc.com/en-NG/news/118127
- Analytics Insight, builder fund — https://www.analyticsinsight.net/blockchain/x1-ecochain-launches-5m-builder-fund-and-galxe-starboard-rewards
- blockchainreporter, Symbiosis partnership "ahead of mainnet launch" — https://blockchainreporter.net/x1-ecochain-partners-with-symbiosis-to-pioneer-cross-chain-interoperability-ahead-of-mainnet-launch/
