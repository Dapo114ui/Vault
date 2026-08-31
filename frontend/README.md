# Vault frontend

Next.js dashboard for the vault contracts in `../contracts`: connect a
wallet, browse deployed vaults, deposit into and withdraw from one. Built
with wagmi + viem for on-chain reads/writes (no WalletConnect Cloud project
ID required — it only uses the browser's injected wallet, e.g. MetaMask).

## Local development

The contracts aren't deployed to X1 EcoChain yet (see
`../docs/RESEARCH_NOTES.md`), so point this at a local Hardhat node to try
it end to end:

```bash
# from the repo root
npx hardhat node
# in another terminal, from the repo root
npx hardhat run scripts/deploy-local.js --network localhost
```

Copy the addresses the deploy script prints into `frontend/.env.local`
(see `.env.example`), then:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, connect the wallet used by your browser
extension against the local Hardhat network (chain ID 31337, RPC
`http://127.0.0.1:8545`), and import one of the funded local test accounts
Hardhat prints on startup if you need test funds.

This flow (connect → approve → deposit → withdraw) has been verified
end-to-end against a local deployment.

## Deploying to Vercel

This app lives in a subdirectory of the `Vault` monorepo, so when
importing the repo in the Vercel dashboard, set the project's **Root
Directory** to `frontend`. Vercel auto-detects the Next.js framework and
build command from there.

Environment variables to set in the Vercel project (Settings →
Environment Variables), matching `.env.example`:

- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_VAULT_FACTORY_ADDRESS`

None of these have real X1 EcoChain values yet — the chain's public
RPC/chain ID aren't confirmed (`../docs/RESEARCH_NOTES.md`) and no
`VaultFactory` has been deployed there. Until then, either leave them
unset (the dashboard shows a "not configured" message) or point them at a
Hardhat node reachable from Vercel's servers (not `127.0.0.1`, e.g. via a
tunnel) for a live demo.
