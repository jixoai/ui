#!/usr/bin/env node
/**
 * The density-adoption registry (design §5) — each row is a FORMAL
 * contract consumed by verify-density-adoption.mjs.
 *
 * densityOwned carries selector/property pairs for the STATIC css
 * scan. Families styled as Tailwind utilities in markup (no css
 * declaration blocks for those selectors) carry densityOwned: [] —
 * their verification is the BROWSER phase (stamps, USED values,
 * physical lanes, scope-resize) plus their focused jsdom suite.
 * The static scan is meaningful only for css-declared geometry.
 *
 * Row shape:
 *   family / roots / docsRoute / probeRoot / lanes / visualOnly /
 *   densityOwned / exceptions / hitFloor / resize / testFile
 */

export const KERNEL_ALLOWLIST = [
  '--jx-text-secondary', '--jx-line-secondary',
  '--jx-leading-secondary',
  '--jx-icon', '--jx-image', '--jx-media-gutter',
  '--jx-inset', '--jx-gap',
  '--jx-stack', '--jx-row-min', '--jx-hit',
  '--jx-text', '--jx-line', '--jx-leading',
  '--jx-icon-optical',
  '--jx-gap-end', '--jx-gap-content',
];

export const REGISTRY = [
  {
    family: 'K0',
    roots: ['registry/files/ui/list-item/', 'apps/www/src/lib/ui/list-item/'],
    docsRoute: '/docs/components/list-item.html',
    probeRoot: '#group-modes [data-slot="item-group"]',
    lanes: ['[data-slot="item-end"]'],
    visualOnly: ['[data-slot="item-media"]', '[data-slot="item-chevron"]'],
    densityOwned: [
      { selector: '.jx-item', properties: ['padding-block', 'padding-inline', 'min-block-size', 'row-gap'] },
      { selector: "[data-slot='item-end']", properties: ['gap', 'min-block-size'] },
      { selector: "[data-slot='item-title']", properties: ['font-size', 'line-height'] },
      { selector: "[data-slot='item-media']", properties: ['width', 'min-block-size'] },
    ],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [
      { scope: 'xs', expect: 'row 28px · text 11px' },
      { scope: 'default', expect: 'row 40px · text 13px' },
      { scope: 'lg', expect: 'row 48px · text 15px' },
    ],
    testFile: 'apps/www/test/list-item.spec.ts',
  },
  {
    family: 'A',
    roots: [
      'registry/files/ui/input/', 'apps/www/src/lib/ui/input/',
      'registry/files/ui/textarea/', 'apps/www/src/lib/ui/textarea/',
      'registry/files/ui/select/', 'apps/www/src/lib/ui/select/',
      'registry/files/ui/native-select/', 'apps/www/src/lib/ui/native-select/',
      'registry/files/ui/number-input/', 'apps/www/src/lib/ui/number-input/',
      'registry/files/ui/tags-input/', 'apps/www/src/lib/ui/tags-input/',
      'registry/files/ui/input-otp/', 'apps/www/src/lib/ui/input-otp/',
      'registry/files/ui/file-input/', 'apps/www/src/lib/ui/file-input/',
    ],
    docsRoute: '/docs/components/form.html',
    probeRoot: '[data-density]',
    lanes: ['.jx-control-shell', '.jx-select', '.jx-sel-trigger', '.jx-tags-shell', '.jx-otp-slot', '.jx-num-btn'],
    visualOnly: ['.jx-select-chevron', '.jx-file-zone-glyph', '.jx-file-icon'],
    // utility-styled family: density rides Tailwind arbitrary values in markup;
    // the browser phase + focused jsdom suite are the verification
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-text 13px' }],
    testFile: 'apps/www/test/density-adoption-form-text.spec.ts',
  },
  {
    family: 'B',
    roots: [
      'registry/files/ui/checkbox/', 'apps/www/src/lib/ui/checkbox/',
      'registry/files/ui/radio/', 'apps/www/src/lib/ui/radio/',
      'registry/files/ui/toggle/', 'apps/www/src/lib/ui/toggle/',
      'registry/files/ui/toggle-group/', 'apps/www/src/lib/ui/toggle-group/',
      'registry/files/ui/range/', 'apps/www/src/lib/ui/range/',
      'registry/files/ui/color-picker/', 'apps/www/src/lib/ui/color-picker/',
    ],
    docsRoute: '/docs/components/checkbox.html',
    probeRoot: '[data-density]',
    lanes: ['[data-jx-check]', '.jx-switch-track', '.jx-tgroup-btn', '.jx-slider'],
    visualOnly: [
      '.jx-checkbox', '.jx-radio', '.jx-toggle-track', '.jx-toggle-knob', '.jx-slider-thumb',
      '[data-jx-color-picker-sv]', '[data-jx-color-picker-hue]', '[data-jx-color-picker-swatch]',
    ],
    // utility-styled family (checkbox/radio/toggle/slider paint is
    // pseudo-element state machines, not density-owned css blocks)
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-text 13px' }],
    testFile: 'apps/www/test/density-adoption-form-boolean.spec.ts',
  },
  {
    family: 'C',
    roots: [
      'registry/files/ui/press-button/', 'apps/www/src/lib/ui/press-button/',
      'registry/files/ui/icon-button/', 'apps/www/src/lib/ui/icon-button/',
      'registry/files/ui/float-button/', 'apps/www/src/lib/ui/float-button/',
      'registry/files/ui/anchor/', 'apps/www/src/lib/ui/anchor/',
      'registry/files/ui/pagination/', 'apps/www/src/lib/ui/pagination/',
      // variant-grammar (2026-08-26): chip is the press family's compact
      // rung — same law, control-scale hit lane, effect pass-through
      'registry/files/ui/chip/', 'apps/www/src/lib/ui/chip/',
    ],
    docsRoute: '/docs/components/press-button.html',
    probeRoot: '.jx-press',
    lanes: ['.jx-press', '[data-jx-chip]'],
    visualOnly: ['svg[data-jx-icon]'],
    // utility-styled family (press-button is pure utility paint)
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-text 13px' }],
    testFile: 'apps/www/test/density-adoption-buttons.spec.ts',
  },
  {
    family: 'D',
    roots: [
      'registry/files/ui/dropdown-menu/', 'apps/www/src/lib/ui/dropdown-menu/',
      'registry/files/ui/menubar/', 'apps/www/src/lib/ui/menubar/',
      'registry/files/ui/navigation-menu/', 'apps/www/src/lib/ui/navigation-menu/',
      'registry/files/ui/command/', 'apps/www/src/lib/ui/command/',
      'registry/files/ui/popconfirm/', 'apps/www/src/lib/ui/popconfirm/',
      'registry/files/ui/breadcrumb/', 'apps/www/src/lib/ui/breadcrumb/',
    ],
    docsRoute: '/docs/components/dropdown-menu.html',
    probeRoot: '[data-density]',
    lanes: ['[data-jx-menu-trigger]', '[data-jx-menubar-trigger]', '[data-jx-command-item]'],
    visualOnly: ['.jx-menu-caret', '[data-jx-breadcrumb-separator]'],
    // utility-styled family (menu item paint is utility markup)
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-text 13px' }],
    testFile: 'apps/www/test/density-adoption-menus.spec.ts',
  },
  {
    family: 'E',
    roots: [
      'registry/files/ui/table/', 'apps/www/src/lib/ui/table/',
      'registry/files/ui/tabs/', 'apps/www/src/lib/ui/tabs/',
      'registry/files/ui/descriptions/', 'apps/www/src/lib/ui/descriptions/',
      'registry/files/ui/statistic/', 'apps/www/src/lib/ui/statistic/',
      'registry/files/ui/badge/', 'apps/www/src/lib/ui/badge/',
      'registry/files/ui/kbd/', 'apps/www/src/lib/ui/kbd/',
      // variant-grammar (2026-08-26): inline-code rides the badge frame
      'registry/files/ui/inline-code/', 'apps/www/src/lib/ui/inline-code/',
      'registry/files/ui/empty/', 'apps/www/src/lib/ui/empty/',
      'registry/files/ui/result/', 'apps/www/src/lib/ui/result/',
      'registry/files/ui/timeline/', 'apps/www/src/lib/ui/timeline/',
      'registry/files/ui/steps/', 'apps/www/src/lib/ui/steps/',
    ],
    docsRoute: '/docs/components/table.html',
    probeRoot: '[data-density]',
    lanes: ['[data-jx-tab]', '[data-jx-step-indicator]'],
    visualOnly: ['[data-jx-tl-dot]', '[data-jx-result-icon]'],
    // utility-styled family
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-text 13px' }],
    testFile: 'apps/www/test/density-adoption-data.spec.ts',
  },
  {
    // ghostty-term (2026-08-28): the live terminal surface. Cell geometry is
    // canvas-painted (fontSize default probes --jx-text; row height --jx-line/
    // --jx-leading used-values), so the static css scan only sees the hit-lane;
    // the browser phase owns stamps/lanes/resize like every utility family.
    family: 'terminal',
    roots: [
      'registry/files/ui/ghostty-term/',
      'apps/www/src/lib/ui/ghostty-term/',
    ],
    docsRoute: '/docs/components/ghostty-term.html',
    probeRoot: '[data-jx-ghostty-term]',
    lanes: ['[data-jx-ghostty-term]'],
    visualOnly: ['[data-jx-ghostty-term] canvas'],
    densityOwned: [
      { selector: '[data-jx-ghostty-term]', properties: ['min-block-size'] },
    ],
    exceptions: [
      // fontSize prop: px-numeric override of the --jx-text-derived default
      // (design D5.1 sanctioned escape hatch — JS-level, not a css selector,
      // outside the token allowlist, no token alignment promised)
    ],
    hitFloor: 'hit',
    resize: [{ scope: 'default', expect: 'canvas row 20px · text 13px' }],
    testFile: 'apps/www/test/ghostty-term.spec.ts',
  },
  {
    // terminal chrome/content trio (merge-alignment B3 density audit,
    // 2026-08-29): the header is CHROME — the data-jx-chrome
    // pointer-modality band, no density opinion, the ambient scope flows
    // through; the card and footer are CONTENT — editorial type
    // literals, no density slot alignment promised. They own NO
    // density-owned geometry (densityOwned stays empty — the jsdom
    // matrix suite in testFile is the evidence: no-parent/xs/lg, never
    // a stamp, the nearest [data-density] ancestor preserved), and the
    // literals below are the registered structural exceptions. The
    // family's fixed-posture leaf (ghostty-term, explicit 'default'
    // fallback) keeps its own row above.
    family: 'terminal-chrome',
    roots: [
      'registry/files/ui/terminal-header/', 'apps/www/src/lib/ui/terminal-header/',
      'registry/files/ui/terminal-card/', 'apps/www/src/lib/ui/terminal-card/',
      'registry/files/ui/terminal-footer/', 'apps/www/src/lib/ui/terminal-footer/',
    ],
    docsRoute: '/docs/components/terminal-header.html',
    // probeRoot is the header ROOT, outside the band: [data-jx-chrome]
    // pins its aliases ABSOLUTELY (sm tier, density-independent — the
    // modality axis, not a second scale), so the generic resize probe
    // must read the ambient density axis around the band, not inside it
    probeRoot: 'header.jx-nav',
    lanes: ['[data-jx-chrome]'],
    visualOnly: ['[data-jx-terminal] [data-jx-light-dot]', '.jx-footer-ghost'],
    densityOwned: [],
    exceptions: [
      // structural literals (B3: content → no stamp; literal = structural
      // exception): the card/footer type scale is authored fixed
      // editorial geometry, not density slots
      { selector: '[data-jx-terminal]', property: 'font-size' },
      { selector: '[data-jx-terminal-footer]', property: 'font-size' },
      { selector: '[data-jx-terminal-footer-column]', property: 'font-size' },
    ],
    hitFloor: 'hit',
    resize: [{ scope: 'default', expect: 'fixed chrome/content — no density-owned geometry (ambient only)' }],
    testFile: 'apps/www/test/density-adoption-form-boolean.spec.ts',
  },
];

// a row is complete when its structural fields exist; densityOwned may be
// empty for utility-styled families (the browser phase + jsdom suite verify)
export const rowIsComplete = (row) =>
  Boolean(row.family && row.roots?.length && row.docsRoute && row.probeRoot && row.testFile);

export const rowsForPacket = (packet) => {
  if (packet === 'all') return REGISTRY;
  if (packet === 'K0') return REGISTRY.filter((r) => r.family === 'K0');
  return REGISTRY.filter((r) => r.family === packet);
};
