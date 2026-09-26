/**
 * stack.stylex.ts — the token-bound flow layout atoms
 * (registry/files/ui/stack/stack.stylex.ts, layout-family round 3,
 * 2026-09-19).
 *
 * The Layout family's FLOW primitive: one-dimensional arrangement
 * (row/column) over the site's space ladder. Every atom binds a
 * typed token — the gap rungs ride tokens['--jx-space-N'] (the
 * sheet's ladder, 16 rungs 2..80) and nothing else; the axis values
 * are the closed CSS vocabulary. The component (stack.svelte)
 * composes these per-axis — a Stack is NOT a new layout engine, it
 * is the site's OWN ladder with a component face (the goal's
 * 补充布局 Layout 组件 lane; the prototype-* family stays the
 * studio's inline-style lane — zero tokens by design, different
 * posture per the layout-family spec).
 *
 * Per-axis atoms, never combinatorial: display/direction/wrap are
 * independent axes; consumers (the component or surface modules
 * composing alongside bespoke atoms — the stage-posture precedent)
 * join them through cx().
 */
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const stackStyles = stylex.create({
  // ── the base: block flow vs inline flow ──
  base: { display: 'flex' },
  baseInline: { display: 'inline-flex' },

  // ── direction (row is flex's default — an explicit atom for the
  //    column flip only; row needs nothing) ──
  column: { flexDirection: 'column' },

  // ── wrap ──
  wrap: { flexWrap: 'wrap' },

  // ── align-items (the cross axis) ──
  alignStart: { alignItems: 'flex-start' },
  alignCenter: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  alignBaseline: { alignItems: 'baseline' },
  alignStretch: { alignItems: 'stretch' },

  // ── justify-content (the main axis) ──
  justifyStart: { justifyContent: 'flex-start' },
  justifyCenter: { justifyContent: 'center' },
  justifyEnd: { justifyContent: 'flex-end' },
  justifyBetween: { justifyContent: 'space-between' },
  justifyStretch: { justifyContent: 'stretch' },

  // ── the space ladder (token-bound, 16 rungs) ──
  gap2: { gap: tokens['--jx-space-2'] },
  gap4: { gap: tokens['--jx-space-4'] },
  gap6: { gap: tokens['--jx-space-6'] },
  gap8: { gap: tokens['--jx-space-8'] },
  gap10: { gap: tokens['--jx-space-10'] },
  gap12: { gap: tokens['--jx-space-12'] },
  gap14: { gap: tokens['--jx-space-14'] },
  gap16: { gap: tokens['--jx-space-16'] },
  gap18: { gap: tokens['--jx-space-18'] },
  gap20: { gap: tokens['--jx-space-20'] },
  gap24: { gap: tokens['--jx-space-24'] },
  gap28: { gap: tokens['--jx-space-28'] },
  gap32: { gap: tokens['--jx-space-32'] },
  gap40: { gap: tokens['--jx-space-40'] },
  gap48: { gap: tokens['--jx-space-48'] },
  gap80: { gap: tokens['--jx-space-80'] },
});

/** the gap rung vocabulary — the sheet's own space ladder, verbatim */
export const STACK_GAP_RUNGS = [
  '2', '4', '6', '8', '10', '12', '14', '16', '18', '20',
  '24', '28', '32', '40', '48', '80',
] as const;

export type StackGap = (typeof STACK_GAP_RUNGS)[number];
