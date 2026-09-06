/**
 * optimize.test.ts — the svgo pass (A2, design §2/§9).
 *
 *   1. the NO-OP PIN: the tuned preset leaves lucide's canonical
 *      serialization byte-identical for every built-in — the
 *      geometry-consistency law survives optimization.
 *   2. the tuned preset compacts dirty artwork (xml prolog, comments,
 *      editor metadata, whitespace, over-precise numbers, dimensions).
 *   3. dimensions die, the viewBox lives — root width/height are
 *      dropped by law, viewBox preserved.
 */

import { describe, expect, test } from 'vitest';
import * as lucide from 'lucide';
import type { IconNode } from 'lucide';
import { optimizeSvg } from '../../../src/icons/library/optimize.js';
import { DEFAULT_LIBRARY_MANIFEST } from '../../../src/icons/library/manifest.js';
import { serializeLucideIcon } from '../../../src/icons/providers/lucide.js';

const canonical = (lucideExport: string): string =>
  serializeLucideIcon(lucide[lucideExport as keyof typeof lucide] as IconNode);

describe('the svgo no-op pin on lucide canonical serialization', () => {
  test('every built-in passes through byte-identical', async () => {
    for (const [name, lucideExport] of DEFAULT_LIBRARY_MANIFEST) {
      const svg = canonical(lucideExport);
      expect(await optimizeSvg(svg), name).toBe(svg);
    }
  });
});

describe('the tuned preset compacts dirty artwork', () => {
  const dirty = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- drawn by hand -->',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.00000">',
    '  <path d="M1.0000 1 L 23 1 L 23 23 L 1 23 Z"></path>',
    '</svg>',
  ].join('\n');

  test('xml prolog, comment, whitespace, hex color and dimensions compact', async () => {
    const out = await optimizeSvg(dirty);
    expect(out.startsWith('<svg ')).toBe(true); // xml prolog gone
    expect(out).not.toContain('<!--'); // comment gone
    expect(out).not.toContain('\n'); // whitespace collapsed
    expect(out).not.toContain('width="24"'); // dimensions dropped (law)
    expect(out).not.toContain('height="24"');
    expect(out).toContain('viewBox="0 0 24 24"'); // viewBox preserved
    expect(out).toContain('stroke="#000"'); // convertColors compacted
    expect(out).toContain('stroke-width="2"'); // numeric cleanup at precision 3
    expect(out).not.toContain('</path>'); // self-closing normalization
  });

  test('a custom floatPrecision rides the numeric cleanup', async () => {
    const noisy =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="1.23456" cy="2" r="3"/></svg>';
    const atThree = await optimizeSvg(noisy);
    expect(atThree).toContain('cx="1.235"'); // rounded to 3 decimals
    const atOne = await optimizeSvg(noisy, { floatPrecision: 1 });
    expect(atOne).toContain('cx="1.2"');
  });
});
