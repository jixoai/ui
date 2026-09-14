// code-card.styles.ts — the readonly code surface, StyleX side.
//
// Source intent: card frame (muted-mix ground, hairline border), head
// (meta-tint band, filename + uppercase lang label), the <pre> AS the
// scrollport (horizontal always; vertical under maxHeight caps; the
// scrollbar-gutter compensation recipe), the veil host (edge fades
// gated on live scroll state — subtraction ink, backdrop contrast),
// foot band with the copy control. fill mode stretches the card and
// hands the whole body height to the pre.
//
// The veils' data-flag gating re-expresses as CONDITIONAL CLASSES from
// JS state (the state→class tax — the css attr-presence selector
// [data-hscroll-start] is not a StyleX construct).
// print: the print-whitelist behavior (display/overflow/maxHeight)
// rides '@media print' conditions — expressible.
import * as stylex from '@stylexjs/stylex';
export const codeCardStyles = {
  card: {
    kogj98: "x1ghz6dp",
    k7Eaqz: "xeuugli",
    kWkggS: "x10g96x4",
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x3qsdy5",
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kgBpGs: "xbjcvb9",
    $$css: true
  },
  cardFill: {
    kZKoxP: "x5yr21d",
    $$css: true
  },
  head: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kOIVth: "x8233eu",
    k7Eaqz: "xeuugli",
    kg3NbH: "x1ryrjj2",
    k8WAf4: "x1f1z27m",
    kGuDYH: "x1j6dyjg",
    kb6lSQ: "x9pfba7",
    kWkggS: "xpzske6",
    kt9PQ7: "xso031l",
    kfdmCh: "x1q0q8m5",
    kL6WhQ: "xb2d4eo",
    kMwMTN: "x1ym7tfx",
    $$css: true
  },
  file: {
    kMv6JI: "x1bjkxns",
    kVQacm: "xb3r6kr",
    kg5iWk: "xlyipyv",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  side: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    koQZXg: "x8x9d4c",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  lang: {
    kb6lSQ: "x1labic3",
    kSiTet: "x18km98s",
    kP9fke: "xtvhhri",
    khDVqt: "xuxw1ft",
    $$css: true
  },
  scrollWrap: {
    kVAEAm: "x1n2onr6",
    k7Eaqz: "xeuugli",
    $$css: true
  },
  scrollWrapFill: {
    k1xSpc: "x78zum5",
    kUk6DE: "x98rzlu",
    kAzted: "x2lwn1j",
    kXwgrk: "xdt5ytf",
    $$css: true
  },
  pre: {
    kogj98: "x1ghz6dp",
    kMv6JI: "xpw0y0u",
    kGuDYH: "x1ct8sxb",
    kLWn49: "x1dbl2gt",
    kMwMTN: "xni05rx",
    kXHlph: "xw2csxc",
    kORKVm: "xryxfnj",
    kvh3hx: "x7p5m3t",
    kZ7BSC: "xliy32w",
    k8WAf4: "x142x9wm",
    kg3NbH: "x7hf3t",
    kKi2Bq: "x1k5ss6i",
    k3Woio: "xybh4k3",
    kiEn40: "x1bqaal",
    kaoPzB: "x1hhue18",
    $$css: true
  },
  vscroll: {
    kORKVm: "x1odjw0f",
    $$css: true
  },
  preFill: {
    kUk6DE: "x98rzlu",
    kAzted: "x2lwn1j",
    kORKVm: "x1odjw0f",
    $$css: true
  },
  veilStart: {
    kgeoSG: "x10tli2e",
    kEoFBp: "x1hmns74",
    kGOzcv: "x1nc033x",
    kSJ0CW: "x1682cnc",
    kOlAkY: "x12s5fzi",
    km8f2m: "xkk1bqk",
    k5QlbN: "x124lp2h",
    k7KCAZ: "x1de4urk",
    kKXxxB: "x13o46a3",
    kqUdNP: "xy5ulmt",
    klC6Y0: "xxlzmds",
    kFbLEI: "xp6epc3",
    k3DiCg: "xdr5qw3",
    kkS91: "x12udz3x",
    kFJNpz: "x1w1d2iz",
    $$css: true
  },
  veilEnd: {
    k5JduY: "x100rkj9",
    kwXMNM: "x1j6awrg",
    kSy8m5: "xd54j2p",
    kH8aOt: "x1unh1gc",
    kkgrvl: "xsfccug",
    kloYau: "x2q1x1w",
    kypkao: "xmf22ne",
    kRicXK: "x1hbq0ec",
    kPNhGg: "x7l6x83",
    kA8PQs: "x11yo84x",
    kR8tOf: "x12ip6w2",
    kxzRJW: "x3sh4h5",
    kNctxI: "x13rawyw",
    kDoRe: "xtveyhk",
    kRqWEK: "x15k16ov",
    $$css: true
  },
  veilStartOn: {
    k5QlbN: "xfbg1o9",
    $$css: true
  },
  veilEndOn: {
    kypkao: "x1rw2j67",
    $$css: true
  },
  veilReducedMotion: {
    kd3yIV: "x13sdc92",
    kkXreq: "x4oqjru",
    $$css: true
  },
  foot: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    kjj79g: "x1qughib",
    kOIVth: "x8233eu",
    kAzted: "x1a5yqsw",
    kLKAdn: "x30hkwx",
    kGO01o: "xe0cj4x",
    kZCmMZ: "x1m83qfk",
    kwRFfy: "xqfkjy8",
    kEafiO: "x178xt8z",
    kPef9Z: "x13fuv20",
    kLZC3w: "x7n9ejg",
    $$css: true
  },
  footSide: {
    k1xSpc: "x78zum5",
    kGNEyG: "x6s0dn4",
    k7Eaqz: "xeuugli",
    $$css: true
  }
};