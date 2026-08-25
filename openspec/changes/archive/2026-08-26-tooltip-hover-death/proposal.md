# tooltip hover death — the tip vanished the moment you hovered

## Why

Owner report (2026-08-25): the tooltip dies the instant you hover —
reproducible on /docs/components/tooltip.html AND every icon-button.
The first-fix attempt (event-order race theory) was disproven by Codex
r2; the Owner's 10× slow-motion observation then isolated the decisive
frame: the tip vanishes the moment the entry animation completes
(blur 100px → 0px).

## What happened (three stacked defects, one per layer)

1. **Channel ownership (the killer, r5)**: the tooltip's hand-rolled
   kernel animates opacity/filter/translate directly and never drives
   `--jx-p`, yet the panel carries `.jx-waapi` — whose cascade
   formulas compute `blur(100px)` and `opacity 0` at `--jx-p = 0`.
   Phase A's WAAPI fill suppressed the formulas; the frame its fill
   dropped (A→B seam), the unpinned FILTER channel fell to
   `blur(100px)` — an invisible smear for the whole resting life while
   `:popover-open` + inline `opacity: 1` read "healthy".
2. **Materials at p=0 (r6)**: the glass/veil colors were READ at
   `--jx-p = 0` — capturing the opaque pose and pinning the resting tip
   as a solid block instead of the α.72 glass / α.32 veil.
3. **Close-seam fragility (r1–r3)**: the close armed on any
   `pointerleave`; on the FIRST open Chromium briefly lays the freshly
   promoted popover out at a stale pre-anchor-resolution position —
   under the cursor — flipping the hit target wrapper→panel and back,
   and the compensating enter is not guaranteed (animated elements
   sliding away from a resting cursor do not reliably get boundary
   events).

## The fix (three locks + formula ownership)

- **lock 1** `open()` sets `pointer-events: none` BEFORE
  `showPopover()`; `aimPin()` restores it once the anchor settles
  (rect read = layout resolved). The stale box can never steal the hit.
- **lock 2** dual-surface presence flags re-checked at timer fire.
- **lock 3** the geometric verdict: hover-capable pointer coords vs
  both surfaces' live rects (+8px halo covering the 6px rest gap);
  kept tips re-arm, walking away still closes; touch coords never feed
  it (liftoff would park the verdict open forever).
- **channel ownership (r5–r7)**: every channel the kernel touches is
  pinned at every rest point — `filter: none` (the r30 residue law) at
  the seam/rest/reduced-motion; materials are NOT read-and-pinned but
  formula-owned: `--jx-p: 1` is parked inline from entry start, so the
  cascade itself computes the rest pose (body glass, shadow veil) and
  a theme switch while resting flows straight through. The only pins
  the formulas cannot say: `filter: none` and the shadow's measured
  SHADOW() vector.

## Decisions

- Event-order-race theory (r1) withdrawn after Codex r2's minimal repro
  (Chromium/WebKit switch siblings out→leave→over→enter); jsdom tests
  rewritten to the real order.
- Formula-driven beats read-and-pin: the formulas ARE the rest pose
  definition (Codex r6 blocker → r7 resolution).
- The `@supports` fallback is a joint capability check (anchor-name +
  position-anchor + position-area + position-try-fallbacks) — syntax
  support only; runtime defects are the browser batteries' job.

## Impact

- registry/files/ui/tooltip/tooltip.svelte (+ mirror)
- apps/www/test/batch2-components.spec.ts (real-order seam tests + the
  touch-liftoff regression)
