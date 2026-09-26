// a11y-table.stylex.ts — the keyboard/ARIA reference table's atoms
// (tailwindless one-shot W1, 2026-09-17; www-only site component —
// no registry mirror).
//
// Source of record: the markup utilities the table carried. The
// whole grid already rode density channels (var(--jx-gap)/--
// jx-stack)/--jx-inset)/--jx-text)/--jx-text-secondary)) — they flow
// into atoms as plain var() strings (a var() reference is not a
// literal; the calc seams keep the sheet's own derivation grammar).
// The h4's font-medium (500) has no weight token: it rides the
// .jx-a11y-heading lane-2 rule in a11y-table.css (reported for
// promotion). tracking 0.14em has no step → calc over --jx-track-wide
// (reported).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const a11yTableStyles = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: 'var(--jx-gap)' },
  heading: {
    fontFamily: tokens['--jx-font-nav'],
    marginBlockEnd: 'var(--jx-stack)',
    fontSize: 'var(--jx-text)',
  },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  // the horizontal overflow lane (PropsTable's scroller idiom): the
  // reference tables document long attribute values — at narrow shells
  // the table grows past its box and must scroll INSIDE, never pan the
  // page shell (the docs-eight-axes finale sweep's 6-page finding)
  scroller: { width: '100%', overflowX: 'auto' },
  headRow: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
  },
  headCell: {
    fontFamily: tokens['--jx-font-nav'],
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: 'calc(var(--jx-track-wide) * 1.75)',
  },
  bodyRow: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  cell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text)',
  },
  cellMono: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
  },
  cellMonoSecondary: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
  kbd: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    paddingInline: 'calc(var(--jx-inset) / 2)',
    paddingBlock: 'calc(var(--jx-stack) / 3)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
  },
});
