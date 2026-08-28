/**
 * The color law — the locked swatch square: the conic well plus the
 * flattened UA swatch pseudos (the .jx-color-swatch law). Ported
 * byte-faithful from jixoai.css @utility jx-html-color — the
 * declarations are the single source now; the @utility retires at
 * cutover.
 *
 * Engine pseudos ride BARE (browsers ignore unknown selectors) —
 * the same pattern as the range law.
 *
 * SOURCE SHAPE NOTE: the @utility base declared corner-shape twice —
 * 'var(--corner-shape, bevel)' first, then 'round' after the radius.
 * Same specificity, later-wins → the computed base value is 'round';
 * the TS object keeps ONE key, positioned at the override site.
 *
 * Pipette: CARRIED BY THE WRAPPER (.jx-color-shell::after in the
 * face) — input[type=color] is a replaced element, ::after is
 * unreliable.
 */
import type { ComponentLaw } from '../types';

export const colorLaw: ComponentLaw = {
  name: 'color',
  application: {
    className: 'jx-html-color',
    elementSelector: "input[type='color']:not(.no-jx-pure, .no-jx-pure *)",
    scoped: true,
    aliases: ['jx-color-swatch'],
  },
  base: {
    appearance: 'none',
    '-webkit-appearance': 'none',
    'box-sizing': 'border-box',
    width: 'calc(var(--jx-hit, 2.5rem) - 2px)',
    height: 'auto',
    'align-self': 'stretch',
    flex: 'none',
    padding: 'calc(var(--jx-hit, 2.5rem) / 6)',
    border: '1px solid var(--border)',
    'border-radius': '50%',
    'corner-shape': 'round',
    background:
      'conic-gradient(from 0deg, #ff0000 0deg, #ffff00 60deg, #00ff00 120deg, #00ffff 180deg, #0000ff 240deg, #ff00ff 300deg, #ff0000 360deg)',
    cursor: 'pointer',
  },
  states: [
    {
      selector: '::-webkit-color-swatch-wrapper',
      declarations: { padding: '0' },
    },
    {
      selector: '::-webkit-color-swatch',
      declarations: {
        border: '2px solid #FFF',
        'border-radius': '50%',
        'corner-shape': 'round',
      },
    },
    {
      selector: '::-moz-color-swatch',
      declarations: {
        border: '0',
        'border-radius': '0',
      },
    },
  ],
};
