// command.stylex.ts — the command family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): the palette shell, the combobox lane, the
// listbox scrollport, the empty line, the group heading and the
// option body became static longhand atoms; density rides the ruler's
// kernel channels as PLAIN var() strings (--jx-hit/--jx-inset/
// --jx-gap/--jx-stack/--jx-text/--jx-line/--jx-text-secondary).
//
// Value notes (receipted):
//   - the 1px frames ride --jx-hairline; the palette's 560px/12vh/
//     60vh measures are structural geometry (lawful literals);
//   - py-[0.375rem]/px-[0.375rem] (6px) map to --space-6; the
//     gutter-compensation max() rides the typed step inside the
//     formula;
//   - text-[0.6875rem] (11px) maps to --text-label;
//   - tracking 0.14em/0.1em derive from the wide step (×1.75 / ×1.25)
//     — reported as MISSING steps for serial promotion.
//
// Lane-2 residue (command.css): the ::backdrop scrim, the :has laws,
// the unlayered hidden-attribute restore (pre-existing), and the
// ACTIVE option's inset 2px primary rule (a px-length shadow literal
// — tier-2 red in atoms; keyed on data-jx-command-item-active, the
// blockquote rule-channel precedent).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const commandStyles = stylex.create({
  // ── the palette shell (native <dialog>) ──────────────────────────
  shell: {
    boxSizing: 'border-box',
    marginTop: '12vh',
    marginInline: 'auto',
    marginBottom: 'auto',
    width: 'min(560px, calc(100vw - 2rem))',
    maxHeight: 'min(60vh, 30rem)',
    borderRadius: tokens['--jx-radius'],
    padding: 0,
    color: tokens['--jx-popover-foreground'],
  },
  frame: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'inherit',
  },
  // ── the combobox lane ────────────────────────────────────────────
  input: {
    boxSizing: 'border-box',
    minHeight: 'var(--jx-hit)',
    width: '100%',
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-foreground'],
    '::placeholder': {
      color: tokens['--jx-muted-foreground'],
    },
    ':focus': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'transparent',
      outlineOffset: '2px',
    },
  },
  // ── the listbox scrollport ───────────────────────────────────────
  list: {
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: tokens['--jx-space-6'],
    paddingInline: 'max(var(--space-6) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
  // ── the empty line (role=status) ─────────────────────────────────
  empty: {
    minHeight: 'var(--jx-hit)',
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-stack)',
    textAlign: 'center',
    fontSize: 'var(--jx-text)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the group heading (micro-label, aria-hidden) ─────────────────
  groupHeading: {
    marginTop: 'var(--jx-stack)',
    marginBottom: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: 'calc(var(--track-wide) * 1.75)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the option body + its JS-known states ────────────────────────
  item: {
    display: 'flex',
    minHeight: 'var(--jx-hit)',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-foreground'],
  },
  itemActive: {
    cursor: 'pointer',
    backgroundColor: tokens['--jx-muted'],
  },
  itemIdle: {
    cursor: 'pointer',
  },
  itemDisabled: {
    cursor: 'not-allowed',
    opacity: 0.45,
  },
  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hint: {
    flex: 'none',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: 'calc(var(--track-wide) * 1.25)',
    color: tokens['--jx-muted-foreground'],
  },
});
