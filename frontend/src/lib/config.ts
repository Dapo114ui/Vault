import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { hardhat } from "viem/chains";
import { defineChain } from "viem";

const CONFIGURED_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 0);

// Local Hardhat is the target only when nothing else is configured (or it is
// explicitly configured), so a production build never defaults to localhost.
const isLocal = !CONFIGURED_CHAIN_ID || CONFIGURED_CHAIN_ID === hardhat.id;

// Confirmed against a live deployment on the Maculatus testnet (chain ID
// 10778) -- the factory, vault and share token in docs/DEPLOYMENTS.md were
// all deployed through this RPC.
export const x1EcoChain = defineChain({
  id: isLocal ? 10778 : CONFIGURED_CHAIN_ID,
  name: "X1 EcoChain Maculatus",
  nativeCurrency: { name: "X1 Testnet Token", symbol: "X1T", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://maculatus-rpc.x1eco.com"] },
  },
  blockExplorers: {
    default: { name: "Maculatus Scan", url: "https://maculatus-scan.x1eco.com" },
  },
  testnet: true,
});

/**
 * The chain this deployment reads from. Every contract read pins itself to
 * this explicitly: without it wagmi follows the *wallet's* current chain, so a
 * visitor whose MetaMask sits on Ethereum sees an app that loads no vaults at
 * all and offers no explanation.
 */
export const ACTIVE_CHAIN = isLocal ? hardhat : x1EcoChain;
export const ACTIVE_CHAIN_ID = ACTIVE_CHAIN.id;

export const wagmiConfig = createConfig({
  chains: isLocal ? [hardhat, x1EcoChain] : [x1EcoChain, hardhat],
  connectors: [injected()],
  transports: {
    // `http(undefined)` falls back to the chain's own default RPC, so a local
    // node on a non-default port is still reachable via NEXT_PUBLIC_RPC_URL.
    [hardhat.id]: http(isLocal ? process.env.NEXT_PUBLIC_RPC_URL : undefined),
    [x1EcoChain.id]: http(),
  },
});

/**
 * Link into the active chain's block explorer, or `undefined` when it has
 * none -- the local Hardhat chain doesn't, so callers render plain text
 * rather than a dead link.
 */
export function explorerUrl(
  kind: "address" | "tx" | "block",
  value: string | number | bigint,
): string | undefined {
  const base = (ACTIVE_CHAIN as { blockExplorers?: { default?: { url?: string } } })
    .blockExplorers?.default?.url;
  if (!base) return undefined;
  return `${base.replace(/\/$/, "")}/${kind}/${value}`;
}

export const VAULT_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS as
  | `0x${string}`
  | undefined;

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
