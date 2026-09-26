// demo.stylex.ts — the corpus dogfood chrome (stylex-kernel phase 0,
// P0.6).
//
// Source of record: the research spike's demo chrome (spike/corpus/
// src/demo.stylex.ts) — the corpus demo's page scaffolding, NOT any
// family's visual intent (the spike authored it StyleX-style "so the
// whole demo rides one engine"). The dogfood re-authors it for the
// same reason: the spike's compiled artifact carries the chrome's
// atoms, so the corpus comparison needs both sides to carry them.
//
// Law mapping: theme refs (muted-foreground/border/card/foreground/
// muted) ride the typed token layer. Divergences vs the spike
// artifact (receipted): typed var indirection only.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const demo = stylex.create({
  page: {
    maxWidth: '880px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
  },
  note: {
    fontSize: '11.5px',
    lineHeight: 1.6,
    color: tokens['--jx-muted-foreground'],
    margin: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },
  sectionTitle: {
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
    margin: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  ground: {
    // a mid-tone ground for the subtraction-ink families (separator,
    // code-card veils): the ink laws are ground-adaptive BY DESIGN
    backgroundImage:
      'linear-gradient(90deg, oklch(0.15 0.05 300), oklch(0.85 0.05 300))',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  nav: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
  },
  navLink: {
    fontSize: '12px',
    color: tokens['--jx-foreground'],
    textDecoration: 'none',
    padding: '2px 6px',
  },
  toggleRow: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '12px',
  },
  miniButton: {
    fontSize: '11px',
    padding: '2px 8px',
    cursor: 'pointer',
    backgroundColor: tokens['--jx-muted'],
    color: tokens['--jx-foreground'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
});
