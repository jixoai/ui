// ghostty-term.stylex.ts — the ghostty-term family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored
// (2026-08-28, batch D design.md D5): the root's terminal ground and
// its focus rings (direct + the :has(:focus-visible) descendant form
// the IME dock needs), the auto-mode fill lane, the canvas's static
// and inset geometries, the IME textarea's sr-only recipe (the
// engine's own bytes: clip-path inset(50%)), and the error face
// (mono 13px over the 1.25 leading, the $ prompt in primary ink).
//
// Law mapping (the tier-2 value rule): the terminal ground rides the
// typed terminal tokens; the fixed 13px error voice rides the
// --jx-text-base kernel channel (the ruler's own T_base —
// density-independent, byte-exact); leading-5 (1.25) rides the
// promoted --leading-tight step; the ±8px/16px measures ride space
// steps. THE WASM CHAIN IS FROZEN LAW (install prerequisite): nothing
// here touches the vt runtime — paint only. The root's display:block
// + hit floor stay lane-2 in ghostty-term.css (data-jx-ghostty-term
// hook); the IME textarea keeps its inline pointer-events style.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// ghostty-term/ and apps/www/src/lib/ui/ghostty-term/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const ghosttyTermStyles = stylex.create({
  // ── the root: the terminal surface and its keyboard focus rings ──
  root: {
    position: 'relative',
    display: 'block',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    outlineStyle: 'none',
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
    // the IME textarea takes over focus from the root — the keyboard
    // ring survives the dock by matching on the focused DESCENDANT
    ':has(:focus-visible)': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },
  // auto mode FILLS its host; explicit cols/rows keep the intrinsic grid
  fill: { height: '100%' },
  // selection owns the pointer — native text selection stays off
  selectNone: { userSelect: 'none' },

  // ── the canvas: static block, absolutely inset in auto mode ──
  canvas: { display: 'block' },
  canvasInset: { position: 'absolute', inset: 0 },

  // ── the IME composition surface: the engine's sr-only recipe ──
  sr: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 'calc(var(--jx-hairline) * -1)',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },

  // ── the error face (no children): the in-place diagnostic ──
  error: {
    padding: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: tokens['--jx-leading-tight'],
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  errorPrompt: {
    color: tokens['--jx-primary'],
    marginInlineEnd: tokens['--jx-space-8'],
  },
});
