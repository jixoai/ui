# consumer-feedback-fixes — the six-site landing wave's upstream debts

> Evidence source: five consumer sites + the openspecui registry-consumer
> migration (2026-09-06) each hit the registry independently; the
> jixoai-website skill's "Registry CLI traps" log and the openspecui
> site's committed local patches are the receipts. This change lands the
> upstream halves so consumers stop carrying site-local patches.

## What Changes

1. **theme-toggle is localizable (P0-1)** — the mode labels (`light` /
   `dark` / `system`) and the full variant's group aria name
   (`"Color theme"`) are hardcoded English; a zh page cannot say 系统.
   New OPTIONAL `labels` prop (`{ light, dark, system, groupAriaLabel? }`,
   default = today's English): absent → byte-identical behavior; present
   → labels + aria localize. The prop is presentation vocabulary (a
   localization payload), not structure — composition-first is untouched.
2. **language-switcher owns its persistence contract (P0-2)** — the
   component never persisted the choice, so every site hand-rolled event
   delegation reading `hreflang` into localStorage (each drifting). The
   component now writes localStorage key `lang` = the target locale code
   on every locale-link click (try/catch, silent — storage can be
   unavailable), documented in the header as the contract with the
   site's language-negotiation bootstrap. Navigation stays a pure anchor
   (SSG-safe, prerender-safe).
3. **CLI install-integrity foolproofing (P0-3)** — four consumer-hit
   defects in `cli/bin/jixoai-ui.mjs`:
   - `recordInstalledItems` locked items whose files never landed (the
     shadcn overwrite prompt cancels the whole write phase under
     piped/EOF stdin). The lock now records an item ONLY after every one
     of its files exists at the alias-resolved install path; a miss
     prints the missing paths and the "move the conflicting file aside
     and retry" guidance, and the item is NOT locked.
   - shadcn sometimes drops alias targets into literal `src/@lib/`,
     `src/@ui/` and `src/vite-plugins/` directories. After every
     add-phase the CLI detects those literal directories, relocates each
     file to its alias-resolved (or project-root) path, reports the
     moves, and leaves the literal dirs empty-removed.
   - `add --help` (and any `--` token) was treated as an item name and
     spawned `shadcn add @jixoai/--help`. Item parsing now skips `--`
     tokens; `--help`/`-h` print the usage.
   - multi-item `add a b c`: the per-item spawn loop already prefixes
     EVERY item (verified by reading; no code change needed — the trap
     the skill recorded is the published-0.3.0-vs-main gap and the
     relocation fix closing the observable symptom). Recorded here so
     the next auditor doesn't re-litigate.
4. **six TS 5.9 diagnostics in shipped lib/ui sources (P1-4)** — the
   openspecui site's svelte-check gate (TS 5.9) flagged, and
   site-patched, six errors; the patches land upstream verbatim in
   intent (runtime behavior unchanged):
   - `context-plugin.svelte.ts` ×2 — readonly brand / marker assignment
     through the branded interface → mutable carrier casts.
   - `defaults.svelte.ts` ×2 — the computed unique-symbol key widens in
     `Object.assign`'s inferred type → `Object.defineProperty` brand
     stamp; the contravariant slot assertion → double cast.
   - `press-button.svelte` ×2 — `flat`'s `$derived` forward-referenced
     `resolvedRaised` → the declaration moves below it ($derived bodies
     evaluate lazily; the reorder is semantics-neutral).
5. **metadata + docs truth (P1-5)**:
   - `registry.json`: toc's `registryDependencies` gains
     `@jixoai/toc-outline` (toc.svelte imports `$lib/toc-outline`; the
     edge was standing ledger debt — the ledger entry retires with it).
   - hero-section: `copyCommand` becomes snippet-conditional — required
     when the DEFAULT copy CTA renders, optional when a `#copy` snippet
     replaces it (Props type relaxed + header/docs/registry docs
     updated).
   - scrollbar-measure docs: `import '@lib/…'` → `import '$lib/…'`
     (SvelteKit consumer dialect; `@lib` is the registry TARGET alias
     space, not an import specifier).
   - jixoai.css `--brand-hue` comment: the wall-clock hue rotation is
     ui.jixoai.com's OWN runtime behavior — the comment now says the
     static value is what registry consumers run (after their
     `init --hue` application), removing the "pre-JS flash value only"
     misreading.

## Impact

- `registry/files/ui/theme-toggle/`, `registry/files/ui/language-switcher/`,
  `registry/files/ui/hero-section/`, `registry/files/ui/press-button/`
  (+ `index.ts` type exports where a new public type appears),
  `registry/files/lib/context-plugin.svelte.ts`,
  `registry/files/lib/defaults.svelte.ts`,
  `registry/files/lib/scrollbar-measure.ts`,
  `registry/files/theme/jixoai.css` — all byte-mirrored to
  `apps/www/src/lib/**`.
- `registry.json` (toc dependency edge, hero-section/scrollbar-measure
  docs strings) + `scripts/verify-deps-baseline.json` (ledger shrink).
- `cli/bin/jixoai-ui.mjs` (install validation, relocation, arg
  discipline) — self-tested in a throwaway consumer fixture.
- `apps/www` docs pages for the three components (API rows) +
  `apps/www/test/` (theme-toggle labels spec NEW, language-switcher
  persistence spec EXTENDED).
- Specs: component-authoring (labels law, persistence contract,
  snippet-conditional payload), registry (CLI install-integrity law,
  docs dialect), context-plugin (the TS 5.9 brand-stamping lane).

## Out of scope

- Publishing/version bumps (Owner decision; the CLI fixes ride the next
  release).
- The `upgrade` command's closure story (locked-items-only refresh) —
  documented consumer guidance, not a code change here.
- The three svelte-check WARNINGS the consumer also surfaced
  (state_referenced_locally in popover/terminal-card/terminal-header) —
  warnings, not gate failures; a separate pass owns them.
