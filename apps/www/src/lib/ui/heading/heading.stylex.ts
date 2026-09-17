// heading.stylex.ts — the heading family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the face's B1 heading channels as the old
// markup's utility strings spelled them — font-bold, leading-[1.25]
// (the leading-tight step IS 1.25), the ink seam
// var(--jx-ty-ink,var(--foreground)) (no prose region → --foreground,
// byte-equal to the old utility), and the per-level EM sizes
// (h1 1.875em / h2 1.5em / h3 1.25em / h4 1.125em / h5+6 1em).
//
// Law mapping (the tier-2 value rule): the weight and leading ride
// the W1 ladder tokens; the ink seam stays the prose-scope fallback
// chain verbatim; the em ladder is RELATIVE by law (the no-font-size
// kinship — it scales with the ambient preset, so NO rem step can
// express it) and rides promotion seams --heading-size-1..5
// (reported for serial promotion; the seam fallbacks are the
// component's own values today).
//
// Mirror law: this file is byte-identical in
// registry/files/ui/heading/ and apps/www/src/lib/ui/heading/ (cmp);
// the tokens import '../../tokens.stylex' resolves in BOTH trees
// (separator's divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const headingStyles = stylex.create({
  // ── the face's B1 channels, every level ──────────────────────────
  base: {
    fontWeight: tokens['--jx-weight-bold'],
    lineHeight: tokens['--jx-leading-tight'],
    color: 'var(--jx-ty-ink, var(--foreground))',
  },
  // ── the em ladder (index = level; h5 and h6 share the 1em rung) ──
  h1: { fontSize: 'var(--heading-size-1, 1.875em)' },
  h2: { fontSize: 'var(--heading-size-2, 1.5em)' },
  h3: { fontSize: 'var(--heading-size-3, 1.25em)' },
  h4: { fontSize: 'var(--heading-size-4, 1.125em)' },
  h5: { fontSize: 'var(--heading-size-5, 1em)' },
  h6: { fontSize: 'var(--heading-size-5, 1em)' },
});
