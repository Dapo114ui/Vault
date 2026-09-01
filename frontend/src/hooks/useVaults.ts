"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { erc20Abi, vaultAbi, vaultFactoryAbi } from "@/lib/abis";
import { VAULT_FACTORY_ADDRESS } from "@/lib/config";

/** Every vault the factory has deployed. */
export function useVaultAddresses() {
  const { data: vaultsCount } = useReadContract({
    address: VAULT_FACTORY_ADDRESS,
    abi: vaultFactoryAbi,
    functionName: "vaultsCount",
    query: { enabled: Boolean(VAULT_FACTORY_ADDRESS) },
  });

  const count = vaultsCount !== undefined ? Number(vaultsCount) : 0;

  const { data } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: VAULT_FACTORY_ADDRESS,
      abi: vaultFactoryAbi,
      functionName: "vaults" as const,
      args: [BigInt(i)] as const,
    })),
    query: { enabled: count > 0 },
  });

  const addresses = (data ?? [])
    .map((entry) => entry.result as `0x${string}` | undefined)
    .filter((a): a is `0x${string}` => Boolean(a));

  return { count, addresses };
}

/**
 * The connected wallet's position across every vault, plus protocol totals.
 * Derived entirely from current state -- shares held x NAV/share -- so it
 * needs no indexer. Cost basis (and therefore realised P&L per depositor)
 * would: shares are transferable, so it can't be recovered from state alone.
 */
export function usePortfolio() {
  const { address: userAddress } = useAccount();
  const { addresses } = useVaultAddresses();

  const { data: vaultState } = useReadContracts({
    contracts: addresses.flatMap((vault) => [
      { address: vault, abi: vaultAbi, functionName: "nav" as const },
      { address: vault, abi: vaultAbi, functionName: "navPerShare" as const },
      { address: vault, abi: vaultAbi, functionName: "shareToken" as const },
    ]),
    query: { enabled: addresses.length > 0 },
  });

  const perVault = addresses.map((vault, i) => ({
    vault,
    nav: vaultState?.[i * 3]?.result as bigint | undefined,
    navPerShare: vaultState?.[i * 3 + 1]?.result as bigint | undefined,
    shareToken: vaultState?.[i * 3 + 2]?.result as `0x${string}` | undefined,
  }));

  const { data: balances } = useReadContracts({
    contracts: perVault.map(({ shareToken }) => ({
      address: shareToken,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: userAddress ? ([userAddress] as const) : undefined,
    })),
    query: { enabled: Boolean(userAddress) && perVault.every((v) => Boolean(v.shareToken)) },
  });

  const totalNav = perVault.reduce((sum, v) => sum + (v.nav ?? 0n), 0n);

  const positionValue = perVault.reduce((sum, v, i) => {
    const shares = balances?.[i]?.result as bigint | undefined;
    if (!shares || !v.navPerShare) return sum;
    return sum + (shares * v.navPerShare) / 10n ** 18n;
  }, 0n);

  const totalShares = perVault.reduce((sum, _v, i) => {
    const shares = balances?.[i]?.result as bigint | undefined;
    return sum + (shares ?? 0n);
  }, 0n);

  return { addresses, perVault, totalNav, positionValue, totalShares };
}
