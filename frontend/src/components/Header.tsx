import Link from "next/link";
import { ConnectButton } from "./ConnectButton";

export function Header() {
  return (
    <header className="border-b border-border-subtle bg-surface-1">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-bold text-white"
          >
            V
          </span>
          <span className="font-semibold tracking-tight">Vault</span>
          <span className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-ink-muted">
            X1 EcoChain
          </span>
        </Link>
        <ConnectButton />
      </div>
    </header>
  );
}
