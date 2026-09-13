// press-button.styles.ts — the press law + the variant ladder,
// re-authored in StyleX.
//
// Source intent (registry/files/ui/press-button + jixoai.css .jx-press):
//   - press physics: hover grows ONLY the shadow; active presses the
//     body +1px (translate) while the shadow's offsets counter-shrink
//     (the *-press poses) — the shadow paint stays anchored;
//   - pose opting through FOUR custom-property seams (--jx-press-shadow/
//     -hover/-active/--jx-press-move) — re-expressed here as a
//     defineVars CONTRACT with createTheme override classes (the
//     idiomatic StyleX replacement for TW arbitrary-property setters
//     like [--jx-press-shadow:none]);
//   - the variant ladder (fill/tonal/outline/ghost/link) supplies all
//     paint channels itself — no two same-property utilities meet;
//   - semantic hue = INJECTION through --jx-fill/--jx-fill-ink/
//     --jx-tonal/--jx-outline, never a variant;
//   - forced-colors degradations per rung; focus 2px Highlight in fc.
//
// Shorthand law: everything LONGHAND (background/border shorthands are
// compile errors under propertyValidationMode 'throw' — spike §5.3).
import * as stylex from '@stylexjs/stylex';

// ── the pose contract: four seams, convex defaults ─────────────────
export const pressPoseVars = {
  "--jx-press-shadow": "var(--jx-press-shadow)",
  "--jx-press-shadow-hover": "var(--jx-press-shadow-hover)",
  "--jx-press-shadow-active": "var(--jx-press-shadow-active)",
  "--jx-press-move": "var(--jx-press-move)",
  __varGroupHash__: "x1ae9fy0"
};

// flat texture (raised={false}): no shadows, engrave-tier inset alone,
// body never moves
export const flatPose = {
  x1ae9fy0: "x1ldno3o x1ae9fy0",
  $$css: true
};

// ghost's none-trio (keeps the bare +1px press)
export const ghostPose = {
  x1ae9fy0: "x1n1jzgs x1ae9fy0",
  $$css: true
};

// ── the hue contract: injection slots with theme-token defaults ────
export const hueVars = {
  "--jx-fill": "var(--jx-fill)",
  "--jx-fill-ink": "var(--jx-fill-ink)",
  "--jx-tonal": "var(--jx-tonal)",
  "--jx-outline": "var(--jx-outline)",
  __varGroupHash__: "x13bcgva"
};

// jx-pair-destructive: fill WITH its ink, ONE class
export const destructivePair = {
  x13bcgva: "x1d326p7 x13bcgva",
  $$css: true
};

// jx-hue-success (the copied transient's tonal)
export const successHue = {
  x13bcgva: "x9qx8o2 x13bcgva",
  $$css: true
};

// the loading spinner's frame keyframes (the spin family's bracket
// cursor, inlined — registry items stay dependency-free)
const spinFrames = "xfeh6hy-B";
export const pressButtonStyles = {
  base: {
    k1xSpc: "x3nfvp2",
    kAzted: "x1bhj078",
    kGNEyG: "x6s0dn4",
    kMv6JI: "xhtk421",
    kGuDYH: "xxguibh",
    kLWn49: "xn212u0",
    k63SB2: "xk50ysn",
    kB7OPa: "x9f619",
    kGVxlE: "xbrdurs",
    kmkexE: "xnroaok",
    kwh8RV: "x18oaz0e",
    kHWfUb: "x181jbsp",
    kSCi1o: "x1mz70g8",
    k3Woio: "x1xtu34k",
    kiEn40: "x7s97pk",
    kJA4h5: "x9kvfbb",
    $$css: true
  },
  textBody: {
    kOIVth: "xiouwu1",
    kg3NbH: "xwwigjq",
    $$css: true
  },
  squareBody: {
    k7Eaqz: "xu9qwbo",
    kjj79g: "xl56j7k",
    $$css: true
  },
  frame: {
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    $$css: true
  },
  fill: {
    kWkggS: "x1wy2m0j",
    kVAM5u: "xugmw4y",
    kMwMTN: "x1n85tha",
    kO6drA: "xnwy5bs",
    kFGkbq: "x1ylmb6m",
    kNwZLq: "x1ggml12",
    $$css: true
  },
  tonal: {
    kWkggS: "xf1wjqb",
    kVAM5u: "xvjspsj",
    kMwMTN: "xzbs2vq",
    kO6drA: "x9yvj25",
    kFGkbq: "x1w1tqly",
    kNwZLq: "xs5hli",
    $$css: true
  },
  outline: {
    kWkggS: "xjbqb8w",
    kVAM5u: "xg9oa76",
    kMwMTN: "x11jfisy",
    kGzVvX: "x18a98v2",
    kO6drA: "x9yvj25",
    kFGkbq: "x1w1tqly",
    kNwZLq: "xs5hli",
    $$css: true
  },
  ghost: {
    kWkggS: "xjbqb8w",
    kVAM5u: "x9r1u3d",
    kMwMTN: "x11jfisy",
    kGzVvX: "x18a98v2",
    kDPRdz: "x1py0k6j",
    kO6drA: "x1qbsd4u",
    kFGkbq: "x16rn130",
    kNwZLq: "xs5hli",
    k6utGk: "x1tvaz0g",
    kueq0M: "xme02mz",
    $$css: true
  },
  link: {
    kMwMTN: "xzwifym",
    kMnn75: "xkrqix3",
    kNySMw: "x1kuah0p",
    kcSHmL: "x3pynha",
    kdSwXR: "x1sur9pj",
    kNwZLq: "x1ljrylj",
    $$css: true
  },
  flatActiveTint: {
    kBHRg1: "x9jfcoq",
    kC0Cxm: "x1yqlv2b",
    kq36bc: "x117h8l",
    kFThYJ: "x1oyek6m",
    kL0o85: "x18y30we",
    kOUZDe: "x198b5v",
    kozTuX: "xcshi6i",
    k5sR2y: "x1xzl2b1",
    kSGFkf: "x1xqyx04",
    kcBH7m: "xhv4qot",
    kCgujz: "xtbvb47",
    kazuLy: "x3t03n0",
    k4htRg: "xrjd2uv",
    $$css: true
  },
  flatHost: {
    kVAEAm: "x1n2onr6",
    $$css: true
  },
  spinnerWrap: {
    k1xSpc: "x3nfvp2",
    kGNEyG: "x6s0dn4",
    kMv6JI: "xpw0y0u",
    kMwMTN: "xzwifym",
    $$css: true
  },
  spinnerFrames: {
    kVAEAm: "x1n2onr6",
    k1xSpc: "xwz0xwf",
    kzqmXN: "xayc3bl",
    k9WMMc: "x2b8uid",
    kXLuUW: "x3ajldb",
    $$css: true
  },
  spinnerFrame: {
    kKX8nH: "x1j61x8r",
    k1lYIM: "x1agbcgv",
    kEXP64: "xcrlgei",
    kKVMdj: "x1ief7js",
    k44tkh: "xemfg65",
    kyAemX: "x1nxgg22",
    ko0y90: "xa4qsjk",
    kjO2d4: "x1aquc0h",
    $$css: true
  },
  frameVisible: {
    k33iCy: "xnpuxes",
    $$css: true
  },
  frameHidden: {
    k33iCy: "xlshs6z",
    $$css: true
  },
  delay200: {
    kKxzle: "x1t83zlg",
    $$css: true
  },
  delay400: {
    kKxzle: "x1xwhvez",
    $$css: true
  },
  delay600: {
    kKxzle: "x1nrwgbl",
    $$css: true
  },
  checkGlyph: {
    k1xSpc: "x3nfvp2",
    kUk6DE: "x1okw0bk",
    kGNEyG: "x6s0dn4",
    kMwMTN: "xzwifym",
    $$css: true
  }
};