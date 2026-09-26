// popover.styles.ts — the floating-surface family's StyleX side:
// trigger button paint, caret, surface body/shadow/scroll ring.
//
// Source intent: the default trigger is a bordered jx-press button
// with muted hover + a chevron caret that flips via the css residue's
// :has(:popover-open) rule (the flip itself stays css — :has over a
// SIBLING selector is not a StyleX construct). The panel body is THE
// SURFACE: variant fill (solid | acrylic 72%+blur | auto), 1px border;
// the shadow child carries the fixed backdrop treatment; the scroll
// ring owns overflow + padding (never the body).
//
// OUT OF SCOPE (recorded): the WAAPI motion kernel (surface-motion.ts
// 204 LOC + the declarative @property --jx-p formulas) — runtime
// animation, not authoring surface; the panel rests at the open pose.
import * as stylex from '@stylexjs/stylex';
export const popoverStyles = {
  anchor: {
    k1xSpc: "x3nfvp2",
    $$css: true
  },
  trigger: {
    k1xSpc: "x3nfvp2",
    kkrTdU: "x1ypdohk",
    kGNEyG: "x6s0dn4",
    kOIVth: "xb6y1gh",
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x1io3bm2",
    kWkggS: "x11gw9ax",
    kg3NbH: "x13s4r1c",
    k8WAf4: "x13eudtd",
    kMv6JI: "xhtk421",
    kGuDYH: "xkpwil5",
    k63SB2: "xk50ysn",
    kMwMTN: "x11jfisy",
    kGVxlE: "xkrwg70",
    kmkexE: "xnroaok",
    kGzVvX: "x1qxz5y",
    kwh8RV: "xfzc84r",
    kHWfUb: "xym9jgt",
    kSCi1o: "x1lnxkn6",
    k3Woio: "x1xtu34k",
    kiEn40: "x7s97pk",
    kJA4h5: "x9kvfbb",
    $$css: true
  },
  caret: {
    k1xSpc: "x3nfvp2",
    kUk6DE: "x1okw0bk",
    k1ekBW: "x11xpdln",
    kIyJzY: "xx6bhzk",
    kAMwcw: "x9lcvmn",
    $$css: true
  },
  shadow: {
    kVAEAm: "x10l6tqk",
    kpwlN0: "x10a8y8t",
    kY2c9j: "x8knxv4",
    kWkggS: "x1k4peil",
    k6WDB: "x12x07u7",
    keRtuK: "x1495lsp",
    kIY38u: "x1l1uqgk",
    $$css: true
  },
  body: {
    kVAEAm: "x1n2onr6",
    kMzoRj: "xmkeg23",
    ksu8eU: "x1y0btm7",
    kVAM5u: "x1io3bm2",
    kWkggS: "xqy2nev",
    $$css: true
  },
  bodyAcrylic: {
    kWkggS: "x1u67apm",
    k6WDB: "xni0bam",
    keRtuK: "x19bkbe6",
    kTahiY: "x1gmqelw",
    kEcs6k: "x11rvarm",
    kK1uS5: "x1pe93vg",
    $$css: true
  },
  scroll: {
    kskxy: "x1nphckf",
    kVQacm: "xysyzu8",
    kZ7BSC: "xliy32w",
    kmVPX3: "xbnopvp",
    kg3NbH: "x2k91m2",
    $$css: true
  }
};