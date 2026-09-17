// alert.stylex.ts — the alert family's atom table
// (tailwindless-site Wave 1 batch 3, 2026-09-17).
//
// Source of record: the old markup's utility strings — the banner
// frame (1px border + the hard offset shadow-2xs, the site's terminal
// material law), the variant ladder's surface/title/body ink groups
// (design.md §1 recipes verbatim: outline's structural --jx-outline
// border, tonal's 12%/45% color-mix tint), the × affordance (the
// ghost text glyph, hit-sized), each with its design §6 forced-colors
// degradation (Canvas/CanvasText — the color-mix tints do NOT drop on
// their own, probed r2).
//
// Value law: theme-able slots ride tokens or var() seams — the 15px
// dismiss glyph (no sheet step yet) rides var(--text-body-lg, 0.9375rem),
// the bold weight var(--weight-bold, 700), leading-none
// var(--leading-none, 1) and the body leading var(--leading-155, 1.55)
// (all reported for serial promotion); 13px body text rides the
// ruler's --jx-text-base kernel channel (the pilot's plain var()
// form); 0.08em tracking and 12px block padding ride the existing
// --track-wide / --space-12 steps. Structure (display, hit lanes as
// var() geometry, outline offsets) is lawful literals.
//
// Mirror law: byte-identical in registry/files/ui/alert/ and
// apps/www/src/lib/ui/alert/ (cmp); '../../tokens.stylex' resolves in
// both trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const alertStyles = stylex.create({
  // ── the banner frame: border + hard offset shadow + radius ──
  banner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)',
    boxSizing: 'border-box',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: 'var(--space-12)',
    boxShadow: tokens['--jx-shadow-2xs'],
    borderRadius: tokens['--jx-radius'],
  },

  // ── the variant ladder ──────────────────────────────────────────
  surfaceOutline: {
    backgroundColor: 'transparent',
    borderColor: 'var(--jx-outline)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
    },
  },
  surfaceTonal: {
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)',
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
    },
  },
  // the title consumes the variant ink (the neutral rung keeps the
  // foreground title)
  titleOutline: {
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  titleTonal: {
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  // the BODY consumes the variant ink on the tonal rung (r2 blocker
  // fix: an error banner no longer paints a red title over gray body
  // copy); outline keeps the muted body — the neutral rung's own ink
  // ramp for long copy
  bodyOutline: {
    color: tokens['--jx-muted-foreground'],
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  bodyTonal: {
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },

  // ── the title row: the label voice over the icon lane ──
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-base)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
  },
  iconLane: { display: 'inline-flex' },
  dismissRow: { display: 'flex', justifyContent: 'flex-end' },

  // ── the body copy ──
  bodyText: {
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-155, 1.55)',
  },

  // ── the × affordance: ghost text glyph, hit-sized, inline-end ──
  dismissBtn: {
    flex: 'none',
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    minHeight: 'var(--jx-hit)',
    minWidth: 'var(--jx-hit)',
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-body-lg, 0.9375rem)',
    fontWeight: 'var(--weight-bold, 700)',
    lineHeight: 'var(--leading-none, 1)',
    color: tokens['--jx-muted-foreground'],
    cursor: 'pointer',
    marginInlineStart: 'auto',
    ':hover': { color: tokens['--jx-foreground'] },
    ':focus-visible': {
      outlineWidth: '1px',
      outlineColor: tokens['--jx-ring'],
      outlineOffset: '-1px',
    },
  },
});
