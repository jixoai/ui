// steps.stylex.ts — the steps family's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the family carried since
// the 2026-09-01 state-vocabulary rebuild. GEOMETRY only: the nine
// marker PAINT rungs (border/bg/ink pairs + the emphasis halo ring +
// disabled's dashed contrast cut + done's hover) are NOT atoms —
// they ride steps.css keyed on the li's data-jx-step state, the
// family's own connector-repaint law (a state rule must own its
// properties outright: the atom tier — components.stylex, later in
// the F9 order — would shade any lane-2 state rule it shared a
// property with; that is also why the marker's border-STYLE lives in
// the css geometry rule, not here — disabled flips it to dashed).
//
// Indicator geometry is behavior (the connector's center-line math
// in steps.css reads var(--jx-icon) from the same channels): width/
// height ride the density media-icon channel verbatim; the secondary
// text/line channels pair as everywhere in the corpus.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const stepsStyles = stylex.create({
  // ── the root list ──
  root: { display: 'flex', flexWrap: 'wrap' },
  // ── the li: shares the row, keeps a readable floor ──
  item: { flex: '1 1 0%', minWidth: '9rem' },
  // the AT-readable status line — hidden from the eye (the v4 clip
  // recipe; structural geometry)
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  // ── the marker cell (spans both body rows) — paint rides the css ──
  marker: {
    flex: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'var(--jx-icon)',
    height: 'var(--jx-icon)',
    borderWidth: tokens['--jx-hairline'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
  },
  // the interactive done form only (span form stays inert)
  markerButton: { cursor: 'pointer' },
  // ── the title (state ink picked by the Item's context read) ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
  },
  titleCurrent: { color: tokens['--jx-foreground'] },
  titleRest: { color: tokens['--jx-muted-foreground'] },
  // ── the description ──
  description: {
    fontSize: 'var(--jx-text-secondary)',
    lineHeight: 'var(--jx-line-secondary)',
    color: tokens['--jx-muted-foreground'],
    opacity: 0.8,
  },
  // ── the connector lane ──
  separator: { pointerEvents: 'none' },
});
