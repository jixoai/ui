// accordion.stylex.ts — the accordion family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the tw4 utility authoring that lived in the
// markup (accordion.svelte / accordion-item.svelte, 2026-08-24) —
// every structural constant lifted verbatim; theme-able slots ride
// the typed token layer or the ruler's kernel channels (the corpus
// law: control voices pair var(--jx-text) with their line channel).
// The STATE seams the utilities carried — hover ink, focus-visible
// outline, the color transition — are NOT atoms: they live in
// accordion-item.css as native pseudos under @layer components (the
// placement law; a lane-2 rule must own every property its state
// rules touch, or the atom tier would shade it — components.stylex
// sorts after components in the F9 layer order).
//
// Value receipts (missing steps reported for serial promotion):
//   - 14px/11px paddings have no voice steps → ruler equations
//     (calc(var(--jx-unit) * 3.5) / * 2.75), the sheet's own
//     derivation grammar (the space ladder is equations from the
//     ruler);
//   - 13px voices ride the density channel var(--jx-text) (exact
//     at the default scope; the fixed --jx-text-base stays reserved
//     to chrome that must NOT retune);
//   - tracking-[0.08em] IS --jx-track-wide (typed).
//
// The tokens import rides the registry consumption path
// ('../../tokens.stylex' — the separator's divergence note #1: one
// relative specifier resolving in both trees).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const accordionStyles = stylex.create({
  // ── the group frame: one hairline box around the set ──
  group: {
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    borderRadius: tokens['--jx-radius'],
  },
  // ghost: antd's frameless paint — no card ground, no frame ink;
  // the sibling seam (accordion.css) keeps drawing the hairlines
  ghost: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  // ── the item: a bare <details> keeps its block posture ──
  item: { display: 'block' },
  // ── the summary line — ink + state seams owned by the css lane ──
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-10'],
    boxSizing: 'border-box',
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: 'calc(var(--jx-unit) * 2.75)',
    cursor: 'pointer',
    listStyleType: 'none',
    userSelect: 'none',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
  },
  // ── the disclosure body ──
  body: {
    paddingInlineStart: tokens['--jx-space-24'],
    paddingInlineEnd: 'calc(var(--jx-unit) * 3.5)',
    paddingBlockEnd: 'calc(var(--jx-unit) * 3.5)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-muted-foreground'],
  },
});
