// pattern-login.stylex.ts — the pattern-login family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17; shared by the login
// card and the OTP second-factor screen — both ride pattern-login.css
// for the ascii corner brackets).
//
// Source of record: the old markup's utility strings — the card frame
// (26rem measure, border + --shadow float tier, site radius), the
// echo header / boot footer bands (hairline dividers, 10px block /
// 16px inline insets, the 20px sm seam), the form column, the ssh
// glyph voices (12px xs + trackings), and the icon lanes.
//
// Value law: theme-able slots ride tokens or var() seams — 12px rides
// the existing --text-label-lg step, 0.08em rides --track-wide (both
// typed); 0.04em has no sheet step yet (promotion seam
// var(--track-04, 0.04em), reported); the 2.5/5 offsets ride ruler
// equations (calc(var(--jx-unit) * 2.5 / 5)). The ascii `+` corner
// brackets stay in pattern-login.css (pseudo-element content, the
// same law as pattern-cta).
//
// Mirror law: byte-identical in registry/files/ui/pattern-login/ and
// apps/www/src/lib/ui/pattern-login/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const loginStyles = stylex.create({
  // ── the card frame (both screens) ──
  card: {
    boxSizing: 'border-box',
    marginInline: 'auto',
    width: '100%',
    maxWidth: '26rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    borderRadius: tokens['--jx-radius'],
    boxShadow: tokens['--jx-shadow'],
  },

  // ── the echo header / boot footer bands ──
  band: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
    paddingInline: 'var(--space-16)',
    paddingBlock: 'calc(var(--jx-unit) * 2.5)',
  },
  bandEnd: {
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
    paddingInline: 'var(--space-16)',
    paddingBlock: 'calc(var(--jx-unit) * 2.5)',
  },

  // ── the form column ──
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-16)',
    paddingInline: 'var(--space-16)',
    paddingBlock: 'var(--space-20)',
    '@media (min-width: 40rem)': {
      paddingInline: 'var(--space-20)',
    },
  },

  // ── the ssh voices ──
  echo: {
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-muted-foreground'],
  },
  prompt: {
    color: tokens['--jx-primary'],
  },
  glyph: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
  },
  hint: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: 'var(--track-04, 0.04em)',
    color: tokens['--jx-muted-foreground'],
  },
  // the boot footer's own echo: the hint voice WITH truncation
  bootEcho: {
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: 'var(--track-04, 0.04em)',
    color: tokens['--jx-muted-foreground'],
  },
  commandLine: {
    minWidth: 0,
    flex: '1 1 0%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: 'var(--track-04, 0.04em)',
    color: tokens['--jx-muted-foreground'],
  },
  promptMark: {
    color: tokens['--jx-primary'],
  },

  // ── the footer's copy row + the icon lanes ──
  bootRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-12)',
  },
  submitOffset: { marginTop: 'var(--space-4)' },
  iconLane: { display: 'inline-flex' },
});
