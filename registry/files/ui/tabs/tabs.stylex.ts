// tabs.stylex.ts — the tabs family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the family's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-hit/--jx-inset/--jx-gap/--jx-text/
// --jx-line/--jx-text-secondary), the theme scale through the typed
// tokens.
//
// Lane split (the placement law): the trigger's interactive poses
// (hover ink, disabled, focus-visible ring, the color transition)
// are NATIVE pseudos in tabs-trigger.css keyed on the data-jx-tab
// hook; the :has() slot law and the icon svg sizing live there too
// (pseudo geometry — atoms cannot express them).
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.12em] → --jx-track-wide (0.08em) — nearest EXISTING
//     step (reported).
//   - the semantic hooks (jx-tabs-run/horizontal/vertical,
//     jx-scroll-host, jx-tab-selected) stay class strings — they are
//     the css laws' keys (pinned identities), never utilities.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tabsStyles = stylex.create({
  // ── the root wrapper: box-tree transparent (display: contents) ──
  root: { display: 'contents' },

  // ── the HOST (one-cell grid root stacking run + veils + chevrons) ──
  host: { position: 'relative', boxSizing: 'border-box' },
  hostHorizontal: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  hostVertical: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--jx-gap)',
  },
  // the line material's structural edge: hairline border on the
  // strip's far side (right on vertical, bottom on horizontal)
  hostBorderBottom: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  hostBorderRight: {
    borderRightWidth: 'var(--hairline)',
    borderRightStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  wrap: { flexWrap: 'wrap' },

  // ── the LIST (the tablist; horizontal = the scroller run itself) ──
  listBase: { boxSizing: 'border-box' },
  listRun: {
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    overflowX: 'auto',
    gap: 'var(--jx-gap)',
  },
  listColumn: { display: 'flex', flexDirection: 'column' },

  // ── the TRIGGER base: the micro-label row at hit height ──
  trigger: {
    position: 'relative',
    zIndex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    appearance: 'none',
    paddingInline: 'var(--jx-inset)',
    minBlockSize: 'var(--jx-hit)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    cursor: 'pointer',
  },
  // the row gap rhythm
  triggerRow: { gap: 'var(--jx-gap)' },
  // stack flips the axis: a tighter column gap replaces the row gap
  triggerStacked: { flexDirection: 'column', justifyContent: 'center', gap: 'calc(var(--jx-gap) * 0.35)' },
  // selection ink (hover/focus/disabled poses are native pseudos in
  // tabs-trigger.css)
  inkSelected: { color: tokens['--jx-foreground'] },
  inkIdle: { color: tokens['--jx-muted-foreground'] },

  // ── the icon lanes ──
  iconLane: { display: 'inline-flex', flexShrink: 0 },
});
