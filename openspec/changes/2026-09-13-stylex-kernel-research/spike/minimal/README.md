# spike/minimal — Svelte 5 + Vite 8 + StyleX (no React, no Tailwind)

The D1 toolchain spike: dev injection (`style[data-stylex]`), HMR
without full reload, FOUC timing, `$state` dynamic values, pseudo-class
+ keyframes dev≡prod parity, and the token-typo compile gate.

## From zero to run

```bash
cd spike/minimal
npm install            # exact pins in package.json (npm only — no pnpm/yarn)
npm run probe:dev      # D1-01/02/03(dev)/06(dev)/08(dev)/09(dev) — spawns+recycles its own vite dev server on :5291
npm run build          # production build → dist/ (the CSS entry src/app.css is REQUIRED — see report)
npm run probe:prod     # D1-03(prod)/05/06(prod)/08(prod)/09(prod) — spawns+recycles vite preview on :5292
node scripts/probe-check.mjs   # D1-12 — svelte-check typo gate (writes+removes a bad .svelte)
ENGINE=webkit node scripts/probe-dev.mjs   # WebKit run (D1-13)
ENGINE=firefox node scripts/probe-dev.mjs  # Firefox run (LIMITATION on this machine — no build installed)
```

Chrome discovery (scripts/browser.mjs): `CHROME_PATH` env → playwright
cache (`~/Library/Caches/ms-playwright/chromium-*`) → system Chrome.
This machine resolved to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
WebKit resolved via playwright-core's registry (`webkit-2336`).

## Layout

- `vite.config.ts` — the unplugin config (debug:true both modes,
  `propertyValidationMode:'throw'`, `runtimeInjection` dev-only, the
  `enforce: undefined` plugin-order trick).
- `src/App.svelte` — the D1 probe surface (`data-d1`-tagged elements).
- `src/tokens.stylex.ts` — defineVars tokens (the D1-12 typo target).
- `scripts/probe-dev.mjs` / `probe-prod.mjs` / `probe-check.mjs` —
  the fixtures; each owns its server lifecycle and prints recycle
  evidence.

## Findings encoded here (details in research/spike-report.md)

1. **No CSS entry → unstyled prod build**: with zero CSS imports the
   unplugin writes `dist/assets/stylex.css` but index.html never links
   it. `src/app.css` (comments only) is the required CSS entry.
2. **`style[data-stylex]` requires `runtimeInjection: true`** — the
   unplugin 0.19.0 default dev path fetches `/virtual:stylex.css` into
   a plain `<style id="__stylex_virtual__">` instead.
3. **`background`/`border` shorthands are silently dropped** by
   babel-plugin 0.19.0 (default `propertyValidationMode: 'silent'`);
   author longhands + pin `'throw'`.
