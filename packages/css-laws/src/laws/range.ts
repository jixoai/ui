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
    elementSelector: "input[type='range']:not(.no-jx-pure, .no-jx-pure *)",
    scoped: true,
    aliases: ['jx-slider'],
  },
  customProperties: {
    '--jx-range-thumb': '100cqh',
    '--jx-range-track': 'calc(100cqh / 2.5)',
    '--jx-range-ring': 'calc(100cqh / 8)',
    '--jx-slider-fill-color': 'var(--primary)',
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
