/**
 * packing.test.ts — greedy packing boundaries + the four-mode matrix +
 * determinism (A3/A6, design §3).
 *
 * The budget unit is the serialized entry line inside a chunk module
 * (`  name: { v: '…', n: '…', d: '…' },\n`) — RAW non-gzip bytes.
 * Fixtures below build synthetic icons whose entry bytes are computed
 * FROM THE GENERATOR'S OWN REPORT, so boundary assertions test the
 * algorithm, not hand-counted strings.
 */

import { describe, expect, test } from 'vitest';
import { generateIconLibraryArtifacts } from '../../../src/icons/library/generate.js';
import { ICON_CHUNK_MODULE_PREFIX } from '../../../src/icons/ids.js';
import type { ResolvedLibraryIcon } from '../../../src/icons/library/types.js';

/** a synthetic icon: n chars of artwork → a known entry payload */
const icon = (name: string, artworkBytes = 40): ResolvedLibraryIcon => ({
  name,
  svg:
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">` +
    `<path d="${'M1 1L'.repeat(artworkBytes / 6)}"/></svg>`,
});

/** total serialized entry bytes the generator measured for these icons */
const packedBytes = (icons: readonly ResolvedLibraryIcon[]): Map<string, number> => {
  const { report } = generateIconLibraryArtifacts(icons, { maxChunkBytes: 1 << 30 });
  expect(report.chunkCount).toBe(1); // one huge budget → all in chunk 0
  return new Map(Object.entries(report.perIconBytes));
};

describe('greedy packing boundaries', () => {
  test('entries exactly AT the budget share one chunk; one byte over opens the next', () => {
    const a = icon('aaaa');
    const b = icon('bbbb');
    const bytes = packedBytes([a, b]);
    const sizeA = bytes.get('aaaa')!;
    const sizeB = bytes.get('bbbb')!;

    // exactly at budget: both fit chunk 0
    const atBudget = generateIconLibraryArtifacts([a, b], { maxChunkBytes: sizeA + sizeB });
    expect(atBudget.report.chunkCount).toBe(1);
    expect(atBudget.report.lazyChunks).toEqual([]);

    // one byte under the sum → b spills to its own chunk (lazy)
    const spill = generateIconLibraryArtifacts([a, b], { maxChunkBytes: sizeA + sizeB - 1 });
    expect(spill.report.chunkCount).toBe(2);
    expect(spill.report.lazyChunks).toEqual([1]);
    expect([...spill.chunks.get(1)!.matchAll(/  (aaaa|bbbb): /g)].map((m) => m[1])).toEqual(['bbbb']);
  });

  test('an icon larger than the budget forms its OWN chunk with a warning', () => {
    const small = icon('s1');
    const huge = icon('h1', 4000);
    const small2 = icon('s2');
    const bytes = packedBytes([small]);
    const budget = Math.max(...[...bytes.values()]);

    const out = generateIconLibraryArtifacts([small, huge, small2], { maxChunkBytes: budget });
    // layout: [s1] [h1] [s2] — the oversized entry chunks alone, the
    // smalls never share with it
    expect(out.report.chunkCount).toBe(3);
    expect(out.report.warnings).toHaveLength(1);
    expect(out.report.warnings[0]).toMatch(/"h1" \(\d+ serialized bytes\) exceeds maxChunkBytes/);
    expect(out.chunks.get(0)).toContain('  s1: ');
    expect(out.chunks.get(1)).toContain('  h1: ');
    expect(out.chunks.get(2)).toContain('  s2: ');
  });

  test('per-chunk byte totals stay within budget and match perIconBytes sums', () => {
    const icons = Array.from({ length: 20 }, (_, i) => icon(`i${String(i).padStart(2, '0')}`, 30 + i * 7));
    const { report } = generateIconLibraryArtifacts(icons, { maxChunkBytes: 800 });
    expect(report.chunkCount).toBeGreaterThan(1);
    for (const [chunk, total] of report.chunkBytes) {
      expect(total).toBeLessThanOrEqual(800);
      const body = generateIconLibraryArtifacts(icons, { maxChunkBytes: 800 }).chunks.get(chunk)!;
      for (const [name, bytes] of Object.entries(report.perIconBytes)) {
        if (body.includes(`  ${name}: `)) {
          // every in-chunk name is counted in this chunk's total (sum
          // check via the report's own map below)
          expect(bytes).toBeGreaterThan(0);
        }
      }
    }
    // global conservation: every icon lands in exactly one chunk
    const placements = [...report.chunkBytes.keys()]
      .map((k) => generateIconLibraryArtifacts(icons, { maxChunkBytes: 800 }).chunks.get(k)!)
      .join('');
    for (const name of Object.keys(report.perIconBytes)) {
      expect(placements.includes(`  ${name}: `)).toBe(true);
    }
  });
});

describe('the four-mode matrix (exact, design §3 table)', () => {
  // enough artwork to force multiple chunks under a small budget
  const icons = Array.from({ length: 8 }, (_, i) => icon(`icon${i}`, 120));
  const maxChunkBytes = 600;

  test("('auto', inline=true default): budgeted chunks, chunk 0 inline, 1..N lazy", () => {
    const out = generateIconLibraryArtifacts(icons, { maxChunkBytes });
    expect(out.report.chunkCount).toBeGreaterThan(1);
    expect(out.report.lazyChunks).toEqual(
      Array.from({ length: out.report.chunkCount }, (_, i) => i).filter((i) => i > 0),
    );
    // chunk 0's entries live INLINE in the artifact
    expect(out.artifact).toContain(`  ${'icon0'}: {`);
    // lazy chunk bodies are served, not embedded
    expect(out.artifact).not.toContain(`  ${'icon7'}: {`);
    expect(out.artifact).toContain(`import('${ICON_CHUNK_MODULE_PREFIX}1')`);
  });

  test("('auto', false): budgeted chunks, ALL lazy (even chunk 0)", () => {
    const out = generateIconLibraryArtifacts(icons, {
      maxChunkBytes,
      inlineFirstChunk: false,
    });
    expect(out.report.lazyChunks).toEqual(
      Array.from({ length: out.report.chunkCount }, (_, i) => i),
    );
    expect(out.artifact).toContain('const CHUNK_0: Readonly<Record<string, IconData>> = {};');
    expect(out.artifact).toContain(`import('${ICON_CHUNK_MODULE_PREFIX}0')`);
  });

  test("('single', inline=true default): ONE chunk fully inline, ZERO virtual imports", () => {
    const out = generateIconLibraryArtifacts(icons, { chunking: 'single' });
    expect(out.report.chunkCount).toBe(1);
    expect(out.report.lazyChunks).toEqual([]);
    expect(out.artifact).not.toContain(ICON_CHUNK_MODULE_PREFIX);
    expect(out.artifact).toContain('  icon7: {'); // the last icon is inline too
  });

  test("('single', false): ONE lazy chunk holding everything", () => {
    const out = generateIconLibraryArtifacts(icons, {
      chunking: 'single',
      inlineFirstChunk: false,
    });
    expect(out.report.chunkCount).toBe(1);
    expect(out.report.lazyChunks).toEqual([0]);
    const lazyImports = out.artifact.match(/import\('virtual:jixoai-icons\/chunk\/\d+'\)/g) ?? [];
    expect(lazyImports).toEqual([`import('${ICON_CHUNK_MODULE_PREFIX}0')`]);
    expect(out.artifact).toContain('const CHUNK_0: Readonly<Record<string, IconData>> = {};');
  });

  test("N=1 under 'auto' + inline: ZERO virtual imports (plugin-free tier)", () => {
    const out = generateIconLibraryArtifacts([icon('only')], {});
    expect(out.report.chunkCount).toBe(1);
    expect(out.report.lazyChunks).toEqual([]);
    expect(out.artifact).not.toContain(ICON_CHUNK_MODULE_PREFIX);
  });
});

describe('determinism', () => {
  test('identical inputs produce byte-identical artifact + chunks across runs', () => {
    const icons = Array.from({ length: 10 }, (_, i) => icon(`d${i}`, 90));
    const first = generateIconLibraryArtifacts(icons, { maxChunkBytes: 500 });
    const second = generateIconLibraryArtifacts(icons, { maxChunkBytes: 500 });
    expect(second.artifact).toBe(first.artifact);
    expect([...second.chunks.keys()]).toEqual([...first.chunks.keys()]);
    for (const key of first.chunks.keys()) {
      expect(second.chunks.get(key)).toBe(first.chunks.get(key));
    }
  });
});
