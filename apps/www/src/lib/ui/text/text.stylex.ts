// text.stylex.ts — the text family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the form map's own utility payload (design §1.5,
// verbatim) — the element vocabulary's per-mark paint. The modifier
// kernel (lib/text-style.svelte.ts resolveTextStyle) is a REGISTERED
// gate producer: its emission shape stays UTILITY strings, untouched
// by this table (the kernel's utilities ride the utilities layer and
// keep beating these atoms — explicit modifier beats the form's own
// paint, the layer law's own posture).
//
// Law mapping (the tier-2 value rule): strong's 600 rides the weight
// ladder token; mark's ground is the recorded color-mix recipe
// verbatim; mark's padding box MIRRORS the face's own em-relative
// values (jx-pure.css `padding: 0.05em 0.25em` — em-scaled, never
// sheet steps) and rides promotion seams
// (--mark-pad-block/--mark-pad-inline, reported); the 2px corner is
// the fleet settle riding --mark-radius (reported); forced colors
// drop to the Highlight system pair inside the atom's @media block
// (the chip precedent).
//
// Mirror law: this file is byte-identical in registry/files/ui/text/
// and apps/www/src/lib/ui/text/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (separator's
// divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const textStyles = stylex.create({
  // ── strong: the recorded 600 override (GitHub/Tailwind emphasis) ──
  strong: {
    fontWeight: tokens['--jx-weight-semibold'],
  },
  // ── em ────────────────────────────────────────────────────────────
  em: {
    fontStyle: 'italic',
  },
  // ── del ───────────────────────────────────────────────────────────
  del: {
    textDecorationLine: 'line-through',
  },
  // ── ins ───────────────────────────────────────────────────────────
  ins: {
    textDecorationLine: 'underline',
  },
  // ── mark: the recorded override — low-alpha primary ground, the
  // face-mirroring em padding box, the 2px corner; forced colors drop
  // to the Highlight system pair ──────────────────────────────────
  mark: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 18%, transparent)',
    paddingInline: 'var(--mark-pad-inline, 0.25em)',
    paddingBlock: 'var(--mark-pad-block, 0.05em)',
    borderRadius: 'var(--mark-radius, 2px)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Highlight',
      color: 'HighlightText',
    },
  },
});
