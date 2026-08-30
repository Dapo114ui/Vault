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

## Mainnet / TGE timeline: conflicting dates, needs a direct check

The brief cites Q3 2026 for mainnet/TGE. Coverage of the grant program's
October 2025 launch (Invezz, Bitcoin.com News, CoinJournal, CaptainAltcoin)
describes the grant as targeting teams that can deliver within 90–120 days,
which read most naturally against a near-term (contemporaneous, i.e. late
2025/early 2026) mainnet milestone rather than a Q3 2026 one — but no
source found in this pass states a mainnet date outright, and roadmap dates
for pre-launch chains commonly slip. **Action item:** check
`x1ecochain.gitbook.io` (X1's tech whitepaper/roadmap pages) and X1's
official X/Telegram directly for the current stated mainnet/TGE date before
committing this vault's plan to any specific quarter.

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
- **Differentiator X1 emphasizes:** ultra-low-energy decentralization via
  ~3Wh X1Nodes deployed in 65+ countries — not directly relevant to vault
  scope, but useful framing language for the application's ecosystem-fit
  section.
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
- **X1 testnet/mainnet RPC URL and chain ID** — `hardhat.config.js` in this
  repo leaves these as environment variables with no defaults baked in for
  mainnet, and a placeholder testnet RPC guess for `x1Testnet`; confirm both
  against `x1ecochain.gitbook.io`'s testnet page before any deployment.

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
