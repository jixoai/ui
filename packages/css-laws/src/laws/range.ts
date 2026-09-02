/**
 * The range law — the input IS the thumb-sized pill: cqw shadow fill +
 * the ringed disc thumb (the .jx-slider law).
 * GEOMETRY TOKEN CHAIN (Codex r1 ruling): thumb + track + centering
 * all derive from the density aliases — never a literal. The size
 * container makes thumb = 100cqh (the input's own height); consumer
 * overrides height (or --jx-icon) → thumb/track/ring all scale.
 * Engine pseudos ride BARE (browsers ignore unknown selectors) —
 * ported byte-faithful from jixoai.css @utility jx-html-range.
 */
import type { ComponentLaw } from '../types';

export const rangeLaw: ComponentLaw = {
  name: 'range',
  application: {
    className: 'jx-html-range',
    elementSelector: "input:where([type='range']:not(.no-jx-pure, .no-jx-pure *))",
    scoped: true,
    aliases: ['jx-slider'],
  },
  customProperties: {
    '--jx-range-thumb': '100cqh',
    '--jx-range-track': 'calc(100cqh / 2.5)',
    '--jx-range-ring': 'calc(100cqh / 8)',
    '--jx-slider-fill-color': 'var(--primary)',
    /* the vertical slider's LENGTH (owner orientation round,
       2026-09-02) — the one axis the icon token cannot derive */
    '--jx-range-length': 'calc(var(--jx-unit, 0.25rem) * 40)',
  },
  base: {
    appearance: 'none',
    '-webkit-appearance': 'none',
    'box-sizing': 'border-box',
    'corner-shape': 'var(--corner-shape, bevel)',
    display: 'block',
    width: '100%',
    height: 'var(--jx-icon, 1.5rem)',
    margin: '0',
    border: '0',
    'border-radius': 'calc(infinity * 1px)',
    background: 'transparent',
    'container-type': 'size',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  states: [
    {
      selector: '::-webkit-slider-runnable-track',
      declarations: {
        height: 'var(--jx-range-track)',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--muted)',
      },
    },
    {
      selector: '::-webkit-slider-thumb',
      declarations: {
        '-webkit-appearance': 'none',
        appearance: 'none',
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
        /* thumb = the icon token; centering = (track − thumb) / 2 */
        width: 'var(--jx-range-thumb)',
        height: 'var(--jx-range-thumb)',
        'margin-top': 'calc((var(--jx-range-track) - var(--jx-range-thumb)) / 2)',
        'border-radius': '50%',
        border: 'var(--jx-range-ring) solid var(--primary)',
        background: 'var(--background)',
        'box-shadow': 'calc(-100cqw - var(--jx-range-thumb) / 2) 0 0 100cqw var(--jx-slider-fill-color)',
      },
    },
    /* RTL fill mirror (E-2, 2026-09-02): the box-shadow fill is
       PHYSICAL — the x-offset paints the bar from the thumb toward the
       track's START edge. In RTL the start edge is the physical RIGHT,
       so the offset flips sign or the fill covers the wrong side
       (pixel-verified: value=10 painted ~90% on the left). Gecko's
       ::-moz-range-progress is logical and needs no mirror. Rides
       AFTER the thumb rule (equal order, stable sort keeps authored
       sequence) so the mirror wins when both match. */
    {
      selector: ':dir(rtl)::-webkit-slider-thumb',
      declarations: {
        'box-shadow': 'calc(100cqw + var(--jx-range-thumb) / 2) 0 0 100cqw var(--jx-slider-fill-color)',
      },
    },
    /* vertical face (owner orientation round, 2026-09-02): the
       platform's own vertical slider — Chromium rides writing-mode
       (vertical-lr + direction:rtl = min at the physical BOTTOM, the
       fader convention), Gecko rides the orient attribute. The
       geometry tokens swap to the WIDTH axis (100cqw): the thumb is
       the icon token, the track its /2.5 thickness across the strip.
       The fill box-shadow flips to the block axis and paints DOWNWARD
       from the thumb (toward min at the bottom); the horizontal
       :dir(rtl) mirror must not flip it, so the vertical rtl variant
       below outranks it by specificity ([orient] attribute).
       Gecko's ::-moz-range-progress is logical, only the thickness
       axis needs the swap. */
    {
      selector: '[orient="vertical"]',
      declarations: {
        '--jx-range-thumb': '100cqw',
        '--jx-range-track': 'calc(100cqw / 2.5)',
        '--jx-range-ring': 'calc(100cqw / 8)',
        'writing-mode': 'vertical-lr',
        direction: 'rtl',
        width: 'var(--jx-icon, 1.5rem)',
        height: 'var(--jx-range-length)',
      },
    },
    {
      selector: '[orient="vertical"]::-webkit-slider-runnable-track',
      declarations: {
        width: 'var(--jx-range-track)',
        height: 'auto',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--muted)',
      },
    },
    {
      selector: '[orient="vertical"]::-webkit-slider-thumb',
      declarations: {
        /* centering swaps to the thickness (horizontal) axis */
        'margin-top': '0',
        'margin-left': 'calc((var(--jx-range-track) - var(--jx-range-thumb)) / 2)',
        'box-shadow':
          '0 calc(100cqh + var(--jx-range-thumb) / 2) 0 100cqh var(--jx-slider-fill-color)',
      },
    },
    {
      selector: '[orient="vertical"]:dir(rtl)::-webkit-slider-thumb',
      declarations: {
        'box-shadow':
          '0 calc(100cqh + var(--jx-range-thumb) / 2) 0 100cqh var(--jx-slider-fill-color)',
      },
    },
    {
      selector: '[orient="vertical"]::-moz-range-track',
      declarations: {
        width: 'var(--jx-range-track)',
        height: 'auto',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--muted)',
      },
    },
    {
      selector: '[orient="vertical"]::-moz-range-progress',
      declarations: {
        width: 'var(--jx-range-track)',
        height: 'auto',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--jx-slider-fill-color)',
      },
    },
    {
      selector: '::-moz-range-track',
      declarations: {
        height: 'var(--jx-range-track)',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--muted)',
      },
    },
    {
      selector: '::-moz-range-progress',
      declarations: {
        height: 'var(--jx-range-track)',
        'border-radius': 'calc(infinity * 1px)',
        background: 'var(--jx-slider-fill-color)',
      },
    },
    {
      selector: '::-moz-range-thumb',
      declarations: {
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
        width: 'var(--jx-range-thumb)',
        height: 'var(--jx-range-thumb)',
        'border-radius': '50%',
        border: 'var(--jx-range-ring) solid var(--primary)',
        background: 'var(--background)',
      },
    },
    {
      selector: ':focus-visible',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '2px',
      },
    },
    {
      selector: ':disabled',
      declarations: { opacity: '0.5', cursor: 'not-allowed' },
    },
  ],
};
