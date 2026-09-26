// tags-input.stylex.ts — the tags-input family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the component's former utility strings re-authored
// as static stylex atoms (the separator law). Structural constants
// lawful; theme-able slots ride channels — the density kernel lanes
// as PLAIN var() strings (--jx-gap/--jx-inset/--jx-hit/--jx-row-min/
// --jx-text/--jx-leading), the theme scale through the typed tokens.
//
// Lane split (the placement law): the shell's :has() machines, the ×
// press physics, the suggestion hover, the shake keyframes and the
// reduced-motion kills already live UNLAYERED in tags-input.css (the
// Part A carve-out — stylex tiers nest under components, so the poses
// that override atom paint require the unlayered level); the
// chip/×/row transitions, the shake animation entry, the ::placeholder
// pair and the color-scheme pair join them there.
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - py-1/px-4px steps → --jx-space-4 — EXACT (pe-2 → space-8 too).
//   - rounded-none → 0 (structural zero).
//   - leading-none (the × glyph row) → var(--jx-line) — no unitless-1
//     step exists (reported).
//   - the flash's border-primary is an atom; the shake animation rides
//     the .jx-tags-flash lane rule (keyframes never live in atoms).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const tagsStyles = stylex.create({
  // ── the faceless form bridge: box-tree transparent ──
  bridge: { display: 'contents' },

  // ── the shell: wrapping chip host at hit height (color-scheme pair
  // + the box-shadow transition ride tags-input.css) ──
  shell: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    width: '100%',
    maxWidth: '100%',
    minBlockSize: 'var(--jx-hit)',
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-gap)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
  },
  shellInvalid: { borderStyle: 'dashed' },

  // ── the chip: muted ground, hairline border, row-min height ──
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    minBlockSize: 'var(--jx-row-min)',
    paddingInlineStart: 'var(--jx-inset)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    color: tokens['--jx-foreground'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-leading)',
  },
  // a no-× chip authors its own end inset (the end-padding fix)
  chipFixedEnd: { paddingInlineEnd: tokens['--jx-space-8'] },
  // the duplicate flash: primary border (the shake rides .jx-tags-flash)
  chipFlash: { borderColor: tokens['--jx-primary'] },

  // ── the chip label lane ──
  chipLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // ── the × lane: stretch-hit, chromeless (press physics in css) ──
  remove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minWidth: 'var(--jx-hit)',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    cursor: 'pointer',
  },

  // ── the "N/N tags" cap note ──
  full: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-row-min)',
  },

  // ── the typing input: the chromeless lane (placeholder pair in
  // tags-input.css ::placeholder) ──
  input: {
    flex: '1 1 0%',
    minWidth: 0,
    minBlockSize: 'var(--jx-row-min)',
    padding: 0,
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    color: tokens['--jx-foreground'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-leading)',
  },

  // ── the suggestion panel's scroll ring ──
  scroll: {
    maxHeight: '60vh',
    overflow: 'auto',
    overscrollBehavior: 'contain',
    scrollbarGutter: 'stable both-edges',
    paddingBlock: tokens['--jx-space-4'],
    paddingInline: 'max(4px - var(--jx-scrollbar-thin, 0px), 0px)',
  },
  list: { margin: 0, padding: 0, listStyleType: 'none' },

  // ── the suggestion row (the select option law) ──
  suggestion: {
    paddingInline: 'var(--jx-inset)',
    paddingBlock: 'var(--jx-gap)',
    minBlockSize: 'var(--jx-hit)',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-leading)',
    color: 'color-mix(in oklab, var(--terminal-foreground) 72%, transparent)',
    cursor: 'pointer',
    borderInlineStartWidth: 'calc(var(--jx-unit) / 2)',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'transparent',
  },
  rowActive: {
    backgroundColor: tokens['--jx-terminal-hover'],
    color: tokens['--jx-terminal-foreground'],
  },
  rowAddedEdge: { borderInlineStartColor: tokens['--jx-primary'] },
});
