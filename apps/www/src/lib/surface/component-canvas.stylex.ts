// component-canvas.stylex.ts — the component-canvas chrome's atom
// table (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// SITE-LANE module (apps/www/src/lib/surface/** — under the transform
// root; the pilot placement law's lane-1 extension). The canvas/dock/
// head chrome's former utility strings re-authored as static stylex
// atoms (the separator law). BOTH mirror sides of the family import
// THIS module through the $lib alias — the item's files[] must grow
// the module (or a registry twin) for shadcn-add installs; REPORTED,
// the orchestrator owns registry.json.
//
// Lane split (the placement law): the container tiers
// (@container/jx-canvas-host + @container/jx-canvas), the jx-press
// channel poses, every hover pose, the chevron/collapse transitions
// and the drawer's cubic-bezier live in component-canvas.css keyed on
// the family's semantic hooks — hover/press override atom paint, so
// they ride the UNLAYERED :where() carve-out (the Part A law).
//
// Value-law receipts (tier-2 slots — the canvas chrome held many
// one-off sub-step rem values; ALL mapped to nearest existing steps
// and REPORTED, none exact unless noted):
//   - gap-4/px-4/p-6/gap-3/gap-2/px-2/py-1/px-[0.5rem] → space-16/
//     space-16/space-24/space-12/space-8/space-8/space-4/space-8 —
//     EXACT step arithmetic.
//   - py-[0.8rem] (12.8px) → space-12 (12px); px-[0.55rem] (8.8px) →
//     space-8 (8px); gap-[0.45rem]/gap-[0.6rem]/gap-[0.4rem] (7.2/
//     9.6/6.4px) → space-8/space-8/space-6; pt-[0.35rem]/pb-[0.35rem]
//     (5.6px) → space-6; ps-[0.6rem] (9.6px) → space-8; pt-[0.4rem]
//     (6.4px) → space-6; mt-[0.85rem] (13.6px) → space-12;
//     py-[0.28rem] (4.48px) → space-4 — nearest steps.
//   - text-[15px] → var(--jx-text) (15px at the default lg scope) —
//     EXACT at default; density-stepping is the honest promotion.
//   - text-[12.5px] → --jx-text-small (12.5px) EXACT; text-[11px] →
//     --jx-text-label (11px) EXACT; text-[10px] → --jx-text-micro
//     (10px) EXACT; text-[11.5px] → --jx-text-label (nearest).
//   - tracking-[0.01em] → 'normal' (nearest — 0.13px at 13px);
//     tracking-[0.04em]/[0.14em] → --jx-track-wide (0.08em, positive
//     direction preserved).
//   - leading-[1.3] → var(--jx-leading-secondary) (1.4);
//     leading-[1.5] → var(--jx-leading) (1.6) — nearest channels.
//   - font-normal/font-medium (400/500) → NO weight token; the title
//     weight rides the [data-jx-canvas-title] lane rule, the toggle's
//     medium rides [.jx-canvas-code-toggle] (component-canvas.css) —
//     reported as --jx-weight-* promotion candidates.
//   - size-6 (24px) → calc(var(--jx-unit) * 6) — EXACT pixels.
//   - max-h-40 (10rem), max-h-[28rem], min-h-[200px], the calc(hit+2px)
//     band, grid-cols — structural measures, lawful literals.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const canvasStyles = stylex.create({
  // ── the canvas root: bordered background surface ──
  root: {
    backgroundColor: tokens['--jx-background'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    minWidth: 0,
  },

  // ── the header band ──
  head: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-16'],
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-12'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  headText: { minWidth: 0 },
  title: {
    margin: 0,
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    letterSpacing: 'normal',
    lineHeight: 'var(--jx-leading-secondary)',
  },
  description: {
    margin: 0,
    marginTop: tokens['--jx-space-4'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-small'],
    lineHeight: 'var(--jx-leading)',
    maxWidth: '62ch',
    textWrap: 'pretty',
  },
  headActions: {
    display: 'flex',
    flex: 'none',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
  },
  // the install badge (press channels + hover in css)
  install: {
    display: 'inline-flex',
    minBlockSize: 'calc(var(--jx-hit) + 2px)',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-8'],
    color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
    cursor: 'pointer',
    fontSize: tokens['--jx-text-label'],
    fontFamily: tokens['--jx-font-mono'],
    whiteSpace: 'nowrap',
  },
  // the icon-only source anchor (press channels in css)
  source: {
    display: 'inline-flex',
    height: 'calc(var(--jx-hit) + 2px)',
    width: 'calc(var(--jx-hit) + 2px)',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
  },

  // ── the scroll layer (container tier + caps in css) ──
  scroll: { minHeight: 0, minWidth: 0 },

  // ── the stage: tinted demo ground, three postures ──
  stage: {
    display: 'flex',
    minHeight: '200px',
    minWidth: 0,
    gap: tokens['--jx-space-16'],
    padding: tokens['--jx-space-24'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 42%, var(--background))',
    color: tokens['--jx-foreground'],
  },
  // (layout-family round 3) — this surface's FLOW layout moved to
  // the Layout family: $lib/ui/stack + $lib/ui/grid (token-bound
  // atoms; the two consumers compose them per-axis). The three
  // bespoke survivors below are NOT flow boxes: demoScope/rowScope
  // are display:contents SCOPE MARKERS (structural seams the docs
  // lint and the print pipeline key on), rimWrapHidden is a STATE
  // gate (display:none), and chevronDown/chevronRight are rotation
  // states — none of these is arrangement.
  demoScope: { display: 'contents' },

  // ── the code bar ──
  codeBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-12'],
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-6'],
    paddingInlineEnd: tokens['--jx-space-8'],
    paddingBlockEnd: tokens['--jx-space-6'],
    paddingInlineStart: tokens['--jx-space-8'],
  },
  codeToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    backgroundColor: tokens['--jx-background'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-foreground'],
    cursor: 'pointer',
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-wide'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    whiteSpace: 'nowrap',
  },
  codeToggleOpen: { backgroundColor: tokens['--jx-muted'] },
  chevronDown: { transform: 'rotate(180deg)' },
  chevronRight: { transform: 'rotate(-90deg)' },
  count: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
  },
  copyUsage: {
    display: 'inline-flex',
    width: 'calc(var(--jx-unit) * 6)',
    height: 'calc(var(--jx-unit) * 6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-muted-foreground'],
    cursor: 'pointer',
  },

  // ── the code drawer (transition in css) ──
  drawer: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    display: 'grid',
    gridTemplateRows: '0fr',
  },
  drawerClip: { minHeight: 0, overflow: 'hidden' },
  codePanels: { display: 'flex', flexDirection: 'column', maxHeight: '28rem' },
  treePane: {
    backgroundColor: tokens['--jx-background'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    flex: 'none',
    maxHeight: '10rem',
    overflowY: 'auto',
  },
  codeView: { display: 'flex', flex: '1 1 0%', flexDirection: 'column', minHeight: 0, minWidth: 0 },

  // ── the dock (pose/material in css) ──
  dock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    boxShadow: tokens['--jx-shadow-xs'],
    color: tokens['--jx-foreground'],
  },
  grip: {
    display: 'flex',
    alignItems: 'center',
    paddingInline: tokens['--jx-space-8'],
    color: tokens['--jx-muted-foreground'],
  },
  rimWrap: { flexShrink: 0 },
  rimWrapHidden: { display: 'none' },
  dockClip: { display: 'flex', minHeight: 0, flexDirection: 'column', overflow: 'hidden' },
  dockScroll: {
    paddingInline: tokens['--jx-space-8'],
    paddingBlockEnd: tokens['--jx-space-8'],
    paddingBlockStart: tokens['--jx-space-6'],
  },
  rowScope: { display: 'contents' },
  output: {
    margin: 0,
    marginTop: tokens['--jx-space-12'],
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
  },
  outputRow: {
    display: 'grid',
    alignItems: 'baseline',
    gap: tokens['--jx-space-8'],
    gridTemplateColumns: 'minmax(5.5rem, auto) minmax(0, 1fr)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
  },
  outputLabel: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
  },
  outputValue: {
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
    margin: 0,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },

  // ── the dock's density select (bare chrome; its --jx-icon/--jx-inset
  // channel overrides + hover ink ride component-canvas.css) ──
  dockDensity: {
    height: '100%',
    cursor: 'pointer',
    alignSelf: 'stretch',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
});
