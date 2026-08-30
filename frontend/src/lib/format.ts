import { formatUnits, parseUnits } from "viem";

export function formatToken(value: bigint | undefined, decimals = 18, fractionDigits = 4): string {
  if (value === undefined) return "—";
  const formatted = formatUnits(value, decimals);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export function parseToken(value: string, decimals = 18): bigint {
  return parseUnits(value || "0", decimals);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
