// date-picker.stylex.ts — the date-picker family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law), shared by all four family fragments
// (date-picker/calendar/month-grid/time-stepper): nav rows, grids,
// day cells, stepper groups, the trigger field and the panel body
// became static longhand atoms. The terminal-bezel ink rides the
// --terminal/--terminal-foreground roles; the cell tints ride
// color-mix over --primary (markup-verbatim formulas).
//
// Value notes (receipted):
//   - gap-2/mb-1/pt-2/pr-2/px-2/gap-3/px-3.5/py-3 map to the
//     --space-8/4/8/8/8/12 + calc(×3.5)/--space-12 steps; the 2px
//     grid seams (gap-0.5) ride calc(var(--jx-unit) * 0.5) — reported
//     MISSING (--space-2); px-3.5 (14px) reported MISSING (--space-14);
//   - text-[10px] → --text-micro; text-[11px] → --text-label;
//     text-xs → --text-label-lg;
//   - tracking 0.2em derives from the wide step (×2.5; reported
//     MISSING --track-month); tracking 0.08em is --track-wide;
//   - the w-7/h-7/w-8/h-8/w-24/max-h-56 band geometry and the
//     repeat(N, 2rem) tracks are structural (lawful literals);
//   - font-bold (700) has NO weight token — lane-2 css keyed on the
//     data hooks, reported MISSING (--jx-weight-bold);
//   - leading-none (1) has NO token — lane-2 css on the day/cell
//     hooks (reported MISSING, --jx-leading-none);
//   - every transition (motion literals) — lane-2 css on the family's
//     own hook classes (the sheet already owns the state machines).
//
// Lane-2 residue (date-picker.css): the anchor-positioned panel, the
// hover/focus/disabled state machines, the reduced-motion kill
// (pre-existing) + the transitions/weights/leadings above.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const datePickerStyles = stylex.create({
  // ── the trigger field (date-picker.svelte) ───────────────────────
  field: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: tokens['--jx-space-8'],
    width: '100%',
  },
  wrap: {
    position: 'relative',
    display: 'block',
    width: '100%',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    textAlign: 'start',
    cursor: 'pointer',
  },
  valueLane: {
    flex: '1',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  valuePlaceholder: {
    color: tokens['--jx-muted-foreground'],
  },
  chevron: {
    flex: 'none',
    width: '0.75rem',
    height: '0.75rem',
    pointerEvents: 'none',
    color: tokens['--jx-muted-foreground'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  // ── the panel body (bezel surface; the lane turns it into a row) ──
  surfacePad: {
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-12'],
  },
  surfaceLane: {
    display: 'flex',
    alignItems: 'stretch',
    gap: tokens['--jx-space-12'],
  },
  // ── the presets lane ─────────────────────────────────────────────
  presetsLane: {
    display: 'flex',
    width: '6rem',
    flex: 'none',
    flexDirection: 'column',
    justifyContent: 'start',
    gap: 'calc(var(--jx-unit) * 0.5)',
    maxHeight: '14rem',
    overflowY: 'auto',
    borderRightWidth: tokens['--jx-hairline'],
    borderRightStyle: 'solid',
    borderRightColor: tokens['--jx-border'],
    paddingRight: tokens['--jx-space-8'],
  },
  presetBtn: {
    display: 'inline-flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'start',
    height: '1.75rem',
    paddingInline: tokens['--jx-space-8'],
    textAlign: 'start',
    fontSize: tokens['--jx-text-label-lg'],
    cursor: 'pointer',
  },
  laneCol: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: tokens['--jx-space-8'],
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
    paddingTop: tokens['--jx-space-8'],
  },
  errorMark: {
    color: tokens['--jx-destructive'],
  },

  // ── the nav row (calendar + month-grid share it verbatim) ────────
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-8'],
    marginBottom: tokens['--jx-space-4'],
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: tokens['--jx-terminal-foreground'],
    cursor: 'pointer',
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  monthLabel: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: 'calc(var(--track-wide) * 2.5)',
    textTransform: 'uppercase',
  },

  // ── the grids ────────────────────────────────────────────────────
  gridCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--jx-unit) * 0.5)',
  },
  headRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 2rem)',
    gap: 'calc(var(--jx-unit) * 0.5)',
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 2rem)',
    gap: 'calc(var(--jx-unit) * 0.5)',
  },
  monthRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 2rem)',
    gap: 'calc(var(--jx-unit) * 0.5)',
  },
  weekday: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '1.5rem',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },

  // ── the day cells (base + the JS-known states) ───────────────────
  dayBase: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    fontVariantNumeric: 'tabular-nums',
    cursor: 'default',
    userSelect: 'none',
  },
  dayOut: {
    opacity: 0.35,
  },
  dayCell: {
    cursor: 'pointer',
  },
  dayMonth: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
  },
  dayToday: {
    borderColor: tokens['--jx-primary'],
  },
  dayFill: {
    backgroundColor: tokens['--jx-primary'],
    color: tokens['--jx-primary-foreground'],
  },
  dayTint: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 14%, transparent)',
  },
  dayOff: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },

  // ── the time stepper ─────────────────────────────────────────────
  timeRoot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens['--jx-space-4'],
  },
  timeGroup: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  stepBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    cursor: 'pointer',
    ':hover': {
      color: tokens['--jx-terminal-foreground'],
    },
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  timeCell: {
    width: '2rem',
    height: '1.75rem',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    outlineWidth: '2px',
    outlineStyle: 'solid',
    outlineColor: 'transparent',
    cursor: 'ns-resize',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: 'var(--ring)',
      outlineOffset: '-1px',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: 0.3,
    },
  },
  colon: {
    fontFamily: tokens['--jx-font-nav'],
    color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)',
  },
  modeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '1.75rem',
    minWidth: '1.75rem',
    paddingInline: tokens['--jx-space-4'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    fontVariantNumeric: 'tabular-nums',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    cursor: 'pointer',
    ':hover': {
      color: tokens['--jx-terminal-foreground'],
    },
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
});
