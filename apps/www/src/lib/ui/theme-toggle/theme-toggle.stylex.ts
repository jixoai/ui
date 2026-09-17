// theme-toggle.stylex.ts — the theme-toggle family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-24): the bezel recipe shared with language-switcher (1px
// currentColor-mix border, transparent fill, 11px label voice, the
// color/border-color/background-color 150ms ease-out transition), the
// segmented selector's per-slot right rail (hairline on the last slot
// only) + the data-active 16% currentColor fill, and the cycling
// button's leaning hover border.
//
// Law mapping (the tier-2 value rule): the transition rides the
// promoted --motion-150/--motion-ease-out tokens; the 11px label
// voice rides the --text-label step; the 6px bezel gap rides the
// --space-6 step; the odd 9px segmented inline padding rides a ruler
// equation (byte-exact, no step). Hover rides a native pseudo INSIDE
// the atom (the pilot ruling); data-active stays the valued hook it
// already was (paint walks a conditional atom group).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// theme-toggle/ and apps/www/src/lib/ui/theme-toggle/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const themeToggleStyles = stylex.create({
  // ── the bezel recipe (shared with language-switcher) ──
  bezel: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: tokens['--jx-space-6'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, currentColor 35%, transparent)',
    backgroundColor: 'transparent',
    fontSize: tokens['--jx-text-label'],
    color: 'inherit',
    transitionProperty: 'color, border-color, background-color',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  // the icon lane wrapper (the component owns the 13px box)
  icon: { flex: 'none', display: 'inline-flex' },

  // ── the full variant: the segmented selector ──
  group: { fontFamily: tokens['--jx-font-nav'], display: 'inline-flex' },
  seg: { paddingBlock: tokens['--jx-space-4'], paddingInline: 'calc(var(--jx-unit) * 2.25)' },
  // the LAST slot alone carries the group's right rail; the earlier
  // slots keep a 0-width inline-end frame so the bezels collapse
  segRail: { borderRightWidth: tokens['--jx-hairline'] },
  segFlush: { borderRightWidth: 0 },
  // the current mode's seat: 16% currentColor ground
  segActive: { backgroundColor: 'color-mix(in oklab, currentColor 16%, transparent)' },

  // ── the cycling variants (compact | icon | text) ──
  cycle: {
    fontFamily: tokens['--jx-font-nav'],
    paddingInline: 'calc(var(--jx-unit) * 2.5)',
    paddingBlock: tokens['--jx-space-4'],
    ':hover': {
      borderColor: 'color-mix(in oklab, currentColor 70%, transparent)',
    },
  },
});
