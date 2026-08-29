/**
 * The select law — the closed control: the input law + the pointer
 * cursor + the chevron icon slot (the @supports gate keeps Firefox on
 * its platform arrow) + the listbox posture for [multiple]/[size]
 * (B4's select). Composed over inputLaw. SINGLE DECLARATION SOURCE:
 * this file. Never edit the generated CSS.
 */
import { composeLaw, type ComponentLaw } from '../types';
import { inputLaw } from './input';

export const selectLaw: ComponentLaw = composeLaw(inputLaw, {
  name: 'select',
  application: {
    className: 'jx-html-select',
    elementSelector: [
      'select:where(:not(.no-jx-pure, .no-jx-pure *))',
      'select:where([multiple], [size]):where(:not(.no-jx-pure, .no-jx-pure *))',
    ],
    scoped: true,
  },
  /* corner-shape precedes the @apply in the source; composeLaw lets the
     delta win and the value is identical — idempotent merge */
  base: {
    'corner-shape': 'var(--corner-shape, bevel)',
    cursor: 'pointer',
    'padding-inline-end': 'calc(var(--jx-inset, 0.75rem) + var(--jx-icon, 1.25rem))',
  },
  /* the chevron = an ICON SLOT (not CSS gradients — those misaligned);
     the SVG chevron-down paints as a mask (currentColor themes) */
  customProperties: {
    '--jx-icon-chevron-svg':
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  },
  /* the engine gate — browsers without ::-moz-range-progress (WebKit,
     Chromium) flatten the appearance and paint the chevron */
  supports: [
    {
      condition: 'not selector(::-moz-range-progress)',
      declarations: {
        appearance: 'none',
        '-webkit-appearance': 'none',
        'background-image': 'var(--jx-icon-chevron, var(--jx-icon-chevron-svg))',
        'background-position': 'right var(--jx-inset, 0.75rem) center',
        'background-size': 'var(--jx-icon, 1.25rem)',
        'background-repeat': 'no-repeat',
      },
      states: [
        {
          selector: ':hover:not(:disabled)',
          /* the hover lean: a CSS filter on the background (the mask
             technique keeps currentColor theming impossible on
             bg-image, so the hover paints a primary-tinted duplicate) */
          declarations: { filter: 'none' },
        },
      ],
    },
  ],
  /* the listbox posture for [multiple]/[size] — MUST emit AFTER the
   * @supports chevron gate (order 600 > supports 500): equal
   * specificity, source order decides, and background-image: none
   * has to win the listbox (Codex r2 P0 regression) */
  states: [
    {
      selector: ':where([multiple], [size])',
      order: 600,
      declarations: {
        'min-height': '5.75rem',
        'padding-block': '0.375rem 0.5rem',
        cursor: 'default',
        'background-image': 'none',
      },
    },
  ],
});
