// icon.styles.ts — the icon family's StyleX surface (small by design:
// the family paints currentColor on the svg root; the StyleX-relevant
// part is the reserved box — the dynamic square whose typed idiom is
// the style FACTORY, per spike-report §5.6).
import * as stylex from '@stylexjs/stylex';
export const iconStyles = {
  reserved: {
    k1xSpc: "x1rg5ohu",
    $$css: true
  },
  reservedSize: size => [{
    kzqmXN: size != null ? "x5lhr3w" : size,
    kZKoxP: size != null ? "x16ye13r" : size,
    $$css: true
  }, {
    "--x-width": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(size),
    "--x-height": (val => typeof val === "number" ? val + "px" : val != null ? val : undefined)(size)
  }]
};