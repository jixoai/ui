// dropdown-menu.stylex.ts — the dropdown-menu family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): the anchor/trigger/caret statics, the
// scroll ring, and the item body became static longhand atoms;
// hover:bg-muted rides a native :hover condition INSIDE the trigger
// atom (the corpus precedent — pure color swap, no motion).
//
// Value notes (receipted):
//   - the 1px trigger frame rides --jx-hairline; max-h 72vh is a
//     structural viewport cap (lawful literal);
//   - font-medium (500) has NO weight token — it lands in
//     dropdown-menu.css's .jx-menu-trigger rule, reported as a
//     MISSING step (--jx-weight-medium) for serial promotion;
//   - the press poses' custom-property setters (--jx-press-shadow*)
//     moved to the SAME css rule (custom-property seams are lane-2
//     material — the separator sheet's own "press-physics vars land
//     here" note);
//   - the caret's transition and the item's background/color
//     transition carry motion literals — lane-2 css (motion tokens
//     do not exist yet; the family sheet already owns the item state
//     machines);
//   - the scroll ring's --jx-menu-pad seam + the gutter-compensation
//     max() ride atoms as PLAIN var() strings (the §4.2 idiom).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const dropdownMenuStyles = stylex.create({
  // ── the anchor wrapper ───────────────────────────────────────────
  anchor: { display: 'inline-flex' },
  // ── the default trigger (hover = a pure ground swap) ────────────
  trigger: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    fontFamily: tokens['--jx-font-sans'],
    color: tokens['--jx-foreground'],
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
    },
  },
  // ── the caret wrapper (the flip is css :has() + :popover-open) ──
  caret: {
    flex: 'none',
    display: 'inline-flex',
  },
  // ── the panel's scroll ring ──────────────────────────────────────
  scroll: {
    maxHeight: '72vh',
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',
    padding: 'var(--jx-menu-pad, 4px)',
    paddingInline: 'max(var(--jx-menu-pad, 4px) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
  // ── the menu item body ───────────────────────────────────────────
  item: {
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    alignItems: 'center',
    textAlign: 'left',
    fontFamily: tokens['--jx-font-sans'],
  },
  itemPlain: {
    backgroundColor: 'transparent',
    color: 'inherit',
  },
  itemDestructive: {
    color: tokens['--jx-destructive'],
  },
});
