/**
 * The clear law — component-level (the input's × glyph); in the
 * STANDARD LAYER so components don't need the full face. Ported
 * byte-faithful from jixoai.css @utility jx-html-clear — the
 * declarations are the single source now; the @utility retires at
 * cutover.
 */
import type { ComponentLaw } from '../types';
import { iconSlot } from '../icon-uris';

export const clearLaw: ComponentLaw = {
  name: 'clear',
  application: {
    className: 'jx-html-clear',
    elementSelector: null,
    scoped: true,
  },
  base: {
    flex: 'none',
    display: 'inline-flex',
    'align-items': 'center',
    'justify-content': 'center',
    'min-width': 'var(--jx-hit, 2.5rem)',
    'min-height': 'var(--jx-hit, 2.5rem)',
    padding: '0',
    border: '0',
    background: 'transparent',
    'font-size': 'var(--jx-text, 0.875rem)',
    'line-height': 'var(--jx-leading, 1.45)',
    cursor: 'pointer',
  },
  states: [
    {
      selector: ':hover',
      declarations: { color: 'var(--foreground)' },
    },
    {
      selector: ':focus-visible',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '-1px',
      },
    },
  ],
  subtrees: [
    {
      /* the glyph — an ICON SLOT (mask, currentColor themes) */
      selector: '.jx-clear-glyph',
      declarations: {
        display: 'block',
        width: '10px',
        height: '10px',
        'background-color': 'currentColor',
        '-webkit-mask': `${iconSlot('clear')} center / contain no-repeat`,
        mask: `${iconSlot('clear')} center / contain no-repeat`,
      },
    },
  ],
};
