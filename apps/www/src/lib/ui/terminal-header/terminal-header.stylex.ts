// terminal-header.stylex.ts — the terminal-header family's atom
// table (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the bezel root
// (terminal ground + hairline underline + the scoped color-scheme),
// the 90rem shell with its sm/lg padding seams at the ORIGINAL
// 40rem/64rem thresholds, the chrome row, the two wings (brand block,
// pill box + frames + hamburger), the bars' transform transition, and
// the mobile drawer (grid-rows 0fr→1fr collapse + the bounded
// scroller).
//
// Value law: theme-able slots ride tokens or var() seams — the shell
// measure rides --shell-w (typed); 11px/0.24em ride --text-label/
// --track-label (typed); text-sm, leading-tight, the 150/200ms
// motion + easings have no sheet steps yet — promotion seams
// (reported). Off-step geometry rides ruler equations (p-0.5, gap-3px
// → calc(var(--jx-unit) * 0.5 / 0.75)); the bezel's terminal-foreground
// /25 border is the color-mix string the utility emitted. The bezel
// chrome-paint bands (indicator brightener, hamburger fold, pill
// typography, subpanel overrides) stay in terminal-header.css.
//
// The drawer's 0fr→1fr pair follows the separator emission-order law:
// drawerOpen is defined AFTER drawer in this one create() call — the
// engine's own priority ordering makes the open rung win.
//
// Mirror law: byte-identical in registry/files/ui/terminal-header/
// and apps/www/src/lib/ui/terminal-header/ (cmp); '../../tokens.
// stylex' resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const thStyles = stylex.create({
  // ── the bezel root (theme-scoped classes stay in the markup) ──
  bezel: {
    isolation: 'isolate',
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
  },
  schemeDark: { colorScheme: 'dark' },
  schemeLight: { colorScheme: 'light' },

  // ── the shell: measure + viewport padding seams ──
  shell: {
    marginInline: 'auto',
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    paddingInline: 'var(--space-16)',
    '@media (min-width: 40rem)': {
      paddingInline: 'var(--space-24)',
    },
    '@media (min-width: 64rem)': {
      paddingInline: 'var(--space-32)',
    },
  },

  // ── the chrome row (the pointer-modality band rides data-jx-chrome) ──
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-16)',
    paddingBlock: 'var(--space-12)',
  },

  // ── LEFT WING · the brand ──
  brandLink: {
    display: 'flex',
    minWidth: 0,
    flex: '1 1 0%',
    alignItems: 'center',
    gap: 'var(--space-12)',
  },
  logoSlot: {
    display: 'flex',
    height: 'var(--jx-hit)',
    width: 'var(--jx-hit)',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCol: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: 'calc(var(--jx-unit) * 0.5)',
  },
  wordmark: {
    fontFamily: tokens['--jx-font-nav'],
    color: 'var(--primary-text)',
    fontSize: 'var(--text-label)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    lineHeight: 'var(--leading-tight, 1.25)',
  },
  domain: {
    fontFamily: tokens['--jx-font-nav'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--text-sm, 0.875rem)',
    lineHeight: 'var(--leading-tight, 1.25)',
  },
  subtitle: {
    display: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--text-label)',
    lineHeight: 'var(--leading-tight, 1.25)',
    opacity: 0.6,
    '@media (min-width: 64rem)': {
      display: 'block',
    },
  },

  // ── RIGHT WING · the nav pill slot + controls ──
  wing: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'var(--space-12)',
  },
  // the pill box: chrome the composed nav lands in (indicator host)
  pillBox: {
    position: 'relative',
    display: 'none',
    alignItems: 'center',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 25%, transparent)',
    padding: 'calc(var(--jx-unit) * 0.5)',
    '@media (min-width: 40rem)': {
      display: 'flex',
    },
  },
  // the indicator part's class seam: transparent ground, square
  // corners, the restored 150ms ease-out opacity fade (B-8)
  indicatorSeam: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    transitionProperty: 'opacity',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  // the bezel control frame (border + p-0.5 = the 38px outer band)
  frame: {
    display: 'flex',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 25%, transparent)',
    padding: 'calc(var(--jx-unit) * 0.5)',
  },
  burgerWrap: {
    display: 'flex',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 25%, transparent)',
    padding: 'calc(var(--jx-unit) * 0.5)',
    '@media (min-width: 40rem)': {
      display: 'none',
    },
  },
  burger: {
    display: 'flex',
    minHeight: 'var(--jx-hit)',
    minWidth: 'var(--jx-hit)',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(var(--jx-unit) * 0.75)',
  },
  bar: {
    display: 'block',
    height: '1.5px',
    width: 'var(--jx-icon)',
    backgroundColor: tokens['--jx-terminal-foreground'],
  },
  barMoving: {
    transitionProperty: 'transform',
    transitionDuration: 'var(--motion-200, 200ms)',
    transitionTimingFunction: 'var(--ease-nav, cubic-bezier(0.22, 1, 0.36, 1))',
  },

  // ── the mobile drawer: 0fr→1fr collapse (drawerOpen AFTER drawer —
  //    the emission-order law makes the open rung win) ──
  // (the wedge round, 2026-09-19): the 0fr→1fr motion LEFT the CSS
  // transition engine — fr-transitions freeze at currentTime 0 in
  // Chrome 146 (the clock-freeze receipt in lib/disclosure-motion);
  // the component drives the same curve through the rAF lane, the
  // atoms carry only the semantic endpoints
  drawer: {
    display: 'grid',
    gridTemplateRows: '0fr',
    '@media (min-width: 40rem)': {
      display: 'none',
    },
  },
  drawerOpen: {
    gridTemplateRows: '1fr',
  },
  drawerClip: {
    overflow: 'hidden',
  },
  drawerScroll: {
    maxHeight: 'calc(100dvh - 4.75rem)',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
    WebkitOverflowScrolling: 'touch',
  },
});
