import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { hardhat } from "viem/chains";
import { defineChain } from "viem";

// X1 EcoChain's public RPC URL and chain ID have not been confirmed against
// the live docs yet (see ../../../docs/RESEARCH_NOTES.md). Override both via
// env vars once they are; this default is a placeholder, not a real endpoint.
export const x1EcoChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0) || 291_000_291,
  name: "X1 EcoChain (unconfirmed)",
  nativeCurrency: { name: "X1", symbol: "X1", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://testnet-rpc.x1ecochain.com"],
    },
  },
});

// Local Hardhat node is included so the vault can be exercised end-to-end
// (`npx hardhat node` + `npx hardhat run scripts/deploy-local.js --network
// localhost` from the repo root) before any real X1 deployment exists.
export const wagmiConfig = createConfig({
  chains: [hardhat, x1EcoChain],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(),
    [x1EcoChain.id]: http(),
  },
});

export const VAULT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS as
  | `0x${string}`
  | undefined;

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
