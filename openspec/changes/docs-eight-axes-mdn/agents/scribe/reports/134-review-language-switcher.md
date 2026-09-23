# TASK 134 — language-switcher (docs page) — 2nd eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT (new) — Tier 1 CONFIRMED.**
Owner = marginalia; vellum's 1st (T127, PASS 0M/1m/1L/0N, Tier 1) consolidated at
4ab37d41. Dist = 4ab37d41 (fresh build rc=0). Port 5243 mine; killed after probes, lsof
post rc=1, siblings untouched.

## The landed items — verified closed

- **LOW 1 (the stale law bullet)** — CLOSED: the law section now reads "menu semantics: a
  bare-disclosure BUTTON trigger (no aria-haspopup), a NAV landmark … navigation, not
  listbox selection (the a11y section below teaches the same served truth)" — the
  listbox/option/selected vocabulary is gone from the source (`rg` for listbox/haspopup/
  role="option"/aria-selected returns only the corrected teaching lines), and the page no
  longer contradicts its own a11y section.
- **MINOR 1 (cx ×2)** — CLOSED at the type layer: the saved svelte-check run reports **0
  errors** on language-switcher.html/+page.svelte AND **0 errors** in the family lane (8
  standing warnings, the provideUniversalLanes cosmetic class).

## Her receipt set — re-derived on my instruments

- **Anchors, not buttons**: the rendered locales are real `<a>` elements with href (12
  page-wide) and **8 carry `aria-current="page"`** — one per rendered switcher instance
  (each demo instance names ITS current locale), the navigation-not-mutation thesis
  holding at every seat.
- **pair · menu split**: the pair seat renders two locale links; the menu seat renders
  **four** (3+ locales → menu) — reproduced.
- **The menu semantics are DOM-true and fiction-free, page-wide**: the trigger is a
  BUTTON `aria-label="Language"` with a bare `aria-expanded` (**no aria-haspopup anywhere
  it matters** — the page-wide 23 haspopup hits are the canvas docks' own menus, zero on
  the switcher), the open panel is a **NAV landmark (aria-label "Language") of four plain
  anchors, all with href**, and the page carries **zero `role="option"`**; the 4
  `aria-selected` hits are the canvas file-trees', not the switcher's.
- **Close paths**: outside click flips `aria-expanded` → "false" ✓; **Escape closes** ✓
  (both reproduced on the real served trigger).

## The fresh axis — the keyboard disclosure contract, end-to-end

Her report drove outside-click and Escape; I drove the keyboard half, which the page
teaches but T127 did not measure:

1. **Enter opens**: focusing the trigger and pressing Enter flips `aria-expanded` →
   "true" — the disclosure is keyboard-openable, not pointer-only.
2. **Focus stays on the trigger** through the open (the disclosure-correct model — no
   focus teleport into the panel).
3. **Tab moves into the open panel**: the next Tab stop is the nav's FIRST locale anchor
   ("English") — the open list is in the Tab order exactly as the a11y table's menu row
   teaches ("the trigger then the open list").
4. Escape then closes from anywhere in the cycle (re-verified after the keyboard path).

The full contract — Enter-open, trigger-held focus, Tab-into-panel, Escape/outside
close — now holds on real keys, completing the honesty-pass story this family exists to
tell.

## Standard battery

- toc 8 == DOM 8 == rail (the 16-anchor raw rail count is the toc family's dual
  desktop/mobile surfaces plus canvas-dock navs — distinct ids clean); **LAW #19: 47 ids,
  zero duplicates**; h1 ×1.
- Gates: verify:docs **rc=0** · ONE saved svelte-check (both lanes 0 errors).
- Probe-fault ownership: my first rail harvest counted 16 anchors with one id ×9 — the
  dual-render plus canvas-dock navs matched my `nav [href^=#]` selector; the toc data
  (8 distinct entries) plus the id census is the receipt. My first outside-click read
  printed the STRING "false" (expanded=false = closed) which reads ambiguously in a log
  — semantics noted here so the record is unambiguous: both close paths land
  aria-expanded="false".
- Artifacts: /tmp/g134-chart.mjs + /tmp/g134-{build,docs,scheck,preview}.log
  (batch-shared).

## Open questions

None. Tier 1 stands: the surface is small and honest, the one LOW and the gate debt from
T127 are both closed, and the keyboard contract — the only unmeasured half of the a11y
story — reproduces in full.
