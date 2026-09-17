// input.stylex.ts — the input family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): the one-off wrapper rows (outer slots,
// inner slot lanes, the semantic glyph lane, the count hint, the
// picker panel's surface padding + datetime divider) became static
// longhand atoms; theme-able values ride the typed token layer or
// the ruler's kernel channels as PLAIN var() strings.
//
// Value notes (receipted):
//   - text-xs maps to the --text-label-lg step (0.75rem — the
//     existing step IS the value); text-[11px] maps to --text-label
//     (0.6875rem = 11px);
//   - gap-1.5 (6px) → --space-6; my-3/py-3 (12px) → --space-12;
//     px-3.5/-mx-3.5 (14px) has NO step — the calc(var(--jx-unit) *
//     ±3.5) equations are the sheet's own ladder physics, reported
//     as a MISSING step (--space-14) for serial promotion; the ±1px
//     outer nudges ride the same ruler equation;
//   - leading-none (line-height: 1) has NO token — it lands as a
//     lane-2 rule in input.css keyed on the data hooks (the family
//     sheet already owns the component paint), reported as a MISSING
//     step (--jx-leading-none);
//   - the jx-* hook classes stay in the static class parts — they
//     are the family css's own contract, not utilities.
//
// Lane-2 residue (input.css): everything the family sheet already
// owns (the shell law, the stepper pair, the picker panel) + the
// leading-none rung above.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const inputStyles = stylex.create({
  // ── the outer block slots (outside the shell, above/below) ───────
  outerStart: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    marginBottom: 'calc(var(--jx-unit) * -1)',
  },
  outerEnd: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    marginTop: 'calc(var(--jx-unit) * -1)',
  },
  // ── the inner slot lanes (prefix/suffix snippets inside the shell) ──
  slotRow: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens['--jx-space-6'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
  },
  // ── the semantic glyph lane (the movable recognition glyph) ──────
  iconLane: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
  },
  // ── the picker panel's surface-body padding (px-3.5 py-3 law) ────
  surfaceBodyPad: {
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-12'],
  },
  // ── the datetime-local panel's date/time divider ─────────────────
  panelDivider: {
    marginInline: 'calc(var(--jx-unit) * -3.5)',
    marginBlock: tokens['--jx-space-12'],
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
  },
  // ── the count hint lane ("n / max") ─────────────────────────────
  hintRow: {
    display: 'flex',
    alignItems: 'center',
  },
  countReset: { margin: 0 },
  countRow: {
    marginInlineStart: 'auto',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-muted-foreground'],
  },
});
