// terminal-footer.stylex.ts — the terminal footer family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the composition carried
// since 2026-08-25. The SHELL's measure + rhythm is NOT here: its
// padding seams are media rules (sm:px-6 / lg:px-8 at Tailwind's own
// 40rem/64rem), and a lane-2 media rule could never re-pin an atom
// (components.stylex sorts after components in the F9 order) — the
// whole shell block lives in terminal-footer.css as the tl-shell
// pattern (base + both seams, :where([data-jx-terminal-footer])).
//
// Value receipts (missing steps reported for serial promotion):
//   - the ghost's 0.9 display leading has no fixed step → an exact
//     equation over the density ladder's 1.6 rung;
//   - tracking-[0.14em] has no step → calc(var(--jx-track-wide) *
//     1.75), riding the track token (the sheet's equation grammar);
//   - 12.5px IS --jx-text-small; 11px IS --jx-text-label (typed).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const terminalFooterStyles = stylex.create({
  // ── the ghost wordmark (decorative, aria-hidden) ──
  ghost: {
    fontFamily: tokens['--jx-font-nav'],
    userSelect: 'none',
    color: 'transparent',
    fontSize: 'clamp(3rem, 11vw, 9rem)',
    lineHeight: 'calc(var(--jx-density-leading-lg) * 0.5625)',
    WebkitTextStroke: '1px color-mix(in oklab, var(--border) 55%, transparent)',
  },
  // ── the meta row: columns stack vs the © line ──
  metaRow: {
    marginTop: tokens['--jx-space-24'],
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens['--jx-space-24'],
    rowGap: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-small'],
    color: tokens['--jx-muted-foreground'],
  },
  columns: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    columnGap: tokens['--jx-space-32'],
    rowGap: tokens['--jx-space-16'],
  },
  // ── one column ──
  column: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
  },
  columnTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: 'calc(var(--jx-track-wide) * 1.75)',
    color: tokens['--jx-muted-foreground'],
  },
  columnLinks: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-4'],
  },
});
