# canvas-redesign — verification (the evidence index)

> Lifecycle: Codex design round (D1–D6) → implementation (7 commits) →
> r2 review 5.5/10 → fixes → r3 6.5/10 (↑1.0) → residuals fixed →
> archived. Owner live-review rounds interleaved throughout.

## D1 — Item family (grid + presence matrix)

- registry:ui/list-item: 10 slots, docs page (5 composition demos),
  blueprint scene, 6 spec locks (root/variants/media/roles/as-override/
  separator) + the css source guard
- r2 found the chained-:has() cascade minting ghost columns (measured
  'content' areas over 3 tracks) → r3 rewrote the matrix EXHAUSTIVE:
  16 wide + 8 narrow self-contained combos, each declaring columns AND
  areas. Browser-verified 19 items × 5 viewport widths: zero
  column/name mismatches
- r3 residual: 4 single-column narrow combos wrote 'actions actions'
  on a 1-col grid (invalid → wide fallback) → fixed to 'actions'
- separator: group children render li[role=presentation] > hr (list
  semantics); r3's double-hairline (wrapper + inner borders) fixed by
  moving the visual class onto the inner separator

## D2/D5 — stage + the three layers

- stage: fill (DEFAULT) | center | start; fill children span the row
  (flex 1 1 100%, inline-size 100%); 78/81 canvases carry explicit
  stage after the sweep (r3 counted); the 68-page migration verified
  zero missing stage/kit/residue by grep
- host (@container/jx-canvas-host) → scroll layer (max-block
  min(32rem,60vh), native auto-scroll, scrollbar law, NAMED
  jx-canvas on the scrollport) → stage — Codex D5 verified by
  computed-style probe; scroll-virtual measured full-width (738/760px)

## D3 — the kit

- PlayFields/PlayRow (Item composition, field context) + 7 controls;
  two sweep batches' frictions landed as PlayText + PlayRange onchange
- r3: PlaySegmented gained TRUE roving tabindex (selected/focused =
  0, others -1; arrows/Home/End move focus)

## D4/D6 — output + chrome

- echo → output sweep (43 renames); never a live region; the canvas
  page's self-referential output row removed entirely (r3: renaming
  wasn't enough — the control already shows the state)
- Source/reset/copy icon-only press controls; single code disclosure
  (chevron + Code + adjacent count, region + inert); the drawer's
  CodeCard footer removed (Owner ruling: its lone copy button
  duplicated the code bar's inline-end copy)

## Gates

- my slice 34/34 (list-item/component-canvas/nav-filter/structure);
  full-suite ambient failures during r3 traced to the PARALLEL task's
  in-flight edits (navigation-menu spec + payload drift), not this
  change
- build:site 7/7; blueprints + payloads regenerated per mirror change
