// hero-section.stylex.ts — the hero-section family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the shell
// (the named container, the 90rem measure, the sm/lg viewport padding
// seams at the ORIGINAL 40rem/64rem thresholds), the row form (grid +
// the ≥64rem CONTAINER tier: two cm tracks, end-aligned aside), the
// entrance cascade (rise keyframes live in hero-section.css — the
// atom carries the animation channel + the delay seam), and the
// eyebrow/title/summary/badges/CTA voices.
//
// Value law: theme-able slots ride tokens or var() seams — the shell
// measure rides the existing --shell-w step (typed); 11px rides
// --text-label and 0.24em rides --track-label (both typed); 15px
// body, the bold weight, the 1.2 display leading, the tight -0.02em
// and 0.14em trackings, the 480ms rise + its cubic-bezier, and the
// 16px sm-tier body have no sheet steps yet — each rides a promotion
// seam (reported for serial promotion; the seam activates the step
// the day it lands). The cm measures and cqi clamps are the print-
// measure idiom (structural geometry); viewport/container THRESHOLDS
// stay verbatim (breakpoint parity).
//
// Mirror law: byte-identical in registry/files/ui/hero-section/ and
// apps/www/src/lib/ui/hero-section/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const heroStyles = stylex.create({
  // ── the entrance cascade (one law; the rise offset and delay vary
  //    per step through the inline-style seams) ──
  step: {
    animationName: 'jx-hero-rise',
    animationDuration: 'var(--motion-hero, 480ms)',
    animationTimingFunction: 'var(--ease-hero, cubic-bezier(0.22, 1, 0.36, 1))',
    animationFillMode: 'backwards',
    animationDelay: 'var(--jx-hero-delay, 0ms)',
  },

  // ── the shell: named container + measure + viewport padding seams ──
  shell: {
    containerType: 'inline-size',
    containerName: 'jx-hero',
    marginInline: 'auto',
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    paddingInline: 'var(--space-16)',
    paddingBlock: 'var(--space-40)',
    '@media (min-width: 40rem)': {
      paddingInline: 'var(--space-24)',
      paddingBlockStart: 'calc(var(--jx-unit) * 14)',
    },
    '@media (min-width: 64rem)': {
      paddingInline: 'var(--space-32)',
    },
  },
  // ── the row form: the ≥64rem CONTAINER tier (the section is the
  //    container — an embedded hero answers its own box) ──
  row: {
    display: 'grid',
    gap: 'var(--space-40)',
    '@container jx-hero (min-width: 64rem)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(10.5cm, 13cm)',
      alignItems: 'end',
      gap: 'calc(var(--jx-unit) * 14)',
    },
  },
  // ── the lead column ──
  lead: { minWidth: 0 },

  // ── the voices ──────────────────────────────────────────────────
  eyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    color: 'var(--primary-text)',
    fontSize: 'var(--text-label)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  title: {
    marginTop: 'var(--space-16)',
    maxWidth: 'min(100%, 22cm)',
    fontSize: 'clamp(2.4rem, 6cqi, 4.4rem)',
    fontWeight: 'var(--weight-bold, 700)',
    lineHeight: 'var(--leading-12, 1.2)',
    letterSpacing: 'var(--track-tight, -0.02em)',
    textWrap: 'balance',
  },
  summary: {
    color: tokens['--jx-muted-foreground'],
    marginTop: 'var(--space-20)',
    maxWidth: 'min(100%, 16cm)',
    textWrap: 'pretty',
    fontSize: 'var(--text-body-lg, 0.9375rem)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    '@media (min-width: 40rem)': {
      fontSize: 'var(--text-body-xl, 1rem)',
      lineHeight: 'calc(var(--jx-unit) * 7)',
    },
  },
  badges: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    marginTop: 'var(--space-32)',
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: 'var(--space-24)',
    rowGap: 'var(--space-8)',
    fontSize: 'var(--text-label-lg)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-14, 0.14em)',
  },
  ctaRow: {
    marginTop: 'var(--space-32)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-12)',
  },
  aside: { minWidth: 0 },
  // ── the copy CTA's icon lanes ──
  iconLane: { display: 'inline-flex' },
});
