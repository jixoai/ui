# Report 10 — quill CODE of dropdown-menu (task 10)

- agent: quill · date: 2026-09-22 · route:
  `apps/www/src/routes/docs/components/dropdown-menu.html/+page.svelte`
  (+page.ts) · new curation:
  `apps/www/src/lib/ui/props-table/docs/dropdown-menu.docs.ts` · matrix
  refresh: `test/fixtures/docs-ambient-vocabulary.matrix.json` (−2 superseded
  t0 rows) + `test/docs-ambient-vocabulary.spec.ts` (scoped candidate
  exemption)
- pre-flight pin grep (the task-9 lesson): dropdown-menu appears in 10 test
  files — the affected set was baselined BEFORE the edit; the two ambient-
  vocabulary pins on the old hand table were known going in
- family read first: dropdown-menu.svelte (417 L) + dropdown-menu.css (the
  consumption law) + stylex + defaults (elevation OWN level2) + the item

## Tier: 2 优化重构 — justified

Bones: a strong hero, a live demo canvas with the last-action echo
playground, a good platform/component split section, a real a11y table.
Gaps: no Overview, no per-axis table, a hand-written props table (legacy),
a thin W3-era universal-props section (elevation only), no install/
see-also, no query() case, order ≠ §2. Same repair shape as checkbox:
restructure, keep, fill.

## Diff

1. `+page.svelte` — archetype order: hero → install → **Overview** (the
   platform/component split folded + the composed-consumer paragraph naming
   the five composers) → usage → live demo (kept) → **Props** (generated
   meta + new curation; the item keeps its hand table — a separate
   component with no meta) → **The eight axes on dropdown-menu** (per-axis
   table + census citation + both demos + query case + two TokenTables) →
   accessibility (kept) → see-also. Removed: types/theming/universal-props
   (folded).
2. `+page.ts` — ToC re-derived (6 ids; survivors usage/api/accessibility/
   dropdown-menu-demo kept).
3. `dropdown-menu.docs.ts` (NEW) — root-table prose (id required, variant's
   literal-slot own, placement's span semantics, the provider density). No
   EXTRA lane: `variant` is not an axis name; it renders from the meta with
   the Own-default marker.
4. Matrix refresh (evidence below): removed the two dropdown-menu t0
   entries (orphaned — their rows migrated into the generated machinery);
   added the scoped candidate exemption for the per-axis mechanism table
   (the inline-code#variant precedent).

## The axis story (grep receipts → rows)

- **CONSUMED (four)**:
  - density — dropdown-menu.css:39-44: trigger/item min-block-size `--jx-hit`,
    gap `--jx-gap`, padding `--jx-inset`, font `--jx-text`/`--jx-line`; the
    named rung stamps data-density on the anchor AND the panel; the menu is a
    STRUCTURAL PROVIDER (inherit-then-provide, the eager-capture r11 law) —
    items and composers resolve through the same contract.
  - shape — css:28: `corner-shape: var(--jx-shape-effective, round)` on
    .jx-menu.
  - radius — css:32-33 + svelte:167-171, BOTH forms: explicit = the menu is
    the CONCENTRIC ANCHOR (`--jx-radius-consumed: effective × factor`);
    auto = the §3 concentric calc verbatim as the css fallback.
  - elevation — the §7 pair (`elevationSurfaceOf`) stamped on the panel;
    the slot's OWN is level2 (3dp, M3's menu rung — the census batch C
    mapping); an explicit level steps the theme's table.
- **SUPPLY-ONLY (three + one split)**: size/color/motion carry the
  negative-grep receipt (`grep -e "--jx-size-effective" -e
  "--jx-color-effective" -e "--jx-motion-effective" ui/dropdown-menu/` → 0);
  theme SPLITS (below). The composed consumers are named in the Overview:
  breadcrumb's composed menu, menubar, navigation-menu, button-group
  overflow, and the component-canvas dock's axis bar (which mounts the family
  on THIS page at density xs — the page demonstrates its own composer).
- **THEME-SPLIT** (declaring-selector grep, voice by voice): FLIPS under the
  panel's .dark — the bezel (--popover/--border, jx-surface-body), the panel
  ink (--popover-foreground, .jx-menu) and the walk highlight with it
  (color-mix over currentColor), the focus ring (--ring), the destructive
  hover pair (raw). STAYS FROZEN (stylex :root aliases) — the trigger chrome
  (--jx-background/--jx-border/--jx-foreground, hover --jx-muted) and the
  destructive label (--jx-destructive). Probed: dark panel bezel
  oklch(0.96→0.185) while the trigger ground stays oklch(1 0 0) byte-identical.

## EXTRA-lane arithmetic (raw SSR)

meta = 16 props; axis-named filtered = 8; rendered main table = **8 rows**
(16 − 8 = 8, extras 0 — exact); universal section = 8; item hand table = 3
rows; per-axis table = 8. Marker ×1. ToC 6/6 unique. 吃也供 gloss ×1 at the
first supply mention (Overview).

## SSR + probe receipts

| claim | receipt | verdict |
|---|---|---|
| portal law: carriers stamp the PANEL | every closed panel's style attr carries the carriers + `--jx-radius-consumed` + `--jx-elevation-effective: 3` (level2 own) in the raw SSR | TRUE |
| radius BOTH forms visible | auto panel: `calc(max(0px, effective − inset-effective) × factor)`; medium panel: `--jx-radius-effective: var(--jx-radius-medium)` + the no-inset product | TRUE |
| radius auto honestly zeroes | probe: auto panel border-radius **0px** (root invariants); medium panel **8px** — the disagreement pair, both greppable in the style attrs | TRUE |
| elevation own level2 vs level4 | probe (body element): shadow recipes differ (2px/6px vs 3px/10px), surface fills differ (oklch 0.96 vs 0.92), `--jx-elevation-effective` 3 vs 8 | TRUE |
| theme split | probe: dark bezel oklch(0.185) vs light oklch(0.96) — flips; trigger ground oklch(1 0 0) in BOTH — frozen | TRUE |
| density ladder + query flip | trigger min-block-size 32px (sm) / 48px (lg); query demo `data-density="lg"` at SSR base, `"sm"` at 1440px, `"lg"` again at 600px (< 40rem) — the caption's direction verbatim | TRUE |
| the family composing itself | the canvas dock's 14 axis menus render at density xs on this page (`jx-canvas-dropdown-menu-axis-*` panels in the SSR) | TRUE |

## Matrix refresh (evidence-bearing)

The ambient-vocabulary matrix pinned the OLD hand table's rows: variant#1 t0
(`'auto' · Own default, not ambient`) and density#1 t0 (`ambient scope`). The
generated-table migration made table[0] meta-driven — the page-source parser
skips meta calls by design (they hold an index slot with no rows), so both
pins found 0 candidates. The rows' facts did not change hands blind:
- variant's Own-'auto' + density's ambient-scope now render from the
  GENERATED meta/universal section, gated by verify:meta (this spec's own
  meta-side check includes dropdown-menu's ambient fields) + the 110-page
  universal manifest;
- the item hand table's density#1 t1 pin still passes (kept);
- my per-axis mechanism table (table[2]) introduced the first axisRows
  candidates INSIDE the bijection domain — exempted scoped to dropdown-menu
  t2 with the rationale comment (the inline-code#variant precedent:
  "exempt: invariant-locked").
Solo after: docs-ambient-vocabulary **284/284** green. The two retired t0
entries are the deletion the evidence demanded; every ambient fact remains
pinned somewhere named in the comment.

## Gates

| gate | result | evidence |
|---|---|---|
| dev-smoke :5241 | PASS | SSR 200 / 1,007,102 B; marker ×1; ToC 6/6; panel stamps greppable |
| affected specs solo BEFORE | 435 passed / 9 failed — ALL 9 avatar.html (a sibling's in-flight pilot edits; zero dropdown files) | /tmp/quill-10-specs-baseline.log |
| affected specs solo AFTER | **435/435 GREEN** (the avatar drift resolved by the sibling between runs; my matrix refresh landed) | /tmp/quill-10-specs-final2.log |
| `npm run build` | **exit 0** — breadcrumb was fixed by scribe mid-task; fresh dist | /tmp/quill-10-build.log |
| `verify:docs-universal` | GREEN 110/110 (fresh dist) | /tmp/quill-10-du-f.log |
| `verify:docs` | GREEN (fresh dist) | /tmp/quill-10-vd-f.log |
| `verify:tailwindless` | GREEN, receipt verbatim unmoved | files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 |
| svelte-check | fleet 1650 (sibling +2); dropdown-menu.html exactly **1** error — the standing cx idiom at 91:28; count-neutral for my files | /tmp/quill-10-sc.log |

## Process receipt

Dev server wrapper 63512 / vite 63542 killed by PID; `ps` gone; `lsof :5241`
empty (exit 1). Probes /tmp/quill-10-axis-probe.mjs + quill-10-probe2.mjs +
SSR capture + gate logs in /tmp only. Working tree: my diff is the four files
above; breadcrumb/avatar siblings' in-flight files untouched (their build
blocker and pilot drift attributed, not staged). No commits, no push.
Measurement-only — no visual judgment entered any verdict.
