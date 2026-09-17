// file-input.stylex.ts — the file-input family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the density
// knob aliases (the --jx-file-* size seams over the closed control
// contract), the DROP zone (dashed hairline, 2.25× height lane, the
// zone glyph/title/hint voices), the BUTTON trigger, the selected
// list + rows + thumbs + the remove/clear affordances, and the
// sr-only native input.
//
// Value law: theme-able slots ride tokens or var() seams — the
// density channels (--jx-gap/--jx-inset/--jx-text/--jx-leading/--jx-
// hit/--jx-file-*) ride plain var() strings exactly as the utilities
// spelled them; 11px rides --text-label, 0.08em rides --track-wide;
// the 10.5px micro voice, 0.18em/0.2em/-0.02em trackings, the medium
// and bold weights, leading-none, and the 150ms motion ride promotion
// seams (reported for serial promotion); off-step one-offs ride ruler
// equations (py 0.15rem → calc(var(--jx-unit) * 0.6); sr-only's -1px
// margin → calc(var(--jx-unit) * -0.25) — margin is a tier-2 slot,
// the equation keeps the exact -1px). The drag-over poses (0,3,0 vs
// the unlayered press law), the sibling hairline, the svg sizings,
// the state machines, and the reduced-motion kill stay in
// file-input.css (lane-2).
//
// Mirror law: byte-identical in registry/files/ui/file-input/ and
// apps/www/src/lib/ui/file-input/ (cmp); '../../tokens.stylex'
// resolves in both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

// the transition chains this family rides (seams until the motion
// steps land): color set + the remove ×'s color,transform pair
const COLORS_CHAIN =
  'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke';

export const fileStyles = stylex.create({
  // ── the density knob aliases (one-line, the closed contract) ──
  density: {
    '--jx-file-h': 'var(--jx-hit)',
    '--jx-file-thumb': 'var(--jx-icon)',
    '--jx-file-icon': 'var(--jx-icon)',
    '--jx-file-text': 'var(--jx-text)',
    '--jx-file-zone-pad': 'var(--jx-inset)',
    '--jx-file-zone-glyph': 'var(--jx-icon)',
  },

  // ── the root column ──
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--jx-gap)',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
  rootDisabled: { opacity: 0.5 },
  labelLine: {
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 'calc(var(--jx-unit) * -0.25)',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },

  // ── the DROP zone (dashed is reserved for drop targets + invalid) ──
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--jx-gap)',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 'calc(var(--jx-file-h) * 2.25)',
    padding: 'var(--jx-file-zone-pad)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    '--jx-press-shadow': 'var(--shadow-2xs)',
    '--jx-press-shadow-hover': 'var(--shadow-xs)',
    '--jx-press-shadow-active': 'var(--shadow-xs-press)',
  },
  dropZoneInvalid: { borderColor: tokens['--jx-destructive'] },
  zoneGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--jx-file-zone-glyph)',
    height: 'var(--jx-file-zone-glyph)',
    color: tokens['--jx-muted-foreground'],
    transitionProperty: COLORS_CHAIN,
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  zoneTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-label)',
    letterSpacing: 'var(--track-20, 0.2em)',
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    textAlign: 'center',
    transitionProperty: COLORS_CHAIN,
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  zoneHint: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-micro-lg, 0.65625rem)',
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-muted-foreground'],
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    textAlign: 'center',
  },
  draggingInk: { color: tokens['--jx-primary'] },

  // ── the BUTTON trigger ──
  buttonTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    width: 'fit-content',
    maxWidth: '100%',
    minHeight: 'var(--jx-file-h)',
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-gap)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontSize: 'var(--jx-file-text)',
    fontWeight: 'var(--weight-medium, 500)',
    '--jx-press-shadow': 'var(--shadow-xs)',
    '--jx-press-shadow-hover': 'var(--shadow-sm)',
    '--jx-press-shadow-active': 'var(--shadow-sm-press)',
  },
  buttonTriggerInvalid: {
    borderStyle: 'dashed',
    borderColor: tokens['--jx-destructive'],
  },
  triggerGlyph: {
    flex: 'none',
    display: 'inline-flex',
    color: tokens['--jx-muted-foreground'],
  },

  // ── the selected list ──
  list: {
    minWidth: 0,
    maxWidth: '100%',
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
  },
  listInvalid: { borderStyle: 'dashed' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    minWidth: 0,
    minHeight: 'var(--jx-file-h)',
    paddingInline: 'var(--jx-inset)',
  },
  thumb: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'calc(var(--jx-file-thumb) + 2px)',
    height: 'calc(var(--jx-file-thumb) + 2px)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    overflow: 'hidden',
  },
  thumbImg: {
    display: 'block',
    width: 'var(--jx-file-thumb)',
    height: 'var(--jx-file-thumb)',
    objectFit: 'cover',
  },
  thumbIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--jx-file-icon)',
    height: 'var(--jx-file-icon)',
    color: tokens['--jx-muted-foreground'],
  },
  fileName: {
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'var(--jx-file-text)',
    color: tokens['--jx-foreground'],
  },
  fileSize: {
    flex: 'none',
    fontSize: 'var(--jx-file-text)',
    fontVariantNumeric: 'tabular-nums',
    color: tokens['--jx-muted-foreground'],
  },
  removeBtn: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 'var(--jx-hit)',
    minHeight: 'var(--jx-hit)',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-leading)',
    cursor: 'pointer',
    transitionProperty: 'color, transform',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
    ':disabled': { cursor: 'not-allowed' },
  },
  clearRow: {
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 'calc(var(--jx-file-h) * 0.75)',
    paddingBlock: 'calc(var(--jx-unit) * 0.6)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-micro-lg, 0.65625rem)',
    letterSpacing: 'var(--track-18, 0.18em)',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transitionProperty: COLORS_CHAIN,
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },

  // ── the error mark + the code text glyph ──
  errorMark: {
    fontWeight: 'var(--weight-bold, 700)',
    color: tokens['--jx-destructive'],
  },
  codeGlyph: {
    fontFamily: tokens['--jx-font-nav'],
    fontWeight: 'var(--weight-bold, 700)',
    fontSize: 'calc(var(--jx-file-icon) * 0.72)',
    letterSpacing: 'var(--track-tight, -0.02em)',
    lineHeight: 'var(--leading-none, 1)',
  },
});
