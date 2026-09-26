// pattern-cta.stylex.ts — the pattern-cta family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the band
// frame (grid, border + --shadow float tier, site radius, the
// min-820px two-track seam at the ORIGINAL threshold), the eyebrow /
// heading / summary voices, the outline escape's block offset, and
// the footer's icon lanes.
//
// Value law: theme-able slots ride tokens or var() seams — the
// eyebrow tracking rides the existing --track-label step (typed);
// 11px rides --text-label; the 15px body, the bold weight, the 1.2
// display leading and the tight -0.02em tracking have no sheet steps
// yet and ride promotion seams (all reported for serial promotion:
// var(--text-body-lg, 0.9375rem), var(--weight-bold, 700),
// var(--leading-12, 1.2), var(--track-tight, -0.02em)); --primary-text
// has no typed mirror (var() plain form, the --jx-text-base
// precedent); the heading's clamp() display measure is a one-off
// structural geometry (lawful); leading-6 rides the ruler equation.
// The `+` corner brackets stay in pattern-cta.css (pseudo-element
// content — lane-2 residue).
//
// Mirror law: byte-identical in registry/files/ui/pattern-cta/ and
// apps/www/src/lib/ui/pattern-cta/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const ctaStyles = stylex.create({
  // ── the band frame: grid + float tier + the 820px two-track seam ──
  band: {
    boxSizing: 'border-box',
    display: 'grid',
    width: '100%',
    gap: 'var(--space-32)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: 'var(--space-16)',
    paddingBlock: 'var(--space-32)',
    borderRadius: tokens['--jx-radius'],
    boxShadow: tokens['--jx-shadow'],
    '@media (min-width: 820px)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(19rem, 24rem)',
      alignItems: 'center',
      paddingInline: 'var(--space-32)',
    },
  },
  // ── the lead column ──
  lead: { minWidth: 0 },
  // ── the shell-prompt eyebrow ──
  eyebrow: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    color: 'var(--primary-text)',
  },
  // ── the display heading ──
  heading: {
    marginTop: 'var(--space-12)',
    maxWidth: '24ch',
    fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)',
    fontWeight: 'var(--weight-bold, 700)',
    lineHeight: 'var(--leading-12, 1.2)',
    letterSpacing: 'var(--track-tight, -0.02em)',
    textWrap: 'balance',
  },
  // ── the support line ──
  summary: {
    marginTop: 'var(--space-12)',
    maxWidth: '52ch',
    textWrap: 'pretty',
    fontSize: 'var(--text-body-lg, 0.9375rem)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the outline escape's block offset (a consumer class on
  // PressButton — the composition-only law holds, no atom patched) ──
  escape: { marginTop: 'var(--space-24)' },
  // ── the footer's icon lanes ──
  iconLane: { display: 'inline-flex' },
});
