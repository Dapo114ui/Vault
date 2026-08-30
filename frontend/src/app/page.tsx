"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { VaultCard } from "@/components/VaultCard";
import { vaultFactoryAbi } from "@/lib/abis";
import { VAULT_FACTORY_ADDRESS } from "@/lib/config";

export default function Home() {
  const { data: vaultsCount } = useReadContract({
    address: VAULT_FACTORY_ADDRESS,
    abi: vaultFactoryAbi,
    functionName: "vaultsCount",
    query: { enabled: Boolean(VAULT_FACTORY_ADDRESS) },
  });

  const count = vaultsCount !== undefined ? Number(vaultsCount) : 0;

  const { data: vaultAddresses } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: VAULT_FACTORY_ADDRESS,
      abi: vaultFactoryAbi,
      functionName: "vaults" as const,
      args: [BigInt(i)] as const,
    })),
    query: { enabled: count > 0 },
  });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Vault</h1>
        <ConnectButton />
      </header>

      <main className="mt-10">
        {!VAULT_FACTORY_ADDRESS ? (
          <div className="rounded-lg border border-dashed border-black/15 dark:border-white/20 p-6 text-sm text-black/70 dark:text-white/70">
            <p className="font-medium text-black dark:text-white">No vault factory configured</p>
            <p className="mt-2">
              Set <code className="font-mono">NEXT_PUBLIC_VAULT_FACTORY_ADDRESS</code> (and{" "}
              <code className="font-mono">NEXT_PUBLIC_CHAIN_ID</code> /{" "}
              <code className="font-mono">NEXT_PUBLIC_RPC_URL</code>) in your environment. For local
              testing, run <code className="font-mono">npx hardhat node</code> and{" "}
              <code className="font-mono">
                npx hardhat run scripts/deploy-local.js --network localhost
              </code>{" "}
              from the repo root, then copy the printed values into{" "}
              <code className="font-mono">frontend/.env.local</code>.
            </p>
          </div>
        ) : count === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No vaults deployed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {vaultAddresses?.map((entry, i) =>
              entry.result ? (
                <VaultCard key={i} vaultAddress={entry.result as `0x${string}`} />
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}
