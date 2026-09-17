// radio.stylex.ts — the radio family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the ONE utility pair the markup carried — the
// bare posture's inline host (inline-flex w-fit, the checkbox law
// verbatim: with no label/error to stack, the field wrapper is dead
// weight; inside list-item end lanes the control must sit at
// inline-END, not stretch the lane). Everything else is hook classes
// — .jx-field/.jx-label/.jx-error consumed from the jx-pure sheet,
// .jx-check-lane / .jx-html-radio from checkbox.css (shared) — all
// kept verbatim (the paint law is css-owned).
//
// Law mapping: display + width are structural — no theme slots.
//
// Mirror law: this file is byte-identical in registry/files/ui/radio/
// and apps/www/src/lib/ui/radio/ (cmp); the tokens import resolves in
// BOTH trees when needed (separator's divergence note #1 — this table
// carries no theme slots).

import * as stylex from '@stylexjs/stylex';

export const radioStyles = stylex.create({
  // ── the bare posture's inline host ───────────────────────────────
  host: {
    display: 'inline-flex',
    width: 'fit-content',
  },
});
