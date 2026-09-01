"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { parseAbiItem, formatUnits } from "viem";
import { DemoBanner, SampleTag } from "@/components/DemoBanner";
import { useVaultAddresses } from "@/hooks/useVaults";
import { DEMO_ACTIVITY, IS_DEMO } from "@/lib/demo";
import { shortenAddress } from "@/lib/format";

const EVENTS = [
  parseAbiItem("event Deposit(address indexed user, uint256 assetsIn, uint256 sharesOut)"),
  parseAbiItem("event Withdraw(address indexed user, uint256 sharesIn, uint256 assetsOut)"),
  parseAbiItem("event SwapExecuted(address[] path, uint256 amountIn, uint256 amountOut)"),
];

/** Bounded lookback -- public RPCs cap eth_getLogs ranges. */
const LOOKBACK = 50_000n;

const amt = (v: unknown) => (typeof v === "bigint" ? Number(formatUnits(v, 18)).toLocaleString() : "—");

export default function Activity() {
  const client = usePublicClient();
  const { addresses } = useVaultAddresses();

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ["activity", addresses],
    enabled: !IS_DEMO && Boolean(client) && addresses.length > 0,
    queryFn: async () => {
      if (!client) return [];
      const latest = await client.getBlockNumber();
      const fromBlock = latest > LOOKBACK ? latest - LOOKBACK : 0n;

      const perVault = await Promise.all(
        addresses.map(async (address) => {
          const logs = await Promise.all(
            EVENTS.map((event) => client.getLogs({ address, event, fromBlock, toBlock: latest }))
          );
          return logs.flat();
        })
      );

      return perVault
        .flat()
        .sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)))
        .slice(0, 50);
    },
  });

  return (
    <>
      {IS_DEMO && <DemoBanner />}

      <div className={IS_DEMO ? "mt-8" : ""}>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Activity</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Deposits, withdrawals and strategy trades, read directly from vault events.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle bg-surface-1">
        {IS_DEMO ? (
          DEMO_ACTIVITY.map((row, i) => (
            <Row
              key={i}
              kind={row.kind}
              vault={row.vault}
              detail={row.detail}
              meta={`${row.actor} · ${row.ago}`}
              sample
            />
          ))
        ) : isLoading ? (
          <Empty>Loading activity…</Empty>
        ) : error ? (
          <Empty>Could not load events from this RPC endpoint.</Empty>
        ) : !entries || entries.length === 0 ? (
          <Empty>
            No vault activity in the last {LOOKBACK.toLocaleString()} blocks.
          </Empty>
        ) : (
          entries.map((log, i) => {
            const name = log.eventName as string;
            const args = log.args as Record<string, unknown>;
            const detail =
              name === "Deposit"
                ? `${amt(args.assetsIn)} in → ${amt(args.sharesOut)} shares`
                : name === "Withdraw"
                  ? `${amt(args.sharesIn)} shares → ${amt(args.assetsOut)} out`
                  : `${amt(args.amountIn)} → ${amt(args.amountOut)}`;
            return (
              <Row
                key={`${log.transactionHash}-${i}`}
                kind={name}
                vault={shortenAddress(log.address)}
                detail={detail}
                meta={`block ${log.blockNumber?.toString() ?? "—"}${
                  args.user ? ` · ${shortenAddress(args.user as string)}` : " · strategy"
                }`}
              />
            );
          })
        )}
      </div>
    </>
  );
}

const KIND_DOT: Record<string, string> = {
  Deposit: "bg-good",
  Withdraw: "bg-warning",
  SwapExecuted: "bg-accent",
};

function Row({
  kind,
  vault,
  detail,
  meta,
  sample,
}: {
  kind: string;
  vault: string;
  detail: string;
  meta: string;
  sample?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[kind] ?? "bg-ink-muted"}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">{kind}</span>
          <span className="truncate text-sm text-ink-secondary">{vault}</span>
          {sample && <SampleTag />}
        </div>
        <p className="tabular mt-0.5 truncate text-xs text-ink-muted">{detail}</p>
      </div>
      <span className="shrink-0 text-xs text-ink-muted">{meta}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-ink-muted">{children}</p>;
}
