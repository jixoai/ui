#!/usr/bin/env node
/**
 * The density-adoption registry (design §5) — each row is a FORMAL
 * contract consumed by verify-density-adoption.mjs. K0 ships the
 * schema + complete K0-owned rows (list-item); every A–E family row
 * is complete at its packet at the latest — placeholder rows are
 * forbidden.
 *
 * Row shape:
 *   family          — the packet owning the row (A|B|C|D|E|K0)
 *   roots           — canonical source/mirror roots (glob prefixes)
 *   docsRoute       — the docs page the browser phase mounts
 *   probeRoot       — a stable selector for the family's probe host
 *   lanes           — interactive lane selectors (hit-rectangle law)
 *   visualOnly      — visual-glyph selectors (exempt from hit law)
 *   densityOwned    — selector/property pairs the static phase scans
 *   exceptions      — { selector, property, reason } allowlist
 *   hitFloor        — 'ctl-hit' (the relation every lane satisfies)
 *   resize          — { scope, expect } relations asserted live
 *   testFile        — the packet's focused jsdom spec
 */

export const KERNEL_ALLOWLIST = [
  '--jx-d-secondary-text', '--jx-d-secondary-line',
  '--jx-d-media-icon', '--jx-d-media-image', '--jx-d-media-gutter',
  '--jx-d-inline-inset', '--jx-d-inline-gap',
  '--jx-d-stack-gap', '--jx-d-row-min', '--jx-d-hit-min',
  '--jx-d-text', '--jx-d-line', '--jx-d-leading',
  '--jx-d-icon-optical-inline',
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
    lanes: [
      '.jx-control-shell', '.jx-select', '.jx-sel-trigger', '.jx-tags-shell',
      '.jx-otp-slot', '.jx-num-btn', '.jx-file-zone', '.jx-file-trigger',
    ],
    visualOnly: ['.jx-select-chevron', '.jx-file-zone-glyph', '.jx-file-icon'],
    densityOwned: [
      { selector: '.jx-control-shell', properties: ['min-height', 'gap'] },
      { selector: '.jx-select', properties: ['min-height', 'padding-block'] },
      { selector: '.jx-sel-trigger', properties: ['min-height', 'gap'] },
      { selector: '.jx-tags-shell', properties: ['min-height', 'gap'] },
      { selector: '.jx-otp-slot', properties: ['min-height', 'min-width'] },
      { selector: '.jx-num-btn', properties: ['min-height', 'min-width'] },
      { selector: '.jx-file-row', properties: ['min-height', 'gap'] },
    ],
    exceptions: [
      { selector: '.jx-select-wrap:has(select[multiple]) .jx-select', property: 'min-height', reason: 'native multiple listbox posture' },
      { selector: '.jx-file-zone', property: 'min-height', reason: 'drop-zone aspect posture derived from ctl-hit' },
    ],
    hitFloor: 'ctl-hit',
    resize: [
      { scope: 'xs', expect: 'all interactive lanes >= --jx-d-ctl-hit' },
      { scope: 'default', expect: 'all interactive lanes >= --jx-d-ctl-hit' },
      { scope: 'lg', expect: 'all interactive lanes >= --jx-d-ctl-hit' },
    ],
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
    lanes: ['[data-jx-check]', '.jx-switch-track', '.jx-tgroup-btn', '.jx-slider', '.jx-color-picker-trigger'],
    visualOnly: [
      '.jx-checkbox', '.jx-radio', '.jx-toggle-track', '.jx-toggle-knob', '.jx-slider-thumb',
      '[data-jx-color-picker-sv]', '[data-jx-color-picker-hue]', '[data-jx-color-picker-swatch]',
    ],
    densityOwned: [
      { selector: '.jx-check-lane', properties: ['min-block-size', 'gap'] },
      { selector: '.jx-checkbox', properties: ['width', 'height'] },
      { selector: '.jx-radio', properties: ['width', 'height'] },
      { selector: '.jx-switch-track', properties: ['min-block-size', 'gap'] },
      { selector: '.jx-toggle-track', properties: ['width', 'height', 'padding'] },
      { selector: '.jx-toggle-knob', properties: ['width', 'height'] },
      { selector: '.jx-tgroup-btn', properties: ['min-block-size', 'padding-block', 'padding-inline', 'font-size', 'line-height'] },
      { selector: '.jx-slider', properties: ['min-block-size'] },
      { selector: '.jx-slider-track', properties: ['height'] },
      { selector: '.jx-slider-fill', properties: ['height', 'inset-block'] },
      { selector: '.jx-slider-thumb', properties: ['width', 'height'] },
      { selector: '.jx-color-picker-trigger', properties: ['min-block-size', 'gap', 'padding-block', 'padding-inline', 'font-size', 'line-height'] },
      { selector: '[data-jx-color-picker-swatch]', properties: ['width', 'height'] },
    ],
    exceptions: [
      { selector: '.jx-color-picker-sv', property: 'width/height', reason: 'color-map structural geometry' },
      { selector: '[data-jx-color-picker-hue]', property: 'width/height', reason: 'color-map structural geometry' },
      { selector: '.jx-color-picker-panel', property: 'width', reason: 'picker panel structural geometry' },
    ],
    hitFloor: 'ctl-hit',
    resize: [
      { scope: 'xs', expect: 'wrapper >= ctl-hit; visual <= ctl-icon' },
      { scope: 'default', expect: 'wrapper >= ctl-hit; visual <= ctl-icon' },
      { scope: 'lg', expect: 'wrapper >= ctl-hit; visual <= ctl-icon' },
    ],
    testFile: 'apps/www/test/density-adoption-form-boolean.spec.ts',
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
    lanes: ['[data-jx-menu-trigger]', '[data-jx-menubar-trigger]', '[data-jx-navmenu-trigger]', '[data-jx-command-item]', '[data-jx-pc-btn]', '[data-jx-breadcrumb-link]'],
    visualOnly: ['.jx-menu-caret', '[data-jx-breadcrumb-separator]'],
    densityOwned: [
      { selector: '.jx-menu-item', properties: ['min-block-size', 'padding-inline', 'padding-block', 'font-size', 'line-height'] },
      { selector: '.jx-menubar-trigger', properties: ['min-block-size', 'padding-inline', 'padding-block', 'font-size', 'line-height'] },
      { selector: '.jx-menubar-menu-item', properties: ['min-block-size', 'padding-inline', 'padding-block', 'font-size', 'line-height'] },
      { selector: '[data-jx-command-item]', properties: ['min-block-size'] },
      { selector: '.jx-pc-btn', properties: ['min-block-size'] },
      { selector: '[data-jx-breadcrumb-link]', properties: ['min-block-size'] },
    ],
    exceptions: [], hitFloor: 'ctl-hit',
    resize: [{ scope: 'xs', expect: 'all lanes >= ctl-hit' }, { scope: 'default', expect: 'all lanes >= ctl-hit' }, { scope: 'lg', expect: 'all lanes >= ctl-hit' }],
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
    densityOwned: [
      { selector: '[data-jx-tab]', properties: ['min-block-size', 'padding-inline', 'font-size', 'line-height'] },
      { selector: '[data-jx-desc-value]', properties: ['padding', 'font-size', 'line-height'] },
      { selector: '[data-jx-badge]', properties: ['padding', 'font-size', 'line-height'] },
      { selector: '[data-jx-step-indicator]', properties: ['width', 'height', 'font-size'] },
    ],
    exceptions: [
      { selector: '.jx-table table', property: 'min-width', reason: 'column overflow geometry' },
      { selector: '[data-jx-tl-connector]::before', property: 'width', reason: 'structural spine hairline' },
      { selector: '[data-jx-step-separator]::after', property: 'height', reason: 'structural connector hairline' },
    ],
    hitFloor: 'ctl-hit',
    resize: [
      { scope: 'xs', expect: 'labels use ctl-text and indicators use ctl-icon' },
      { scope: 'default', expect: 'data/status rhythm uses ctl aliases' },
      { scope: 'lg', expect: 'Table inherits parent lg and stamps lg' },
    ],
    testFile: 'apps/www/test/density-adoption-data.spec.ts',
  },
];

export const rowIsComplete = (row) =>
  Boolean(row.family && row.roots?.length && row.docsRoute && row.probeRoot &&
    Array.isArray(row.densityOwned) && row.densityOwned.length > 0 && row.testFile);

export const rowsForPacket = (packet) => {
  if (packet === 'all') return REGISTRY;
  if (packet === 'K0') return REGISTRY.filter((r) => r.family === 'K0');
  return REGISTRY.filter((r) => r.family === packet);
};
