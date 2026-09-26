// separator.stylex.ts — the corpus dogfood, separator family
// (stylex-kernel phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/separator/separator.stylex.ts) — the subtraction-ink
// law: the contrast ghost with MASK geometries over it (dashed 6/4,
// dense 3/3, dotted chain, svg wave), the blend engine for fade, the
// one additive exception solid. The GRAD helper builds STATIC strings
// at module scope — plain string composition, not a stylex factory;
// the atoms are static longhands (lawful).
//
// Law mapping: the solid exception's --border fill rides the typed
// token layer (whole-value member). Everything else is verbatim from
// the spike (literals + masks). The :where()→stylex-merge semantic
// shift the research recorded applies unchanged.
//
// Divergences vs the spike artifact (receipted): var(--border) →
// var(--jx-border) on the solid atoms only.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

const GRAD = (deg: number | string, on: number | string, off: number | string) =>
  `repeating-linear-gradient(${deg}deg, #000 0 ${on}px, transparent ${on}px ${off}px)`;

export const separatorStyles = stylex.create({
  // ── the base strip: sizes + the contrast ghost ──
  horizontal: {
    inlineSize: '100%',
    blockSize: '1px',
    backdropFilter: 'contrast(0.5)',
    WebkitBackdropFilter: 'contrast(0.5)',
    borderWidth: 0,
    borderStyle: 'none',
  },
  vertical: {
    inlineSize: '1px',
    alignSelf: 'stretch',
    flex: 'none',
    backdropFilter: 'contrast(0.5)',
    WebkitBackdropFilter: 'contrast(0.5)',
  },
  // ── solid: the additive exception — ghost OFF, --border ON ──
  solidHorizontal: {
    backdropFilter: 'none',
    backgroundColor: tokens['--jx-border'],
  },
  solidVertical: {
    backdropFilter: 'none',
    backgroundColor: tokens['--jx-border'],
  },
  // ── dashed 6/4 ──
  dashedH: { maskImage: GRAD(90, 6, 10), WebkitMaskImage: GRAD(90, 6, 10) },
  dashedV: { maskImage: GRAD(180, 6, 10), WebkitMaskImage: GRAD(180, 6, 10) },
  // ── dense 3/3 ──
  denseH: { maskImage: GRAD(90, 3, 6), WebkitMaskImage: GRAD(90, 3, 6) },
  denseV: { maskImage: GRAD(180, 3, 6), WebkitMaskImage: GRAD(180, 3, 6) },
  // ── dotted: 2px lanes, radial dot chain ──
  dottedH: {
    blockSize: '2px',
    maskImage: 'radial-gradient(circle 1px at 1px 1px, #000 99%, transparent 100%)',
    WebkitMaskImage:
      'radial-gradient(circle 1px at 1px 1px, #000 99%, transparent 100%)',
    maskSize: '5px 2px',
    WebkitMaskSize: '5px 2px',
    maskRepeat: 'repeat-x',
    WebkitMaskRepeat: 'repeat-x',
  },
  dottedV: {
    inlineSize: '2px',
    maskImage: 'radial-gradient(circle 1px at 1px 1px, #000 99%, transparent 100%)',
    WebkitMaskImage:
      'radial-gradient(circle 1px at 1px 1px, #000 99%, transparent 100%)',
    maskSize: '2px 5px',
    WebkitMaskSize: '2px 5px',
    maskRepeat: 'repeat-y',
    WebkitMaskRepeat: 'repeat-y',
  },
  // ── wavy: the svg sine mask, 6px lanes ──
  wavyH: {
    blockSize: '6px',
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 3 Q3 .4 6 3 T12 3' fill='none' stroke='black' stroke-width='1.3'/%3E%3C/svg%3E\")",
    WebkitMaskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6'%3E%3Cpath d='M0 3 Q3 .4 6 3 T12 3' fill='none' stroke='black' stroke-width='1.3'/%3E%3C/svg%3E\")",
    maskSize: '12px 6px',
    WebkitMaskSize: '12px 6px',
    maskRepeat: 'repeat-x',
    WebkitMaskRepeat: 'repeat-x',
  },
  wavyV: {
    inlineSize: '6px',
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='12'%3E%3Cpath d='M3 0 Q.4 3 3 6 T3 12' fill='none' stroke='black' stroke-width='1.3'/%3E%3C/svg%3E\")",
    WebkitMaskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='12'%3E%3Cpath d='M3 0 Q.4 3 3 6 T3 12' fill='none' stroke='black' stroke-width='1.3'/%3E%3C/svg%3E\")",
    maskSize: '6px 12px',
    WebkitMaskSize: '6px 12px',
    maskRepeat: 'repeat-y',
    WebkitMaskRepeat: 'repeat-y',
  },
  // ── fade: the blend engine — alpha-ramped white, peak 0.6, difference ──
  fadeH: {
    backdropFilter: 'none',
    backgroundImage:
      'linear-gradient(90deg, transparent, rgb(255 255 255 / 0.35) 30%, rgb(255 255 255 / 0.6) 50%, rgb(255 255 255 / 0.35) 70%, transparent)',
    mixBlendMode: 'difference',
  },
  fadeV: {
    backdropFilter: 'none',
    backgroundImage:
      'linear-gradient(180deg, transparent, rgb(255 255 255 / 0.35) 30%, rgb(255 255 255 / 0.6) 50%, rgb(255 255 255 / 0.35) 70%, transparent)',
    mixBlendMode: 'difference',
  },
});
