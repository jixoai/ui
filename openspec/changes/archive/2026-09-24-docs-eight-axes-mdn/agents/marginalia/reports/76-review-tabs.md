# TASK 76 — SECOND REVIEW tabs.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (2nd of 2; vellum's CODE, scribe's 1st — independence law
  held: scribe's tabs report unopened until after the findings below were fixed; the
  concordance addendum follows at the end)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/tabs.html/`
  (+page.svelte 1150 lines) over the tabs family `apps/www/src/lib/ui/tabs/`
  (list 634 / root 208 / trigger 120 / content 56 / stylex 95), served live on :5244.
- **Method**: source reads (family svelte/stylex, the `--jx-foreground` chain), headless
  Chromium over dev SSR :5244, the task-74 pin-finder protocol (census-all → ancestor
  walk → body-level clone) folded into the 2nd receipts per the remaining-sweep flag,
  the ARIA/indicator/panel/keyboard battery, density digits across 48rem, the three
  gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT new on the page. The
  dispatched pin-finder confirmation landed clean: tabs' root-dark flips are ALL
  unpinned, every hold is a stage pin — the three-tier law's fourth data point stands
  with no anomalies.

## THE PIN-FINDER CONFIRMATION — the sweep flag is closed

Scribe's fourth-data-point receipt (tabs FLIP on --jx-foreground) re-derived with the
full instrument:

- **Light baseline**: selected trigger ink `oklch(0 0 0)` (the light foreground, 22
  stage-pinned + 7 unpinned instances); idle ink `oklch(0.3211 0 0)` (muted-foreground,
  91 + 9); panels `oklch(0 0 0)` (10 + 12). html `--foreground`/`--jx-foreground` both
  `oklch(0 0 0)`.
- **Root html.dark**: html vars flip to `oklch(1 0 0)`. Census: **every unpinned
  instance flips** — 7/7 selected inks → oklch(1 0 0), 9/9 idle → oklch(0.8452 0 0),
  12/12 panels → oklch(1 0 0) — **no data-theme ancestor on any of them**. The 29
  stage-pinned instances hold — and the walk puts the boundary at the same
  `div.x78zum5.xz65tgg[data-theme="light"]` stage inside `jx-canvas-scroll` found on
  separator/spin/tags-input (task 74), and the body-level clone of a held trigger
  **moves-to-flip** (oklch(0 0 0) → oklch(1 0 0)). Zero unexplained holds; the law
  needs no new carve-out.
- Chain from source: `inkSelected: { color: tokens['--jx-foreground'] }` (stylex :90;
  `tokens.stylex :57 '--jx-foreground': 'var(--foreground)'`) — the :root alias
  family, live per tier 1, island-proof per tier 2, stage-pinned per tier 3.

## The standing-TRUE spot-checks — all held

1. **ARIA chain**: **29 tablists** (census == receipt), 129 triggers, 22 panels
   (trigger-only demos account for the lists-without-panels delta — the censused
   list's aria-controls ids resolve: s2-panel-preview/raw/diff/audit all exist).
2. **Indicator envelope**: the sliding indicator span (last child) measures 80×2px
   inside the active trigger's 80×40px box, x-aligned, contained true, display block.
3. **Panel unmounting**: active panel hidden=false with content mounted; inactive
   panels hidden=true with **zero child elements** (the `{#if active}` content
   unmount inside the `hidden={!active}` shell, source :51-55); a real click moves
   selection, visibility, and the content with it.
4. **Keyboard**: ArrowRight from the focused trigger advances selection AND focus
   (selected index 1→2, focusInList 2).
5. **Density digits, both ends**: the query seat (source :1119,
   `density={responsiveDensity}`) stamps **data-density lg @1440 with trigger 48px →
   sm @600 with trigger 32px**, while the static lg demo stays 48 at both viewports
   (the flip is the seat's query, not the viewport touching statics). The DensityDemo
   lanes receipt the kernel scale digit-exact: **xs 28px / default 40px / lg 48px**
   trigger heights over the `--jx-hit` max() equations (0.25rem ×7/×10/×12), sm ×8=32.
6. **The sixth mechanism's stage ground**: the theme-split census IS the receipt —
   29 instances hold under root dark solely inside `data-theme="light"` stages
   (mechanism 6), matching the alias-theme law's tier 3; nothing holds outside them.

## Standard battery

- Warm-reload discipline held across all sessions; zero console errors in-session.
- Zero product-tree edits; html.dark classes and clones reverted in-probe with
  restored baselines re-read.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **tabs.html: 0 diagnostics**. Family lane (pre-existing, files NOT in-flight — git status clean, last touch 8f50adc1): 7 ERRORs — the Object.entries-undefined overload class (tabs.svelte :129, tabs-list.svelte :183, +4 same shape) and **`Cannot find name 'TabsScrollEffect'` at tabs-list.svelte :158** (type-layer only; the scroll demo runs — runtime strips types). Family-owner ledger debt, not page-blocking |

Sibling keyed noise receipted, not chased: the fleet run carries the in-flight
sibling set (quill's website-scaffold.html, vellum's terminal-footer, scribe's toast).

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 50912; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.**
- Instrument honesty: my first two density-seat reads logged an unawaited promise
  (JSON `{}`) and my third keyed the FIRST lg-stamped root — the static lg demo, not
  the query seat. Fixed by reading ALL lg/sm roots at both viewports and taking the
  one whose rung CHANGES (the seat), with the static as the control. The demo-lane
  digits (28/40/48) and the seat flip (48→32) are from the corrected runs.
- Artifacts: /tmp/marginalia-76-probe{1,2,3,4}.mjs,
  /tmp/marginalia-76-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **`Cannot find name 'TabsScrollEffect'`** (tabs-list.svelte :158): a missing
   type import in the family — runtime-clean, but the fleet svelte-check carries it
   in every run. One-line import fix for the family owner; folded into the same
   ledger debt as the Object.entries overloads.
2. The remaining sweep slots (system-dialog.html, progress.html's frozen-ink
   instance) still owe the pin-finder at next touch — tabs was the dispatched one.

---

## Concordance addendum (appended after reading scribe's report 68)

My findings above were fixed before this section.

- **FULL CONCORDANCE — every overlapping receipt reproduced**: the 29/129/22 census
  (his exact numbers), panels hidden + zero children (element-presence both), the
  indicator envelope (my static 80×2-in-80×40 contained read sits inside his rAF
  travel census — 15 distinct transforms through the authored 0.24s×3, the RM jump),
  ArrowRight moving focus AND selection, the density seat 48@lg → 32@sm digit-exact,
  the sixth-mechanism paint reads (his light/island/root-dark triple on the trigger's
  computed color = my census tiers exactly: island holds, root dark flips unpinned,
  stages pin), LAW #19 and page 0 diagnostics, ambient 284/284 + universal 110/110,
  and the same family-debt receipt including `TabsScrollEffect` (his gates table named
  it first).
- **His receipts #5/#6 were the stage-pin insight before task 74 had the name**: his
  #6 measured the `data-theme="light"` canvas ground holding under root dark, and his
  OQ1 flagged the canvas light-pin as a fleet posture ("axis receipts measured inside
  canvases describe the light ground"). Task 74 generalized exactly that into the
  three-tier law — his flags were the seed.
- **One framing retirement, no contradiction**: his #5's closing line ("the hold/flip
  line is exactly the var-read vs physics line", with separator HELD) predates task
  74. The physics half stands (ghost/mask/blend inks are theme-free at every tier);
  the var-chain half now reads live-at-root — separator's SOLID fill also flips
  unpinned (task 74), so the fleet line's separator slot is physics-HOLD +
  var-chain-FLIP, not a family-wide HOLD. His tabs numbers were honest element reads
  and land in tiers 1–3 unchanged.
- **Additions (mine, not in report 68)**: the pin-finder as the 2nd-review receipt
  (all 29 holds walked to the same stage div class as separator/spin/tags-input; the
  body-level clone moves-to-flip; the no-data-theme-ancestor check on all 28
  unpinned flips); the static-lg-demo control proving the seat flip is the query, not
  the viewport; the DensityDemo lane digits (xs 28 / default 40 / lg 48 over the
  --jx-hit max() ×7/×10/×12 equations) behind the seat's 48/32; and the family-debt
  count (7 ERRORs) with the `TabsScrollEffect` one-line-import note for the owner.
