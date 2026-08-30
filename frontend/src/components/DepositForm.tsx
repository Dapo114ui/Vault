"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, vaultAbi } from "@/lib/abis";
import { wagmiConfig } from "@/lib/config";
import { formatToken, parseToken } from "@/lib/format";

export function DepositForm({
  vaultAddress,
  baseAssetAddress,
  baseAssetDecimals,
  baseAssetSymbol,
}: {
  vaultAddress: `0x${string}`;
  baseAssetAddress: `0x${string}`;
  baseAssetDecimals: number;
  baseAssetSymbol: string;
}) {
  const { address: userAddress } = useAccount();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "approving" | "depositing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract({
    address: baseAssetAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(userAddress) },
  });

  const { data: allowance } = useReadContract({
    address: baseAssetAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: userAddress ? [userAddress, vaultAddress] : undefined,
    query: { enabled: Boolean(userAddress) },
  });

  const amountBig = amount ? parseToken(amount, baseAssetDecimals) : 0n;
  const needsApproval = amountBig > 0n && (allowance ?? 0n) < amountBig;
  const isBusy = status === "approving" || status === "depositing";

  async function handleSubmit() {
    if (!userAddress || amountBig <= 0n) return;
    setError(null);
    try {
      if (needsApproval) {
        setStatus("approving");
        const hash = await writeContractAsync({
          address: baseAssetAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [vaultAddress, amountBig],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash });
        await queryClient.invalidateQueries();
      }
      setStatus("depositing");
      const hash = await writeContractAsync({
        address: vaultAddress,
        abi: vaultAbi,
        functionName: "deposit",
        args: [amountBig],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash });
      await queryClient.invalidateQueries();
      setAmount("");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
      <h3 className="font-medium">Deposit</h3>
      <p className="mt-1 text-xs text-black/50 dark:text-white/50">
        Balance: {formatToken(balance, baseAssetDecimals)} {baseAssetSymbol}
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          disabled={isBusy}
          className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={!userAddress || amountBig <= 0n || isBusy}
          className="whitespace-nowrap rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {status === "approving" ? "Approving…" : status === "depositing" ? "Depositing…" : needsApproval ? "Approve & Deposit" : "Deposit"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
