/**
 * The tgroup law — a SUBTREE law: the joined segment row over bare
 * label>input+span children (the .jx-tgroup law). The group element
 * owns the law; the child labels carry the seam geometry. Ported
 * byte-faithful from jixoai.css @utility jx-html-tgroup — the
 * declarations are the single source now; the @utility retires at
 * cutover.
 */
import type { ComponentLaw } from '../types';

export const tgroupLaw: ComponentLaw = {
  name: 'tgroup',
  application: {
    className: 'jx-html-tgroup',
    elementSelector: null,
    scoped: true,
    aliases: ['jx-tgroup'],
  },
  base: {
    'corner-shape': 'var(--corner-shape, bevel)',
    display: 'inline-flex',
    width: 'fit-content',
    'flex-wrap': 'wrap',
    /* clip children to the container's radius — active segment bg bleeds otherwise */
    overflow: 'hidden',
    'border-radius': 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    'box-shadow': 'var(--shadow-2xs)',
  },
  subtrees: [
    {
      selector: '> label',
      declarations: {
        display: 'inline-flex',
        'align-items': 'center',
        'min-block-size': 'var(--jx-hit, 2.5rem)',
        'padding-block': 'calc((var(--jx-hit, 2.5rem) - var(--jx-line, 1.25rem)) / 2)',
        'padding-inline': 'var(--jx-inset, 0.75rem)',
        'font-family': 'var(--font-nav)',
        'font-size': 'var(--jx-text, 0.8125rem)',
        'line-height': 'var(--jx-line, 1.25rem)',
        'text-transform': 'uppercase',
        'letter-spacing': '0.1em',
        color: 'var(--muted-foreground)',
        'background-color': 'transparent',
        'border-inline-end': '1px solid var(--border)',
        cursor: 'pointer',
        'user-select': 'none',
        transition: 'color 150ms ease-out, background-color 150ms ease-out',
      },
      states: [
        {
          selector: ':last-child',
          declarations: { 'border-inline-end': '0' },
        },
        {
          selector: ':not(:has(input:disabled)):hover',
          declarations: { color: 'var(--foreground)' },
        },
        {
          selector: ':has(input:checked)',
          declarations: {
            'background-color': 'var(--primary)',
            color: 'var(--primary-foreground)',
          },
        },
        {
          selector: ':has(input:checked):not(:has(input:disabled)):hover',
          declarations: { color: 'var(--primary-foreground)' },
        },
        {
          selector: ':has(input:focus-visible)',
          declarations: {
            outline: '1px solid var(--ring)',
            'outline-offset': '-1px',
          },
        },
        {
          selector: ':has(input:disabled)',
          declarations: {
            cursor: 'not-allowed',
            opacity: '0.45',
          },
        },
      ],
    },
    {
      selector: '> label > input',
      declarations: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: '0',
        border: '0',
        overflow: 'hidden',
        'clip-path': 'inset(50%)',
        'white-space': 'nowrap',
      },
    },
  ],
  media: [
    {
      query: '(prefers-reduced-motion: reduce)',
      rules: [{ selector: ' > label', declarations: { transition: 'none' } }],
    },
  ],
  /* The chrome axis — BARE rung (grindstone #17-3, 2026-09-13): an
     integrated field row owns the frame, so its in-row segment group
     dissolves the box (the borderless-chrome law — no box-in-a-box).
     The affordance carries itself: ghost cells, muted hover wash, the
     checked primary fill (the shared rules above). This rung absorbs
     the canvas-authored .jx-canvas-seg idiom as the standard layer,
     including its r2 lesson: cells flex-grow so a wrapped line fills
     its remainder edge to edge (without growth, the folded line's
     empty tail reads as a slab). The FRAMED path above is untouched —
     a rung only ever adds. */
  rungs: [
    {
      gate: "[data-chrome='bare']",
      base: {
        border: '0',
        background: 'transparent',
        'box-shadow': 'none',
        'border-radius': '0',
        overflow: 'visible',
      },
      subtrees: [
        {
          selector: '> label',
          declarations: {
            'border-inline-end': '0',
            flex: '1 1 auto',
            'justify-content': 'center',
          },
          states: [
            {
              selector: ':not(:has(input:disabled)):hover',
              declarations: {
                color: 'var(--foreground)',
                'background-color': 'color-mix(in oklab, var(--muted) 55%, transparent)',
              },
            },
          ],
        },
      ],
    },
  ],
};
