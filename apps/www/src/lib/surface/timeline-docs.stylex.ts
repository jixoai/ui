// timeline-docs.stylex.ts — the timeline docs page's atom table
// (tailwindless-site P0 tasks 3.1–3.2, 2026-09-17).
//
// The SITE lane's first atom module (the placement law's lane-1
// extension): static `stylex.create` atoms UNDER the transform root
// (apps/www/src/lib/surface/** — the kernel-scope gate transforms
// src/lib; the route imports, never authors). The pilot page's
// recurring SINGLE-concern paint lives here; recurring COMPOSITES
// (eyebrow, body voice, frame, grids, stepper control) are the
// REGISTERED semantic rules in the site lane-2 sheet
// ($lib/site/timeline-docs.css — @layer components + :where()) —
// never utility lookalikes.
//
// Value law (three tiers):
//   - structural constants: display/flow, width floors, the one-off
//     stage measures (24rem/42rem), the scroller caps and horizontal
//     scroll floors — atom-local geometry, lawful literals;
//   - theme-able values ride the typed site voice scale
//     (jixoai.css "The site voice scale" segment ⇄ tokens.stylex.ts):
//     space steps, the demo stage measure, label/track steps, ink
//     roles — zero px/rem literals in tier-2 slots;
//   - 13px body text consumes the ruler's --jx-text-base kernel
//     channel as a PLAIN var() string (the tokens map's cycle law:
//     a typed key may never share its sheet name).
//
// Consumption: members compose through the page's component-local
// cx join (the separator serialize law, Wave-1 ruling 2026-09-17 —
// this module exports atoms only, never the joiner).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const tlDocs = stylex.create({
  // ── layout (structural constants) ──────────────────────────────
  flex: { display: 'flex' },
  col: { flexDirection: 'column' },
  wrap: { flexWrap: 'wrap' },
  itemsCenter: { alignItems: 'center' },
  itemsBaseline: { alignItems: 'baseline' },
  between: { justifyContent: 'space-between' },
  minW0: { minWidth: 0 },
  wFull: { width: '100%' },
  oxAuto: { overflowX: 'auto' },
  oyAuto: { overflowY: 'auto' },

  // ── the space ladder (typed steps) ─────────────────────────────
  gap6: { gap: tokens['--jx-space-6'] },
  gap8: { gap: tokens['--jx-space-8'] },
  gap12: { gap: tokens['--jx-space-12'] },
  gap16: { gap: tokens['--jx-space-16'] },
  gap24: { gap: tokens['--jx-space-24'] },
  gap32: { gap: tokens['--jx-space-32'] },
  p12: { padding: tokens['--jx-space-12'] },
  p16: { padding: tokens['--jx-space-16'] },
  p24: { padding: tokens['--jx-space-24'] },
  mt20: { marginTop: tokens['--jx-space-20'] },
  mt24: { marginTop: tokens['--jx-space-24'] },
  ml4: { marginInlineStart: tokens['--jx-space-4'] },

  // the free-body list reset (margins/padding zero + no markers)
  listReset: { margin: 0, padding: 0, listStyleType: 'none' },

  // ── measures ───────────────────────────────────────────────────
  // the recurring demo-stage measure (typed); the one-off sm/2xl
  // stages, the animation scroller cap, and the horizontal scroll
  // floors are structural constants (single-use geometry)
  measure28: { maxWidth: tokens['--jx-stage-w'] },
  maxW24: { maxWidth: '24rem' },
  maxW42: { maxWidth: '42rem' },
  maxH64: { maxHeight: '16rem' },
  minW26: { minWidth: '26rem' },
  minW30: { minWidth: '30rem' },
  minW34: { minWidth: '34rem' },

  // ── typography (typed steps; 13px via the ruler's kernel channel)
  micro: { fontSize: tokens['--jx-text-micro'] },
  textBase: { fontSize: 'var(--jx-text-base)' },
  trackWide: { letterSpacing: tokens['--jx-track-wide'] },
  upper: { textTransform: 'uppercase' },
  tabular: { fontVariantNumeric: 'tabular-nums' },

  // ── fonts (typed) ──────────────────────────────────────────────
  fontNav: { fontFamily: tokens['--jx-font-nav'] },
  fontMono: { fontFamily: tokens['--jx-font-mono'] },

  // ── ink roles (typed) ──────────────────────────────────────────
  primary: { color: tokens['--jx-primary'] },
  accent: { color: tokens['--jx-accent'] },
  fg: { color: tokens['--jx-foreground'] },
});
