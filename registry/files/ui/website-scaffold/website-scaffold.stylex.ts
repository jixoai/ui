// website-scaffold.stylex.ts — the scaffold's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the ONE utility the markup carried — main#main's
// flex-1 (the body lane's grow law: the scroll container is a flex
// column and the main region absorbs every free block). Everything
// else in the markup is jx-* hook classes — the grid architecture's
// own keys (website-scaffold.css), kept verbatim.
//
// Law mapping: flex: 1 1 0% is structural (the flex grow/shrink/basis
// geometry, byte-equal to the flex-1 utility's emission) — no theme
// slots.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/website-scaffold/ and
// apps/www/src/lib/ui/website-scaffold/ (cmp); the tokens import
// resolves in BOTH trees when needed (separator's divergence note #1
// — this table carries no theme slots).

import * as stylex from '@stylexjs/stylex';

export const scaffoldStyles = stylex.create({
  // ── main#main: the body lane's grow law ──────────────────────────
  main: {
    flex: '1 1 0%',
  },
});
