// cascader.stylex.ts — the cascader family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the chain-of-selects route's utility strings as the
// batch-2 ruling spelled them: the group's column stack at the 6px
// gap, the 12px label-lg eyebrow voice, the wrapping chain, and the
// select shells' native-control face (mono 13px body, hairline border
// on the border role, background/foreground pair, the fleet radius,
// the 50% disabled dim).
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — 6px/10px spacing steps (space-6/space-10),
// the 12px label-lg text + 0.1em track-10 on the label, 13px
// --jx-text-base on the select (the ruler's T_base, a kernel channel
// the typed map never wraps), the hairline weight, and the radius/f/
// color roles through the typed table. The 7px block padding is a
// no-step oddball and rides the ruler equation calc(var(--jx-unit) *
// 1.75) — byte-exact at the default unit. The disabled dim is a
// state pose INSIDE the atom (nothing else claims opacity on the
// select; the :focus outline law stays unlayered in cascader.css and
// shares no property with any atom).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// cascader/ and apps/www/src/lib/ui/cascader/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const cascaderStyles = stylex.create({
  // ── the group: a column stack at the form gap's half ──
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
    width: 'fit-content',
  },
  // ── the reads-above-the-chain label: the eyebrow voice ──
  label: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label-lg)',
    letterSpacing: 'var(--track-10)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the chain: one wrapping row of selects ──
  chain: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-6)',
  },
  // ── the select shell: the native-control face (the jx-cascader-
  //    select hook keeps the :focus outline law in cascader.css) ──
  select: {
    paddingBlock: 'calc(var(--jx-unit) * 1.75)',
    paddingInline: 'var(--space-10)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    borderRadius: tokens['--jx-radius'],
    ':disabled': {
      opacity: 0.5,
    },
  },
});
