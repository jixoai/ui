// navigation-menu.stylex.ts — the navigation-menu family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the family's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-hit/--jx-gap/--jx-inset/--jx-text/
// --jx-line), the theme scale through the typed tokens.
//
// Lane split (the placement law): the entries' hover ink and the
// focus-visible ring are NATIVE pseudos in navigation-menu.css keyed
// on the family hooks — UNLAYERED :where() (the menubar carve-out
// law: stylex tiers nest under components, so overriding the family's
// own atom ink requires the unlayered level). The current/open color
// ORDER stays JS-known here as atom groups (open beats current, hover
// beats current-but-closed — the pre-composed specificity order).
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - tracking-[0.12em] → --jx-track-wide (0.08em) — nearest EXISTING
//     step (reported).
//   - gap-1 (4px) → --jx-space-4 — EXACT (the unit step).
//   - rounded-[calc(var(--radius)-2px)] stays the verbatim channel
//     formula (calc rides the radius token — no literal step).
//   - the popover-surface seams ([--jx-pop-pad] channel padding, the
//     scrollbar-aware inline max()) ride verbatim var() strings.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const navMenuStyles = stylex.create({
  // ── the bar: wrapping row of entries ──
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: tokens['--jx-space-4'],
  },

  // ── the trigger (button entry with a panel) ──
  trigger: {
    display: 'inline-flex',
    minBlockSize: 'var(--jx-hit)',
    cursor: 'pointer',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    textDecorationLine: 'none',
  },

  // ── the bare in-bar link ──
  link: {
    display: 'inline-flex',
    minBlockSize: 'var(--jx-hit)',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-wide'],
    textDecorationLine: 'none',
  },

  // ── the ink ladder (open > current > idle; hover is a native
  // pseudo in navigation-menu.css) ──
  inkOpen: { color: tokens['--jx-foreground'] },
  inkCurrent: { color: tokens['--jx-primary'] },
  inkIdle: { color: tokens['--jx-muted-foreground'] },

  // ── the item's anchor slot span ──
  slot: { display: 'inline-flex' },

  // ── the panel: fitted popover capped near the viewport ──
  panel: {
    width: 'fit-content',
    maxWidth: 'min(92vw, 26rem)',
  },
  // the scroll ring: capped height, stable gutter, the pop-pad channel
  // (scrollbar-aware inline max — the jx-pop sheet's law, verbatim)
  scroll: {
    maxHeight: '72vh',
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',
    padding: 'var(--jx-pop-pad, 12px 14px)',
    paddingInline: 'max(var(--jx-pop-pad-inline, 14px) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
  panelBody: { display: 'flex', flexDirection: 'column' },

  // ── the sliding indicator: the restrained tonal fill (the
  // tabs-pill dialect, ink through the --jx-tonal channel) ──
  indicator: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0,
    borderRadius: 'calc(var(--radius) - 2px)',
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 14%, transparent)',
  },
});
