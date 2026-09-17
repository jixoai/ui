// breadcrumb.stylex.ts — the breadcrumb family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the composition carried
// since 2026-08-25. HOVER/FOCUS paint rides stylex-native pseudo
// conditions inside the atoms (the corpus law — press-button/
// popover/code-card's own form; compiled members carry their state
// classes in the joined string, verified against the pinned engine).
// TRANSITIONS are motion (duration/easing have no tokens — reported):
// they ride breadcrumb.css behind the .jx-bc-link semantic class,
// which rides the CLASS STRING so the link's child({ props })
// replacement-element contract keeps its animation.
//
// The menu item / caret transitions ride dropdown-menu.css already
// (.jx-menu-item / .jx-menu-caret own them — the motion-literals
// lane-2 ruling recorded there); breadcrumb's copies were redundant.
//
// Value receipts: 12px IS --jx-text-label-lg; 0.08em IS --jx-track-wide
// (typed); gap-1.5 IS --jx-space-6.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const breadcrumbStyles = stylex.create({
  // ── the ordered trail ──
  list: {
    margin: 0,
    display: 'flex',
    listStyleType: 'none',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
  },
  // ── the current page: real foreground, never underlined ──
  page: {
    color: tokens['--jx-foreground'],
    textDecoration: 'none',
  },
  // ── the manual gap glyph ──
  ellipsis: {
    color: tokens['--jx-muted-foreground'],
    letterSpacing: 0,
    userSelect: 'none',
  },
  // ── the trail link (and the collapse's ellipsis link): muted ink
  // warming to the brand hue; the 150ms color transition rides the
  // .jx-bc-link class in breadcrumb.css (motion has no tokens) ──
  link: {
    textDecoration: 'none',
    color: {
      default: tokens['--jx-muted-foreground'],
      ':hover': tokens['--jx-primary'],
    },
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '2px',
    },
  },
  // ── the dropdown trigger button ──
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens['--jx-space-4'],
    cursor: 'pointer',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    color: {
      default: tokens['--jx-muted-foreground'],
      ':hover': tokens['--jx-primary'],
    },
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '2px',
    },
  },
  triggerCaret: { flex: 'none', display: 'inline-flex' },
  // ── a peer destination anchor (real link, menu-item contract) ──
  menuItem: {
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    alignItems: 'center',
    textAlign: 'left',
    fontFamily: tokens['--jx-font-sans'],
    backgroundColor: 'transparent',
    color: 'inherit',
  },
  dropdownHost: { display: 'inline-flex' },
});
