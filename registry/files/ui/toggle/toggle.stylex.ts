// toggle.stylex.ts — the toggle family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the disabled pose the old markup spelled as
// conditional utilities — opacity 50 + the not-allowed cursor (the
// same law checkbox/radio paint). The switch paint itself is the
// shared standard layer's .jx-html-switch law (jixoai.css, the
// ::before knob + transform travel) — a STATIC hook string kept
// verbatim; .jx-label likewise rides the jx-pure sheet.
//
// Law mapping: opacity + cursor sit outside the census's theme
// families — structural pose values, byte-equal to the old utilities.
//
// Mirror law: this file is byte-identical in registry/files/ui/toggle/
// and apps/www/src/lib/ui/toggle/ (cmp); the tokens import resolves
// in BOTH trees when needed (separator's divergence note #1 — this
// table carries no theme slots).

import * as stylex from '@stylexjs/stylex';

export const toggleStyles = stylex.create({
  // ── the disabled pose (the checkbox/radio law) ───────────────────
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
