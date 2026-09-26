// combobox.stylex.ts — the combobox family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the wrap and
// the input shell (min-height lane, 12px inline insets, the
// box-shadow transition with its light/dark scheme swap), the
// multiple-mode chips (muted fill, hairline border, 12px voice, the
// × affordance), the clear/chevron controls, the panel scroller
// (60vh cap + the scrollbar-gutter seam), the listbox reset, and the
// option rows (72% ink, active/selected terminal grounds, the 2px
// selected edge on border-inline-start).
//
// Value law: theme-able slots ride tokens or var() seams — 13px rows
// and 11px/12px labels ride the --jx-text-base / --text-label /
// --text-label-lg kernel channels and steps; the 100/150ms motion, ease-out, and
// the 1/1.4/1.45 leadings have no sheet steps yet (promotion seams,
// reported); the 2px selected edge rides the ruler equation
// calc(var(--jx-unit) * 0.5); the scroll-gutter inset keeps the
// utility's exact max() form (a var-compensated structural seam);
// min-heights/widths (2.5rem lane, 1.25/1.5rem glyphs, 6rem lane
// floor) are structural geometry. The .jx-field scaffold, the anchor
// panel residue (@supports + ::backdrop), the shell's :has() hover/
// focus/disabled machines, row hovers, and the reduced-motion kill
// stay in combobox.css / jx-pure Part A.
//
// Mirror law: byte-identical in registry/files/ui/combobox/ and
// apps/www/src/lib/ui/combobox/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const cbxStyles = stylex.create({
  // ── the faceless form bridge box (never a flash gap) ──
  bridge: { display: 'contents' },

  // ── the wrap (anchor host) ──
  wrap: {
    position: 'relative',
    display: 'block',
    width: '100%',
    maxWidth: '100%',
  },

  // ── the shell (the box law's owner; hover/focus/:has() machines
  //    ride combobox.css over the jx-combobox-shell hook) ──
  shell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    width: '100%',
    maxWidth: '100%',
    minHeight: '2.5rem',
    paddingInline: 'var(--space-12)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    colorScheme: 'light',
    transitionProperty: 'box-shadow',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
    '@media (prefers-color-scheme: dark)': {
      colorScheme: 'dark',
    },
  },
  shellWrap: { flexWrap: 'wrap' },
  shellInvalid: { borderStyle: 'dashed' },

  // ── the multiple-mode trigger chips ──
  chip: {
    display: 'inline-flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'var(--space-4)',
    paddingInlineStart: 'var(--space-8)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    color: tokens['--jx-foreground'],
    fontSize: 'var(--text-label-lg)',
    lineHeight: 'var(--leading-none, 1)',
    height: '1.5rem',
  },
  chipLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chipRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '1.5rem',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: tokens['--jx-muted-foreground'],
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionDuration: 'var(--motion-100, 100ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
    ':hover': { color: tokens['--jx-foreground'] },
    ':disabled': { cursor: 'not-allowed' },
  },

  // ── the input lane (jx-html-control-lane owns the form-lane paint;
  //    p-0 is the UA input padding reset the lane rule lacks) ──
  lane: { padding: 0 },
  laneMultiple: {
    flex: '1 1 6rem',
    minWidth: '6rem',
  },

  // ── the clear × and the chevron toggle ──
  clearBtn: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens['--jx-muted-foreground'],
    cursor: 'pointer',
    transitionProperty:
      'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionDuration: 'var(--motion-100, 100ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
    ':hover': { color: tokens['--jx-foreground'] },
    ':disabled': { cursor: 'not-allowed' },
  },
  toggleBtn: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens['--jx-muted-foreground'],
    cursor: 'pointer',
    ':disabled': { cursor: 'not-allowed' },
  },
  chevron: {
    width: '0.75rem',
    height: '0.75rem',
    pointerEvents: 'none',
    transitionProperty: 'transform',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  chevronOpen: { rotate: '180deg' },

  // ── the panel scroller ──
  scroll: {
    maxHeight: '60vh',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: 'var(--space-4)',
    paddingInline: 'max(4px - var(--jx-scrollbar-thin, 0px), 0px)',
  },

  // ── the listbox reset ──
  list: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },

  // ── the option rows ──
  option: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--jx-unit) * 0.5)',
    paddingInline: 'var(--space-10)',
    paddingBlock: 'var(--space-6)',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-145, 1.45)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    cursor: 'pointer',
    borderInlineStartWidth: 'calc(var(--jx-unit) * 0.5)',
    borderStyle: 'solid',
    borderInlineStartColor: 'transparent',
    transitionProperty: 'background-color, color',
    transitionDuration: 'var(--motion-100, 100ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  optionActive: {
    backgroundColor: tokens['--jx-terminal-hover'],
    color: tokens['--jx-terminal-foreground'],
  },
  optionSelected: {
    backgroundColor: tokens['--jx-terminal-hover'],
    color: tokens['--jx-terminal-foreground'],
    borderInlineStartColor: tokens['--jx-primary'],
  },
  optionDisabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  optionLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  optionDesc: {
    fontSize: 'var(--text-label)',
    lineHeight: 'var(--leading-14, 1.4)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },
  optionUse: {
    color: tokens['--jx-primary'],
  },
  empty: {
    margin: 0,
    paddingInline: 'var(--space-10)',
    paddingBlock: 'var(--space-6)',
    fontSize: 'var(--jx-text-base)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },
});
