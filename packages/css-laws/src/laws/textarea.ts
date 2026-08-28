/**
 * The textarea law — the multiline lane: the input law + the textarea
 * min + vertical resize (B4's textarea clause). Composed over inputLaw
 * (the @apply chain retired into TS). SINGLE DECLARATION SOURCE: this
 * file. Never edit the generated CSS.
 */
import { composeLaw, type ComponentLaw } from '../types';
import { inputLaw } from './input';

export const textareaLaw: ComponentLaw = composeLaw(inputLaw, {
  name: 'textarea',
  application: {
    className: 'jx-html-textarea',
    elementSelector: 'textarea:not(.no-jx-pure, .no-jx-pure *)',
    scoped: true,
  },
  /* corner-shape precedes the @apply in the source; composeLaw lets the
     delta win and the value is identical — idempotent merge */
  base: {
    'corner-shape': 'var(--corner-shape, bevel)',
    'min-height': 'var(--jx-textarea-min, 5rem)',
    height: 'auto',
    resize: 'vertical',
  },
});
