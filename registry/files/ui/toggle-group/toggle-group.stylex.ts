// toggle-group.stylex.ts — the toggle-group family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: toggle-group-item.svelte's utility payload — the
// content span's lane posture (flex ONLY when icon lanes exist:
// text-only items keep the exact anonymous-box rendering the shared
// sheet paints) and the slot lanes' inline frames. The label-side
// :has() halving (has-[[data-icon=inline-*]]:pl/pr-[calc(...)]) moved
// to toggle-group.css as lane-2 :where() :has() rules — the padding
// owner is the shared components-layer .jx-tgroup-item paint, and the
// halving must beat it by LAYER (unlayered), exactly as the old
// utilities-layer form did. The [&>svg]:size descendant boundary
// rides the same sheet (StyleX forbids descendant combinators).
// .jx-tgroup-item / .jx-tgroup-content / .jx-html-tgroup stay STATIC
// hook strings — the shared sheet's own keys.
//
// Law mapping: the content lane's gap derives from the density ruler
// (calc(var(--jx-gap) / 2), the chip's own spacing recipe verbatim);
// everything else is structural (display, alignment).
//
// Mirror law: this file is byte-identical in
// registry/files/ui/toggle-group/ and apps/www/src/lib/ui/toggle-group/
// (cmp); the tokens import resolves in BOTH trees when needed
// (separator's divergence note #1 — this table carries no theme
// slots).

import * as stylex from '@stylexjs/stylex';

export const toggleGroupStyles = stylex.create({
  // ── the content span: flex only when lanes exist ────────────────
  content: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'calc(var(--jx-gap) / 2)',
  },
  // ── the slot lanes (svg sizing rides toggle-group.css) ──────────
  slotStart: { display: 'inline-flex' },
  slotEnd: { display: 'inline-flex' },
});
