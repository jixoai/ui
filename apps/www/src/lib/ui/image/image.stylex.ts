// image.stylex.ts — the image family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the tw4 utility payload as the old markup
// spelled it — the <img>'s responsive law (max-width 100%, height
// auto: the intrinsic width/height attributes carry the ratio, the
// rendered box never overflows its container) and the broken-source
// panel (the dashed muted placeholder holding the intrinsic dims so
// failure never shifts layout). The data-jx-image /
// data-jx-image-broken hooks (2026-08-25) stay attribute-stamped —
// they are the css-law keys, not classes.
//
// Law mapping (the tier-2 value rule): the panel's ground/ink/border
// ride the typed semantic tokens; p-6 (24px) maps to the space
// ladder's --space-24 step (4px ruler × 6 — the existing step IS the
// value); border weight rides the hairline token. The rest is
// structural (display, alignment, box-sizing, the auto height).
//
// Mirror law: this file is byte-identical in registry/files/ui/image/
// and apps/www/src/lib/ui/image/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (separator's
// divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const imageStyles = stylex.create({
  // ── the <img> responsive law ─────────────────────────────────────
  img: {
    maxWidth: '100%',
    height: 'auto',
  },
  // ── the broken-source panel (default fallback face) ──────────────
  broken: {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    color: tokens['--jx-muted-foreground'],
    padding: tokens['--jx-space-24'],
  },
});
