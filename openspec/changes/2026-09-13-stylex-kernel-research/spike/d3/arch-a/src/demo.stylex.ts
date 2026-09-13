// demo.styles.ts — the corpus demo chrome (page scaffolding, NOT any
// family's visual intent). StyleX-authored like the families so the
// whole demo rides one engine.
import * as stylex from '@stylexjs/stylex';

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
    color: 'var(--muted-foreground)',
    margin: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--card)',
  },
  sectionTitle: {
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
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
    borderBottomColor: 'var(--border)',
  },
  navLink: {
    fontSize: '12px',
    color: 'var(--foreground)',
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
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
  },
});
