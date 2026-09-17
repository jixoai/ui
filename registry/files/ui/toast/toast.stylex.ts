// toast.stylex.ts — the toast family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities of toast-v2 (2026-09-02).
// The lane split (each seam moved where it belongs):
//   - CUSTOM-PROPERTY setters (the press physics vars, the glass
//     tuning vars) are not atom-expressible — they ride toast.css
//     keyed on the component's OWN hooks (.jx-press [data-jx-toast],
//     [data-jx-effect='blur']); the glass values stay the retired
//     backdrop-blur-md ground verbatim (computed-equivalence);
//   - the enter/exit ANIMATIONS (duration/easing literals, motion
//     has no tokens) ride toast.css as [data-jx-toast] /
//     .jx-toast-leaving rules (the unlayered reduced-motion kill
//     already overrides them);
//   - the §6 FORCED-COLORS degradations ride one @media
//     (forced-colors: active) block keyed on the data hooks — every
//     rung's degradation collapses to Canvas/CanvasText there
//     exactly as the utilities did;
//   - hover/focus paint on the dismiss button rides pseudo
//     conditions (the corpus law).
//
// Value receipts (missing steps reported for serial promotion):
//   - 14px card padding → ruler equation (no --space-14); 3px/2px
//     nudges → unit equations; 12px/12.5px ARE the label steps;
//     13px rides var(--jx-text); leading-[1.5] IS the density
//     secondary-default rung (1.5); text-sm (14px) → the ruler
//     equation; shadow-lg → --jx-shadow-md (the dead rung was
//     removed at F-10; md is the nearest live tier);
//   - tracking 0.1em → calc over --jx-track-wide.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const toastStyles = stylex.create({
  // ── the stack (pointer-transparent; only cards opt in) ──
  stack: { display: 'grid', gridAutoRows: 'min-content', pointerEvents: 'none' },
  contentStart: { alignContent: 'flex-start' },
  contentEnd: { alignContent: 'flex-end' },
  topLevel: { height: '100%', width: 'auto', padding: tokens['--jx-space-16'] },
  standaloneMeasure: { zIndex: 90, width: 'min(22rem, calc(100vw - 2rem))' },
  // the nine standalone slots (physical names, physical insets)
  posLeftTop: { position: 'fixed', left: tokens['--jx-space-16'], top: tokens['--jx-space-16'] },
  posCenterTop: { position: 'fixed', left: '50%', top: tokens['--jx-space-16'], translate: '-50%' },
  posRightTop: { position: 'fixed', right: tokens['--jx-space-16'], top: tokens['--jx-space-16'] },
  posLeftCenter: { position: 'fixed', left: tokens['--jx-space-16'], top: '50%', translate: '0 -50%' },
  posCenterCenter: { position: 'fixed', left: '50%', top: '50%', translate: '-50% -50%' },
  posRightCenter: { position: 'fixed', right: tokens['--jx-space-16'], top: '50%', translate: '0 -50%' },
  posLeftBottom: { position: 'fixed', left: tokens['--jx-space-16'], bottom: tokens['--jx-space-16'] },
  posCenterBottom: { position: 'fixed', left: '50%', bottom: tokens['--jx-space-16'], translate: '-50%' },
  posRightBottom: { position: 'fixed', right: tokens['--jx-space-16'], bottom: tokens['--jx-space-16'] },
  // the card wrapper (transform vars ride Svelte's style attr)
  wrapper: { pointerEvents: 'auto', gridArea: '1/1', justifySelf: 'stretch' },
  wrapperStart: { alignSelf: 'start' },
  wrapperEnd: { alignSelf: 'end' },
  // ── the card (enter animation + press/glass vars in the css) ──
  card: {
    display: 'grid',
    alignItems: 'start',
    columnGap: tokens['--jx-space-10'],
    rowGap: tokens['--jx-space-6'],
    boxSizing: 'border-box',
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-12'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    color: tokens['--jx-popover-foreground'],
    borderRadius: tokens['--jx-radius'],
    overflow: 'hidden',
  },
  // the variant ladder's border rung (the four global hue slots)
  borderOutline: { borderColor: 'var(--jx-outline)' },
  borderTonal: { borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)' },
  // the material rungs (glass = the stamp channel + css tuning vars)
  groundPopover: { backgroundColor: tokens['--jx-popover'] },
  groundTonal: { backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, var(--popover))' },
  // the ink rungs (forced-colors collapses in the css)
  inkForeground: { color: tokens['--jx-foreground'] },
  inkTonal: { color: 'var(--jx-tonal)' },
  inkMuted: { color: tokens['--jx-muted-foreground'] },
  inkTransparent: { color: 'transparent' },
  cursorPointer: { cursor: 'pointer' },
  invisible: { visibility: 'hidden' },
  // ── the card's zones ──
  leading: {
    flex: 'none',
    alignSelf: 'start',
    paddingBlockStart: 'calc(var(--jx-unit) / 2)',
    gridArea: 'leading',
  },
  body: { display: 'grid', minWidth: 0, gap: tokens['--jx-space-4'], gridArea: 'body' },
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: 'calc(var(--jx-track-wide) * 1.25)',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-density-secondary-leading-default)',
  },
  trailing: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: tokens['--jx-space-10'],
    alignSelf: 'stretch',
    gridArea: 'trail',
  },
  // ── the dismiss seat (forced-colors outline in the css) ──
  dismiss: {
    flex: 'none',
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    marginBlockStart: 'calc(var(--jx-unit) * 0.75)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    gridArea: 'close',
    color: {
      default: tokens['--jx-muted-foreground'],
      ':hover': tokens['--jx-foreground'],
    },
    ':focus-visible': {
      outline: 'var(--hairline) solid var(--ring)',
      outlineOffset: '-1px',
    },
  },
  dismissGlyph: { display: 'inline-flex' },
  // ── the +N queued chip ──
  queued: {
    pointerEvents: 'auto',
    justifySelf: 'end',
    boxSizing: 'border-box',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRadius: tokens['--jx-radius'],
    backgroundColor: tokens['--jx-popover'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: 'calc(var(--jx-track-wide) * 1.25)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the reading panel (toast-dialog) ──
  panel: {
    pointerEvents: 'auto',
    boxSizing: 'border-box',
    margin: 0,
    position: 'fixed',
    left: '50%',
    top: '10vh',
    translate: '-50%',
    width: 'min(36rem, calc(100vw - 2rem))',
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: tokens['--jx-space-20'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRadius: tokens['--jx-radius'],
    backgroundColor: tokens['--jx-popover'],
    color: tokens['--jx-popover-foreground'],
    boxShadow: tokens['--jx-shadow-md'],
    outline: 'none',
    cursor: 'default',
  },
  panelGrid: { display: 'grid', gap: tokens['--jx-space-12'] },
  panelHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-16'],
  },
  panelTitleBlock: { display: 'grid', gap: tokens['--jx-space-6'], minWidth: 0 },
  panelDesc: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit))',
    lineHeight: 'var(--jx-density-leading-lg)',
    color: tokens['--jx-muted-foreground'],
  },
  panelLeading: { flex: 'none', paddingBlockStart: 'calc(var(--jx-unit) / 2)' },
  panelTrailing: { paddingBlockStart: tokens['--jx-space-4'] },
  panelFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-12'],
    paddingBlockStart: tokens['--jx-space-8'],
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
  },
  panelCountdownRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-10'] },
  panelActions: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    paddingBlockStart: tokens['--jx-space-8'],
  },
  panelAction: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 'var(--jx-hit)',
    paddingInline: 'var(--jx-inset)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
    color: tokens['--jx-foreground'],
    fontSize: 'var(--jx-text)',
    cursor: 'pointer',
    borderRadius: tokens['--jx-radius'],
  },
});
