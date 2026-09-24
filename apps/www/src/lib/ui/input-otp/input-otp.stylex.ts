// input-otp.stylex.ts — the input-otp family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the group
// column (density --jx-gap stack), the label voice, the slot grid,
// the slot's own geometry (hit-or-two-lines lane, hairline border,
// site radius, mono voice over the density text channel, primary
// caret, disabled dim), the markup-known state borders (filled →
// foreground, complete → primary, invalid → destructive + dashed),
// and the error line.
//
// Value law: theme-able slots ride tokens or var() seams — the 0.1em
// label tracking has no sheet step yet (var(--track-10, 0.1em),
// reported); 12px error text rides the existing --text-label-lg step;
// hit/line geometry stays the calc-over-density-channels form the
// utilities spelled. The :focus outline law (and its complete-state
// ink swap — a two-state compose) stays in input-otp.css (lane-2).
//
// Mirror law: byte-identical in registry/files/ui/input-otp/ and
// apps/www/src/lib/ui/input-otp/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const otpStyles = stylex.create({
  // ── the group column ──
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-gap)',
    width: 'fit-content',
  },
  // ── the label voice ──
  label: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    letterSpacing: 'var(--track-10, 0.1em)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the slot row ──
  slots: {
    display: 'flex',
    gap: 'var(--jx-gap)',
  },
  // ── one slot: hit-or-two-lines lane, hairline frame, mono voice ──
  slot: {
    boxSizing: 'border-box',
    // WIDTH is explicit — a digit cell, never a text field: without it
    // the input's intrinsic ~20ch content width owned every wide
    // container (167px slots on the docs page; the narrow DensityDemo
    // probes that measured 32/36/40/48 were shrinking to this same
    // floor, masking the gap — the Owner's walkthrough catch)
    width: 'max(var(--jx-hit), calc(var(--jx-line) * 2))',
    minWidth: 'max(var(--jx-hit), calc(var(--jx-line) * 2))',
    minHeight: 'max(var(--jx-hit), calc(var(--jx-line) * 2))',
    padding: 0,
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    textAlign: 'center',
    borderRadius: tokens['--jx-radius'],
    caretColor: tokens['--jx-primary'],
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  // ── the markup-known state borders ──
  filledBorder: { borderColor: tokens['--jx-foreground'] },
  completeBorder: { borderColor: tokens['--jx-primary'] },
  invalidBorder: {
    borderColor: tokens['--jx-destructive'],
    borderStyle: 'dashed',
  },
  // ── the error line ──
  error: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-6)',
    fontSize: 'var(--text-label-lg)',
    color: tokens['--jx-destructive'],
  },
});
