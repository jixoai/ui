// density-demo.stylex.ts — the density-demo's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// SITE-ONLY face (www side; no registry twin): the multi-scope demo's
// utility strings — the side-by-side scope row at the --jx-gap rhythm,
// the equal-share cells floored at 200px (the ruler equation — 50
// units), the scope label's eyebrow voice (font-nav, secondary text,
// 0.14em track-14, uppercase, the --jx-stack block offset), and the
// [data-density] scope box's half-strength hairline frame at the
// --jx-inset padding.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel channels ONLY — the nav font, the muted ink, the track-14
// step, the border role's 50% color-mix, and the --jx-gap/--jx-stack/
// --jx-inset density kernel channels; geometry (flex wrap, the 1 1 0%
// share, the 200px floor as calc(var(--jx-unit) * 50)) is structural.
//
// No mirror law (site-only identity): this module lives on the www
// side alone; the tokens import '../../tokens.stylex' resolves there.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const densityDemoStyles = stylex.create({
  // ── the scope row: side-by-side rungs at the gap rhythm ──
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--jx-gap)',
  },
  // ── the equal-share cell, floored so four rungs stay readable ──
  // (the basis RIDES the floor: at narrow shells a 0% basis let all
  // four cells share one line — wrap armed but never triggered, the
  // floored min-widths then panned the shell 900px-wide. Equal basis +
  // equal grow keeps the desktop result identical; the finale sweep's
  // input-otp finding)
  cell: {
    flex: '1 1 calc(var(--jx-unit) * 50)',
    minWidth: 'calc(var(--jx-unit) * 50)',
  },
  // ── the scope label: the eyebrow voice ──
  label: {
    display: 'block',
    fontFamily: tokens['--jx-font-nav'],
    marginBottom: 'var(--jx-stack)',
    fontSize: 'var(--jx-text-secondary)',
    letterSpacing: tokens['--jx-track-14'],
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the [data-density] scope box: half-strength frame at the
  //    ambient inset ──
  scopeBox: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    padding: 'var(--jx-inset)',
    // a rung's child can be intrinsically wider than the floored cell
    // (input-otp's slot row at lg ≈ 900px — slots are hit-floored and
    // cannot shrink); the box scrolls its content instead of panning
    // the shell (the finale sweep's finding)
    overflowX: 'auto',
  },
});
