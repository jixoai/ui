// dialog.stylex.ts — the dialog family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the platform element's utility payload as the
// old markup spelled it — the geometry/reset laws the floating-
// surface law lets the <dialog> itself carry (the platform paints
// nothing VISUAL; these are the layout channel: the UA-default kill,
// the centered measure, the popover ink, the ceiling the height
// continuity chain conducts, dialog.css §1). Everything stateful
// (the ::backdrop scrim, the x-glyph scale, the open/postover-open
// display poses) stays in dialog.css — the mechanism's residue.
//
// Law mapping (the tier-2 value rule): the ink rides the typed
// popover token; the rest is structural geometry (width measure,
// max-width, the dvh ceiling calc) and UA resets (margin auto =
// the native centering, padding 0 = the UA chrome kill) — the
// slots the census keeps outside the theme families. The
// jx-surface/jx-waapi/jx-card-* hooks stay STATIC class strings:
// they are the theme sheet's own contract, not utilities.
//
// Mirror law: this file is byte-identical in registry/files/ui/dialog/
// and apps/www/src/lib/ui/dialog/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (separator's
// divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const dialogStyles = stylex.create({
  // ── the platform element's layout channel ────────────────────────
  // margin auto = the native <dialog> centering (kept explicit so the
  // 92vw/26rem measure centers in the top layer); padding 0 kills the
  // UA's default chrome box (the surface-body child owns the real
  // insets); max-w-full clamps the measure inside narrow viewports
  platform: {
    margin: 'auto',
    padding: 0,
    width: 'min(92vw, 26rem)',
    maxWidth: '100%',
    color: tokens['--jx-popover-foreground'],
  },
  // the interior host's ceiling: the platform ceiling (100dvh minus
  // the 2rem viewport breathing room) dialog.css §1 conducts through
  // the flex chain to the grid host — the consumer's platformClass
  // can still override it (the class prop's geometry-override law)
  heightCap: {
    maxHeight: 'calc(100dvh - 2rem)',
  },
});
