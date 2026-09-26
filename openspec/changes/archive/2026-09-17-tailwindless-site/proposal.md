# The tailwindless site — the first consumer eats its own tokens (Owner 2026-09-17)

## Why

The Owner's ruling: the www site is jixoai-ui's FIRST use case — as long
as the site itself runs on Tailwind, every consumer is hard-bound to the
Tailwind pairing (our components emit utility classes only Tailwind
defines). The de-Tailwind process is ALSO the design-token re-collection
(收纳): theme-able values become token steps, and the Context+cssToken
philosophy threads end to end — every visual decision routes through a
CSS token the nearest theme scope can retune with zero per-page
knowledge.

Census (research/site-census.md; interim regex estimate — the P0
AST extractor recalibrates): **397 files, ~21k utility occurrences** —
routes ~15.1k · site libs ~3.7k · lib/ui components ~2.3k across 101
files (byte-mirrored into the registry: the DISTRIBUTED side of the
hard binding).

## What Changes — the end-state law + the phased program

THE TAILWINDLESS LAW rides the EXISTING placement lanes — there is NO
second utility system (the Gate-1 ruling killed the draft's
hand-rolled jx-atoms sheet):

- **Lane 1 (atoms) extends to the site**: registry components
  complete their STANDING stylex migration (the placement law's
  changed lane — the kernel corpus proved 9 families' sources; ~101
  real files to go, the migration ledger gains a completion
  schedule); site surfaces (routes + site libs) author atom modules
  at `apps/www/src/lib/surface/<name>.stylex.ts` — UNDER the
  transform root (the kernel-scope gate transforms only src/lib +
  registry/files; routes import, never author outside; NO plugin
  include change).
- **The value rule (three tiers)**: structural constants lawful;
  theme-able values MUST ride tokens — a literal there is a MISSING
  STEP, promoted into the sheet (the 收纳); recurring composites
  become REGISTERED semantic rules in lane-2 sheets (owner + selector
  + scope recorded), never utility lookalikes.
- **The gate** (`verify:tailwindless`): AST extraction (Svelte
  `class=`/`class:` + TS `cn()`/template strings; doc-string sample
  code EXCLUDED), a REGISTERED dynamic-producer list (`cn()`,
  `resolveTextStyle`, slot resolvers — each enumerating its legal
  identities), per-file ALLOWLISTS of surviving identities + counts
  (growth CI-red; migrated files at zero), and negative tests (a new
  utility → red; an equal-count swap → red; an unregistered producer
  identity → red).
- **Pfinal's negative end-state** is enumerated in the law's delta:
  every Tailwind directive (`@import 'tailwindcss'`, `@theme`,
  `@custom-variant`, `@utility`), the `@tailwindcss/vite` plugin in
  both vite configs, `tailwind-merge` in the cn() seam, the print
  clone's `dark:` stripping, `check-tw4-prereq.mjs` + the registry
  install prerequisite (the consumer contract flips to theme-sheet
  only), and the dependency entries — all deleted, with the stylex
  payload's layer contract re-proven post-Tailwind (dual import-order
  browser probe).

### Phases (each its own change, gated like this one)

- **P0 (THIS change)**: the law + the AST gate with per-file budgets
  (pinned by the gate's own extractor; the machine-readable contract
  is research/tailwindless-allowlist.json — schema committed with
  this change, populated by the extractor) + ONE REAL REGISTRY
  FAMILY migrated end-to-end — **separator** (its re-authored
  `.stylex.ts` source of record already exists in the kernel corpus):
  component rewire, mirror, payload rebuild, registry.json — plus the
  CLEAN CONSUMER receipt (a plain-vite spot project, ZERO Tailwind
  and zero @stylexjs, installing the migrated separator item + the
  theme sheet and rendering it — extending verify:stylex-payload's
  existing spot-compile machinery; the kernel corpus page keeps its
  name honestly as the kernel/payload fixture) + ONE pilot page
  migrated end-to-end (`docs/components/timeline.html` — high
  density: arbitrary values, hover composites, complex grids,
  responsive seams) with the acceptance matrix below. P0 CREATES the
  token steps it promotes (jixoai.css + tokens.stylex + the typed
  map + mirror land IN this change — no forward dependency on P1).
- **P1** (`2026-09-17-tailwindless-p1-tokens`): the token 收纳 AUDIT
  — the whole sheet's scale completeness, the exception registry
  sweep, the design-tokens spec delta (P0's created steps
  referenced, not re-litigated).
- **P2** (`2026-09-17-tailwindless-p2-components`): registry
  components (~101 files, ledger schedule) — mirror-synced, payload
  rebuilt, and the REGISTRY SPEC DELTA lands here (the tw4 install
  prerequisite retires for migrated items; `check-tw4-prereq.mjs`
  narrows then dies); the cn()/tailwind-merge seam's replacement
  ships WITH this phase at the latest.
- **P3**: site libs (~3.7k).
- **P4..Pn**: routes by zone batches.
- **Pfinal**: the negative end-state above; budget EMPTY.

### The P0 acceptance matrix (per surface, with the pilot)

viewport × container-width matrix (1100px+ seams, sm/lg equivalents),
dark-scope parity, keyboard focus visibility, forced-colors,
print/PagedJS (print-viewport's media→container rewriting included) —
plus the vision subagent's before/after section parity walkthrough.
Responsive seams become CONTAINER queries on an ancestor host (a
container never matches itself) or registered semantic media rules;
hover/focus stay NATIVE pseudo selectors inside semantic rules (NOT
JS data-attr rewrites — the Gate-1 correction).
