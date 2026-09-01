"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { Sidebar } from "./Sidebar";

const CRUMB: Record<string, string> = {
  "/": "Overview",
  "/strategies": "Strategies",
  "/activity": "Activity",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumb = CRUMB[pathname] ?? (pathname.startsWith("/vault/") ? "Vault" : "");

  return (
    <div className="flex min-h-full">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-3.5">
          <nav className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="text-ink-muted hover:text-ink">
              Vault
            </Link>
            {crumb && (
              <>
                <span className="text-ink-muted">/</span>
                <span className="text-ink">{crumb}</span>
              </>
            )}
          </nav>
          <ConnectButton />
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
