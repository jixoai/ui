/**
 * The control-lane law — the slotted input inside a control-shell:
 * borderless and transparent, inherits the shell's geometry, and
 * carries the placeholder, the date/time picker indicator and the
 * email/search inline-start icons (same shapes as the input law).
 * Ported byte-faithful from jixoai.css @utility jx-html-control-lane.
 *
 * SINGLE DECLARATION SOURCE: this file. Never edit the generated CSS.
 */
import type { ComponentLaw } from '../types';

export const controlLaneLaw: ComponentLaw = {
  name: 'control-lane',
  application: {
    className: 'jx-html-control-lane',
    elementSelector: null,
    scoped: true,
    aliases: ['jx-control-lane'],
  },
  base: {
    flex: '1 1 auto',
    'min-height': 'calc(var(--jx-hit, 2.5rem) - 2px)',
    'min-width': '0',
    border: '0',
    outline: 'none',
    background: 'transparent',
    color: 'var(--foreground)',
    font: 'inherit',
    'font-size': 'var(--jx-text, 0.875rem)',
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
    /* date/time indicator — same law as jx-html-input (the lane posture
     * is what the component uses for date/time inputs; em-based sizing
     * scales with the input's own font-size which tracks density) */
    {
      selector: '::-webkit-calendar-picker-indicator',
      declarations: {
        '-webkit-appearance': 'none',
        appearance: 'none',
        width: '1.4em',
        height: '1.4em',
        /* the indicator's END inset is the INPUT's own padding-inline-end
         * (ownership symmetry with the prefix law): no margin-inline-end
         * here — it would stack 0.6em + gap = 19.8px against the 7.8px
         * text start. margin-inline-start stays: it is the value↔icon
         * separation, the icon's own geometry, not a box inset */
        'margin-inline-start': 'var(--jx-gap, 0.5rem)',
        cursor: 'pointer',
        'background-image':
          "var(--jx-icon-calendar, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4'/%3E%3Cpath d='M8 2v4'/%3E%3Cpath d='M3 10h18'/%3E%3C/svg%3E\"))",
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='time']::-webkit-calendar-picker-indicator",
      declarations: {
        'background-image':
          "var(--jx-icon-clock, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpolyline points='12 6 12 12 16 14'/%3E%3C/svg%3E\"))",
      },
    },
    /* inline-start default icons: email = envelope, search = magnifier.
     * background-image positioned at the start edge; padding-inline-start
     * grows to make room (padding + icon + gap). Icon size and padding
     * both ride em — density-tracking, proportional to the input */
    {
      selector: "[type='email']",
      declarations: {
        'padding-inline-start': 'calc(1.4em + var(--jx-gap, 0.5rem))',
        'background-image':
          "var(--jx-icon-mail, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='16' x='2' y='4' rx='2'/%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/%3E%3C/svg%3E\"))",
        'background-position': 'left 0 center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='search']",
      declarations: {
        'padding-inline-start': 'calc(1.4em + var(--jx-gap, 0.5rem))',
        'background-image':
          "var(--jx-icon-search, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E\"))",
        'background-position': 'left 0 center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    /* the UA cancel ornament repaints as the input-suffix-icon
       standard (the clear glyph's lucide X through the icon slot);
       the component's own clearable ✕ kills it (input.css residue) */
    {
      selector: "[type='search']::-webkit-search-cancel-button",
      declarations: {
        '-webkit-appearance': 'none',
        appearance: 'none',
        width: '1.4em',
        height: '1.4em',
        'margin-inline-start': 'var(--jx-gap, 0.5rem)',
        cursor: 'pointer',
        'background-image':
          "var(--jx-icon-clear, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E\"))",
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
      },
    },
  ],
};
