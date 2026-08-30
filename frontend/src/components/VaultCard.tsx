"use client";

import Link from "next/link";
import { useReadContract, useReadContracts } from "wagmi";
import { vaultAbi, erc20Abi } from "@/lib/abis";
import { formatToken, shortenAddress } from "@/lib/format";

export function VaultCard({ vaultAddress }: { vaultAddress: `0x${string}` }) {
  const { data: shareTokenAddress } = useReadContract({
    address: vaultAddress,
    abi: vaultAbi,
    functionName: "shareToken",
  });

  const { data } = useReadContracts({
    contracts: [
      { address: vaultAddress, abi: vaultAbi, functionName: "nav" },
      { address: vaultAddress, abi: vaultAbi, functionName: "navPerShare" },
      {
        address: shareTokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: shareTokenAddress,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    query: { enabled: Boolean(shareTokenAddress) },
  });

  const [nav, navPerShare, symbol, totalSupply] = data?.map((d) => d.result) ?? [];

  return (
    <Link
      href={`/vault/${vaultAddress}`}
      className="block rounded-lg border border-black/10 dark:border-white/15 p-4 hover:border-black/30 dark:hover:border-white/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-black/60 dark:text-white/60">
          {shortenAddress(vaultAddress)}
        </span>
        {typeof symbol === "string" && (
          <span className="text-xs rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5">
            {symbol}
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-black/50 dark:text-white/50">NAV</dt>
          <dd>{formatToken(nav as bigint | undefined)}</dd>
        </div>
        <div>
          <dt className="text-black/50 dark:text-white/50">NAV / share</dt>
          <dd>{formatToken(navPerShare as bigint | undefined)}</dd>
        </div>
        <div>
          <dt className="text-black/50 dark:text-white/50">Shares outstanding</dt>
          <dd>{formatToken(totalSupply as bigint | undefined)}</dd>
        </div>
      </dl>
    </Link>
  );
}
