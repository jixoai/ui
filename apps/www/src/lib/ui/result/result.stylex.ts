// result.stylex.ts — the result family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the component's former Tailwind utility strings
// (tw4 2026-08-24 "pure token utilities") re-authored as static
// stylex atoms — the separator law (registry/files/ui/separator/
// separator.stylex.ts). Every value is either a STRUCTURAL constant
// (display/flow/measure geometry) or rides a channel: the density
// kernel lanes stay PLAIN var() strings (--jx-stack/--jx-inset/
// --jx-icon/--jx-text/--jx-line — the typed map's cycle law), the
// theme scale rides the typed tokens layer.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.06em] → --jx-track-wide (0.08em) — the nearest
//     EXISTING step; the exact 0.06em has no step (reported).
//   - leading-none → lineHeight: var(--jx-line) — no unitless-1
//     token exists (reported); the glyph rides flex centering.
//   - border (1px) → borderWidth: var(--hairline) — same 1px value,
//     token-compliant (no preflight to lean on: borderStyle rides
//     along explicitly, the separator divergence #2 law).
//   - max-w-[44ch] stays a structural measure literal (44ch — the
//     ch-relative column cap, no step to promote; reported).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const resultStyles = stylex.create({
  // ── the page shell: centered column over the stack rhythm ──
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--jx-stack)',
    paddingInline: 'calc(var(--jx-inset) * 2)',
    paddingBlock: 'calc(var(--jx-inset) * 4)',
    textAlign: 'center',
  },

  // ── the status glyph box: 2× icon lane, card ground, 2xs lift ──
  iconBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'calc(var(--jx-icon) * 2)',
    height: 'calc(var(--jx-icon) * 2)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  // status borders: success = the brand voice (no green in this
  // language), error = destructive, the neutrals stay --border
  borderPrimary: { borderColor: tokens['--jx-primary'] },
  borderDestructive: { borderColor: tokens['--jx-destructive'] },
  borderNeutral: { borderColor: tokens['--jx-border'] },

  // ── the fallback glyph: mono ink at 1.25× the icon lane ──
  glyph: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-icon) * 1.25)',
    lineHeight: 'var(--jx-line)',
  },
  inkPrimary: { color: tokens['--jx-primary'] },
  inkDestructive: { color: tokens['--jx-destructive'] },

  // ── the voices: nav-cased title, muted body capped at 44ch ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
  },
  description: {
    maxWidth: '44ch',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the actions row: one stack below, gap-rhythmed, centered ──
  actions: {
    marginBlockStart: 'var(--jx-stack)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 'var(--jx-gap)',
  },
});
