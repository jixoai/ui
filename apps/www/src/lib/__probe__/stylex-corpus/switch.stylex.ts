// switch.stylex.ts — the corpus dogfood, switch family (stylex-kernel
// phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/switch/switch.stylex.ts) — the jx-html-switch law: ONE
// input[role=switch], the ::before IS the knob, transform travel
// translateX(width − track); the whole state machine
// (:hover:not(:checked):not(:disabled), :checked, :focus-visible,
// :disabled, :checked::before, reduced-motion) is StyleX-expressible
// and rides verbatim. Geometry rides the density channels
// (--jx-toggle-track/width/knob) — ambient scope, plain var()
// strings (§4.2).
//
// Law mapping: theme refs (track/knob grounds, ring, label ink) ride
// the typed token layer; composite values (the inset ring shadow)
// name the --jx-* member literally.
//
// Divergences vs the spike artifact (receipted): typed var
// indirection only.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const switchStyles = stylex.create({
  // the visible label (jx-label intent: density-scaled, secondary tone)
  label: {
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-foreground'],
  },
  track: {
    appearance: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
    position: 'relative',
    width: 'var(--jx-toggle-width, 2.5rem)',
    height: 'var(--jx-toggle-track, 1.5rem)',
    margin: 0,
    flex: 'none',
    padding:
      'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - 1px)',
    borderWidth: 0,
    borderStyle: 'none',
    boxShadow: '0 0 0 1px var(--jx-border) inset',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: tokens['--jx-muted'],
    cursor: 'pointer',
    transition: `background-color 200ms ${EASE}, box-shadow 200ms ${EASE}`,
    ':hover:not(:checked):not(:disabled)': {
      boxShadow: '0 0 0 1px var(--jx-primary) inset',
    },
    ':checked': {
      backgroundColor: tokens['--jx-primary'],
    },
    ':focus-visible': {
      outline: '1px solid var(--jx-ring)',
      outlineOffset: '-1px',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  // the knob — ::before; travel = width − track on the inline axis
  knob: {
    '::before': {
      content: "''",
      position: 'absolute',
      boxSizing: 'border-box',
      insetBlock:
        'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - 1px)',
      insetInlineStart:
        'calc((var(--jx-toggle-track, 1.5rem) - var(--jx-toggle-knob, 1rem)) / 2 - 1px)',
      inlineSize: 'calc(var(--jx-toggle-knob, 1rem) + 2px)',
      blockSize: 'calc(var(--jx-toggle-knob, 1rem) + 2px)',
      borderRadius: 'calc(infinity * 1px)',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: tokens['--jx-primary'],
      backgroundColor: tokens['--jx-background'],
      transform: 'translateX(0)',
      transition: `transform 200ms ${EASE}, background-color 200ms ${EASE}, border-color 200ms ${EASE}`,
    },
    ':checked::before': {
      // NOTE (D5 finding, kept from the spike): a `vars` key inside
      // stylex.create throws "Invalid pseudo or at-rule" on 0.19.0 —
      // the travel var inlines into the value (the source's own form).
      transform:
        'translateX(calc(var(--jx-toggle-width, 2.5rem) - var(--jx-toggle-track, 1.5rem)))',
      backgroundColor: tokens['--jx-primary-foreground'],
    },
    // reduced-motion: the transitions die (the r8 freeze law)
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '::before': {
        transition: 'none',
      },
    },
  },
});
