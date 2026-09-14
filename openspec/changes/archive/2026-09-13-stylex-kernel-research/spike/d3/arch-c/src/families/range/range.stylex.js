// range.styles.ts — the field scaffolding (StyleX side of the split).
//
// Source intent: the label row (real label[for] + live mono readout),
// the tick ruler anchored to the THUMB's travel (half-thumb inline
// inset; repeating-gradient marks at step periods; the ::after end
// tick at 100%), the error line, density tiers via the ambient var
// scope. The source expresses the vertical face through DESCENDANT
// attr selectors (.jx-field[data-orient] [data-jx-range-body]) —
// StyleX has no descendant selectors; the orientation lifts into
// component conditionals (the state→class tax, recorded).
import * as stylex from '@stylexjs/stylex';
export const rangeStyles = {
  field: {
    k1xSpc: "x78zum5",
    kXwgrk: "xdt5ytf",
    kOIVth: "x195vfkc",
    $$css: true
  },
  fieldVertical: {
    kXwgrk: "x1q0g3np",
    kGNEyG: "x1qjc9v5",
    kOIVth: "xpj7pl4",
    $$css: true
  },
  head: {
    k1xSpc: "x78zum5",
    kGNEyG: "x1pha0wt",
    kjj79g: "x1qughib",
    kOIVth: "x8233eu",
    $$css: true
  },
  label: {
    kGuDYH: "xxguibh",
    kLWn49: "xn212u0",
    kMwMTN: "x11jfisy",
    $$css: true
  },
  srOnly: {
    kVAEAm: "x10l6tqk",
    kzqmXN: "x1i1rx1s",
    kZKoxP: "xjm9jq1",
    kmVPX3: "x1717udv",
    kogj98: "xkdpibf",
    kVQacm: "xb3r6kr",
    kMcinP: "xeh89do",
    khDVqt: "xuxw1ft",
    kMzoRj: "xc342km",
    ksu8eU: "xng3xce",
    $$css: true
  },
  readout: {
    kGuDYH: "xxguibh",
    kLWn49: "xn212u0",
    kMv6JI: "xpw0y0u",
    kcqcaj: "xss6m8b",
    kMwMTN: "x11jfisy",
    $$css: true
  },
  readoutInvalid: {
    kMwMTN: "x19150mw",
    $$css: true
  },
  bodyHorizontal: {
    k1xSpc: "x1lliihq",
    $$css: true
  },
  bodyVertical: {
    k1xSpc: "x78zum5",
    kGNEyG: "x1qjc9v5",
    kOIVth: "xpj7pl4",
    $$css: true
  },
  rulerHorizontal: {
    kVAEAm: "x1n2onr6",
    kZKoxP: "x16wp3ig",
    keoZOQ: "x72edsj",
    kUOVxO: "x1sz5sl3",
    $$css: true
  },
  rulerVertical: {
    kVAEAm: "x1n2onr6",
    kzqmXN: "x1jw3ynk",
    kZKoxP: "xt7dq6l",
    kSGwAc: "xkh2ocl",
    kqGvvJ: "x1jneikf",
    kUOVxO: "xrxpjvj",
    $$css: true
  },
  endTickH: {
    k5JduY: "x100rkj9",
    kwXMNM: "x1j6awrg",
    kH8aOt: "x1unh1gc",
    k3foIR: "x1m1drc7",
    k8Iv0R: "x1xrz1ek",
    kkgrvl: "xv6d0c5",
    ks3ayO: "xlav4h",
    $$css: true
  },
  endTickV: {
    k5JduY: "x100rkj9",
    k3foIR: "x1i63x89",
    k8Iv0R: "x1xrz1ek",
    kH8cDV: "x17cx49",
    kLxBhq: "xnbfe2x",
    kkgrvl: "x183bm9d",
    k4zj60: "xcock1l",
    kwXMNM: "x1j6awrg",
    ks3ayO: "xlav4h",
    $$css: true
  },
  tickH: {
    kVAEAm: "x10l6tqk",
    kkqhue: "x17y0mx6",
    k87sOh: "x13vifvy",
    kZKoxP: "x5yr21d",
    kKwaWg: "x1scd3q6",
    koV3a4: "x1hsawpp",
    $$css: true
  },
  tickV: {
    kVAEAm: "x10l6tqk",
    kYYq5F: "x10no89f",
    k87sOh: "x80663w",
    kLqNvP: "x1o0tod",
    kzqmXN: "xh8yej3",
    kZKoxP: "xt7dq6l",
    kKwaWg: "x4301iv",
    $$css: true
  },
  error: {
    kogj98: "x1ghz6dp",
    kGuDYH: "xxguibh",
    kLWn49: "xn212u0",
    kMwMTN: "x19150mw",
    $$css: true
  },
  errorMark: {
    kKX8nH: "x1j61x8r",
    k63SB2: "x1xlr1w8",
    k71WvV: "xgpuomr",
    $$css: true
  }
};