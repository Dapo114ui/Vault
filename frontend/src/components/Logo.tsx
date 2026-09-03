/**
 * The X1 Vault wordmark, drawn as a vector rather than set in a font so the
 * letterforms stay fixed: a bold X1 monogram where the 1 carries the brand
 * green and tucks against the X, then VAULT at a lighter weight with the
 * crossbar-less A the mark is built around.
 *
 * The strokes use `currentColor`, so the mark inverts with the surface —
 * dark on the light theme, light on the dark one — while the 1 stays brand
 * green on both. If you have the original asset, drop it at
 * `public/logo.svg`; the layout below is sized to take an <img> instead.
 */
export function Wordmark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 172 38"
      fill="none"
      className={className}
      role="img"
      aria-label="X1 Vault"
    >
      {/* X — heavier than the wordmark, as in the mark */}
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="butt">
        <path d="M8 6 L28 32" />
        <path d="M28 6 L8 32" />
      </g>

      {/* 1 — the one element in brand colour, overlapping the X's right arm */}
      <path d="M35 32 L40 6" stroke="var(--brand)" strokeWidth="7" strokeLinecap="butt" />

      {/* VAULT — lighter weight, wide-set, A drawn without a crossbar */}
      <g
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      >
        <path d="M60 6 L68 32 L76 6" />
        <path d="M82 32 L90 6 L98 32" />
        <path d="M104 6 V23 a8 8 0 0 0 16 0 V6" />
        <path d="M126 6 V32 H142" />
        <path d="M145 6 H161 M153 6 V32" />
      </g>
    </svg>
  );
}

/** Just the X1 monogram, for tight spots like a mobile header. */
export function LogoMark({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 46 38" fill="none" className={className} role="img" aria-label="X1 Vault">
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="butt">
        <path d="M8 6 L28 32" />
        <path d="M28 6 L8 32" />
      </g>
      <path d="M35 32 L40 6" stroke="var(--brand)" strokeWidth="7" strokeLinecap="butt" />
    </svg>
  );
}
