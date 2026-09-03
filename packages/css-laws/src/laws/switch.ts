/**
 * The switch law — ONE input[role=switch]: the pill track with the
 * ::before knob riding absolute + inset + transform travel (B13,
 * density aliases; the inset ring keeps the knob's full padding).
 * Ported byte-faithful from jixoai.css @utility jx-html-switch —
 * a standalone law, no composition. SINGLE DECLARATION SOURCE: this
 * file. Never edit the generated CSS.
 *
 * Knob stroke (2026-09-03, Owner tweak parameterized): the knob
 * carries a border sized by --jx-toggle-knob-border (default 1px)
 * and painted --jx-toggle-knob-border-color (default var(--primary)).
 * Border-box sizing eats the stroke from the knob's own box, so the
 * geometry DERIVES from the same token — box grows +2×border, inset
 * and the content-ring padding each give back −1×border — keeping
 * the outer footprint identical to the strokeless knob at any token
 * value (0px retires the stroke with no dead arithmetic).
 */
import type { ComponentLaw } from '../types';

export const switchLaw: ComponentLaw = {
  name: 'switch',
  application: {
    className: 'jx-html-switch',
    elementSelector: "input:where([type='checkbox'][role='switch']:not(.no-jx-pure, .no-jx-pure *))",
    scoped: true,
  },
  base: {
    appearance: 'none',
    '-webkit-appearance': 'none',
    'box-sizing': 'border-box',
    'corner-shape': 'var(--corner-shape, bevel)',
    position: 'relative',
    width: 'var(--jx-toggle-width, 2.5rem)',
    height: 'var(--jx-toggle-track, 1.5rem)',
    margin: '0',
    flex: 'none',
    padding:
      'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - var(--jx-toggle-knob-border, 1px))',
    border: '0',
    'box-shadow': '0 0 0 1px var(--border) inset',
    'border-radius': 'calc(infinity * 1px)',
    background: 'var(--muted)',
    cursor: 'pointer',
    transition:
      'background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 200ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  pseudos: {
    /* the knob rides absolute + inset + transform travel — inset from
       the track's own geometry tokens, so density scales everything;
       the stroke token drives the box math (see the header law) */
    before: {
      declarations: {
        content: "''",
        position: 'absolute',
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
        'inset-block':
          'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - var(--jx-toggle-knob-border, 1px))',
        'inset-inline-start':
          'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - var(--jx-toggle-knob-border, 1px))',
        'inline-size': 'calc(var(--jx-toggle-knob, 1rem) + 2 * var(--jx-toggle-knob-border, 1px))',
        'block-size': 'calc(var(--jx-toggle-knob, 1rem) + 2 * var(--jx-toggle-knob-border, 1px))',
        'border-radius': 'calc(infinity * 1px)',
        border: 'var(--jx-toggle-knob-border, 1px) solid var(--jx-toggle-knob-border-color, var(--primary))',
        background: 'var(--background)',
        transform: 'translateX(0)',
        transition:
          'transform 200ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      states: {
        checked: {
          transform:
            'translateX(calc(var(--jx-toggle-width, 2.5rem) - var(--jx-toggle-track, 1.5rem)))',
          background: 'var(--primary-foreground)',
        },
      },
    },
  },
  states: [
    {
      selector: ':hover:not(:checked):not(:disabled)',
      declarations: { 'box-shadow': '0 0 0 1px var(--primary) inset' },
    },
    {
      selector: ':checked',
      declarations: { background: 'var(--primary)' },
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
