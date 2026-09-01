"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWrongNetwork } from "@/hooks/useNetwork";
import { useVaultAddresses } from "@/hooks/useVaults";
import { ACTIVE_CHAIN } from "@/lib/config";
import { DEMO_VAULTS, IS_DEMO } from "@/lib/demo";

const NAV = [
  { href: "/", label: "Overview", icon: GridIcon },
  { href: "/strategies", label: "Strategies", icon: ChartIcon },
  { href: "/activity", label: "Activity", icon: FeedIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isWrongNetwork } = useWrongNetwork();
  const { addresses } = useVaultAddresses();

  // Name the network the app actually reads from, not the wallet's -- those
  // can differ, and the wallet's is the one that's wrong when they do.
  const networkLabel = IS_DEMO
    ? "Preview — no network"
    : isWrongNetwork
      ? `${ACTIVE_CHAIN.name} — wallet elsewhere`
      : ACTIVE_CHAIN.name;

  const vaultCount = IS_DEMO ? DEMO_VAULTS.length : addresses.length;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-1 lg:flex">
      <div className="px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white"
          >
            V
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight text-ink">Vault</span>
            <span className="block text-[10px] uppercase tracking-widest text-ink-muted">
              Protocol
            </span>
          </span>
        </Link>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              IS_DEMO || isWrongNetwork ? "bg-warning" : "bg-good"
            }`}
          />
          <span className="truncate text-xs text-ink-secondary">{networkLabel}</span>
        </div>
      </div>

      <nav className="mt-6 px-3">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-widest text-ink-muted">Workspace</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-surface-2 font-medium text-ink"
                  : "text-ink-secondary hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <Icon />
              <span className="flex-1">{label}</span>
              {label === "Strategies" && vaultCount > 0 && (
                <span className="rounded bg-surface-1 px-1.5 text-xs text-ink-muted">
                  {vaultCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <nav className="mt-6 px-3">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-widest text-ink-muted">Protocol</p>
        <a
          href="https://github.com/Dapo114ui/Vault/tree/main/docs"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <BookIcon />
          <span className="flex-1">Documentation</span>
          <ExternalIcon />
        </a>
      </nav>
    </aside>
  );
}

const iconClass = "h-4 w-4 shrink-0 text-ink-muted";

function GridIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 13V7M8 13V3M13 13v-4" strokeLinecap="round" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 4h10M3 8h10M3 12h6" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M3 3h4a2 2 0 0 1 2 2v8a1.5 1.5 0 0 0-1.5-1.5H3V3Z" />
      <path d="M13 3H9a2 2 0 0 0-2 2v8a1.5 1.5 0 0 1 1.5-1.5H13V3Z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 text-ink-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M6 3h7v7M13 3 6.5 9.5" strokeLinecap="round" />
      <path d="M11 10v3H3V5h3" strokeLinecap="round" />
    </svg>
  );
}
