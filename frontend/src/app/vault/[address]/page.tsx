"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useReadContracts } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { erc20Abi, vaultAbi } from "@/lib/abis";
import { formatToken } from "@/lib/format";

export default function VaultPage() {
  const params = useParams<{ address: string }>();
  const vaultAddress = params.address as `0x${string}`;

  const { data: core } = useReadContracts({
    contracts: [
      { address: vaultAddress, abi: vaultAbi, functionName: "baseAsset" },
      { address: vaultAddress, abi: vaultAbi, functionName: "shareToken" },
      { address: vaultAddress, abi: vaultAbi, functionName: "nav" },
      { address: vaultAddress, abi: vaultAbi, functionName: "navPerShare" },
      { address: vaultAddress, abi: vaultAbi, functionName: "highWaterMark" },
      { address: vaultAddress, abi: vaultAbi, functionName: "performanceFeeBps" },
    ],
  });

  const [baseAssetAddress, shareTokenAddress, nav, navPerShare, highWaterMark, performanceFeeBps] =
    (core?.map((d) => d.result) ?? []) as [
      `0x${string}` | undefined,
      `0x${string}` | undefined,
      bigint | undefined,
      bigint | undefined,
      bigint | undefined,
      bigint | undefined,
    ];

  const { data: tokenInfo } = useReadContracts({
    contracts: [
      { address: baseAssetAddress, abi: erc20Abi, functionName: "decimals" },
      { address: baseAssetAddress, abi: erc20Abi, functionName: "symbol" },
      { address: shareTokenAddress, abi: erc20Abi, functionName: "symbol" },
    ],
    query: { enabled: Boolean(baseAssetAddress && shareTokenAddress) },
  });

  const [baseDecimals, baseSymbol, shareSymbol] = (tokenInfo?.map((d) => d.result) ?? []) as [
    number | undefined,
    string | undefined,
    string | undefined,
  ];

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-black/60 dark:text-white/60 hover:underline">
          ← Vault
        </Link>
        <ConnectButton />
      </header>

      <main className="mt-8">
        <h1 className="font-mono text-sm text-black/60 dark:text-white/60">{vaultAddress}</h1>

        <dl className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-black/10 dark:border-white/15 p-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-black/50 dark:text-white/50">NAV</dt>
            <dd className="mt-1">
              {formatToken(nav, baseDecimals ?? 18)} {baseSymbol}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-black/50 dark:text-white/50">NAV / share</dt>
            <dd className="mt-1">{formatToken(navPerShare, baseDecimals ?? 18)}</dd>
          </div>
          <div>
            <dt className="text-xs text-black/50 dark:text-white/50">High-water mark</dt>
            <dd className="mt-1">{formatToken(highWaterMark, baseDecimals ?? 18)}</dd>
          </div>
          <div>
            <dt className="text-xs text-black/50 dark:text-white/50">Performance fee</dt>
            <dd className="mt-1">
              {performanceFeeBps !== undefined ? Number(performanceFeeBps) / 100 : "—"}%
            </dd>
          </div>
        </dl>

        {baseAssetAddress && shareTokenAddress && baseDecimals !== undefined ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DepositForm
              vaultAddress={vaultAddress}
              baseAssetAddress={baseAssetAddress}
              baseAssetDecimals={baseDecimals}
              baseAssetSymbol={baseSymbol ?? ""}
            />
            <WithdrawForm
              vaultAddress={vaultAddress}
              shareTokenAddress={shareTokenAddress}
              shareSymbol={shareSymbol ?? ""}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading vault…</p>
        )}
      </main>
    </div>
  );
}
