// switch.styles.ts — the jx-html-switch law re-authored in StyleX.
//
// Source intent (registry/files/ui/toggle + jixoai.css:1598-1660): ONE
// input[role=switch], no track/knob spans — the ::before IS the knob;
// transform travel translateX(width − track); inset ring shadow; hover
// ring on unchecked; :checked flips ground to primary + knob to
// primary-foreground; focus-visible outline −1px; disabled 0.5.
// Geometry rides density vars (--jx-toggle-track/width/knob derive
// from --jx-line — the ambient density scope flows by inheritance).
//
// EXPRESSIBILITY: the whole state machine is StyleX-expressible —
// ':checked', ':hover', ':not', ':focus-visible', ':disabled' and
// ':checked::before' chains are all supported pseudo syntaxes on the
// pinned set. The bezier transition strings pass verbatim.
import * as stylex from '@stylexjs/stylex';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const switchStyles = stylex.create({
  // the visible label (jx-label intent: density-scaled, secondary tone)
  label: {
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: 'var(--foreground)',
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
    boxShadow: '0 0 0 1px var(--border) inset',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'var(--muted)',
    cursor: 'pointer',
    transition: `background-color 200ms ${EASE}, box-shadow 200ms ${EASE}`,
    ':hover:not(:checked):not(:disabled)': {
      boxShadow: '0 0 0 1px var(--primary) inset',
    },
    ':checked': {
      backgroundColor: 'var(--primary)',
    },
    ':focus-visible': {
      outline: '1px solid var(--ring)',
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
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--background)',
      transform: 'translateX(0)',
      transition: `transform 200ms ${EASE}, background-color 200ms ${EASE}, border-color 200ms ${EASE}`,
    },
    ':checked::before': {
      // NOTE (D5 finding): a `vars` key inside stylex.create throws
      // "Invalid pseudo or at-rule" on 0.19.0 — the travel var must
      // inline into the value (or ride defineVars). The source's own
      // form (calc in the transform) is used directly.
      transform:
        'translateX(calc(var(--jx-toggle-width, 2.5rem) - var(--jx-toggle-track, 1.5rem)))',
      backgroundColor: 'var(--primary-foreground)',
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
