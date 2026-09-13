// icon.styles.ts — the icon family's StyleX surface (small by design:
// the family paints currentColor on the svg root; the StyleX-relevant
// part is the reserved box — the dynamic square whose typed idiom is
// the style FACTORY, per spike-report §5.6).
import * as stylex from '@stylexjs/stylex';

export const iconStyles = stylex.create({
  // the lazy pending/rejected reserved box — same square as the glyph,
  // SSR/hydration-stable by construction
  reserved: {
    display: 'inline-block',
  },
  // the typed dynamic idiom: a factory compiles to a CSS custom
  // property (--x-size-w) + inline style, degrading gracefully
  reservedSize: (size: string) => ({
    width: size,
    height: size,
  }),
});
