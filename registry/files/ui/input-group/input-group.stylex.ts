// input-group.stylex.ts — the input-group family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-30): the root's joined-field bezel (hairline border, radius
// 0, background ground, the hit-lane floor, the box-shadow 150ms
// ease-out transition), the lane's chromeless fill (min-width 0,
// grow, inline insets, zero block padding), and the addon's muted
// lane (flex-none, gap, inline insets, the secondary text voice) with
// its 50% disabled dim.
//
// Law mapping (the tier-2 value rule): the transition rides the
// promoted --motion-150/--motion-ease-out tokens; every other
// theme-able slot rides kernel channels or semantic tokens. The STATE
// MACHINES (well shadows, focus ring, dashed invalid, disabled border
// — the input family's paint law keyed on data-jx-igroup) stay
// lane-2 in input-group.css exactly as authored: the atom table never
// touches a property those machines paint, so the cascade outcome is
// byte-parity with the old utilities.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// input-group/ and apps/www/src/lib/ui/input-group/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const inputGroupStyles = stylex.create({
  // ── the root: the joined field's bezel ──
  root: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: '100%',
    minHeight: 'var(--jx-hit)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    transitionProperty: 'box-shadow',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  // ── the lane: chromeless fill inside the shell ──
  lane: {
    minWidth: 0,
    flexGrow: 1,
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 0,
  },
  // ── the addon: the muted lane beside the field ──
  addon: {
    display: 'flex',
    flex: 'none',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    paddingInline: 'var(--jx-inset)',
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text)',
  },
  // the root-disabled group's addons dim to 50%
  addonDisabled: { opacity: 0.5 },
});
