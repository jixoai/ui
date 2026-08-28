/**
 * The clear law — component-level (the input's × glyph); in the
 * STANDARD LAYER so components don't need the full face. Ported
 * byte-faithful from jixoai.css @utility jx-html-clear — the
 * declarations are the single source now; the @utility retires at
 * cutover.
 */
import type { ComponentLaw } from '../types';

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
        '-webkit-mask':
          "var(--jx-icon-clear, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E\")) center / contain no-repeat",
        mask:
          "var(--jx-icon-clear, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E\")) center / contain no-repeat",
      },
    },
  ],
};
