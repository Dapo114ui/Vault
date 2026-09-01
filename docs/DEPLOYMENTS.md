# Deployments

## X1 EcoChain — Maculatus testnet

Deployed with `scripts/deploy-x1.js`. This is a **deposit-and-withdraw-only
v1**: the router and oracle are wired to `address(0)`, so the vault holds only
its base asset and never calls Ecodex or DIA. Trading is enabled by a redeploy
once those addresses are confirmed (see `NEXT_STEPS.md`).

| | |
|---|---|
| Chain ID | `10778` |
| RPC | `https://maculatus-rpc.x1eco.com` |
| Explorer | `https://maculatus-scan.x1eco.com` |
| Gas token | X1T |

| Contract | Address |
|---|---|
| `VaultFactory` | `0x76830898D4deC2E2D71055a553896FDECA29B070` |
| `Vault` | `0x323fa03BB4437A0962131a405102A37D570A05FD` |
| `ShareToken` | `0xD8e9430D20996d60CAde83AF5CA2cCCcb2B18591` |
| `RiskManager` | `0xf5582A6232d692C684ACAA40Dae13f6cCBf19dc1` |
| `StrategyExecutor` | `0xd7F88811FCa5d4c9E5992A176203586813aFaF45` |
| Base asset (USDT, 18 dp) | `0xd127BA1f0EfA2c5c7d9e6E7339DBafe2A6b1EAeC` |
| Deployer / trader | `0x31180D4e47b875b316465047e09A6BDf5B29199C` |

The deployer is a purpose-made throwaway holding testnet funds only. Its key
lives in an untracked local `.env`; it is not, and must never become, an
account with anything of value on it.

Note the base asset on this network reports **18 decimals**, not the 6 that
USDT uses on Ethereum. Nothing in the app assumes either — `Vault` records the
base asset's own decimals at construction and the frontend reads them back
per vault — but it is worth knowing when eyeballing raw values in the explorer.

## Frontend

The Vercel deployment needs three variables, which are what
`scripts/deploy-x1.js` prints at the end of a run:

```
NEXT_PUBLIC_CHAIN_ID=10778
NEXT_PUBLIC_RPC_URL=https://maculatus-rpc.x1eco.com
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x76830898D4deC2E2D71055a553896FDECA29B070
```

All three are `NEXT_PUBLIC_*`, so they are compiled into the browser bundle by
design — none of them is a secret. They are read at **build** time, so a change
to any of them needs a redeploy, not just a save.
