// sheet.stylex.ts — the sheet family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): the frame resets, the edge docking
// margins, the docked-axis geometry, the title row and the body
// stack became static longhand atoms. The animation state machine
// stays class-hooked (sheet.css keys .jx-sheet-{side}[open]/.closing
// — those hook classes stay in the static class part).
//
// Value notes (receipted):
//   - the sheet's 18px drawer rhythm (px-[1.125rem]) and the 14px
//     block beat (py-3.5) have NO steps — calc(var(--jx-unit) * 4.5 /
//     3.5) keep the exact tuned values on the ruler's physics,
//     reported as MISSING steps (--space-18 / --space-14) for serial
//     promotion;
//   - the title voice is the pilot's kernel channel set verbatim:
//     var(--jx-text-base) (13px) + the wide tracking × 1.5 (0.12em);
//   - the dvh/vw geometry and the min(var(--jx-sheet-size), 92vw)
//     cap are structural measures (lawful literals; the size seam
//     stays the family's own custom property).
//
// Lane-2 residue (sheet.css): the x-glyph descendant boundary, the
// slide state machine + keyframes + ::backdrop, and the body-cell
// rhythm override (the former !px/!py/!text utilities — same
// !important semantics, keyed on .jx-sheet-body-cell).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const sheetStyles = stylex.create({
  // ── the dialog frame: UA resets + popover ink ───────────────────
  frame: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    margin: 0,
    padding: 0,
    borderRadius: 'none',
    color: tokens['--jx-popover-foreground'],
  },
  // ── edge docking: the auto margin hugs the panel to its edge ────
  dockLeft: { marginRight: 'auto' },
  dockRight: { marginLeft: 'auto' },
  dockTop: { marginBottom: 'auto' },
  dockBottom: { marginTop: 'auto' },
  // ── the docked axis geometry ─────────────────────────────────────
  axisSide: {
    height: '100dvh',
    width: 'min(var(--jx-sheet-size), 92vw)',
    maxHeight: 'none',
  },
  axisEdge: {
    width: '100vw',
    maxWidth: '100vw',
    maxHeight: '85dvh',
  },
  // ── the side-drawer height chain (surface + sticker host) ───────
  fill: { height: '100%' },
  // ── the head band's title row ────────────────────────────────────
  titleRow: {
    display: 'flex',
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    paddingInline: 'calc(var(--jx-unit) * 4.5)',
    paddingBlock: 'calc(var(--jx-unit) * 3.5)',
  },
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-base)',
    letterSpacing: 'calc(var(--track-wide) * 1.5)',
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
  },
  headExtra: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    minWidth: 0,
  },
  // ── the body stack ───────────────────────────────────────────────
  bodyStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-16'],
  },
});
