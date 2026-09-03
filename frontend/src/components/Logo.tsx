"use client";

import { useState } from "react";

/**
 * The X1 Vault logo.
 *
 * Tries the real asset first and falls back to a drawn placeholder only if
 * none is present, so dropping a file into `public/` is the whole install.
 * Candidates are tried in order: SVG scales cleanly at chrome sizes, so it
 * wins where both exist.
 *
 * The drawn fallback is an approximation, not the brand. It exists so the
 * app is never unbranded, not as a substitute for the real mark.
 */

const WORDMARK_SOURCES = ["/logo.svg", "/logo.png", "/logo.webp"];
const MARK_SOURCES = ["/logo-mark.svg", "/logo-mark.png", "/logo-mark.webp"];

function DrawnWordmark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 156 38" fill="none" className={className} role="img" aria-label="X1 Vault">
      <g stroke="currentColor" strokeWidth="7.5" strokeLinecap="butt">
        <path d="M8 6 L30 32" />
        <path d="M30 6 L8 32" />
      </g>
      <path d="M39 32 L43 6" stroke="var(--brand)" strokeWidth="7.5" strokeLinecap="butt" />
      <g stroke="currentColor" strokeWidth="4.5" strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M56 6 L63 32 L70 6" />
        <path d="M76 32 L83 6 L90 32" />
        <path d="M96 6 V24 a7 7 0 0 0 14 0 V6" />
        <path d="M116 6 V32 H130" />
        <path d="M134 6 H148 M141 6 V32" />
      </g>
    </svg>
  );
}

function DrawnMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 50 38" fill="none" className={className} role="img" aria-label="X1 Vault">
      <g stroke="currentColor" strokeWidth="7.5" strokeLinecap="butt">
        <path d="M8 6 L30 32" />
        <path d="M30 6 L8 32" />
      </g>
      <path d="M39 32 L43 6" stroke="var(--brand)" strokeWidth="7.5" strokeLinecap="butt" />
    </svg>
  );
}

/** Steps through candidate files, then gives up to the drawn version. */
function AssetOrFallback({
  sources,
  className,
  Fallback,
}: {
  sources: string[];
  className: string;
  Fallback: ({ className }: { className: string }) => React.ReactElement;
}) {
  const [index, setIndex] = useState(0);

  if (index >= sources.length) return <Fallback className={className} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={sources[index]}
      src={sources[index]}
      alt="X1 Vault"
      className={className}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}

/** Full lockup, for the sidebar. */
export function Wordmark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <AssetOrFallback sources={WORDMARK_SOURCES} className={className} Fallback={DrawnWordmark} />
  );
}

/** Monogram only, for the mobile header and other tight spots. */
export function LogoMark({ className = "h-6 w-auto" }: { className?: string }) {
  return <AssetOrFallback sources={MARK_SOURCES} className={className} Fallback={DrawnMark} />;
}
