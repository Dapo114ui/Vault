import { VAULT_FACTORY_ADDRESS } from "./config";

/**
 * Demo mode renders the dashboard with clearly-labelled sample vaults when no
 * VaultFactory address is configured -- which is the case until the contracts
 * are deployed to X1 EcoChain (see ../../../docs/RESEARCH_NOTES.md).
 *
 * These numbers are illustrative only. Every surface that shows them also
 * shows that they are sample data, and all write actions are disabled, so
 * demo output is never mistakable for real on-chain activity.
 */
export const IS_DEMO = !VAULT_FACTORY_ADDRESS;

export type DemoVault = {
  address: `0x${string}`;
  name: string;
  shareSymbol: string;
  baseSymbol: string;
  strategy: string;
  /** All 1e18-scaled, matching the contracts' accounting. */
  nav: bigint;
  navPerShare: bigint;
  highWaterMark: bigint;
  sharesOutstanding: bigint;
  performanceFeeBps: number;
  caps: {
    maxPositionSize: bigint;
    maxSingleAssetBps: number;
    maxDrawdownBps: number;
  };
};

const e18 = (whole: string): bigint => {
  const [int, frac = ""] = whole.split(".");
  return BigInt(int + frac.padEnd(18, "0").slice(0, 18));
};

export const DEMO_VAULTS: DemoVault[] = [
  {
    address: "0xDe0000000000000000000000000000000000A001",
    name: "Ecodex Momentum",
    shareSymbol: "vECOM",
    baseSymbol: "USDT",
    strategy: "Trend-following on X1/USDT",
    nav: e18("412500"),
    navPerShare: e18("1.184"),
    highWaterMark: e18("1.184"),
    sharesOutstanding: e18("348395"),
    performanceFeeBps: 2000,
    caps: {
      maxPositionSize: e18("50000"),
      maxSingleAssetBps: 4000,
      maxDrawdownBps: 1500,
    },
  },
  {
    address: "0xDe0000000000000000000000000000000000A002",
    name: "Stable Carry",
    shareSymbol: "vSTBC",
    baseSymbol: "USDT",
    strategy: "LP fee capture on Ecodex stable pools",
    nav: e18("276000"),
    navPerShare: e18("1.041"),
    highWaterMark: e18("1.052"),
    sharesOutstanding: e18("265129"),
    performanceFeeBps: 1000,
    caps: {
      maxPositionSize: e18("40000"),
      maxSingleAssetBps: 2500,
      maxDrawdownBps: 500,
    },
  },
  {
    address: "0xDe0000000000000000000000000000000000A003",
    name: "X1 Accumulation",
    shareSymbol: "vX1AC",
    baseSymbol: "USDT",
    strategy: "Scheduled X1 accumulation with drawdown stop",
    nav: e18("98400"),
    navPerShare: e18("0.968"),
    highWaterMark: e18("1.113"),
    sharesOutstanding: e18("101652"),
    performanceFeeBps: 1500,
    caps: {
      maxPositionSize: e18("25000"),
      maxSingleAssetBps: 6000,
      maxDrawdownBps: 2000,
    },
  },
];

export function getDemoVault(address: string): DemoVault | undefined {
  return DEMO_VAULTS.find((v) => v.address.toLowerCase() === address.toLowerCase());
}

export const DEMO_TOTAL_NAV = DEMO_VAULTS.reduce((sum, v) => sum + v.nav, 0n);
