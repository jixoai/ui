// prototype-kit.stylex.ts — the prototype kit's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the kit's utility strings as the prototype
// standard (2026-09-11) spelled them: the frame figure's column stack
// at the 4px caption gap, the shared caption voice (mono 12px eyebrow
// on the muted ink — the same recipe on the canvas's full-row label),
// the scale-to-fit shell's clipped border box, the iframe's plain
// block face, and the canvas section's min-width floor.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens
// ONLY — the hairline weight, the border/background/muted ink roles,
// 12px label-lg text + 0.08em wide tracking on the caption, and the
// fleet radius; geometry (flex stack, overflow clip, borderless
// iframe, min-width 0) is structural. The kit's GRID is prop-driven
// inline style by the css-architecture grid law — never an atom. The
// notice state stays SELF-STYLED inline (the design host's tailwind
// context may be absent — the frame-view header's own law).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// prototype-kit/ and apps/www/src/lib/ui/prototype-kit/ (cmp); the
// tokens import '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const prototypeKitStyles = stylex.create({
  // ── the frame figure: a column stack, caption over shell ──
  figure: {
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  // ── the caption voice (frame label + the canvas's full-row label) ──
  caption: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: 'var(--track-wide)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the scale-to-fit shell: the clipped, rounded border box the
  //    visually-scaled iframe paints inside ──
  shell: {
    overflow: 'hidden',
    borderRadius: tokens['--jx-radius'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  // ── the real iframe: a plain block, no border of its own ──
  iframe: { display: 'block', borderWidth: 0 },
  // ── the canvas section's min-width floor (grid tracks shrink it
  //    no further; the grid itself rides inline style) ──
  canvas: { minWidth: 0 },
});
