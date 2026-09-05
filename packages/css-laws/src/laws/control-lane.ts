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
import { iconSlot } from '../icon-uris';

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
    /* the shell owns the box law — the lane must stay chromeless even
     * under the .jx-pure face, where the bare-element defaults are
     * live on the same <input> and would otherwise leak their
     * padding-block onto the lane (a hidden floor above --jx-hit;
     * 2026-08-29 Owner catch on the hit-floor prototype) */
    padding: '0',
    outline: 'none',
    background: 'transparent',
    color: 'var(--foreground)',
    /* the well's focus ink (elevation grammar, 2026-09-01): the caret
     * answers focus in the ring hue — the shell's border tints in kind */
    'caret-color': 'var(--primary)',
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
         * here — it would stack inset + gap (a double inset) against the
         * start inset. margin-inline-start stays: it is the value↔icon
         * separation, the icon's own geometry, not a box inset */
        'margin-inline-start': 'var(--jx-gap, 0.5rem)',
        cursor: 'pointer',
        'background-image': iconSlot('calendar'),
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='time']::-webkit-calendar-picker-indicator",
      declarations: {
        'background-image': iconSlot('clock'),
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
        'background-image': iconSlot('mail'),
        'background-position': 'left 0 center',
        'background-size': '1.4em',
        'background-repeat': 'no-repeat',
      },
    },
    {
      selector: "[type='search']",
      declarations: {
        'padding-inline-start': 'calc(1.4em + var(--jx-gap, 0.5rem))',
        'background-image': iconSlot('search'),
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
        'background-image': iconSlot('clear'),
        'background-size': 'contain',
        'background-repeat': 'no-repeat',
      },
    },
  ],
};
