// prose.stylex.ts — the corpus dogfood, prose family (stylex-kernel
// phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/prose/prose.stylex.ts) — the reading-region provider's
// HOST lane: the STATIC enums (family/ink/ground/align/wrap/hyphens)
// as classes; the free-form size knob stays the provider's INLINE
// declaration lane (the spike's own two-channel emission; the
// factory idiom is forbidden here — design §4.2 — and the icon
// family's seam re-authoring carries the dynamic-value proof).
//
// Law mapping: ink/ground/family theme refs ride the typed token
// layer (--jx-* members). Divergences vs the spike artifact
// (receipted): typed var indirection only.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const proseStyles = stylex.create({
  host: {
    // the base reading region (jx-pure face essentials)
    fontFamily: tokens['--jx-font-sans'],
    lineHeight: 1.6,
  },
  familyMono: { fontFamily: tokens['--jx-font-mono'] },
  familySerif: { fontFamily: '"Iowan Old Style", Georgia, serif' },
  inkMuted: { color: tokens['--jx-muted-foreground'] },
  inkPrimary: { color: tokens['--jx-primary'] },
  inkDestructive: { color: tokens['--jx-error'] },
  groundBackground: { backgroundColor: tokens['--jx-background'] },
  groundCard: { backgroundColor: tokens['--jx-card'] },
  groundPopover: { backgroundColor: tokens['--jx-popover'] },
  groundMuted: { backgroundColor: tokens['--jx-muted'] },
  groundSecondary: { backgroundColor: tokens['--jx-secondary'] },
  groundAccent: { backgroundColor: tokens['--jx-accent'] },
  groundTransparent: { backgroundColor: 'transparent' },
  alignCenter: { textAlign: 'center' },
  alignEnd: { textAlign: 'end' },
  alignJustify: { textAlign: 'justify' },
  wrapPretty: { textWrap: 'pretty' },
  wrapBalance: { textWrap: 'balance' },
  wrapStable: { textWrap: 'stable' },
  hyphensAuto: { hyphens: 'auto' },
  hyphensNone: { hyphens: 'none' },
  hyphensManual: { hyphens: 'manual' },
});
