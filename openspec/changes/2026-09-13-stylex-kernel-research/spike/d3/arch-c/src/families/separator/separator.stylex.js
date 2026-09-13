// separator.styles.ts — the subtraction-ink law re-authored in StyleX.
//
// Source intent (registry/files/ui/separator/): ONE ink, two engines:
// the contrast ghost (backdrop-filter: contrast(0.5) — the backdrop's
// own tonal shift, zero color tokens) with MASK geometries over it
// (dashed 6/4, dense 3/3, dotted chain, svg wave), the blend engine
// for fade (alpha-ramped white under mix-blend-mode: difference), and
// the one additive exception solid (var(--border), ghost OFF).
// Orientation swaps the mask axis. EVERYTHING here is StyleX-
// expressible as string values — backdrop-filter, mask-image (with
// the -webkit- twin via firstThatWorks), mix-blend-mode are ordinary
// properties to StyleX.
//
// EXPRESSIBILITY NOTE (recorded): the source rides :where() so
// consumer utilities always win (zero specificity). StyleX classes
// are ordinary (0,1,0); the "consumer wins" discipline moves from
// cascade specificity to stylex() merge order — a semantic shift, not
// a capability loss (details in corpus-report).
import * as stylex from '@stylexjs/stylex';
const GRAD = (deg, on, off) => `repeating-linear-gradient(${deg}deg, #000 0 ${on}px, transparent ${on}px ${off}px)`;
export const separatorStyles = {
  horizontal: {
    kzqmXN: "xh8yej3",
    kZKoxP: "xjm9jq1",
    k6WDB: "x1s3qnfn",
    keRtuK: "xbzouxq",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    $$css: true
  },
  vertical: {
    kzqmXN: "x1i1rx1s",
    kSGwAc: "xkh2ocl",
    kUk6DE: "x1okw0bk",
    k6WDB: "x1s3qnfn",
    keRtuK: "xbzouxq",
    $$css: true
  },
  solidHorizontal: {
    k6WDB: "x1t853zo",
    kWkggS: "xms2ikn",
    $$css: true
  },
  solidVertical: {
    k6WDB: "x1t853zo",
    kWkggS: "xms2ikn",
    $$css: true
  },
  dashedH: {
    kX1K2I: "x1ycxmf",
    kAExgp: "xxg92ui",
    $$css: true
  },
  dashedV: {
    kX1K2I: "x130xnox",
    kAExgp: "x1mauu7a",
    $$css: true
  },
  denseH: {
    kX1K2I: "xdm3r4a",
    kAExgp: "x1n3fem5",
    $$css: true
  },
  denseV: {
    kX1K2I: "x3q4nmu",
    kAExgp: "x1fb04h1",
    $$css: true
  },
  dottedH: {
    kZKoxP: "x36qwtl",
    kX1K2I: "xzw1ypj",
    kAExgp: "x5cpf72",
    kn1fP1: "xsbdu3q",
    kRUf43: "x1pf8epq",
    kJcbqH: "x1wsrsg2",
    kucrf1: "x1wix2xn",
    $$css: true
  },
  dottedV: {
    kzqmXN: "xfo62xy",
    kX1K2I: "xzw1ypj",
    kAExgp: "x5cpf72",
    kn1fP1: "xhxtcz0",
    kRUf43: "x1a1638o",
    kJcbqH: "xcljghj",
    kucrf1: "xi0he60",
    $$css: true
  },
  wavyH: {
    kZKoxP: "xols6we",
    kX1K2I: "x1uv594n",
    kAExgp: "x1is8714",
    kn1fP1: "x3d3ze",
    kRUf43: "xrqyqz2",
    kJcbqH: "x1wsrsg2",
    kucrf1: "x1wix2xn",
    $$css: true
  },
  wavyV: {
    kzqmXN: "x1v4s8kt",
    kX1K2I: "xwrgzkm",
    kAExgp: "x1tmcpx8",
    kn1fP1: "x1j3x0ap",
    kRUf43: "x8x7f8w",
    kJcbqH: "xcljghj",
    kucrf1: "xi0he60",
    $$css: true
  },
  fadeH: {
    k6WDB: "x1t853zo",
    kKwaWg: "x1go0ci8",
    k9M9Na: "x6176g0",
    $$css: true
  },
  fadeV: {
    k6WDB: "x1t853zo",
    kKwaWg: "xm93v8h",
    k9M9Na: "x6176g0",
    $$css: true
  }
};