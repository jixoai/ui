/**
 * The control law — the single-box form control: one element owns the
 * border, padding and state (the first of the two control postures).
 * Ported byte-faithful from jixoai.css @utility jx-html-control.
 *
 * SINGLE DECLARATION SOURCE: this file. Never edit the generated CSS.
 */
import type { ComponentLaw } from '../types';

export const controlLaw: ComponentLaw = {
  name: 'control',
  application: {
    className: 'jx-html-control',
    elementSelector: null,
    scoped: true,
    aliases: ['jx-control'],
  },
  base: {
    'box-sizing': 'border-box',
    display: 'block',
    width: '100%',
    'min-height': 'var(--jx-hit, 2.5rem)',
    padding: 'var(--jx-gap, 0.5rem) var(--jx-inset, 0.75rem)',
    border: '1px solid var(--border)',
    'border-radius': '0',
    background: 'var(--background)',
    color: 'var(--foreground)',
    'font-size': 'var(--jx-text, 0.875rem)',
    'color-scheme': 'light',
    transition: 'box-shadow 150ms ease-out',
  },
  pseudos: {
    placeholder: {
      declarations: {
        color: 'var(--jx-placeholder, color-mix(in oklab, var(--foreground) 40%, var(--background)))',
        opacity: '1',
      },
    },
  },
  states: [
    {
      selector: ':hover',
      declarations: { 'box-shadow': 'var(--shadow-2xs)' },
    },
    {
      selector: ':focus-visible',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '-1px',
      },
    },
    {
      selector: ':disabled',
      declarations: {
        opacity: '0.5',
        cursor: 'not-allowed',
      },
    },
    {
      selector: "[aria-invalid='true']",
      declarations: {
        'border-style': 'dashed',
        'border-color': 'var(--error)',
        color: 'var(--error)',
      },
    },
    {
      selector: "[aria-invalid='false']",
      declarations: { 'border-color': 'var(--primary)' },
    },
  ],
  media: [
    {
      query: '(prefers-reduced-motion: reduce)',
      rules: [{ selector: '', declarations: { transition: 'none' } }],
    },
  ],
};
