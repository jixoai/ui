// color-picker.stylex.ts — the color picker family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities of the native rebase
// (2026-09-01). The lane's WELL state machine, the native-face
// builds, the anchor-positioned panel, the SV overlays and the dot
// halos stay in color-picker.css (unchanged laws); the trigger's
// redundant transition utilities died — the css state machine already
// owns `box-shadow 150ms ease-out, border-color 150ms ease-out`. The
// chevron's flip transition moved INTO the css (motion literals have
// no tokens) keyed on the existing .jx-color-picker-chevron hook —
// the atom carries `rotate: 180deg` and the css transitions `rotate`
// (the modern property — transform-flavored utilities are gone).
//
// COLOR-SPACE CONSTANTS: the pointer dots' `white` checker border is
// the instrument exemption the css already documents (must read on
// every hue); the pad/rail gradient strings are geometry. The SV
// pad's ground rides the live --jx-color-picker-hue channel (var()
// string, not a literal).
//
// Value receipts: gap-2.5 IS --jx-space-10; 13px rides the density
// channel var(--jx-text) (the lane's own voice); 12px IS
// --jx-text-label-lg; the 3px swatch gutter is a ruler equation
// (calc(var(--jx-unit) * 0.75) — reported as a missing micro step).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const colorPickerStyles = stylex.create({
  // ── the trigger lane shell (the well + states live in the css) ──
  trigger: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
  },
  // the native field's mono voice (the value notation lane)
  fieldMono: { fontFamily: tokens['--jx-font-mono'] },
  // the sr-only collapse (showValue=false / a custom lane snippet)
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  // the consumer lane slot's wrapper
  laneSlot: {
    display: 'flex',
    minWidth: 0,
    flex: '1 1 0%',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
  },
  // ── the chevron (flip transition in the css, keyed on its hook) ──
  chevron: {
    flex: 'none',
    width: '0.75rem',
    height: '0.75rem',
    borderWidth: 0,
    padding: 0,
    backgroundColor: 'transparent',
    color: tokens['--jx-muted-foreground'],
  },
  chevronOpen: { rotate: '180deg' },
  // ── the panel's surface body ──
  surfaceBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-10'],
    padding: tokens['--jx-space-12'],
  },

  // ── the editor ──
  editor: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-10'] },
  svPad: {
    position: 'relative',
    direction: 'ltr',
    width: '100%',
    height: '150px',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'hsl(var(--jx-color-picker-hue) 100% 50%)',
    cursor: 'crosshair',
    touchAction: 'none',
    userSelect: 'none',
  },
  svDot: {
    position: 'absolute',
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'transparent',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'white', // color-space constant (the css exemption class)
    pointerEvents: 'none',
  },
  hueRail: {
    position: 'relative',
    direction: 'ltr',
    width: '100%',
    height: '0.75rem',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundImage:
      'linear-gradient(to right, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))',
    cursor: 'crosshair',
    touchAction: 'none',
    userSelect: 'none',
  },
  hueDot: {
    position: 'absolute',
    top: '50%',
    translate: '0 -50%',
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'transparent',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'white', // color-space constant (the css exemption class)
    pointerEvents: 'none',
  },
  toolbar: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-6'] },
  valueField: { fontFamily: tokens['--jx-font-mono'], fontSize: 'var(--jx-text)', minWidth: '29ch' },
  pipetteGlyph: { display: 'inline-flex' },
  formatSelect: { fontSize: tokens['--jx-text-label-lg'] },
  swatchesCenter: { display: 'flex', justifyContent: 'center' },

  // ── the preset palette ──
  swatches: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 22px)',
    gap: 'calc(var(--jx-unit) * 0.75)',
  },
  row: { display: 'contents' },
  swatchCell: {
    width: '22px',
    height: '22px',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    cursor: 'pointer',
  },
});
