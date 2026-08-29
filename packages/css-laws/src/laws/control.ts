/**
 * The control law — the single-box form control: one element owns the
 * border, padding and state (the first of the two control postures).
 * Ported byte-faithful from jixoai.css @utility jx-html-control.
 *
 * 2026-08-29 · Tier-1 parity: the date/time picker indicator and the
 * email/search inline-start icons ride the SAME repaints as the input
 * law (the .jx-control alias is the bare-markup twin of jx-html-input —
 * "the same classes the components consume"). Padding adaptation: the
 * control's own inline inset is --jx-inset (not the input law's 0.6em
 * literal), so the prefix law grows start padding from the token and
 * the icon sits at the token's edge.
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
    /* date/time/month/week picker indicator (Chromium only — Firefox
       degrades to its own indicator); same law as the input/lane */
    {
      selector: '::-webkit-calendar-picker-indicator',
      declarations: {
        '-webkit-appearance': 'none',
        appearance: 'none',
        width: '1.4em',
        height: '1.4em',
        /* the END inset is the control's own padding-inline-end
         * (--jx-inset): ownership symmetry with the prefix law */
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
    /* inline-start icons for email/search — same law as the input/lane,
       sized from the control's own --jx-inset edge */
    {
      selector: "[type='email']",
      declarations: {
        'padding-inline-start': 'calc(var(--jx-inset, 0.75rem) + 1.4em + var(--jx-gap, 0.5rem))',
        'background-image':
          "var(--jx-icon-mail, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='16' x='2' y='4' rx='2'/%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/%3E%3C/svg%3E\"))",
        'background-position': 'left var(--jx-inset, 0.75rem) center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='search']",
      declarations: {
        'padding-inline-start': 'calc(var(--jx-inset, 0.75rem) + 1.4em + var(--jx-gap, 0.5rem))',
        'background-image':
          "var(--jx-icon-search, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E\"))",
        'background-position': 'left var(--jx-inset, 0.75rem) center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    /* the UA cancel ornament repaints as the input-suffix-icon
       standard (the clear glyph's lucide X through the icon slot) */
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
  media: [
    {
      query: '(prefers-reduced-motion: reduce)',
      rules: [{ selector: '', declarations: { transition: 'none' } }],
    },
  ],
};
