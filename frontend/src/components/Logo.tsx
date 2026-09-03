"use client";

import { useState } from "react";

/**
 * The X1 Vault logo.
 *
 * It renders `public/logo.svg` (or `logo-mark.svg` for the monogram) when
 * that file exists, and falls back to the drawn version below when it does
 * not. Drop the real asset in and it is picked up with no code change; the
 * fallback only exists so the app is never unbranded in the meantime.
 *
 * The drawn version is a reconstruction by eye and is not the real mark —
 * treat it as a placeholder, not as the brand.
 */

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

/** Full lockup: X1 monogram plus the VAULT wordmark. */
export function Wordmark({ className = "h-7 w-auto" }: { className?: string }) {
  const [useFile, setUseFile] = useState(true);

  if (useFile) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.svg"
        alt="X1 Vault"
        className={className}
        onError={() => setUseFile(false)}
      />
    );
  }
  return <DrawnWordmark className={className} />;
}

/** Monogram only, for tight spots like the mobile header. */
export function LogoMark({ className = "h-6 w-auto" }: { className?: string }) {
  const [useFile, setUseFile] = useState(true);

  if (useFile) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo-mark.svg"
        alt="X1 Vault"
        className={className}
        onError={() => setUseFile(false)}
      />
    );
  }
  return <DrawnMark className={className} />;
}
