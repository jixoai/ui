# Tasks

## 1. P0-1 theme-toggle labels

- [x] 1.1 `labels?: ThemeToggleLabels` prop (`{ light, dark, system,
      groupAriaLabel? }`, exported type) — absent = today's English,
      byte-identical behavior; header comment Props documentation
- [x] 1.2 full variant: labels render per mode, group aria name
      localizes; hideLabels aria fallback localizes
- [x] 1.3 mirror sync + theme-toggle spec (defaults unchanged, custom
      labels, aria, unlocalized value domain) — 7/7 green

## 2. P0-2 language-switcher persistence

- [x] 2.1 click on any locale anchor (pair + menu) writes
      `localStorage.lang = code` (try/catch silent); anchor navigation
      unchanged; header comment states the `lang` key contract
- [x] 2.2 mirror sync + language-switcher persistence spec (4 new
      tests: menu click, pair click, no-preventDefault, hostile
      storage) — 14/14 green

## 3. P0-3 CLI install integrity

- [x] 3.1 recordInstalledItems verifies every file exists on disk at
      its alias-resolved path before locking; miss → explicit warning
      (missing paths + move-aside-and-retry guidance), item NOT locked
- [x] 3.2 post-add relocation: literal `src/@lib/`, `src/@ui/`,
      `src/vite-plugins/` dropped files move to their alias/root
      paths, reported; empty literal dirs removed
- [x] 3.3 `add` arg discipline: `--` tokens never become item names;
      `--help`/`-h` print usage; multi-item per-item spawn prefix
      verified (each item spawns `shadcn add @jixoai/<item>` —
      self-test calls.log shows both prefixed invocations)
- [x] 3.4 throwaway-fixture self-test (file:// registry + fake npx on
      PATH, zero network): T1 --help usage/no spawn, T2 cancelled
      write → NOT locked + warning, T3 misplacement → relocated +
      both items locked with verified paths

## 4. P1-4 TS 5.9 source fixes

- [x] 4.1 context-plugin.svelte.ts: mutable-carrier brand + readOnly
      assignments (2 diagnostics)
- [x] 4.2 defaults.svelte.ts: Object.defineProperty brand stamp +
      double-cast slot assertion (2 diagnostics)
- [x] 4.3 press-button.svelte: `flat` below `resolvedRaised` (forward
      reference; 2 diagnostics)
- [x] 4.4 mirror sync + consumer-gate proof: originals swapped into
      the openspecui website → svelte-check "6 errors" (the exact
      six); fixed sources swapped in → "0 errors"; consumer tree
      restored (git checkout, zero residue)

## 5. P1-5 metadata + docs

- [x] 5.1 registry.json: toc += `@jixoai/toc-outline`; ledger entry
      retired — verify:deps ratchet 19→18 GREEN
- [x] 5.2 hero-section copyCommand snippet-conditional (type + header
      + registry docs + docs page API row)
- [x] 5.3 scrollbar-measure docs `$lib` dialect (registry docs string
      + file header)
- [x] 5.4 jixoai.css --brand-hue comment rewritten for consumer
      context (mirror both sides)
- [x] 5.5 apps/www docs pages: theme-toggle labels row + localized
      demo, language-switcher persistence row, hero-section
      copyCommand row

## 6. Gates

- [x] 6.1 gen-mirror-manifest regenerated (113 items / 450 pairs);
      verify:mirror GREEN
- [x] 6.2 verify:deps + verify:meta + verify:standards GREEN; targeted
      vitest (theme-toggle, language-switcher, press-button ×2,
      defaults, context-plugin, props-table ×2) 128/128 green;
      verify:surface 47/47 green against a fresh dev server (one
      45/47 run proven frame-timing flake — clean-main and re-run both
      47/47); verify:press runs its press-law probes green but the
      harness crashes PRE-EXISTING at the playground matrix (the
      2026-09-04 canvas refactor removed the native <select> rows the
      script drives — not in this change's face; see proposal Out of
      scope)
- [x] 6.3 build:registry green; payload spot-checks (toc dep edge,
      labels, lang persistence, optional copyCommand, carrier cast,
      defineProperty) all present in public/r
- [x] 6.4 test:types: same single pre-existing paint-axis 2xs type
      failure as the pre-change baseline (1 failed typecheck, zero
      new); full plain suite tabs-indicator failure proven
      parallel-load flake (67/67 in isolation)
- [x] 6.5 three-stage commit (spec → implementation + tasks →
      archive) on main
