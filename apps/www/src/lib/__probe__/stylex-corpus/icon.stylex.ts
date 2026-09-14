// icon.stylex.ts — the corpus dogfood, icon family (stylex-kernel
// phase 0, P0.6).
//
// Source of record: the research spike's re-authoring (spike/corpus/
// src/families/icon/icon.stylex.ts). The spike carried the D5 "typed
// dynamic idiom" — a style FACTORY:
//
//     reservedSize: (size: string) => ({ width: size, height: size })
//
// compiling to @property --x-width/--x-height custom properties +
// `width: var(--x-width)` rules. Phase 0's authoring law FORBIDS
// factories outside the markup layer (design §4.2 — the
// dynamic-value trilogy each silently broke); the sanctioned idiom is
// the CSS-var binding: the atom consumes a seam, the component
// computes it at runtime (inline style or scoped stamp — D1-08).
//
// Re-authoring: the reserved box's size rides `--jx-icon-size`, whose
// FALLBACK degrades to the ambient density channel (--jx-icon, the
// sheet's own media icon size) — a per-instance knob under the
// ambient default, expressed entirely in the atom.
//
// Divergences vs the spike artifact (receipted): the two
// `@property --x-*` blocks and the var(--x-width)/var(--x-height)
// atom rules are GONE — replaced by the seam atoms below (§4.2).

import * as stylex from '@stylexjs/stylex';

export const iconStyles = stylex.create({
  // the lazy pending/rejected reserved box — same square as the glyph,
  // SSR/hydration-stable by construction
  reserved: {
    display: 'inline-block',
  },
  // the §4.2 seam: components stamp --jx-icon-size at runtime; unset
  // (the fixture's own state) degrades to the ambient density channel
  reservedSize: {
    width: 'var(--jx-icon-size, var(--jx-icon, 1.5rem))',
    height: 'var(--jx-icon-size, var(--jx-icon, 1.5rem))',
  },
});
