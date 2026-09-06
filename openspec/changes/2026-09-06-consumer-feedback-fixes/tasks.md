# Tasks

## 1. P0-1 theme-toggle labels

- [ ] 1.1 `labels?: ThemeToggleLabels` prop (`{ light, dark, system,
      groupAriaLabel? }`, exported type) — absent = today's English,
      byte-identical behavior; header comment Props documentation
- [ ] 1.2 full variant: labels render per mode, group aria name
      localizes; hideLabels aria fallback localizes
- [ ] 1.3 mirror sync + theme-toggle spec (defaults unchanged, custom
      labels, aria)

## 2. P0-2 language-switcher persistence

- [ ] 2.1 click on any locale anchor (pair + menu) writes
      `localStorage.lang = code` (try/catch silent); anchor navigation
      unchanged; header comment states the `lang` key contract
- [ ] 2.2 mirror sync + language-switcher persistence spec

## 3. P0-3 CLI install integrity

- [ ] 3.1 recordInstalledItems verifies every file exists on disk at
      its alias-resolved path before locking; miss → explicit warning
      (missing paths + move-aside-and-retry guidance), item NOT locked
- [ ] 3.2 post-add relocation: literal `src/@lib/`, `src/@ui/`,
      `src/vite-plugins/` dropped files move to their alias/root
      paths, reported; empty literal dirs removed
- [ ] 3.3 `add` arg discipline: `--` tokens never become item names;
      `--help`/`-h` print usage; multi-item per-item spawn prefix
      verified (documented in proposal §3)
- [ ] 3.4 throwaway-fixture self-test (mock registry via file://, no
      network)

## 4. P1-4 TS 5.9 source fixes

- [ ] 4.1 context-plugin.svelte.ts: mutable-carrier brand + readOnly
      assignments (2 diagnostics)
- [ ] 4.2 defaults.svelte.ts: Object.defineProperty brand stamp +
      double-cast slot assertion (2 diagnostics)
- [ ] 4.3 press-button.svelte: `flat` below `resolvedRaised` (forward
      reference; 2 diagnostics)
- [ ] 4.4 mirror sync + consumer-gate proof (svelte-check 0 errors on
      the swapped-in sources)

## 5. P1-5 metadata + docs

- [ ] 5.1 registry.json: toc += `@jixoai/toc-outline`; ledger entry
      retired (verify:deps ratchet shrinks 19→18)
- [ ] 5.2 hero-section copyCommand snippet-conditional (type + header
      + registry docs + docs page API row)
- [ ] 5.3 scrollbar-measure docs `$lib` dialect (registry docs string
      + file header)
- [ ] 5.4 jixoai.css --brand-hue comment rewritten for consumer
      context (mirror both sides)
- [ ] 5.5 apps/www docs pages: theme-toggle labels row,
      language-switcher persistence note

## 6. Gates

- [ ] 6.1 gen-mirror-manifest regenerated; verify:mirror green
- [ ] 6.2 verify:deps + verify:press + verify:surface + targeted
      vitest (language-switcher, theme-toggle, press-button,
      context-plugin, defaults, props-table-meta-drift) green
- [ ] 6.3 build:registry (registry.json JSON validity through shadcn)
- [ ] 6.4 test:types (apps/www) no NEW failures (the pre-existing
      paint-axis 2xs failure is recorded, not owned here)
- [ ] 6.5 three-stage commit (spec → implementation + tasks →
      archive) on main
