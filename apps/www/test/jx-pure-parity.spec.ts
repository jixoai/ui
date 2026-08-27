/**
 * SVG geometry parity lock (2026-08-23, Codex r1 suggestion; repointed to
 * jx-pure.css the same day — the native-form sheet was absorbed verbatim as
 * Part A of the jx-pure componentless face).
 *
 * The Tier-1 sheet carries its icon glyphs as static data-URI SVGs inside
 * CSS custom properties (--jx-icon-calendar / clock / pipette), while the
 * component layer prints the SAME glyphs from lib/icons.ts. Two copies of
 * one geometry WILL drift unless a check fails the suite — this is that
 * check: decode every sheet URI and compare shape-level fingerprints
 * (path d / points / rect / circle geometry) against the icons.ts export
 * of the same name. Also locks the registry native-form deprecated alias
 * to the same source file (one css, two install names, zero divergence).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { calendar, clock, pipette } from '../src/lib/icons';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '../../..');
const sheet = readFileSync(resolve(here, '../src/lib/jx-pure.css'), 'utf8');
  const themeSheet = readFileSync(resolve(here, '../src/lib/jixoai.css'), 'utf8');

/** the sheet's data-URI for one icon name, decoded to an SVG string */
function sheetIcon(name: 'calendar' | 'clock' | 'pipette'): string {
    // V2: pipette lives in jixoai.css (jx-html-color); calendar/clock in jx-pure.css
  const m = sheet.match(new RegExp(`--jx-icon-${name}:\\s*url\\("([^"]+)"\\)`))
      ?? themeSheet.match(new RegExp(`--jx-icon-${name}[,:].*?url\\("([^"]+)"\\)`))
      ?? sheet.match(new RegExp(`--jx-icon-${name}[,:].*?url\\("([^"]+)"\\)`));
  if (!m) throw new Error(`--jx-icon-${name} missing from jx-pure.css`);
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
      expect(sheet + themeSheet, `--jx-icon-${name}`).toMatch(new RegExp(`--jx-icon-${name}[:,]`));
    }
  });

  it('the registry native-form alias ships the SAME jx-pure source (one css, two install names)', () => {
    const registry = JSON.parse(readFileSync(resolve(repoRoot, 'registry.json'), 'utf8')) as {
      items: { name: string; files: { path: string; target: string }[] }[];
    };
    const jxPure = registry.items.find((item) => item.name === 'jx-pure');
    const alias = registry.items.find((item) => item.name === 'native-form');
    expect(jxPure?.files[0]?.path, 'the jx-pure item points at the canonical source').toBe(
      'registry/files/theme/jx-pure.css',
    );
    expect(alias?.files[0]?.path, 'the deprecated alias points at the SAME source (no second copy)').toBe(
      'registry/files/theme/jx-pure.css',
    );
    expect(alias?.files[0]?.target, 'the alias keeps the old install path for one release window').toBe(
      '@lib/native-form.css',
    );
  });

  it('the site copy matches the registry source (no drift between the two)', () => {
    const source = readFileSync(resolve(repoRoot, 'registry/files/theme/jx-pure.css'), 'utf8');
    expect(sheet).toBe(source);
  });

  it('layer structure: Part A classes stay UNLAYERED, B element rules live in @layer components', () => {
    // Part A must never enter a layer — the Tier-2 contract relies on
    // unlayered rules beating layered utilities (jixoai.css law)
    const aRules = ['.jx-control {', '.jx-slider {', '.jx-control-shell {'];
    // the header comment MENTIONS "@layer components" — anchor on the
    // real block, not the prose
    const layerStart = sheet.indexOf('\n@layer components {');
    const layerEnd = sheet.indexOf('/* =====================================================================\n   C');
    for (const rule of aRules) {
      const at = sheet.indexOf(rule);
      expect(at, `${rule} exists`).toBeGreaterThan(-1);
      expect(at < layerStart || at > layerEnd, `${rule} must stay outside @layer components`).toBe(true);
    }
    // B element rules must ride :where(.jx-pure) inside the components layer
    const layerBody = sheet.slice(layerStart, layerEnd);
    for (const probe of [
      ':where(.jx-pure) :where(button',
      ':where(.jx-pure) input:where(',
      ':where(.jx-pure) summary',
      ':where(.jx-pure) table',
      ':where(.jx-pure.jx-light)',
    ]) {
      expect(layerBody.includes(probe), `${probe} inside @layer components`).toBe(true);
    }
  });

  it('size budget: the whole face stays under 18KB gzip (release gate)', () => {
    const gz = gzipSync(Buffer.from(sheet, 'utf8')).length;
    // baseline was native-form 5,598B gzip. Gate history: r1 11KB →
    // completion 14KB (B10-B12 + auto-dark) → 16KB (cqw fill + INK
    // fallback) → 18KB (openspec Owner round 2: switch redesign with
    // size classes, the the structural group vocabulary, the error/success B14
    // remap) → 18KB (the :not() reverse scope: 211 selector exclusions
    //   — the price of never fighting the host's own styles, Owner's
    //   third D2 revision). Data-URI weight remains the (c)-path cost.
    expect(gz, `jx-pure.css gzipped to ${gz}B`).toBeLessThanOrEqual(18 * 1024);
  });

  it('auto-dark region stays in sync with jixoai.css .dark (run scripts/gen-jx-auto-dark.mjs on drift)', () => {
    const tokenSheet = readFileSync(resolve(repoRoot, 'registry/files/theme/jixoai.css'), 'utf8');
    const darkAt = tokenSheet.indexOf('\n.dark {');
    expect(darkAt, 'jixoai.css .dark block').toBeGreaterThan(-1);
    const open = tokenSheet.indexOf('{', darkAt);
    let depth = 1;
    let i = open + 1;
    while (depth > 0 && i < tokenSheet.length) {
      const ch = tokenSheet[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    expect(depth, 'jixoai.css .dark block is balanced').toBe(0);
    const declarations = tokenSheet.slice(open + 1, i - 1).trim();
    const begin = sheet.indexOf('/* ==== BEGIN GENERATED');
    const end = sheet.indexOf('/* ==== END GENERATED');
    expect(begin, 'generated region present').toBeGreaterThan(-1);
    expect(end, 'generated region closed').toBeGreaterThan(begin);
    const generated = sheet.slice(begin, end);
    // every declaration line of the single source must appear verbatim
    for (const line of declarations.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      expect(generated.includes(trimmed), `auto-dark drift: missing "${trimmed.slice(0, 60)}"`).toBe(true);
    }
  });
});
