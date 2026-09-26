/**
 * The radio law — icon-sized circle, the ::after scale dot (B5).
 * Composed over checkboxLaw: the ::before clip-path glyph retires to
 * content: none; the ::after dot scales in on :checked. SINGLE
 * DECLARATION SOURCE: this file. Never edit the generated CSS.
 */
import { composeLaw, type ComponentLaw } from '../types';
import { checkboxLaw } from './checkbox';

export const radioLaw: ComponentLaw = composeLaw(checkboxLaw, {
  name: 'radio',
  application: {
    className: 'jx-html-radio',
    elementSelector: "input:where([type='radio']:not(.no-jx-pure, .no-jx-pure *))",
    scoped: true,
  },
  base: {
    'border-radius': '50%',
    transition: 'border-color 150ms ease-out',
  },
  /* the checkbox tri-state does not compose: per the HTML spec a radio
     matches :indeterminate whenever NO member of its name-group is
     checked — a RESTING group, not a selection state. Inheriting
     checkbox's indeterminate branches would paint every all-unchecked
     group as a solid brand blob (the task-94 finding, originally
     fixed in the sheet; held at THIS source since the regen would
     resurrect a sheet-side edit — the generated-sheet law). */
  omitStateSelectors: [':indeterminate'],
  omitPseudoStates: { before: ['indeterminate'] },
  pseudos: {
    /* the checkbox glyph is retired — content: none wins over the
       composed ::before build, exactly like the @apply cascade did */
    before: {
      declarations: { content: 'none' },
    },
    after: {
      declarations: {
        content: "''",
        position: 'absolute',
        inset: '2px',
        display: 'block',
        'box-sizing': 'border-box',
        'corner-shape': 'var(--corner-shape, bevel)',
        'border-radius': '50%',
        background: 'var(--primary)',
        transform: 'scale(0)',
        transition: 'transform 150ms ease-out',
      },
      states: {
        checked: {
          transform: 'scale(1)',
        },
      },
    },
  },
  /* the radio keeps the hole (background) on :checked — the dot carries
     the primary color, unlike the checkbox's filled box */
  states: [
    {
      selector: ':checked',
      declarations: { background: 'var(--background)' },
    },
  ],
});
