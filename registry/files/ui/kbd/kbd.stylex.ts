// kbd.stylex.ts — the kbd family's atom table (tailwindless one-shot
// Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old native <kbd> authored
// (tw4, 2026-08-24): the ENGRAVED geometry — 1px border, the 2px
// corner radius (Owner 2026-09-05) + the --shadow-engrave inset —
// and the variant ladder byte-aligned with chip/press-button's map
// (each rung the sole border-color source; the frame never carries a
// named border paint).
//
// Law mapping (the tier-2 value rule): the 2px corner has NO sheet
// step — it rides the promotion seam var(--kbd-radius, 2px) (reported;
// the orchestrator promotes steps serially). The engrave shadow rides
// the typed --jx-shadow-engrave token, the frame rides --jx-hairline,
// the micro voice rides the --jx-text-secondary/--jx-line-secondary
// kernel channels. Forced-colors degradation (each rung's own: fill →
// ButtonFace/ButtonText, tonal/outline → Canvas/CanvasText) rides
// nested @media blocks — the exact forms the chip pilot proved.
//
// Mirror law: this file is byte-identical in registry/files/ui/kbd/
// and apps/www/src/lib/ui/kbd/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const kbdStyles = stylex.create({
  // ── the engraved glyph body ──
  base: {
    display: 'inline-block',
    paddingInline: 'var(--jx-gap)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderRadius: 'var(--kbd-radius, 2px)',
    boxShadow: tokens['--jx-shadow-engrave'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    whiteSpace: 'nowrap',
  },

  // ── the ladder (a rung is the SOLE border-color source) ──
  fill: {
    backgroundColor: 'var(--jx-fill)',
    borderColor: 'var(--jx-fill)',
    color: 'var(--jx-fill-ink)',
    '@media (forced-colors: active)': {
      backgroundColor: 'ButtonFace',
      borderColor: 'ButtonText',
      color: 'ButtonText',
    },
  },
  tonal: {
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)',
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'var(--jx-outline)',
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
});
