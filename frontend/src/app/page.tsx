"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { Header } from "@/components/Header";
import { DemoBanner } from "@/components/DemoBanner";
import { VaultCard, DemoVaultCard } from "@/components/VaultCard";
import { HeroFigure, StatTile } from "@/components/StatTile";
import { vaultFactoryAbi } from "@/lib/abis";
import { VAULT_FACTORY_ADDRESS } from "@/lib/config";
import { DEMO_VAULTS, DEMO_TOTAL_NAV, IS_DEMO } from "@/lib/demo";
import { formatBps, formatCompact } from "@/lib/format";

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

  const avgFeeBps = Math.round(
    DEMO_VAULTS.reduce((sum, v) => sum + v.performanceFeeBps, 0) / DEMO_VAULTS.length
  );

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {IS_DEMO && <DemoBanner />}

        <section className={IS_DEMO ? "mt-8" : ""}>
          <HeroFigure
            label="Total value locked"
            value={IS_DEMO ? formatCompact(DEMO_TOTAL_NAV) : formatCompact(0n)}
            unit={IS_DEMO ? DEMO_VAULTS[0]?.baseSymbol : undefined}
            sub={
              IS_DEMO
                ? `across ${DEMO_VAULTS.length} sample vaults`
                : count > 0
                  ? `across ${count} vault${count === 1 ? "" : "s"}`
                  : "no vaults deployed yet"
            }
          />
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Vaults" value={IS_DEMO ? String(DEMO_VAULTS.length) : String(count)} />
          <StatTile
            label="Avg. performance fee"
            value={IS_DEMO ? formatBps(avgFeeBps) : "—"}
            sub="charged above high-water mark"
          />
          <StatTile label="Risk caps" value="On-chain" sub="enforced per trade" tone="good" />
          <StatTile label="Custody" value="Vault-held" sub="trader never withdraws" tone="good" />
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium text-ink-secondary">Vaults</h2>

          {IS_DEMO ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {DEMO_VAULTS.map((vault) => (
                <DemoVaultCard key={vault.address} vault={vault} />
              ))}
            </div>
          ) : count === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface-1 p-6 text-sm text-ink-secondary">
              The factory at{" "}
              <code className="font-mono text-xs">{VAULT_FACTORY_ADDRESS}</code> has not deployed
              any vaults yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {vaultAddresses?.map((entry, i) =>
                entry.result ? (
                  <VaultCard key={i} vaultAddress={entry.result as `0x${string}`} />
                ) : null
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border-subtle px-6 py-5">
        <p className="mx-auto w-full max-w-5xl text-xs text-ink-muted">
          Pro-rata share vaults trading through Ecodex, with on-chain risk caps and a
          high-water-mark performance fee.
        </p>
      </footer>
    </div>
  );
}
