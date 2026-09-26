# spike/ssg — SvelteKit 2 + adapter-static + StyleX

The SSG/prerender spike: ≥2 routes (`/` static paints + theme/density
toggles; `/dynamic` runtime-decided style values), prerendered class
constants, render-blocking CSS timing, hydration hygiene, no-JS
render, and the per-page CSS bytes table.

## From zero to run

```bash
cd spike/ssg
npm install
npm run prepare        # svelte-kit sync
npm run build          # vite build + adapter-static → build/ (prerendered)
npm run probe          # D1-03(prod)/04/05/06(prod+dev)/07/08(prod)/09(prod)/10(dev) + CSS table
ENGINE=webkit npm run probe
```

The probe serves `build/` with `scripts/serve.mjs` (static-host
convention: extensionless paths → `<path>.html` — adapter-static with
`fallback: undefined` writes `dynamic.html` and expects the host to
resolve `/dynamic`), then spawns + recycles a `vite dev` server for
the dev-side fixtures.

## Wiring notes

- `vite.config.ts` follows the OFFICIAL example-sveltekit pattern:
  `sveltekit()` + `stylex.vite({...})` spread with `enforce: undefined`
  (the plugin-order trick), explicit `dev`/`runtimeInjection` on
  `command === 'serve'`, `debug: true` both modes (D1-06).
- `src/routes/+layout.svelte` carries the official dev-HMR boilerplate
  (`$effect(() => import('virtual:stylex:runtime'))` + the dev
  `/virtual:stylex.css` link).
- Token files MUST be imported via RELATIVE paths — `$lib/...` aliases
  break the babel-plugin's module resolution (verbatim error in the
  report).
- Prerendered pages CANNOT read `url.searchParams` (SvelteKit throws
  during prerender) — the theme/density switcher is client-side state
  (`src/lib/theme.svelte.ts`), so no-JS ships the default theme.
- Dynamic values prerender as a CSS custom property inline
  (`style="--x-width:160px"`) + default classes — L1 §5's predicted
  degradation, confirmed in `build/dynamic.html`.

## Per-page CSS delivery (prod, this machine)

```
 /         css=2917B (0.C2ffvBrf.css) js=84912B (10 files)
 /dynamic  css=2917B (0.C2ffvBrf.css) js=84301B (10 files)
```

One shared CSS asset (single app.css entry; stylex css appended);
JS differs ~600B between routes.
