// scroll-run.stylex.ts — the scroll-chrome overlay geometry atoms
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: scroll-chrome.svelte's utility payload — the
// overlay half of the ONE scroll-run contract (scroll-run.css): the
// veil layer's one-cell grid placement (z 1, pointer-transparent —
// the overlay pointer law) and the shadow veils' stacking-context
// promotion (grid-area + translateZ(0), the backdrop-filter
// requirement). The jx-scroll-veil-layer / jx-scroll-veil /
// jx-scroll-shadow hooks stay STATIC class strings — they are the
// law sheet's own keys (existence gates, entrance translates, mask
// ramps), never utilities.
//
// Layer note (the veil gates): the existence gates in scroll-run.css
// are UNLAYERED on purpose — they beat this sheet's @layer components
// placement rules, and they beat the atoms alike (the engine nests
// its tiers under components, layer-law.ts mechanic 1) — the
// "no verdict, no chrome" law survives the atom migration unchanged.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/scroll-run/ and apps/www/src/lib/ui/scroll-run/
// (cmp); the tokens import resolves in BOTH trees when needed
// (separator's divergence note #1 — this table carries no theme
// slots, only structural geometry).

import * as stylex from '@stylexjs/stylex';

export const scrollChromeStyles = stylex.create({
  // ── the merged veil layer: ONE pointer-transparent grid item ────
  veilLayer: {
    display: 'grid',
    gridArea: '1 / 1',
    pointerEvents: 'none',
  },
  // ── the shadow veils: the same cell, promoted to its own stacking
  // context so backdrop-filter never bleeds the run's scroll beneath
  shadowVeil: {
    gridArea: '1 / 1',
    transform: 'translateZ(0)',
  },
});
