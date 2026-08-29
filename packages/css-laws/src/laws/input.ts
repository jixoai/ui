/**
 * The input law — the text-like control box (B4's 13-type allowlist
 * payload; the number lane keeps the PLATFORM stepper by sharing
 * this law). Ported byte-faithful from jixoai.css @utility jx-html-input
 * (native-contract-fusion V2, 2026-08-27) — the declarations are the
 * single source now; the @utility is retired at cutover.
 */
import type { ComponentLaw } from '../types';

export const inputLaw: ComponentLaw = {
  name: 'input',
  application: {
    className: 'jx-html-input',
    /* the :where(:not(...)) opt-out wrapper is LOAD-BEARING: a bare
     * :not(.no-jx-pure, .no-jx-pure *) contributes its argument's
     * specificity (0,1,0), pushing the element default to (0,1,1) —
     * above every component class, so element paint (padding-block,
     * border) leaked onto chromeless lanes under the .jx-pure face
     * (the 36px hidden floor, 2026-08-29). Keep the element default
     * at type specificity; component classes MUST outrank it. */
    elementSelector:
      "input:where(:not([type]), [type='text'], [type='password'], [type='email'], [type='url'], [type='tel'], [type='search'], [type='date'], [type='time'], [type='datetime-local'], [type='month'], [type='week'], [type='number']):where(:not(.no-jx-pure, .no-jx-pure *))",
    scoped: true,
  },
  base: {
    'corner-shape': 'var(--corner-shape, bevel)',
    'box-sizing': 'border-box',
    display: 'block',
    width: '100%',
    'max-width': '100%',
    'min-height': 'var(--jx-hit, 2.5rem)',
    'padding-block': 'var(--jx-gap, 0.5rem)',
    'padding-inline': '0.6em',
    border: '1px solid var(--border)',
    'border-radius': '0',
    background: 'var(--background)',
    color: 'var(--foreground)',
    font: 'inherit',
    'font-size': 'var(--jx-text, 0.875rem)',
    'line-height': 'var(--jx-leading, 1.45)',
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
      selector: ':hover:not(:disabled)',
      declarations: { 'box-shadow': 'var(--shadow-2xs)' },
    },
    {
      selector: ':focus-visible',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '-1px',
        'box-shadow': 'none',
      },
    },
    {
      selector: ':disabled',
      declarations: {
        opacity: '0.5',
        cursor: 'not-allowed',
        'box-shadow': 'none',
      },
    },
    {
      selector: "[aria-invalid='true']",
      declarations: { 'border-style': 'dashed' },
    },
    /* date/time/month/week picker indicator (Chromium only — Firefox
       degrades to its own indicator). SIZE: proportional via em — the
       input's font-size tracks density (--jx-text) */
    {
      selector: '::-webkit-calendar-picker-indicator',
      declarations: {
        '-webkit-appearance': 'none',
        appearance: 'none',
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
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
    /* inline-start icons for email/search — same law as the lane */
    {
      selector: "[type='email']",
      declarations: {
        'padding-inline': 'calc(0.6em + 1.4em + var(--jx-gap, 0.5rem)) 0.6em',
        'background-image':
          "var(--jx-icon-mail, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='16' x='2' y='4' rx='2'/%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/%3E%3C/svg%3E\"))",
        'background-position': 'left 0.6em center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='search']",
      declarations: {
        'padding-inline': 'calc(0.6em + 1.4em + var(--jx-gap, 0.5rem)) 0.6em',
        'background-image':
          "var(--jx-icon-search, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.3-4.3'/%3E%3C/svg%3E\"))",
        'background-position': 'left 0.6em center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    /* the UA cancel ornament repaints as the input-suffix-icon
       standard (the clear glyph's lucide X through the icon slot) —
       Chromium/WebKit pseudo; Firefox renders no cancel ornament */
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
