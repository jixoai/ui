/**
 * @jixoai/ui-vite-plugin (spinners) — the loader-pack battery (review R2,
 * 2026-09-12): the two vendored packs (magecdn's 109-loader catalog,
 * SamHerbert's 12-loader SVG-Loaders set) meet the SAME laws the custom
 * lane meets — kebab grammar on every key, RAW safety on every svg,
 * structural extractability (a viewBox-holding root), and byte
 * fidelity of the packed payload vs the vendored constant.
 */

import { describe, expect, test } from 'vitest';
import { magecdnSpinners } from '../../src/spinners/packs/magecdn.js';
import { svgLoadersSpinners } from '../../src/spinners/packs/svg-loaders.js';
import { createSafetyChecker } from '../../src/spinners/safety.js';
import { extractSpinData } from '../../src/spinners/generate.js';
import { SPINNER_NAME_PATTERN } from '../../src/spinners/resolve.js';
import { BLOCKS_WAVE_SVG } from '../../src/spinners/manifest.js';

const PACKS = [
  { id: 'magecdn', pack: magecdnSpinners, minCount: 94 },
  { id: 'svg-loaders', pack: svgLoadersSpinners, minCount: 12 },
] as const;

describe('the vendored loader packs (review R2)', () => {
  test('every key in both packs matches the kebab grammar', () => {
    for (const { id, pack } of PACKS) {
      const bad = Object.keys(pack).filter((name) => !SPINNER_NAME_PATTERN.test(name));
      expect(bad, `${id}: grammar violations`).toEqual([]);
    }
  });

  test('both packs carry their full vendored counts', () => {
    expect(Object.keys(magecdnSpinners)).toHaveLength(94); // 109 vendored − 15 dynamic-context exclusions (round 10)
    expect(Object.keys(svgLoadersSpinners)).toHaveLength(12);
  });

  test('every svg passes the RAW safety checker', () => {
    const checker = createSafetyChecker({ mode: 'error' });
    for (const { id, pack } of PACKS) {
      for (const [name, source] of Object.entries(pack)) {
        const svg = typeof source === 'string' ? source : source.file;
        const verdict = checker.check(svg, `${id}:${name}`);
        expect(verdict.passed, `${id}:${name} safety — ${verdict.issues.map((i) => i.message).join('; ')}`).toBe(true);
      }
    }
  });

  test('every svg structurally extracts (viewBox-holding root)', () => {
    for (const { id, pack } of PACKS) {
      for (const [name, source] of Object.entries(pack)) {
        const svg = typeof source === 'string' ? source : source.file;
        expect(() => extractSpinData(svg), `${id}:${name} extract`).not.toThrow();
      }
    }
  });

  test('byte fidelity: the packed payload equals the vendored constant (spot checks)', () => {
    // magecdn's blocks-wave is the SAME artwork as the built-in manifest —
    // the pack override is byte-identical by construction
    expect(magecdnSpinners['blocks-wave']).toBe(BLOCKS_WAVE_SVG);
    // the classic SamHerbert oval: stroke-nature artwork (stroke="#fff" root)
    const oval = extractSpinData(svgLoadersSpinners['oval'] as string);
    expect(oval.n).toBe('stroke');
    expect(oval.v).toBe('0 0 38 38');
  });

  test('the packs ride the override law when spread', () => {
    const custom = { ...magecdnSpinners, 'blocks-wave': svgLoadersSpinners['tail-spin']! };
    expect(custom['blocks-wave']).toBe(svgLoadersSpinners['tail-spin']);
  });
});
