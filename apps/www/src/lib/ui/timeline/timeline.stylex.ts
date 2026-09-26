// timeline.stylex.ts — the timeline family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the drawn-spine engine's part-level utility
// strings (W3 rework, 2026-09-15): the semantic ol's UA reset, the
// content column's stack at the --jx-stack rhythm, the li's min-width
// floor, the time voice (mono, the secondary density pair, muted ink),
// and the title voice (font-nav, the base density pair, 0.08em wide
// tracking, uppercase). The spine geometry (stroke weights, JOINT-LAP,
// butt caps, lane tracks), the dot's svg paint, and every state law
// stay timeline.css keyed on the data-jx-tl-* hooks — FROZEN (r4–r6);
// no atom shares a property with any of it.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — the nav/mono fonts, the muted ink, 0.08em
// track-wide, and the --jx-text/--jx-line + secondary density channel
// pairs (kernel channels the typed map never wraps); geometry (UA
// resets, flex stack, min-width) is structural.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// timeline/ and apps/www/src/lib/ui/timeline/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const timelineStyles = stylex.create({
  // ── the semantic ol: the UA list chrome reset ──
  list: { margin: 0, padding: 0, listStyleType: 'none' },
  // ── the li: the subgrid tenant's min-width floor ──
  item: { minWidth: 0 },
  // ── the content column: stack at the family's block rhythm ──
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-stack)',
    minWidth: 0,
  },
  // ── the time voice: mono secondary, muted ink ──
  time: {
    margin: 0,
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the title voice: the nav eyebrow on the base pair ──
  title: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    letterSpacing: 'var(--track-wide)',
    textTransform: 'uppercase',
  },
});
