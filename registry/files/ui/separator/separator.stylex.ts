// separator.stylex.ts — the separator family's atom table
// (tailwindless-site P0 task 2.1, 2026-09-17).
//
// Source of record: the kernel corpus re-authoring (apps/www/src/lib/
// __probe__/stylex-corpus/separator.stylex.ts, stylex-kernel phase 0
// P0.6) — the subtraction-ink law: the contrast ghost with MASK
// geometries over it (dashed 6/4, dense 3/3, dotted chain, svg wave),
// the blend engine for fade, the one additive exception solid. The
// GRAD helper builds STATIC strings at module scope — plain string
// composition, not a stylex factory; the atoms are static longhands
// (lawful). This copy is the REGISTRY item's canonical module: the
// corpus keeps proving the kernel pipeline; this file ships.
//
// Law mapping: the solid exception's --border fill rides the typed
// token layer (whole-value member). Everything else is the corpus
// verbatim (literals + masks). The :where()→layer-law semantic shift
// the research recorded applies unchanged: consumer utilities beat
// these atoms under EITHER import order (the F9 canonical layer law).
//
// Divergences vs the corpus artifact (receipted, 2026-09-17):
//   1. import path: '../../tokens.stylex' — the registry consumption
//      path. The canonical typed pair is registry/files/lib/
//      tokens.stylex.ts ⇄ apps/www/src/lib/tokens.stylex.ts; a
//      ui/<item>/<item>.stylex.ts sits TWO levels deep, where that
//      path only resolves in the www tree. The registry/files root
//      carries a byte-identical tokens copy (registry/files/
//      tokens.stylex.ts, paired to the www mirror by manifest
//      override) so ONE relative specifier resolves identically in
//      the registry tree, the www mirror, and consumer installs
//      (@lib/tokens.stylex.ts → $lib/tokens.stylex.ts) — the babel
//      module resolution takes relative imports only (the ssg
//      lesson), so $lib aliases cannot serve.
//   2. the old component's structural Tailwind utilities joined the
//      atoms (the tailwindless consumer has no preflight to lean on):
//      horizontal gains flex 'none' + margin 0 (the hr's own UA
//      reset), vertical gains display 'inline-block' (the inline-peer
//      split posture). Structural constants — tier-1 lawful.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

const GRAD = (deg: number | string, on: number | string, off: number | string) =>
  `repeating-linear-gradient(${deg}deg, #000 0 ${on}px, transparent ${on}px ${off}px)`;

export const separatorStyles = stylex.create({
  // ── the base strip: sizes + the contrast ghost ──
  horizontal: {
    inlineSize: '100%',
    blockSize: '1px',
    flex: 'none',
    margin: 0,
    backdropFilter: 'contrast(0.5)',
    WebkitBackdropFilter: 'contrast(0.5)',
    borderWidth: 0,
    borderStyle: 'none',
  },
  vertical: {
    display: 'inline-block',
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
