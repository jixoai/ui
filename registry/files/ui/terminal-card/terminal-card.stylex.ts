// terminal-card.stylex.ts — the terminal card family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the card carried since
// tw4 (2026-08-24). The line-reveal state machine stays in
// terminal-card.css (unchanged); NEW lane-2 rules carry what atoms
// cannot own here: the body's sm: padding seam (media rules can
// never re-pin atoms — the F9 layer order), the command display
// voice (font-semibold's 600 has no weight token + its sm: size
// seam), and the output stack's sibling rhythm (a `> * + *`
// boundary). Those hook data-jx-terminal-body / -command / -outputs.
//
// Value receipts: 14px bar padding rides the ruler equation (no
// --space-14 step — reported); 12px IS --jx-text-label-lg; 0.1em
// tracking = calc over --jx-track-wide (no step — reported); the
// traffic-light oklch grounds are INSTRUMENT constants (the card's
// own chrome, dark-locked — not theme roles); the cursor's em
// measures are glyph geometry (they scale with the command voice).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const terminalCardStyles = stylex.create({
  // ── the bezel: dark-locked shell, hard-offset shadow ──
  card: {
    width: '100%',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    boxShadow: tokens['--jx-shadow'],
  },
  schemeDark: { colorScheme: 'dark' },
  schemeLight: { colorScheme: 'light' },
  // ── the traffic-light title bar ──
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-6'],
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-8'],
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: 'calc(var(--jx-track-wide) * 1.25)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },
  // the dots: instrument constants (the card's own chrome)
  dot: {
    width: '0.5rem',
    height: '0.5rem',
    flex: 'none',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'currentColor',
  },
  dotRed: { backgroundColor: 'oklch(0.7 0.18 25)' },
  dotYellow: { backgroundColor: 'oklch(0.85 0.17 95)' },
  dotGreen: { backgroundColor: 'oklch(0.75 0.17 150)' },
  barTitle: {
    marginInlineStart: tokens['--jx-space-8'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // ── the command line (the p's voice is the css lane: weight + seam) ──
  prompt: { color: tokens['--jx-primary'], marginInlineEnd: tokens['--jx-space-8'] },
  cursor: {
    display: 'inline-block',
    width: '0.58em',
    height: '1.05em',
    backgroundColor: tokens['--jx-terminal-foreground'],
    verticalAlign: 'text-bottom',
    marginInlineStart: 'calc(var(--jx-unit) / 2)',
  },
  // ── the output block (padding + sibling rhythm in the css lane) ──
  outputs: {
    marginTop: tokens['--jx-space-12'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--jx-density-line-default)',
  },
});
