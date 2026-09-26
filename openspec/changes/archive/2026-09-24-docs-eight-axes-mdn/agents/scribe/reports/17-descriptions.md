# TASK 17 — CODE descriptions (tier 2, the dl detail-view family)

- **Scribe**: scribe · 2026-09-22
- **Scope**: `apps/www/src/routes/docs/components/descriptions.html/+page.svelte` (rewritten 477 → ~590 lines) · `+page.ts` (toc rewritten) · NEW curation `apps/www/src/lib/ui/props-table/docs/descriptions.docs.ts` · `apps/www/test/canvas-same-source.spec.ts` (PILOTS entry + types/vertical/axes blocks)
- **VERDICT: COMPLETE** — all gates green; every mechanism row probed against the served family; no false claims carried forward (the old page's token table was honest this time — one empty-source bug fixed)

## Tier decision

Tier 2. The family HAS generated meta (14 prop entries) → the 2-row hand API table retired into the generated PropsTable + curation. The old page's skeleton was pre-archetype (no overview; hand theming with a DensityDemo; an `#install`/`#see-also` toc-shaped skeleton the page pins required preserving).

## Probe findings that shaped the page

1. **Density is CONSUMED through the ambient scope** — the dl/anatomy rides `--jx-gap/--jx-inset` (padding), `--jx-text/--jx-line` (dd body voice), `--jx-text-secondary/--jx-line-secondary` (dt micro-label). Measured ladder: **10/11/12/14px terms · 11/12/13/15px values · 8/8/12/16px padding across xs/sm/default/lg**; the number coefficient composes at :root and is inert (3× → 13px/12px unmoved). The named-rung stamp read live: `data-density="lg"` + `--jx-density-coefficient: 1` (exact rung, never double-scaled).
2. **Theme is the avatar frozen-pole TWIN** — the chrome's five stylex aliases (`--jx-border/--jx-card/--jx-muted/--jx-muted-foreground/--jx-foreground`) declare exactly twice in the built sheet (`:root,.xbpgcew` pole + the theme class; one `.dark` occurrence, never a theme voice). Live co-resident probe: the theme="dark" specimen carries `.dark` and NOTHING repaints — term ink/muted ground/border/card ground identical to the light specimens. Documented absence (W-next #1) — the row says so, naming the alias re-declaration as the future fix.
3. **The other six axes are supply-only** — negative-grep receipt: zero carrier reads (`--jx-size-effective|--jx-shape-effective|--jx-radius-effective|--jx-color-effective|--jx-elevation-effective|--jx-motion-effective|--jx-density-coefficient` var-reads) in ui/descriptions/. The color carrier's grammar measured verbatim on the live root (`--jx-color-effective: var(--jx-color-error)` — the §12 named indirection) with the paint unmoved.
4. **columns + the container query measured**: `--jx-desc-cols: N` inline (clamped 1–4 by truncation in the component); `@container (max-width: 640px)` folds the grid to one track — probed at 500px viewport → single track.
5. **query() case**: `density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}` — 1280 → 15px/16px, 600 → 12px/8px, 1280 → 15px/16px.

## Fixed defects found in the old page

- **The task-15 empty-source disease, live here**: the hand token table passed `source: 'structural'` for `--jx-desc-cols` → an EMPTY Source cell (SSR-measured, 1 empty cell at baseline). The new token table uses mapped sources only — 0 empty cells.
- The generated lane restores props the hand table never showed: `style` (real API — the root JOINS it after the carriers) and `children` (required snippet).

## Page structure delivered

hero → **install** (`#install` — the page pin requires it) → **overview** → usage → the lab (columns/bordered playground, hand — bind) → **lane shapes** (id="types", same-source) → examples intro → **vertical terms** (id="vertical", same-source) → **responsive columns** (hand — frame bind) → **extra header actions** (hand — echo bind) → **Props** (generated meta + curation) → **the eight axes** (id="axes", same-source; per-axis table + tokens + theme split + one real query() case) → accessibility → **see-also** (`#see-also` — the page pin).

- **EXTRA arithmetic**: meta 14 − 8 axis-named − 2 hidden (`class`, `rest` — the checkbox pattern) = **4 family rows** (columns, bordered, children*, style — SSR-verified); universal 8; axes 8; tokens 7 with **0 empty cells**.
- **No extra lane**: `bordered` is the literal slot's boolean form (own false); `columns` is the family's own HOW-prop — no axis-name casualties.
- **PILOTS**: 3 blocks (types/vertical/axes) auto-filled from the real extraction — `canvas-same-source` **84/84**.
- **toc**: `+page.ts` rewritten — 10 sections; SSR 11 anchors (main + 10), 0 dead; one h1.
- **a11y**: the dl/dt/dd semantic table preserved.

## Gate receipts (before → after)

| Gate | Before | After |
|---|---|---|
| Solo battery (8 files: docs-structure, ambient-vocab 283/283, meta-drift, canvas-same-source 84/84, composition-a, density-adoption-data, batch5-antd, defaults-form-families) | 515/515 with 1 outside flake | **515/515** |
| table-grid-toolbar-pages (descriptions pin) | 4/5 (flake) | **5/5** — after adding the `#install`/`#see-also` ids the pin demands |
| `verify:docs-universal` | — | GREEN 110/110 |
| `verify:tailwindless` | — | GREEN — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim |
| `verify:docs` | — | skeleton lint staged scope green |
| svelte-check (page + curation) | — | **0 errors**; the cx `false |` idiom errors are the family's own (untouched by me, the avatar/button-group idiom class); workspace 1615 vs 1623 baseline |
| Live probes | — | ladder 10/11/12/14 · 11/12/13/15 · 8/8/12/16; number inert; frozen-pole theme co-resident; columns clamp + container fold; query both directions |
| Raw SSR | 1 empty cell | 200; 4+8+8+7+3 tables, **0 empty**; toc 0 dead; 1 h1 |

## Incidents, honest

- **Baseline "flake" vs real regression — two different failures**: the pre-edit battery failed `table — the recipe suite renders end to end` (5s mount timeout — genuinely intermittent, 2/3 solo greens, unrelated page). The POST-edit `table-grid-toolbar-pages` failures were NOT that flake: they were the `descriptions — vertical + responsive + extra` skeleton pin demanding `#see-also` (and `#install`) — ids my rewrite had dropped when switching to DocsInstall/DocsSeeAlso wrappers. Read the assertion, added the ids, 5/5. Lesson recorded in experience.md.
- **Virtual-module staleness**: adding `id="vertical"` mid-session did not regenerate `virtual:jixoai-canvas` ("no canvas with id 'vertical' — the page ids are: [types, axes]") until a dev-server restart. The extractor itself is id-gated (extract.ts: static Text id; missing = silent skip; dynamic/dup = named error).
- **-rn trap**: zero occurrences this task (the law held).

## Process evidence

- Port **5243**: lsof empty before; two server lives (restart forced by the virtual-module staleness above); final PID `19113` killed → lsof **empty**, no ps residue, background task exit 143 (my SIGTERM). **No commits, no pushes.**
- Touched files: the two route files + the new curation + the canvas spec (git status receipt in the log).
- Artifacts: probes `/tmp/scribe-17-probe{1,2,3}.mjs` + logs; SSR before/after `/tmp/scribe-17-ssr-{before,after,final}.html`; gate logs `/tmp/scribe-17-{baseline,tgt,tgt-r1..3,tgt-f1..2,tgt-g,solos2,universal,twind,docs,scheck}.log`.
