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
  '--jx-d-secondary-text', '--jx-d-secondary-line',
  '--jx-d-secondary-leading',
  '--jx-d-media-icon', '--jx-d-media-image', '--jx-d-media-gutter',
  '--jx-d-inline-inset', '--jx-d-inline-gap',
  '--jx-d-stack-gap', '--jx-d-row-min', '--jx-d-hit-min',
  '--jx-d-text', '--jx-d-line', '--jx-d-leading',
  '--jx-d-icon-optical-inline',
  '--jx-d-end-gap', '--jx-d-content-gap',
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
    resize: [{ scope: 'default', expect: '--jx-d-text 13px' }],
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
    resize: [{ scope: 'default', expect: '--jx-d-text 13px' }],
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
    ],
    docsRoute: '/docs/components/press-button.html',
    probeRoot: '.jx-press',
    lanes: ['.jx-press'],
    visualOnly: ['svg[data-jx-icon]'],
    // utility-styled family (press-button is pure utility paint)
    densityOwned: [],
    exceptions: [],
    hitFloor: 'ctl-hit',
    resize: [{ scope: 'default', expect: '--jx-d-text 13px' }],
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
    resize: [{ scope: 'default', expect: '--jx-d-text 13px' }],
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
    resize: [{ scope: 'default', expect: '--jx-d-text 13px' }],
    testFile: 'apps/www/test/density-adoption-data.spec.ts',
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
