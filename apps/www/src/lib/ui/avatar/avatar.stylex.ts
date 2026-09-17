// avatar.stylex.ts — the avatar family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): structural utilities became static
// longhand atoms; theme-able values ride the typed token layer or
// the context seams as PLAIN var() strings. The md size keeps its
// context seam verbatim (--jx-avatar-md, the list-item media host's
// derived square; fallback 2rem).
//
// Value notes (receipted):
//   - the 1px frame rides --jx-hairline (tier-2: borderWidth
//     literals are red);
//   - the fallback's text-xs maps to the --text-label-lg step
//     (0.75rem — the existing step IS the value; the avatar
//     initials join the control-label voice);
//   - the 0.06em tracking derives from the typed wide step
//     (0.08em × 0.75) — reported as a MISSING step for serial
//     promotion;
//   - the fallback's bg-muted overrides the frame's bg-card by
//     ATOM ORDER (fallbackPosture is created after frame — the
//     engine's own emission order, the separator's size-override
//     law).
//
// Lane-2 residue: the SILHOUETTE geometry lives in avatar.css —
// corner-shape + the scaled bevel radii and the 50% circle are
// keyed on the family's own data contract (data-jx-avatar-variant
// × data-jx-avatar), not the class channel.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const avatarStyles = stylex.create({
  // ── the shared frame (img and initials block alike) ──────────────
  frame: {
    flex: 'none',
    boxSizing: 'border-box',
    objectFit: 'cover',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    color: tokens['--jx-muted-foreground'],
  },
  // ── sizes: one geometry prop, sm 24 · md 32 (context-owned) · lg 40 ──
  sizeSm: { width: '1.5rem', height: '1.5rem' },
  sizeMd: { width: 'var(--jx-avatar-md, 2rem)', height: 'var(--jx-avatar-md, 2rem)' },
  sizeLg: { width: '2.5rem', height: '2.5rem' },
  // ── the img posture ──────────────────────────────────────────────
  imgPosture: { display: 'inline-block' },
  // ── the initials fallback (created AFTER frame: its ground wins) ──
  fallbackPosture: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens['--jx-muted'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: 'calc(var(--track-wide) * 0.75)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});
