// prose.styles.ts — the reading-region provider's HOST lane.
//
// Source intent: <Prose> resolves 11 knobs, emits ONLY-SET inheritance
// declarations + --jx-ty-* var mirrors + presence attrs; the
// descendant lanes ride the residue css. In StyleX terms: the STATIC
// enums (family/ink/ground/align/wrap/hyphens) compile to classes;
// the free-form CssLength knobs (size) ride the typed FACTORY idiom;
// the var mirrors + presence attrs stay inline/attrs (the source's
// own inline-style emission — same channel, no regression).
import * as stylex from '@stylexjs/stylex';
export const proseStyles = {
  host: {
    kMv6JI: "xhtk421",
    kLWn49: "x1dbl2gt",
    $$css: true
  },
  familyMono: {
    kMv6JI: "xpw0y0u",
    $$css: true
  },
  familySerif: {
    kMv6JI: "xv4si4x",
    $$css: true
  },
  inkMuted: {
    kMwMTN: "xrvchh",
    $$css: true
  },
  inkPrimary: {
    kMwMTN: "xzwifym",
    $$css: true
  },
  inkDestructive: {
    kMwMTN: "x19150mw",
    $$css: true
  },
  groundBackground: {
    kWkggS: "x11gw9ax",
    $$css: true
  },
  groundCard: {
    kWkggS: "x1ep7253",
    $$css: true
  },
  groundPopover: {
    kWkggS: "xqy2nev",
    $$css: true
  },
  groundMuted: {
    kWkggS: "xuhz2es",
    $$css: true
  },
  groundSecondary: {
    kWkggS: "x1ut2sa4",
    $$css: true
  },
  groundAccent: {
    kWkggS: "xwnonoy",
    $$css: true
  },
  groundTransparent: {
    kWkggS: "xjbqb8w",
    $$css: true
  },
  alignCenter: {
    k9WMMc: "x2b8uid",
    $$css: true
  },
  alignEnd: {
    k9WMMc: "xp4054r",
    $$css: true
  },
  alignJustify: {
    k9WMMc: "xmw9mke",
    $$css: true
  },
  wrapPretty: {
    kN2L0X: "x1fzhlzt",
    $$css: true
  },
  wrapBalance: {
    kN2L0X: "x1w2vvpw",
    $$css: true
  },
  wrapStable: {
    kN2L0X: "x1yjdo0r",
    $$css: true
  },
  hyphensAuto: {
    kE4Cay: "xkjl1po",
    $$css: true
  },
  hyphensNone: {
    kE4Cay: "xuix1fa",
    $$css: true
  },
  hyphensManual: {
    kE4Cay: "xxydokm",
    $$css: true
  }
};