// skeleton.stylex.ts — the skeleton family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the paint payload as the old markup's utility
// string spelled it — the muted ground and the inset hairline ring
// (the placeholder's box law). The PULSE (animate-[jx-skeleton-pulse
// _1.4s_ease-in-out_infinite]) stays in skeleton.css lane-2 with its
// keyframes and the reduced-motion kill: the animation property is
// media-touched (the kill), so the whole property rides the unlayered
// residue — one place for the entire pulse law (the W1 motion
// precedent: motion literals with no ladder step live in the family
// css, never as atoms).
//
// Law mapping (the tier-2 value rule): the ground rides the typed
// muted token; the ring's width rides the hairline token inside a
// var()-chain (the census's own rule: a var-chain shadow eats tokens,
// no literal length fragment); the color role rides the border token.
// The .jx-skeleton hook stays a STATIC class string — skeleton.css's
// own key.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/skeleton/ and apps/www/src/lib/ui/skeleton/
// (cmp); the tokens import '../../tokens.stylex' resolves in BOTH
// trees (separator's divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const skeletonStyles = stylex.create({
  // ── the placeholder block (shape is the consumer's geometry) ─────
  base: {
    backgroundColor: tokens['--jx-muted'],
    boxShadow: 'inset 0 0 0 var(--hairline) var(--border)',
  },
});
