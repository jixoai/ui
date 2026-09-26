// textarea.stylex.ts — the textarea family's atom table (tailwindless
// one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old wrapper authored (tw4,
// 2026-08-24): the slot-row lanes (12px gaps, 6px block padding, the
// hairline border facing the field, the 12px muted voice), the count
// readout's nav voice (11px + the 0.08em --track-wide step), and the
// outer rows' -4px pull against the shell.
//
// Law mapping (the tier-2 value rule): text-xs (12px) maps to the
// promoted --text-label-lg step, text-[11px] to --text-label; the
// gaps/pulls ride space steps and ruler equations (byte-exact). The
// box law itself (border/fill/hover/focus/disabled/invalid) is
// CONSUMED from the jx-pure sheet's Part A (.jx-html-control-shell) —
// this table only adds the column direction and the slot rows; the
// chromeless lane (.jx-textarea) stays a consumed law class.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// textarea/ and apps/www/src/lib/ui/textarea/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const textareaStyles = stylex.create({
  // the shell's column direction (the box law rides Part A's
  // .jx-html-control-shell class, joined beside this atom)
  shellColumn: { flexDirection: 'column' },

  // ── the outer slot rows: muted 12px voice, pulled toward the shell ──
  outerStart: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    marginBottom: 'calc(var(--jx-unit) * -1)',
  },
  outerEnd: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    marginTop: 'calc(var(--jx-unit) * -1)',
  },

  // ── the inner slot rows: a lane behind its own hairline ──
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
  },
  innerStart: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
  },
  innerEnd: {
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
  },

  // ── the count readout: flushed to the lane's end, the nav voice ──
  count: {
    marginInlineStart: 'auto',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-wide'],
  },
});
