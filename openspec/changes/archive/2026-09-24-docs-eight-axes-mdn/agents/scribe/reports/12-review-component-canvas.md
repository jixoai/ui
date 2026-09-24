# scribe review 2 — component-canvas (task 12, docs-eight-axes-mdn)

Agent: scribe · 2026-09-22 · reviewer role, main dir, no commits.
Scope: `apps/www/src/routes/docs/components/component-canvas.html/`
(+page.svelte, +page.ts), `component-canvas.docs.ts`, and the re-pinned
ambient spec/matrix. Independence law honored: this file was written
BEFORE opening marginalia/reports/11-review-component-canvas.md; the
consolidation note is appended.

## Verdict: PASS — page #9 closure declared

Every claim in my review loadout re-derived from the current tree and
held. Zero BLOCKER/MAJOR/MINOR findings; two NIT-grade observations
recorded for the dossier, neither worth a fix round.

## 1. W7 bar numbers on the CURRENT tree — all TRUE

- **28 valued `data-jx-canvas-axis="<axis>"`** in raw SSR = 7 axis menus
  × 4 canvases on the page (workbench outer + inner, the six-lane schema
  demo, the responsive-size demo); Counter: size/shape/radius/density/
  color/elevation/motion ×4 each. Total attribute references 195 (menus'
  check-mark items included). The theme seat is the aria-pressed cycle
  button, deliberately outside the axis-menu set — consistent with the
  a11y table's "seven axis icon-buttons".
- **28 `data-axis-auto="true"`** at rest (7 × 4) — every menu rests on
  auto, the honestly-inert seed.
- **query() base 14→18px with the 0.875× em caption** — probed both
  directions: viewport ≥48rem caption 15.75px (0.875 × 18), <48rem
  12.25px (0.875 × 14), round-trip stable. The stage re-bases; the
  caption follows.
- **Chrome title 13px fixed** — `#jx-canvas-component-canvas-title` is a
  styled `<p>` (the outline law) at 13px (--jx-text) while the stage
  re-bases; the chrome genuinely does not follow the size lane.
- **Theme flip stage-scoped, root clean** — clicking the dock's Toggle
  theme: exactly ONE `[data-theme="dark"]` appears, INSIDE the canvas
  root (`root.contains` true), carrying the `dark` token-scope class
  with the ground flipped dark; the root itself carries NO data-theme
  attr and NO dark class (its style stays the density pin); the head
  title ink stays black; restore returns dark count to 0.
- **The density default's pin** — all 4 canvas roots carry
  `style="--jx-density-coefficient: 1"` (the prop's own 'default' rung
  through the legacy slot), exactly as the density row claims
  ("grep any canvas root" — greped, 4/4).

## 2. EXTRA rescue doubled — arithmetic verified from raw SSR

Family table = **21 rows**: 27 generated meta props − 6 split-axis
lanes (size/shape/radius/color/elevation/motion → the shared section)
− 2 name-filtered §13 seats (theme, density) + 2 extra-lane rows
(theme 'light'|'dark' bindable; density the repo-standard rung union)
= 21, row names parsed one by one from the built tables. The shared
section renders the eight axes verbatim; no meta twins of theme/
density survive (single rows). My task-9 review independently verified
this same rescue mechanism at the from-meta level (reference spread +
identity filter); here I confirm its second consumer renders.

## 3. The re-pin honesty — TRUE

- Ambient vocabulary spec solo: **284/284**.
- The carrier-freeze comment names its replacement gates explicitly:
  verify:meta (the generated metas), verify:explicit-props E2 (the
  TS-AST axis-surface census gate), plus the 110-page universal
  manifest — the founding-13 list is kept as history above the live
  carrier set.
- The t2 exemption is narrowly scoped and PINNED BY CODE, not comment:
  an AST scan of `component-canvas.docs.ts`'s extra lane asserts the
  three facts (density row present exactly once, default `'default'`
  with no ambient marker, "page-owned bindable" prose). canvas-
  playground's carrier retirement (the dock-head rung select) is
  recorded with its replacement surface (the bar's axes record).

## 4. press-shadow literals → per-element tuning — TRUE

`component-canvas.css:374-385` is the per-element tuning the TokenTable
row now states: `--jx-press-shadow(-hover/-active): none` on the
install badge + copy-usage toggle; `shadow-2xs / xs / xs-press` on the
source anchor + code toggle. No copied literal remains.

## 5. Standard checks

- **Tier: 2 confirmed.** The W7-era page (e6f477dc, 284 lines) had four
  DOM ids absent from the toc (canvas-law/types/theming/universal-props
  — dead rows), no overview, no generated props table, no per-axis
  table, no query() case. The recursion demo, the motion seat, and the
  same-source law survived verbatim into the new page — tier 2's
  information-preservation duty met; tier 3 would have discarded real
  machinery, tier 1 could not reach the archetype.
- **Archetype order + toc vs DOM**: hero → Install → Overview → Usage →
  recursive workbench → Props (generated meta + curation, marker ×1) →
  the eight axes (per-axis table + schema demo + query case + fixed-
  voice TokenTable) → same-source law → Accessibility → See also. All 7
  toc ids resolve; survivor deep-link ids kept deliberately (the toc
  comment documents the fold); See also out of the toc (the ruling).
- **THEME-SPLIT**: the theme row documents the §13 stage-preview seat
  per voice — data-theme + the theme sheet's dark/jx-light token-scope
  classes on the STAGE element only, chrome and siblings never re-theme
  (probed: exactly the scope claim holds, restore clean). The color row
  additionally carries the specimen-scope re-stamp caveat (the
  canvas-bug law) — source-consistent.
- **query() form**: the number-lane bare form `query({ md: 18 }, 14)` —
  ruled eligible under the §6 inference rule (no explicit generic list;
  O and B both infer) and empirically clean: ZERO svelte-check errors on
  the page (the old W7 page carried 7; quill's round fixed all of them —
  workspace idiom debt actually shrank here).
- **Declaring-element**: the density row's two-seat split is stated with
  the mechanism (the rung stamped on the STAGE as scope boundary; the
  lane riding the bar into the root supply); the pin verified 4/4.
- **吃也供 gloss**: first mention glossed "(吃也供, supply-and-consume)"
  in the axes summary ✓; en-US clean.
- **grep test/ pins**: ambient AST pins cover the extra lane facts; the
  hardening pins from my task 10 (identity + render-count) cover the
  rescue mechanism this page depends on.

## Findings summary

| # | severity | note |
|---|---|---|
| 1 | PASS | page + bar + arithmetic + re-pin + press-shadow: all verified TRUE |
| 2 | NIT (observation) | TokenTable's `description` field is dead surface (W-next #3 convergence already filed by marginalia — nothing to add beyond my task-11 receipt) |
| 3 | NIT (observation) | `data-jx-canvas-axis` totals 195 raw occurrences (28 valued + 159 check refs); brief's "28 hits" = the valued buttons — worth pinning the COUNTING RULE in any future gate so the numbers stay comparable |

No BLOCKER, MAJOR, or MINOR. **PASS — component-canvas closure declared**
(page #9 in the campaign's closure order, after date-picker #8 if
marginalia's review lands first; the order is the orchestrator's
bookkeeping — the page itself is done).

## Processes

- Port 5243: lsof empty before start; dev server killed by listener PID
  + wrapper PID — `listeners=0 wrappers=0` receipt. No build needed
  (review-only; no repo source writes).
- Probes: /tmp/scribe-12-probe.mjs (+probe2/probe3/dom — two selector
  iterations and one stale-element-reference artifact self-caught and
  documented), logs alongside. SSR parsed from /tmp/scribe-12-ssr.html.
- svelte-check full run: /tmp/scribe-12-svelte-check.log — the page
  carries ZERO diagnostics (down from the W7 page's 7); the 7 remaining
  on canvas-playground.svelte are the family file's pre-existing idiom
  debt (out of doc scope; down from 15 at task 8's baseline).

---

## Consolidation note (appended after cross-reading marginalia's 11-review-component-canvas.md)

Cross-read complete. Convergence: marginalia's PASS verified the same
four extras and the W7 bar; my independent re-derivation confirms every
number they reported (28 valued axis attributes = 7×4, 28
data-axis-auto at rest, 21 family rows with theme+density extras, the
14→18px em-caption query case, the stage-scoped theme flip). Their
"ambient solo 284" matches my solo run on the current tree. My additive
contributions: the 195-occurrence counting-rule clarification (NIT), the
press-shadow css line receipts (374-385), the old-page tier audit
numbers (284 lines, 4 dead toc ids), and the probe-artifact lesson (the
stage element is re-created on theme flip — stale references read the
pre-flip node; re-query after the flip). PASS stands; closure stands.
