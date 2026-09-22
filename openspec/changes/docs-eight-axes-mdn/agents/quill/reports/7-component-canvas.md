# Report 7 — quill CODE of component-canvas (task 7)

- agent: quill · date: 2026-09-22 · route:
  `apps/www/src/routes/docs/components/component-canvas.html/+page.svelte`
  (+page.ts) · new curation:
  `apps/www/src/lib/ui/props-table/docs/component-canvas.docs.ts` · re-pin:
  `apps/www/test/docs-ambient-vocabulary.spec.ts` (exemption scan target)
- family read FIRST (measurement-first): component-canvas.svelte (805 L) +
  canvas-playground.svelte (1075 L, the W7 bar) + component-canvas.css +
  surface/component-canvas.stylex.ts + component-canvas-defaults.svelte.ts +
  the generated meta — the page documents the W7 ship, not memory
- baseline before edits: verify:tailwindless GREEN (receipt verbatim below) ·
  verify:docs-universal 110/110 · verify:docs staged green · affected specs
  solo 407/407 (7 files) · svelte-check 1644 ERRORS / 1031 WARNINGS (the
  post-cascader state)

## Tier: 2 优化重构 — justified

The bones were good and current (the W7 bar already narrated in hero/theming
prose; the recursion demo, the schema-driven six-lane demo, the motion seat,
the same-source law all real). What failed the archetype: NO per-axis table
(§2.5's heart — the W7 two-seats story had no reference rows), a hand-written
19-row props table (the migration's exact anti-pattern), no Overview, no
install, no see-also, hero summary a wall, order ≠ §2, and a theming
TokenTable with copied-literal press-shadow values the family css contradicts
(`--jx-press-shadow: '0 1px 2px rgb(0 0 0 / 0.08)'` vs the real per-element
tuning: none on install/copy, shadow-2xs/xs on source/code-toggle — my own
chip lesson recurring). Restructured to the archetype, kept every demo and
law byte-honest, filled the gaps. Tier 3 would have risked the tuned demo
wiring for no information gain.

## Changes

1. `+page.svelte` — archetype order: hero (summary cut to 2 sentences) →
   DocsInstall → **Overview** (new: the canvas-law content folded —
   platform-first law, P1 protocol, outline law, chrome-only dock, postures,
   the depth-two recursion cap) → Usage → the recursive workbench (kept
   verbatim incl. live usage tracking) → **Props** (generated meta + docs
   curation) → **The eight axes on component-canvas** (per-axis table + the
   census citation + the fixed-voice TokenTable + the schema-driven six-lane
   demo kept + ONE real query() case) → Same-source (kept) → Accessibility
   (extended with the bar's menu a11y) → DocsSeeAlso. Removed: canvas-law /
   types / theming sections (folded), the hand props array, the stale press
   TokenTable. Kept: the svelte:head motion-seat style block (the motion
   axis's page-side consumer).
2. `+page.ts` — ToC re-derived to DOM order; survivor ids kept
   (usage/accessibility/api/canvas-workbench/same-source); canvas-law/types/
   theming dropped (content folded, noted in the file comment).
3. `component-canvas.docs.ts` (NEW) — curation over the generated meta:
   prose for 19 family props (required asserted on title/files/children;
   values bindable), **EXTRA-lane rescue doubled**: `theme` (stage-preview
   'light'|'dark' bindable) and `density` (the Density rung bindable,
   `ambient: 'own'` — the stage-boundary posture) both share axis names and
   would be silently dropped by UNIVERSAL_AXIS_NAMES; the extra lane re-adds
   them with their real unions (the chip precedent — landed post-fix, the
   rows render: SSR receipt below).
4. `docs-ambient-vocabulary.spec.ts` — the component-canvas#density
   exemption RE-PINNED with evidence: the pinned row moved from the page's
   hand table into the curation's extra lane, so the scan target moves with
   it (same three facts: default `'default'`, no ambient inside the default,
   'page-owned bindable' prose) + an additive theme-twin assertion pinning
   both §13 seats in the extra lane. Zero pinned intent deleted.

## The axis story (grep receipts → page claims)

- `grep -e "--jx-*-effective" component-canvas.css component-canvas.stylex.ts
  canvas-playground.svelte component-canvas.svelte` → **zero consumers** (exit
  1): none of the six lanes repaints the workbench chrome. The chrome's real
  reads are fixed kernel channels (--jx-text / -small / -label / -micro,
  --jx-hit band, the per-element --jx-press-shadow tuning) — the positive
  fixed-voice TokenTable documents them.
- The two-seats model (W7): dock-owned `axes` state (seven lanes, all-auto
  seed) joined `consumer-explicit ?? bar-lane` via GETTER-FIELDED barLanes →
  ONE resolve → §11 carriers joined into the root style attr (merge law) →
  provideUniversalLanes supply → query anchor on the section. `auto` = no
  opinion; the ambient keeps flowing. Supply, never force.
- theme/density: the §13 no-rename seats (census D-fold row, W6-dossier-
  flagged beside code-card/mermaid); the W7 bar later gave the density AXIS
  its supply seat. The prop's own default keeps `--jx-density-coefficient: 1`
  on the root (SSR-greppable on every canvas root) while the rung attr rides
  the STAGE.

## Receipts — SSR grep (curl :5241, served page)

| claim (page) | SSR receipt | verdict |
|---|---|---|
| extra-lane rescue renders | 'Stage preview theme' ×1, 'Stage preview density' ×1; density cell `'default' · Own default, not ambient` ×1 | TRUE |
| the bar ships on every canvas | `data-jx-canvas-theme-toggle` ×4, `data-jx-canvas-axis="size"` ×4, `data-jx-canvas-dock-axes` ×4 (4 canvases: workbench + inner + lanes demo + query demo) | TRUE |
| menu items carry auto + check | `data-jx-canvas-axis-check` ×159, `data-axis-auto` ×29 | TRUE |
| outline law | `data-toc-skip` ×5 (4 canvases + 1 in a drawer sample string), title is `p[data-jx-canvas-title]` | TRUE |
| query() case is real and base-painted | `query({ md: 18 }, 14)` in code ×2 (CodeBlock + drawer); the demo root stamps `--jx-size-effective: 14px` at SSR (the §9.1 base) | TRUE |
| 吃也供 gloss | first prose mention carries the ruled form ×1; the only other occurrence is the pre-existing jixoai.css source comment in the inlined sheet (out of docs scope) | TRUE |

## Receipts — the ONE probe (/tmp/quill-7-axis-probe.mjs, 10/10 TRUE)

| # | claim | probe | result |
|---|---|---|---|
| P1 | query() base at SSR | root font-size at 700px viewport | 14px — TRUE |
| P1 | the em caption follows the lane | caption 0.875 × root at both rungs | 12.25px / 15.75px — TRUE |
| P1 | steps to 18 at the md rung | root font-size at 1000px (≥48rem) | 18px — TRUE |
| P2 | chrome stays fixed | head title 13px at BOTH viewports (--jx-text channel, not em) | TRUE |
| P3 | theme flip is stage-scoped | bar toggle → stage data-theme="dark" + dark class; ROOT classList clean | TRUE |
| P3 | aria-pressed carries state | false at light → true after the flip | TRUE |
| P4 | bar at rest: auto + pressed-false | `data-axis-auto="true"` (Svelte data-attr boolean rendering), `aria-pressed="false"` | TRUE |
| P5 | explicit-beats-bar is structurally visible | the query canvas's bar size button still `data-axis-auto` while the root rides the explicit resolved lane | TRUE |

## Re-pin evidence (the one spec edit)

`docs-ambient-vocabulary.spec.ts` pinned the canvas density PROP row where it
lived — the hand table's `default: "'default'"` row. The generated-table
migration moved that row into the curation's extra lane (the baseline skill
§6's own EXTRA-lane law; "when a page and this document disagree, this
document wins"). The re-pin scans `component-canvas.docs.ts`'s extra lane
with the same ts-AST parser and asserts the identical three facts, plus the
theme twin (additive). Solo run 288/288 green.

## Gates (log-file + $? discipline; all my own runs)

| gate | result | evidence |
|---|---|---|
| dev-smoke :5241 | PASS | SSR 200 / 1,091,876 B; universal marker ×1; H1 renders; greps above |
| `npm run build` | exit 0 | fresh dist; component-canvas.html carries the marker ×1 |
| `verify:docs-universal` | GREEN 110/110 | "110/110 component pages render the shared universal section (110 markers)" (/tmp/quill-7-du-final.log) |
| `verify:tailwindless` | GREEN, receipt UNMOVED | "files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim" (/tmp/quill-7-tl-final.log) |
| `verify:docs` | GREEN | "✓ all docs pages pass the skeleton lint (staged scope green)" (/tmp/quill-7-vd-final.log) |
| canvas-same-source solo | GREEN | within the 7-file affected run (the page embeds live canvases; it carries no ids → no extraction, the documented zero-cost posture) |
| affected specs solo | 407/407 BEFORE → 410/410 AFTER | the +3 is shared-tree drift: accordion/badge joined canvas PILOTS mid-task (commits 61e3561d / 6900340b); per-file counts stable elsewhere (/tmp/quill-7-specs-baseline.log, -final2.log) |
| scoped svelte-check | 1644 → **1644** (count-neutral) | the page carries exactly 7 errors, ALL pre-existing code carried from the old page (the cx-idiom overload ×1 + the specimen re-stamp's 6 axisLaneOf→UniversalLanes QueryResult mismatches — byte-identical call sites the old page shipped); 0 new (/tmp/quill-7-sc.log) |

## Process receipt

Dev server: wrapper PID 93600 / vite listener PID 93664 (`npm run dev -- --
port 5241 --strictPort` → /tmp/quill-7-dev.log), killed by PID after the
smoke; `ps -p` → gone; `lsof -i :5241 -sTCP:LISTEN` → empty (exit 1). Probe
script + SSR captures + all gate logs in /tmp only. Working tree: my diff is
the four files above; siblings' in-flight files untouched. No commits, no
push. Measurement-only verification — no visual judgment entered any verdict.
