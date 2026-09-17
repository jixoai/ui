// icon-button.stylex.ts — the icon-button family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the ONE utility the markup carried — the glyph
// span's shrink-0 (the icon lane never compresses when the button's
// text wraps or the row runs narrow; the press law's own lane
// discipline). Everything else is PressButton composition — the
// shell's paint rides the press-button family, not this one.
//
// Law mapping: flex-shrink is structural — no theme slots.
//
// Mirror law: this file is byte-identical in
// registry/files/ui/icon-button/ and apps/www/src/lib/ui/icon-button/
// (cmp); the tokens import resolves in BOTH trees when needed
// (separator's divergence note #1 — this table carries no theme
// slots).

import * as stylex from '@stylexjs/stylex';

export const iconButtonStyles = stylex.create({
  // ── the glyph lane (inside PressButton's content slot) ───────────
  glyph: {
    flexShrink: 0,
  },
});
