// spin.stylex.ts — the spin family's atom table (tailwindless one-shot
// Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored
// (spin-ora-svg-lane, 2026-09-11): the svg/text glyphs' primary ink,
// the text cursor's pre-formatted one-cell grid, the wrapping
// posture's one-cell stack (the z-1 status pill over the content and
// the --scrim veil), and the inline posture's row.
//
// Law mapping (the tier-2 value rule): the pill's measures ride space
// steps / ruler equations (14px/8px insets, byte-exact), the shadow
// rides the typed --jx-shadow token; the ink rides semantic tokens.
// THE CSS FLAT ENGINE IS FROZEN LAW (round 4, verified-pack): the
// frame rules (jx-spin-frame), the injected keyframes (<style
// data-jx-spin-frames>), and the reduced-motion kills stay lane-2 in
// spin.css untouched — this table never touches opacity/animation.
//
// Mirror law: this file is byte-identical in registry/files/ui/spin/
// and apps/www/src/lib/ui/spin/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const spinStyles = stylex.create({
  // ── the glyph lanes' ink ──
  glyph: { color: tokens['--jx-primary'] },
  // the text cursor: pre-formatted, one cell per frame (the widest
  // frame's advance width holds the box — whitespace-pre)
  cursor: {
    position: 'relative',
    display: 'inline-grid',
    whiteSpace: 'pre',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-primary'],
  },

  // ── the wrapping posture: a one-cell grid stack ──
  wrap: { display: 'grid', isolation: 'isolate' },
  // the status pill: the private z rung above the content
  live: {
    zIndex: 1,
    gridArea: '1 / 1',
    placeSelf: 'center',
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-8'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-popover'],
    boxShadow: tokens['--jx-shadow'],
  },
  // the wrapped content and the scrim share the pill's cell
  content: { gridArea: '1 / 1' },
  scrim: { gridArea: '1 / 1', backgroundColor: 'var(--scrim)' },

  // ── the inline posture: the glyph row ──
  inline: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-primary'],
  },
});
