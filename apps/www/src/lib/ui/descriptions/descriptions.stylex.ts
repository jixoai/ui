// descriptions.stylex.ts — the descriptions family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17). Both halves
// share ONE table: the dl grid root and the term/value cell the Item
// renders.
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-24): the dl's column grid over --jx-desc-cols (the @container
// declaration), the bordered frame, the cell's term/value two-track
// grid (minmax(7rem,12rem) + 1fr), the term's micro-label voice (the
// 0.12em --track-12 step), and the dd's body voice over the --jx-text/
// --jx-line channels.
//
// Law mapping (the tier-2 value rule): every theme-able slot rides
// tokens or kernel channels; the 7rem/12rem cell track is a structural
// grid measure (grid-template-columns geometry, not a theme slot). The
// narrow-container fallback (one pair per row under 640px) stays
// UNLAYERED in descriptions.css behind :where(.jx-desc) — a container
// query can never live on the element itself, and the fallback must
// beat this table's grid atoms, so it rides lane-2 (the unlayered
// carve-out beats every layer).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// descriptions/ and apps/www/src/lib/ui/descriptions/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const descriptionsStyles = stylex.create({
  // ── the dl root: N term/value pairs per row, a named container ──
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(var(--jx-desc-cols), minmax(0, 1fr))',
    gap: 0,
    margin: 0,
    containerType: 'inline-size',
  },
  // the bordered look: hairline frame over the card ground
  bordered: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },

  // ── the Item's cell ──
  cell: {
    display: 'grid',
    gridTemplateColumns: 'minmax(7rem, 12rem) 1fr',
    minWidth: 0,
  },
  // the bordered cell's bottom hairline
  cellBordered: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
  },
  // the dt: truncated micro-label over the secondary voice
  term: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: 'var(--jx-gap) var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    letterSpacing: tokens['--jx-track-12'],
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // the bordered dt: muted ground + the inline-end rule
  termBordered: {
    backgroundColor: tokens['--jx-muted'],
    borderRightWidth: tokens['--jx-hairline'],
    borderRightStyle: 'solid',
    borderRightColor: tokens['--jx-border'],
  },
  // the dd: body voice, wrapping anywhere
  value: {
    margin: 0,
    padding: 'var(--jx-gap) var(--jx-inset)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-foreground'],
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
});
