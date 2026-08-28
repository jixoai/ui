/**
 * The control-shell law — the wrapper posture of the control family:
 * the shell owns the border and inset, slotted children ride the flex
 * row, and the lane's state reaches the shell's border via :has().
 * Ported byte-faithful from jixoai.css @utility jx-html-control-shell.
 *
 * SINGLE DECLARATION SOURCE: this file. Never edit the generated CSS.
 */
import type { ComponentLaw } from '../types';

export const controlShellLaw: ComponentLaw = {
  name: 'control-shell',
  application: {
    className: 'jx-html-control-shell',
    elementSelector: null,
    scoped: true,
    aliases: ['jx-control-shell'],
  },
  base: {
    'box-sizing': 'border-box',
    display: 'flex',
    width: '100%',
    'min-height': 'var(--jx-hit, 2.5rem)',
    gap: 'var(--jx-gap, 0.5rem)',
    /* inline inset — em-based (proportional to font-size → density);
     * ALWAYS present (slotted or not) so text never touches the border */
    'font-size': 'var(--jx-text, 0.875rem)',
    'padding-inline': '0.6em',
    border: '1px solid var(--border)',
    'border-radius': '0',
    background: 'var(--background)',
    transition: 'box-shadow 150ms ease-out',
  },
  states: [
    /* END-INSET OWNERSHIP: the shell's 0.6em end padding is the inset
     * for EVERY slim last child (the lane, suffix spans) — measured
     * regression: suffix text sat 1px off the border under the old
     * "not the lane" drop. The ONLY self-insetting last child is the
     * clear button (.jx-html-clear carries the full --jx-hit lane);
     * for it alone the end padding drops to avoid double-spacing */
    {
      selector: ':has(> .jx-html-clear:last-child)',
      declarations: { 'padding-inline-end': '0' },
    },
    {
      selector: ':hover',
      declarations: { 'box-shadow': 'var(--shadow-2xs)' },
    },
    {
      selector: ':has(:focus-visible)',
      declarations: {
        outline: '1px solid var(--ring)',
        'outline-offset': '-1px',
      },
    },
    {
      selector: ":has([aria-invalid='true']), .jx-invalid",
      declarations: { 'border-style': 'dashed' },
    },
    /* disabled: the shell's border dims so the disabled state is visible
     * on the wrapper (the lane's own opacity is not enough when the
     * border lives on the shell) */
    {
      selector: ':has(:disabled)',
      declarations: {
        'border-color': 'var(--muted)',
        cursor: 'not-allowed',
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
