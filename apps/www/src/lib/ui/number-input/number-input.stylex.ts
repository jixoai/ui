// number-input.stylex.ts — the number-input family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): the shell row, the stepper pair and the
// centered number cell became static longhand atoms; density rides
// the --jx-hit kernel channel (PLAIN var() string, the cycle law).
//
// Value notes (receipted):
//   - the 1px frames and the steppers' -1px overlap seams ride the
//     --hairline token and its calc negation (borderWidth/margin
//     literals are tier-2 red);
//   - font-bold (700) has NO weight token — lane-2 css on the
//     .jx-num-btn hook, reported as MISSING (--jx-weight-bold);
//   - leading-none (1) has NO token — same lane-2 ruling (reported
//     MISSING, --jx-leading-none);
//   - the shell's and buttons' transitions were ALREADY the css
//     sheet's (:where(.jx-num) carries box-shadow/border-color; the
//     buttons' background/transform pair moves there now) — motion
//     literals never ride atoms.
//
// Lane-2 residue (number-input.css): the hover/well/press state
// machines, the focus laws, the reduced-motion kill (pre-existing) +
// the steppers' chrome trio above.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const numberInputStyles = stylex.create({
  // ── the shell row ────────────────────────────────────────────────
  shell: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: '100%',
    minHeight: 'var(--jx-hit)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 'none',
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
  },
  shellInvalid: {
    borderStyle: 'dashed',
  },
  shellOff: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // ── the stepper pair (the minus edge overlaps the shell border) ──
  stepStart: {
    marginInlineStart: 'calc(var(--hairline) * -1)',
  },
  stepEnd: {
    marginInlineEnd: 'calc(var(--hairline) * -1)',
  },
  stepper: {
    flex: 'none',
    minWidth: 'var(--jx-hit)',
    minHeight: 'var(--jx-hit)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 'none',
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    cursor: 'pointer',
    touchAction: 'manipulation',
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  // ── the centered number cell ─────────────────────────────────────
  cell: {
    flex: '1',
    minWidth: 0,
    textAlign: 'center',
    appearance: 'textfield',
  },
  cellOff: {
    cursor: 'not-allowed',
  },
});
