# TASK 16 — CODE color-picker (tier 2, the batch's color-instrument family)

- **Scribe**: scribe · 2026-09-22
- **Scope**: `apps/www/src/routes/docs/components/color-picker.html/+page.svelte` (rewritten 336 → ~590 lines) · `+page.ts` (toc rewritten to the archetype order) · NEW curation `apps/www/src/lib/ui/props-table/docs/color-picker.docs.ts` · `apps/www/test/canvas-same-source.spec.ts` (PILOTS entry + types/axes blocks) · `apps/www/test/fixtures/docs-ambient-vocabulary.matrix.json` (re-pinned per the avatar precedent)
- **VERDICT: COMPLETE** — all gates green, every mechanism row probed against the served family

## Tier decision

Tier 2 (full archetype rewrite). The family HAS generated meta (98-file meta dir; color-picker.meta.ts, 27 prop entries) so the hand API table retired into the generated PropsTable + curation lane; the old page (docs-restructure P0, 336 lines) had the pre-archetype skeleton (demo/types/usage/accessibility/theming/universal-props/api) with a hand API table of 9 rows that MISSED `label` entirely and pinned the falsified "CONSUMES size and color" claim.

## The headline finding: the color axis is STAMPED, never CONSUMED

The brief hypothesized real color-axis consumption. The negative-grep falsifies it:

- `rg -n -- "--jx-color-effective|--jx-size-effective|--jx-shape-effective|--jx-radius-effective|--jx-elevation-effective|--jx-motion-effective|--jx-density-coefficient" apps/www/src/lib/ui/color-picker/` → **zero hits** (exit 1).
- The family stamps the §11 carriers (color-picker.svelte:254 `stampCarriersForLanes(d)` → :411 `style={carriers}`) and nothing in color-picker.css/stylex/editor/swatches reads any of them. The old page's universal summary "The family CONSUMES size and color" is FALSE on both counts; the family source's own props comment ("CONSUMED by the family" at :180) carries the same error — **family-comment fix flagged for the family owner** (my page documents measured truth).
- The grammar still measured, verbatim on the live root style attr: `color="error"` → `--jx-color-effective: var(--jx-color-error)` (the §12 named indirection); the number form → `--jx-color-effective: oklch(var(--jx-color-formula-l, 0.6489) var(--jx-color-formula-c, 0.237) calc(200 + var(--jx-color-formula-drift, 0)))` (the chip grammar, this family's stamp byte-identical); and the lane paints NOTHING semantic under a stamped carrier (border/ground/shadow unmoved, probe-measured) — the instrument is deliberately hue-neutral.

## What IS consumed: density through the ambient scope

The well IS the density ruler: trigger min-block-size = `--jx-color-lane` = max(--jx-hit, --jx-icon + 2×--jx-inset + 2px), type = `--jx-text`, padding = --jx-inset/--jx-line (color-picker.css:25-28). Measured ladder: **34/36/46/58px well floors · 11/12/13/15px type across xs/sm/default/lg**. The NUMBER lane is inert (coefficient composes at the :root rung scopes — measured: a 3× coefficient leaves 46/13 unmoved). The named-rung stamp measured on the root: `data-density="lg"` + `--jx-density-coefficient: 1` (explicit rung resets the coefficient — exact rung, never double-scaled).

## The theme split (three classes, grep-decided, probe-confirmed)

Co-resident light/dark specimens on my own axes canvas, single-evaluate:

| Class | Voices | Measured |
|---|---|---|
| FLIPS (raw token layer; substitution at the element; the island re-declares) | caret `--primary`, swatch border `--border`, well shadow `--shadow-well`, focus ring `--ring`, panel fill `--terminal` — all re-declared under `.dark` (jixoai.css:269+) | caret L/C `0.6489/0.237 → 0.7044/0.1872`; well shadow black inset → white inset; swatch border black → white |
| FROZEN (stylex alias, substituted at :root) | trigger border/ink/ground `--jx-border/--jx-foreground/--jx-background` | identical under the island (oklch(0 0 0)/oklch(1 0 0)) |
| THEME-NEUTRAL (color-space constants) | conic swatch, pad's #fff/#000 overlays, dots' #000 halo | must read on EVERY hue — the instrument exemption |

**The brand-hue trap (probe before prose, twice over)**: the caret's hue is `var(--brand-hue)` — and `hue-runtime.svelte.ts:146` seeds `--brand-hue` on :root from a live wall-clock (4 min/deg). My first two probe runs read 254/116/235 — transient clock values, NOT token facts. The page prose cites the L/C signature + the −4° dark drift, never the absolute hue.

## Size: supply-only, per the button-group row shape

The size stamp is `--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)` INLINE on the root — the trigger's own css font-size (`--jx-text`) beats it for the field (form controls inherit no font, css:105), the well floor is the ruler equation, the editor parts are rem-fixed. Measured: the stamp moves the root's font-size and nothing on the lane.

## Composition receipts

- The popover is the PLATFORM element — native `popover="auto"` + `popovertarget` on the chevron (spec-pinned at color-picker.spec.ts:177-186), CSS Anchor Positioning (`anchor-name: --jx-color-picker-s1` measured in the root style attr; flip-block fallback; `@supports` viewport-center fallback), `::backdrop` transparent, closed-panel display:none law. NOT the ui/popover family — no duplicate-family documentation issue; the surface motion is the surface-motion kernel (the popover wiring law).
- The editor's `--jx-color-picker-hue` is the VALUE instrument's live channel (SV pad ground `hsl(var(--jx-color-picker-hue) 100% 50%)` measured) — not the color axis.

## Page structure delivered

hero → install → **overview** → usage → the picker lab (playground, hand mirror — bind:value rejection class) → **lane shapes** (id="types", SAME-SOURCE) → **bindings & errors** (hand mirrors, bind:value) → **Props** (generated meta + curation) → **the eight axes** (id="axes", same-source; per-axis table + tokens + theme split + one real query() case) → accessibility → see-also.

- **EXTRA arithmetic**: meta 27 entries − 3 quoted-duplicate collapses (`'data-density'`/`'aria-invalid'`/`'aria-describedby'`) = 24 unique − 8 axis-named − 4 hidden by curation (id, data-density, class, rest — the checkbox pattern) = **12 family rows** (SSR-verified: value bind, format, name, label, error, disabled, variant, showSwatch, showValue, lane, aria-invalid, aria-describedby); universal 8; axes 8. **0 empty cells** — every token-table source uses a mapped value (the task-15 sourceLabel lesson applied).
- **No extra lane**: no family prop shares an axis name (`variant` is the surface slot's own literal — no chip casualty).
- **query()**: `density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}` both generics (the §6 law documented inline); measured 1280 → 58/15, 600 → 36/12, 1280 → 58/15.
- **toc**: +page.ts rewritten — 8 sections, SSR-verified 8/8, 0 dead anchors, `#theming` retired. one h1 (hero).
- **a11y**: the honest-limits table preserved verbatim; the swatch is --jx-hit sized (default 40px exceeds the 28px default floor; 2xs sits at the 24px AA minimum — the fleet ruling, used if cited).

## Matrix re-pin (the avatar precedent, documented in-fixture)

`docs-ambient-vocabulary.matrix.json` (34 entries): color-picker's two hand-table[0] rows retired — density re-pinned to tableIndex 1 (the axes-table call site carries the tracked ambient-scope rows; the meta table holds index slot 0), size ADDED at table[1] (the bijection's delete-attack requires every tracked ambient row pinned), and the variant own-marker entry REMOVED (the generated family table's own marker is not AST-pinnable — the curation restores the bare `'auto'` literal the extractor does not emit for literal slots). Full reasoning in the fixture notes.

## Gates (before → after)

| Gate | Before | After |
|---|---|---|
| Solo battery (meta-drift, canvas, docs-structure, ambient-vocab, color-picker, input-picker-bridge, defaults-form-families) | 425/425 (5 files) | **484/484** (7 files) |
| `verify:docs-universal` | — | GREEN 110/110 |
| `verify:tailwindless` | — | GREEN — files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim |
| `verify:docs` | — | skeleton lint staged scope green |
| svelte-check (page + curation) | — | **0 errors** (workspace baseline 1623 pre-existing, unchanged) |
| Live probes | — | ladder 34/36/46/58 · 11/12/13/15; number inert; stamps grammar-verbatim; theme flip/frozen/neutral; query both directions |
| Raw SSR | — | 200; toc 8/8, 0 dead; 12+8+8 tables; 0 empty cells; 1 h1 |

## Process evidence

- Port **5243**: lsof empty before; PID `63732` killed after → lsof **empty**, background task exit 143 (my SIGTERM). **No commits, no pushes.**
- Baseline solos ran BEFORE the first page edit (425/425), after-battery 484/484.
- The dev-server log caught the one mid-flight 500 (axes canvas missing `files` — the drawer crashes on undefined) — fixed by composing the drawer from the extraction, which also earned the second PILOTS block.
- Multi-writer collision on canvas-same-source.spec.ts handled by re-read + re-edit (vitest -u had rewritten the file under me).
- Artifacts: probes `/tmp/scribe-16-probe{1,2,3,4,5,6,7,8,9}.mjs` + logs; SSR before/after `/tmp/scribe-16-ssr-{before,after,final}.html`; gate logs `/tmp/scribe-16-{baseline,solos,solos2,universal,twind,docs,scheck,matrix*}.log`.
- `-rn` trap discipline: caught myself twice mid-task (the --replace flag mangling output); re-ran clean both times — the AGENTS.md law is load-bearing.
