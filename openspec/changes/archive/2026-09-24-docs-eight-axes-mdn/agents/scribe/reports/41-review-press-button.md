# Task 41 — SECOND REVIEW press-button (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS — the page closes (DONE as #39).** All four closure
clauses (80720a6a) verified landed — mirror integrity, the wording in
both copies, the caveat's cite accurate, and the theme claims
re-measured LIVE post-closure, including a THIRD hue sample that
extends the wall-clock ledger (125 → 137 since the closure commit, L/C
invariant throughout). Independence law kept: findings formed from my
own source reads + probes BEFORE opening marginalia's report 38.

**Reviewed**: `apps/www/src/routes/docs/components/press-button.html/`
(+page.svelte 992 lines, +page.ts 12-entry toc) +
`apps/www/src/lib/ui/press-button/` (7 files, 3274 lines) + the registry
mirror — the tree's only in-flight files are quill's skeleton.html and
vellum's scroll-area.html (untouched; neither keys anything I ran).

## The closure clauses — verified landed

### 1. The 42px drift fix, MIRRORED — VERIFIED-TRUE

All 7 family files **byte-IDENTICAL** across `apps/www/src/lib/ui/press-button/`
and `registry/files/ui/press-button/` (diff -q ×7). The docstring at
press-button.svelte :408 carries the new wording — "rendered square
rides the density hit channel (40.0px measured at …)" — in BOTH copies;
**zero 42px remnants** in svelte/ts/css on either side (grep). The
same-source drawer's data path verified end-to-end: the page imports
`press-button.svelte?raw` (build-time inline), and the compiled `?raw`
module endpoint serves the fixed text (**`40.0px measured at` ×1, zero
42px**). SSR byte note: the drawer content renders client-side on open —
the SSR bytes carry the page's own rows (2 × "density hit channel": the
size axis row + the a11y hit-target row) but not the drawer payload;
the content-module receipt above is the proof.

### 2. The theme row's L/C signature + hue caveat — VERIFIED-TRUE, re-tinted live

The row now reads "signature: L/C identical on both sides, hue
wall-clock — absolute hue digits don't reproduce across runtime states;
the site-local hue runtime, jixoai.css :32-45, rotates the channel" —
and the cite is accurate (jixoai.css :32-45 is the hue-SOURCE block:
`--brand-hue` on :root only; "the wall-clock rotation is ui.jixoai.com's
site-local hue-runtime script, never shipped to consumers"). Live
re-tint under a real `.dark` island (wrap IN PLACE, restored):

- light fill: `oklab(0.6489 -0.183774 0.149646)` → C ≈ 0.2370 (the
  known light primary pair);
- dark fill: **`oklch(0.7044 0.1872 137)`** — the **L/C signature
  (0.7044, 0.1872) reproduced digit-exact**, and the hue is now **137**:
  marginalia measured 129 → 125 at her pass and at closure; my 137 is a
  THIRD sample — the rotation is live and ongoing, which is precisely
  why the page now quotes the signature instead of digits. Bonus: dark
  hue − light hue ≈ −4° at the same instant — the drift calc live.

### 3. The frozen-ink seam's loudest rung — VERIFIED-TRUE live

Fill label ink **oklch(0 0 0) on light AND on the re-tinted dark fill**
(measured both) — black-on-dark-primary, the visible contrast cost,
named in the theme row exactly where readers look. Outline: frame flips
oklch(0 0 0) → **oklch(1 0 0)** (the paint re-derives) while the label
ink stays frozen oklch(0 0 0) — the split-within-the-ladder teaching
reproduces element-for-element.

### 4. W-next #5 CLOSED-narrowed — the page teaches it — VERIFIED-TRUE

The api popovertarget row: "declared and forwarded on the button form
(verified live: click opens and toggles the target panel with zero
component listeners); anchors cannot invoke popovers, so the anchor form
drops it. Composers set aria-haspopup themselves" — and the overview
teaches the same contract. My independent re-proof post-closure: the
attribute forwarded onto a rendered PressButton BUTTON root (via the
rest spread path), click → `:popover-open` **true**, second click →
**false** — the native invoker opens AND toggles with zero component
listeners. The standing rule (claimed-prop wiring must be a prop; the
setAttribute wire is unsupported) is what both this page and
popconfirm's teach.

## Standard battery

- **SSR/post-settle duality + warm-reload**: first visit warms, reload
  measures (the banked law); SSR chrome below.
- **EXTRA-lane, rows BY NAME**: authored hand array **15** entries
  (density, variant, {@attach …}, …rest, href, loading, disabled,
  popovertarget, external, onclick, type, ariaLabel, square, raised,
  children) → served **14** — density is axis-named and folds into the
  universal 8 (the EXTRA-limitation fold, consistent). Universal fold:
  8 axis rows; the family's own axisRows table is the measured layer.
- **THEME-SPLIT vocabulary + declaration coverage**: the row names the
  re-deriving voice (the site's dark scope re-declares the four seam
  tokens as live chains — the canvas-bug on-element seam), the frozen
  voice (outline/ghost's tokens['--jx-foreground'] defineVars :root
  literal), and now the hue-runtime caveat — mechanisms named, coverage
  measured (fill/outline/ghost inks + frames, both sides).
- **Vocabulary-grep**: zero `--jx-size-effective` readers, zero
  `--jx-motion-effective` readers, zero 42px remnants (all three grep
  receipts hold on the current tree).
- **KEYED-EACH**: the types demo's each blocks are unkeyed over STATIC
  arrays (no reorder surface) — no LAW #18 exposure.
- **TRANSITION-FRAME**: the press law rest receipt
  (`rgba(0,0,0,0.5) 2px 2px 0px`, transform none, 150ms ×4 transitions)
  matches the ladder teaching; reads taken post-settle.
- **Structure**: h1 ×1 · universal marker ×1 · toc **12/12** served ==
  +page.ts == DOM order (overview, live-demo, zone, anchors, async, law,
  types, usage, theming, api, universal-props, accessibility; install +
  see-also out).

## Findings

1. **[NONE — no new MAJOR or MINOR]** The closure clauses landed clean;
   nothing new blocking.
2. **[INFO · family-lane typing debt, pre-existing]** svelte-check:
   `press-button.svelte:451` — `'aria-label'`/`'aria-disabled'`
   destructured without a Props member (marginalia's :448/:449 note, the
   line shifted with the docstring fix). Same destructure-typing class
   as number-input's chrome; the composed-never-clobbered law's typing
   cleanup lane. Page: **0 diagnostics**.
3. **[INFO · ledger extension]** The hue wall-clock now has THREE
   runtime samples — 129 (marginalia's pass) → 125 (closure time) →
   137 (this review) — with L/C (0.7044, 0.1872) invariant throughout.
   The page's signature-plus-caveat form is the only reproducible way
   to write this receipt; the absolute-hue form is dead.

## Cross-check against marginalia's report 38 (read AFTER findings formed)

Full concordance: her press-ladder ladder/ghost/flat receipts, hit
floors (24/28/32/40/48 + 40.0×40.0 square — the number her MINOR
defended, now the docstring's truth), the 6px concentric seat, the
theme split, the forced-colors law, the toc 12/12, the vocabulary
sweep, and her three findings — which ARE the closure clauses, all
three now landed and re-verified by me (the mirror, the signature, the
fill-ink extension). Her W-next #5 adjudication is the one the page now
teaches; my popovertarget re-proof post-closure is the fresh receipt.
No divergences.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284**, exit 0 — GREEN clean (quill's matrix re-pin is in the tree; the earlier sheet keys pass; vellum's scroll-area edit no longer trips the deny sweep) |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | press-button.html page: **0 diagnostics**; the family's :451 aria-destructure pair + cx-union overloads are the pre-existing typing-debt class (unchanged files, mirror-identical) |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

## Closure

press-button passes review #2 — **the page closes as #39**. The closure
clauses are landed and verified, the standing rule is taught, the only
residue is the pre-existing family-lane typing debt (INFO, unchanged
files, the same lane as the chrome cleanup). No page changes required.

No commits made. Report file:
`agents/scribe/reports/41-review-press-button.md`.
