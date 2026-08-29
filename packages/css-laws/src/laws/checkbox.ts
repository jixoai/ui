/**
 * The checkbox law — icon-sized box, the ::before clip-path glyph with
 * the checked/indeterminate morphs (B5). Ported byte-faithful from
 * jixoai.css @utility jx-html-checkbox.
 *
 * SINGLE DECLARATION SOURCE: this file. Never edit the generated CSS.
 */
import type { ComponentLaw } from '../types';

export const checkboxLaw: ComponentLaw = {
  name: 'checkbox',
  application: {
    className: 'jx-html-checkbox',
    elementSelector: "input:where([type='checkbox']:not([role='switch']):not(.no-jx-pure, .no-jx-pure *))",
    scoped: true,
  },
  base: {
    appearance: 'none',
    '-webkit-appearance': 'none',
    position: 'relative',
    'box-sizing': 'border-box',
    'corner-shape': 'var(--corner-shape, bevel)',
    width: 'var(--jx-icon, 1.25rem)',
    height: 'var(--jx-icon, 1.25rem)',
    margin: '0',
    flex: 'none',
    border: '1px solid var(--border)',
    'border-radius': '0',
    background: 'var(--background)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
  },
  pseudos: {
    before: {
      declarations: {
        content: "''",
        position: 'absolute',
        inset: '2px',
        display: 'block',
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
        background: 'var(--primary-foreground)',
        opacity: '0',
        transform: 'rotate(45deg)',
        'clip-path': 'polygon(20% 100%, 20% 80%, 50% 80%, 50% 80%, 70% 80%, 70% 100%)',
        transition: 'clip-path 150ms ease-out, opacity 150ms ease-out, transform 150ms ease-out',
      },
      states: {
        checked: {
          opacity: '1',
          'clip-path': 'polygon(20% 100%, 20% 80%, 50% 80%, 50% 0%, 70% 0%, 70% 100%)',
        },
        indeterminate: {
          opacity: '1',
          transform: 'rotate(0deg)',
          'clip-path': 'polygon(10% 40%, 10% 60%, 45% 60%, 55% 60%, 90% 60%, 90% 40%)',
        },
      },
    },
  },
  states: [
    {
      selector: ':hover:not(:checked):not(:disabled)',
      declarations: { 'border-color': 'var(--primary)' },
    },
    {
      selector: ':checked, :indeterminate',
      declarations: {
        background: 'var(--primary)',
        'border-color': 'var(--primary)',
      },
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
      declarations: { opacity: '0.5', cursor: 'not-allowed' },
    },
    {
      selector: "[aria-invalid='true']",
      declarations: { 'border-style': 'dashed' },
    },
  ],
  media: [
    {
      query: '(prefers-reduced-motion: reduce)',
      rules: [
        { selector: '', declarations: { transition: 'none' } },
        { selector: '::before', declarations: { transition: 'none' } },
      ],
    },
  ],
};
