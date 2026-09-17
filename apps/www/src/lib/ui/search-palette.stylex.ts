// search-palette.stylex.ts — the docs search palette's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities of the r12 Dialog-composed
// palette (search-corpus, 2026-09-02). The flight cue's keyframes
// stay in the component's scoped <style> (the jx-flight law, frozen);
// the result heading's font-medium (500) rides the new lane-2 sheet
// search-palette.css (.jx-search-heading — no weight token exists;
// reported for promotion).
//
// Value receipts (missing steps reported for serial promotion):
//   - 10.5px has no step → --jx-text-micro (the corner-annotation
//     voice, 0.5px off the authored size);
//   - rounded-md (6px) has no step → --jx-radius (the fleet corner:
//     0 light / 8px under @supports corner-shape);
//   - leading-snug (1.375) → an exact equation over the density
//     ladder's 1.6 rung; leading-relaxed (1.625) → the 1.6 rung;
//   - 14px paddings / the 36px empty-state block ride ruler
//     equations (no --space-14 / --space-36 steps);
//   - 12/12.5/13px ARE --jx-text-label-lg / --jx-text-small / the
//     var(--jx-text) channel.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex'; // lib/ui ROOT (one level up — separator sits a folder deeper)

export const searchPaletteStyles = stylex.create({
  // ── the host root (layout-transparent for the Dialog beneath) ──
  contents: { display: 'contents' },
  // the Dialog's geometry overrides (className prop)
  dialog: {
    marginTop: '14vh',
    width: 'min(92vw, 44rem)',
    maxHeight: 'calc(100dvh - 14vh - 2rem)',
  },
  // the head band's flush column (past the inset track)
  headerCol: { gridColumnStart: 1 },
  // the Input IS the head
  inputFlex: { width: '100%', minWidth: 0, flex: '1 1 0%' },
  searchIcon: { flex: 'none', userSelect: 'none', color: tokens['--jx-muted-foreground'] },
  // the flight cue (keyframes in the scoped block)
  flightGap: { display: 'flex', flex: 'none', gap: tokens['--jx-space-4'] },
  flightRow: { display: 'flex', gap: tokens['--jx-space-4'] },
  // ── the PENDING state ──
  pending: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    paddingInline: tokens['--jx-space-20'],
    paddingBlock: tokens['--jx-space-32'],
  },
  pendingText: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    color: tokens['--jx-muted-foreground'],
  },
  // ── the EMPTY state ──
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    paddingInline: tokens['--jx-space-20'],
    paddingBlock: 'calc(var(--jx-unit) * 9)',
    textAlign: 'center',
  },
  emptyIcon: {
    userSelect: 'none',
    color: 'color-mix(in oklab, var(--muted-foreground) 50%, transparent)',
  },
  emptyTitle: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-small'],
    color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
  },
  emptyTitleInk: { color: tokens['--jx-foreground'] },
  emptyHint: {
    fontSize: tokens['--jx-text-label'],
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
  },
  // ── the results list ──
  list: { padding: tokens['--jx-space-8'] },
  option: {
    display: 'block',
    borderRadius: tokens['--jx-radius'],
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-10'],
  },
  optionActive: { backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' },
  optionPage: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: 'calc(var(--jx-track-wide) * 1.75)',
    color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
  },
  // the 500 weight rides .jx-search-heading (search-palette.css)
  optionHeading: {
    marginTop: tokens['--jx-space-4'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'calc(var(--jx-density-leading-lg) * 0.859375)',
  },
  optionSummary: {
    marginTop: tokens['--jx-space-4'],
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'var(--jx-density-leading-lg)',
    color: tokens['--jx-muted-foreground'],
  },
  summaryMark: { backgroundColor: 'transparent', color: tokens['--jx-primary'] },
});
