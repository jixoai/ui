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
  // A–E rows land complete with their family packets (packet-manifest
  // ownership); the verifier REJECTS rows with empty roots as
  // placeholders.
];

export const rowIsComplete = (row) =>
  Boolean(row.family && row.roots?.length && row.docsRoute && row.probeRoot &&
    Array.isArray(row.densityOwned) && row.densityOwned.length > 0 && row.testFile);

export const rowsForPacket = (packet) => {
  if (packet === 'all') return REGISTRY;
  if (packet === 'K0') return REGISTRY.filter((r) => r.family === 'K0');
  return REGISTRY.filter((r) => r.family === packet);
};
