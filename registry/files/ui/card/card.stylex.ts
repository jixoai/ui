// card.stylex.ts — the card family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the structural kernel's utility strings as the
// 2026-09-03 inline-ruler rebuild and the card-surface-kernel
// (2026-09-09) spelled them: the root's planar face (hairline border
// on the border role, card ground, the 2xs hard-offset shadow), the
// head title row's block band, and the body cell's reading voice with
// its gutter-compensating inline formula. The RULER paint (zone tracks,
// subgrid tenancy, scroll law, seats) stays css law keyed on the
// data-jx-card family — no atom shares a property with any of it.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — the hairline weight, the shadow/color roles
// through the typed table, 10px/14px spacing steps (space-10 for the
// head band, space-14 for the body block rhythm), 15px body-lg title
// text, 13px --jx-text-base body (the ruler's T_base, a kernel channel
// the typed map never wraps). The title's 1.3 leading and 0.01em
// tracking have NO sheet steps yet and ride the promotion seams
// var(--leading-13, 1.3) / var(--track-01, 0.01em) (reported; the
// orchestrator promotes steps serially) — as does the body's 1.6
// var(--leading-16, 1.6). The body cell's inline padding is the frozen
// gutter-compensation formula (card-surface-kernel T3, single-sourced
// HERE since that change) riding the space-14 step; the 80% ink mix is
// the structural color recipe the utility spelled.
//
// Mirror law: this file is byte-identical in registry/files/ui/card/
// and apps/www/src/lib/ui/card/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const cardStyles = stylex.create({
  // ── the root's planar face (the zones' geometry is css law) ──
  root: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  // ── the head title row's own band (≈40px face); the 14px inline
  //    inset arrives BY TRACK — never a utility here ──
  headBand: { paddingBlock: 'var(--space-10)' },
  // ── the head's default title voice (dialog-verbatim) ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-body-lg)',
    lineHeight: 'var(--leading-13, 1.3)',
    letterSpacing: 'var(--track-01, 0.01em)',
  },
  // ── the body cell: the scroll ring's own content face — the inline
  //    formula compensates the dynamic gutter against the 14px track
  //    inset (single-sourced here; the card root never paints it) ──
  bodyCell: {
    minWidth: 0,
    paddingBlock: 'var(--space-14)',
    paddingInline: 'max(var(--space-14) - var(--jx-scrollbar-thin, 0px), 0px)',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-16, 1.6)',
    color: 'color-mix(in oklab, var(--card-foreground) 80%, transparent)',
  },
});
