// native-scroll-area.stylex.ts — the family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the markup's utility payload — the region's
// positioning frame and the viewport's orientation → overflow law
// (the deterministic branch the old orientationUtilities map spelled
// as utility strings). The overflow axis pairs stay a STATIC
// module-scope map onto atom groups (the playbook's variant-map law:
// variant → atom group at module scope, runtime is a pure lookup).
// The .jx-native-scroll-area / .jx-native-scroll /
// .jx-native-scroll-viewport hooks stay STATIC class strings — the
// capability sheet's own keys (scrollbar-gutter, color-scheme
// observer channel, overscroll containment).
//
// Law mapping: everything here is structural (position, overflow
// axis pairs, the content stretcher) — no theme slots.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/native-scroll-area/ and
// apps/www/src/lib/ui/native-scroll-area/ (cmp); the tokens import
// resolves in BOTH trees when needed (separator's divergence note #1
// — this table carries no theme slots).

import * as stylex from '@stylexjs/stylex';

export const nativeScrollAreaStyles = stylex.create({
  // ── the region's frame ───────────────────────────────────────────
  area: {
    position: 'relative',
  },
  // ── the viewport's overflow axis pairs (orientation → atom) ──────
  vertical: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  horizontal: {
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  both: {
    overflowX: 'auto',
    overflowY: 'auto',
  },
  // ── the content stretcher (fills the scrollport) ─────────────────
  content: {
    height: '100%',
  },
});
