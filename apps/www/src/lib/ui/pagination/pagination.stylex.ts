// pagination.stylex.ts — the pagination family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the family's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-hit/--jx-inset/--jx-gap/--jx-text/
// --jx-line), the theme scale through the typed tokens.
//
// Lane split (the placement law): the jx-press channel poses
// (--jx-press-shadow* custom properties configure the shared press
// @utility law — stylex atoms cannot author custom properties) and
// the hover/focus-visible poses live in pagination.css keyed on the
// family hooks (data-jx-page / -current / -edge); hover overrides
// atom ink, so those rules ride the UNLAYERED :where() carve-out
// (the Part A law — stylex tiers nest under components).
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.08em] → --jx-track-wide (0.08em) — EXACT.
//   - border (1px) → borderWidth var(--hairline) + explicit
//     borderStyle solid (no preflight — the separator divergence #2).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const paginationStyles = stylex.create({
  // ── the nav landmark ──
  nav: { display: 'block' },

  // ── the strip: wrapping row of items at the inline gap ──
  list: {
    margin: 0,
    display: 'flex',
    listStyleType: 'none',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    padding: 0,
  },

  // ── the ellipsis: aria-hidden gap glyph ──
  ellipsis: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 'var(--jx-inset)',
    color: tokens['--jx-muted-foreground'],
    userSelect: 'none',
  },

  // ── the chip geometry (numbered pages + edge controls) ──
  chip: {
    display: 'inline-flex',
    minBlockSize: 'var(--jx-hit)',
    minInlineSize: 'var(--jx-hit)',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textDecorationLine: 'none',
    letterSpacing: tokens['--jx-track-wide'],
    cursor: 'pointer',
  },
  // the current page: the law's press without its shadow (the press
  // channel pose lives in pagination.css on [data-jx-page-current])
  chipCurrent: {
    borderColor: tokens['--jx-primary'],
    backgroundColor: tokens['--jx-primary'],
    color: tokens['--jx-primary-foreground'],
  },
  // an idle page / edge control (hover pose in pagination.css)
  chipIdle: {
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    color: tokens['--jx-foreground'],
  },
  // the edge controls' cased label (prev/next)
  chipUpper: { textTransform: 'uppercase' },

  // ── the honest disabled span (no href, no onclick) ──
  chipOff: {
    display: 'inline-flex',
    minBlockSize: 'var(--jx-hit)',
    minInlineSize: 'var(--jx-hit)',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-foreground'],
    opacity: 0.45,
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
});
