"use client";

import { ExplorerLink } from "./ExplorerLink";
import { formatBps } from "@/lib/format";

type Row = { label: string; address?: `0x${string}` };

/**
 * The addresses behind a vault, plus who is paid the performance fee.
 *
 * The fee is charged in newly minted shares, which dilutes existing holders
 * rather than deducting from a balance -- so a depositor cannot see it in
 * their own token balance, and it has to be stated.
 */
export function VaultContracts({
  vaultAddress,
  shareTokenAddress,
  baseAssetAddress,
  riskManagerAddress,
  strategyExecutorAddress,
  feeRecipient,
  feeBps,
  shareSymbol,
  isDemo = false,
}: {
  vaultAddress: `0x${string}`;
  shareTokenAddress?: `0x${string}`;
  baseAssetAddress?: `0x${string}`;
  riskManagerAddress?: `0x${string}`;
  strategyExecutorAddress?: `0x${string}`;
  feeRecipient?: `0x${string}`;
  feeBps?: number;
  shareSymbol?: string;
  isDemo?: boolean;
}) {
  const rows: Row[] = [
    { label: "Vault", address: vaultAddress },
    { label: "Share token", address: shareTokenAddress },
    { label: "Base asset", address: baseAssetAddress },
    { label: "Risk manager", address: riskManagerAddress },
    { label: "Strategy executor", address: strategyExecutorAddress },
  ];

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-1 p-5">
      <h2 className="font-medium text-ink">Contracts &amp; fees</h2>

      <dl className="mt-3 divide-y divide-border-subtle border-y border-border-subtle">
        {rows.map(({ label, address }) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="text-xs text-ink-muted">{label}</dt>
            <dd className="tabular font-mono text-xs text-ink-secondary">
              {address ? (
                isDemo ? (
                  <span>{`${address.slice(0, 6)}…${address.slice(-4)}`}</span>
                ) : (
                  <ExplorerLink kind="address" value={address} />
                )
              ) : (
                "—"
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs text-ink-muted">Performance fee paid to</span>
          <span className="tabular font-mono text-xs text-ink-secondary">
            {feeRecipient ? (
              isDemo ? (
                <span>{`${feeRecipient.slice(0, 6)}…${feeRecipient.slice(-4)}`}</span>
              ) : (
                <ExplorerLink kind="address" value={feeRecipient} />
              )
            ) : (
              "—"
            )}
          </span>
        </div>
        <p className="mt-2 max-w-prose text-xs text-ink-muted">
          {formatBps(feeBps)} of profit above the high-water mark is charged as newly minted{" "}
          {shareSymbol ?? "share"} tokens paid to that address. Minting new shares dilutes every
          existing holder proportionally, so the charge will not appear as a deduction from your
          balance — your share of the vault gets slightly smaller instead.
        </p>
      </div>
    </div>
  );
}
