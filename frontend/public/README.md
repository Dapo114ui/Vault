# Brand assets

Two files are picked up automatically by `src/components/Logo.tsx` when
present. Neither is committed yet, because the originals have not been
handed over.

| File | Used for | Notes |
|---|---|---|
| `logo.svg` | Full lockup (sidebar) | X1 monogram + VAULT wordmark |
| `logo-mark.svg` | Monogram only (mobile header) | Just the X1 |

Until they exist, the app falls back to a drawn approximation in
`Logo.tsx`. That fallback is a placeholder, not the brand — replace it.

## Getting the real files in

Drop both into this directory and commit. No code change is needed; the
component tries the file first and only falls back when it 404s.

A note on colour: the logo is designed on near-black. The app renders on a
light surface by default, so **export the artwork with the black background
removed** and the wordmark in a single flat colour — the component tints it
via CSS so it inverts correctly in both themes. If your only copy has the
black background baked in, a PNG will still work but will show a black box
on the light theme.
