/**
 * SVG geometry parity lock (2026-08-23, Codex r1 suggestion).
 *
 * The Tier-1 native-form sheet carries its icon glyphs as static
 * data-URI SVGs inside CSS custom properties (--jx-icon-calendar /
 * clock / pipette), while the component layer prints the SAME glyphs
 * from lib/icons.ts. Two copies of one geometry WILL drift unless a
 * check fails the suite — this is that check: decode every sheet URI
 * and compare shape-level fingerprints (path d / points / rect /
 * circle geometry) against the icons.ts export of the same name.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { calendar, clock, pipette } from '../src/lib/icons';

const here = resolve(fileURLToPath(import.meta.url), '..');
const sheet = readFileSync(resolve(here, '../src/lib/native-form.css'), 'utf8');

/** the sheet's data-URI for one icon name, decoded to an SVG string */
function sheetIcon(name: 'calendar' | 'clock' | 'pipette'): string {
  const m = sheet.match(new RegExp(`--jx-icon-${name}:\\s*url\\("([^"]+)"\\)`));
  if (!m) throw new Error(`--jx-icon-${name} missing from native-form.css`);
  return decodeURIComponent(m[1]!);
}

/** shape-level fingerprint: every drawable's geometry, sorted */
function fingerprint(rawSvg: string): string {
  // the sheet's data-URIs carry single-quoted attributes, icons.ts
  // double-quoted — normalize before extracting
  const svg = rawSvg.replace(/'/g, '"');
  const shapes: string[] = [];
  for (const m of svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)) shapes.push(`d:${m[1]}`);
  for (const m of svg.matchAll(/<(circle|rect|polyline|line|ellipse)\b([^>]*)>/g)) {
    shapes.push(`${m[1]}:${m[2].replace(/\s+/g, ' ').trim()}`);
  }
  if (shapes.length === 0) throw new Error('no drawable geometry found');
  return shapes.sort().join('§');
}

describe('native-form ↔ icons.ts geometry parity', () => {
  it.each([
    ['calendar', calendar],
    ['clock', clock],
    ['pipette', pipette],
  ] as const)('%s matches the icons.ts geometry', (name, icon) => {
    expect(fingerprint(sheetIcon(name))).toBe(fingerprint(icon));
  });

  it('the sheet still declares all three icon custom properties', () => {
    for (const name of ['calendar', 'clock', 'pipette'] as const) {
      expect(sheet, `--jx-icon-${name}`).toMatch(new RegExp(`--jx-icon-${name}:`));
    }
  });
});
