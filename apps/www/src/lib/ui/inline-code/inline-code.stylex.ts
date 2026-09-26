// inline-code.stylex.ts — the inline-code family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the variant-grammar ladder's utility strings as
// the fused rework froze them (r4, 2026-09-08): the width-only base
// frame (hairline border + the density chip radius --jx-chip-radius,
// never the fleet corner) with the mono/13px-secondary pair as
// SEPARATE members (the twin-drop law: an explicit modifier prop
// DROPS the token twin, never outranks it), and the three rungs —
// fused (transparent ground, transparent-painted border,
// backdrop-contrast 85% — the Owner's acceptance tune, one notch
// quieter than 75, strictly above the separator's 0.5 ghost), tonal
// (the neutral injection + the 12%/45% tint recipe), outline (the
// structural --jx-outline border) — each with its §6 forced-colors
// degradation (Canvas/CanvasText; the 1px border survives every rung).
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — the hairline weight, the mono font, the
// --jx-text-secondary/--jx-line-secondary density channels (kernel
// channels the typed map never wraps), and the color roles. The
// contrast percentage is the fused rung's structural recipe constant
// (85, the Owner-pinned tune — not a sheet step). The neutral
// injection rides the '--jx-tonal' custom property exactly as the old
// arbitrary utility did (a consumer's own [--jx-tonal:…] class still
// wins: utilities sort after the atom tier). padding-inline is NOT
// here by law — the formula rides inline-code.css's ONE :where rule
// (the vision-pass pivot); the --tok-* palette stays css-side too.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// inline-code/ and apps/www/src/lib/ui/inline-code/ (cmp); the tokens
// import '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const inlineCodeStyles = stylex.create({
  // ── the base frame: inline block, width-only border, chip radius ──
  base: {
    display: 'inline-block',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderRadius: 'var(--jx-chip-radius)',
    whiteSpace: 'nowrap',
  },
  // the mono twin (DROPPED when an explicit family rides the kernel)
  mono: { fontFamily: tokens['--jx-font-mono'] },
  // the size/leading twins (DROPPED when explicit modifiers ride)
  fsSecondary: { fontSize: 'var(--jx-text-secondary)' },
  lhSecondary: { lineHeight: 'var(--jx-line-secondary)' },

  // ── the ladder ──────────────────────────────────────────────────
  // fused: the backdrop-fusion rung — transparent ground, the
  // width-only border painted transparent (currentColor would leak),
  // the backdrop pulled toward mid (the frame IS the fusion)
  fused: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    backdropFilter: 'contrast(85%)',
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': {
      borderColor: 'CanvasText',
    },
  },
  // tonal: the neutral injection + the 12%/45% tint recipe
  tonal: {
    '--jx-tonal': 'var(--muted-foreground)',
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)',
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
  // outline: the structural border rung
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'var(--jx-outline)',
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
      color: 'CanvasText',
    },
  },
});
