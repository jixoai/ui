// link.stylex.ts — the link family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the face B2 non-nav lane as the old markup's
// utility strings spelled it — primary text, 4px underline offset,
// underline on hover, the forced-colors LinkText system ink — plus
// the suffix-icon lane's frame (inline-flex, flex-none, the 0.2em
// inline-start gap owning the whole label-to-glyph distance, the
// -0.125em optical baseline shift).
//
// Law mapping (the tier-2 value rule): the ink rides the typed
// primary token; hover and forced-colors ride native pseudo/@media
// blocks INSIDE the atoms (the chip precedent — no JS data-attr);
// the 0.2em gap is em-relative (scales with the ambient scale, the
// no-font-size kinship — no sheet step can express it) and rides the
// promotion seam --link-icon-gap (reported); text-underline-offset
// (4px) and the vertical-align shift are fixed optical geometry the
// census keeps outside the theme families.
//
// Mirror law: this file is byte-identical in registry/files/ui/link/
// and apps/www/src/lib/ui/link/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (separator's
// divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const linkStyles = stylex.create({
  // ── the anchor: the face B2 non-nav lane, standalone ─────────────
  anchor: {
    color: tokens['--jx-primary'],
    textUnderlineOffset: '4px',
    ':hover': {
      textDecorationLine: 'underline',
    },
    '@media (forced-colors: active)': {
      color: 'LinkText',
    },
  },
  // ── the suffix-icon lane (data-jx-link-icon span) ────────────────
  iconLane: {
    marginInlineStart: 'var(--link-icon-gap, 0.2em)',
    display: 'inline-flex',
    flex: 'none',
    verticalAlign: '-0.125em',
  },
});
