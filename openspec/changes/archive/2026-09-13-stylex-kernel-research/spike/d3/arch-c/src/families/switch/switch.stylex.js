// switch.styles.ts — the jx-html-switch law re-authored in StyleX.
//
// Source intent (registry/files/ui/toggle + jixoai.css:1598-1660): ONE
// input[role=switch], no track/knob spans — the ::before IS the knob;
// transform travel translateX(width − track); inset ring shadow; hover
// ring on unchecked; :checked flips ground to primary + knob to
// primary-foreground; focus-visible outline −1px; disabled 0.5.
// Geometry rides density vars (--jx-toggle-track/width/knob derive
// from --jx-line — the ambient density scope flows by inheritance).
//
// EXPRESSIBILITY: the whole state machine is StyleX-expressible —
// ':checked', ':hover', ':not', ':focus-visible', ':disabled' and
// ':checked::before' chains are all supported pseudo syntaxes on the
// pinned set. The bezier transition strings pass verbatim.
import * as stylex from '@stylexjs/stylex';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const switchStyles = {
  label: {
    kGuDYH: "xxguibh",
    kLWn49: "xn212u0",
    kMwMTN: "x11jfisy",
    $$css: true
  },
  track: {
    kysU6D: "xjyslct",
    k3lkva: "x1lugfcp",
    kB7OPa: "x9f619",
    kVAEAm: "x1n2onr6",
    kzqmXN: "x62ywxn",
    kZKoxP: "xo805f9",
    kogj98: "x1ghz6dp",
    kUk6DE: "x1okw0bk",
    kmVPX3: "x1w89k0k",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    kGVxlE: "x1912r8m",
    kaIpWk: "xtkphhm",
    kWkggS: "xuhz2es",
    kkrTdU: "x1ypdohk",
    kmkexE: "x6y0dih",
    kaV37T: "x19z9sk5",
    kQ3NqR: "x1bww20j",
    k3Woio: "x114y1c1",
    kiEn40: "xy9f4xx",
    kWCcOm: "xijokvz",
    kYPGJ8: "x1s07b3s",
    $$css: true
  },
  knob: {
    kgeoSG: "x10tli2e",
    kEoFBp: "x1hmns74",
    kQmYQc: "xtql2tq",
    kGOzcv: "x1qzzs4r",
    kSJ0CW: "x1yyf8ht",
    kOlAkY: "x10kowwv",
    kgzTxl: "x101mhmm",
    kPB484: "x1ql9qlr",
    k5Ohv7: "xz8fyzm",
    kj4x2v: "x1fo1fc9",
    kfXFYZ: "xefkghh",
    kLkRvE: "x335uk2",
    kcTAPf: "x1458kei",
    k2g4ti: "x1v6rcj3",
    kEz2qb: "xsnaal3",
    kZVgdj: "x1utro9o",
    kJA4h5: "x9kvfbb",
    k707sr: "x1fgujza",
    $$css: true
  }
};