/**
 * The range law — container-query-driven geometry + engine pseudos.
 * The input IS the thumb-sized pill; cqw shadow fill + disc thumb.
 */
import type { ComponentLaw } from '../types';

export const rangeLaw: ComponentLaw = {
  name: 'range',
  application: {
    className: 'jx-html-range',
    elementSelector: "input[type='range']:not(.no-jx-pure, .no-jx-pure *)",
    scoped: true,
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
      selector: ':focus-visible',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '2px',
      },
    },
    {
      selector: ':disabled',
      declarations: {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
    },
  ],
  supports: [
    {
      // WebKit: the disc thumb + cqw fill
      condition: "selector(::-webkit-slider-runnable-track)",
      declarations: {},
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
            width: 'var(--jx-range-thumb)',
            height: 'var(--j-range-thumb)',
            'margin-top': 'calc((var(--jx-range-track) - var(--jx-range-thumb)) / 2)',
            'border-radius': '50%',
            border: 'var(--jx-range-ring) solid var(--primary)',
            background: 'var(--background)',
            'box-shadow': 'calc(-100cqw - var(--jx-range-thumb) / 2) 0 0 100cqw var(--jx-slider-fill-color)',
          },
        },
      ],
    },
    {
      // Firefox: native progress + simpler thumb
      condition: 'selector(::-moz-range-progress)',
      declarations: {},
      states: [
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
      ],
    },
  ],
};
