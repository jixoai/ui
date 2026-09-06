/**
 * generate.test.ts — the pure generator's output contract (A4/A6,
 * design §5/§6): the artifact's shape, the MEASURED default-set
 * acceptance (numbers asserted from REAL generator output over the 38
 * lucide built-ins — never assumed), structured-extraction semantics
 * (child overrides survive in d; nature detection), and the sentinel
 * bytes embedded in the LAZY loaders.
 *
 * Pure-core discipline: importing generate.ts transitively imports NO
 * vite module — asserted here so the root-script adapter's no-vite
 * contract stays honest.
 */

import { describe, expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import * as lucide from 'lucide';
import {
  generateIconLibraryArtifacts,
  extractIconData,
  chunkModuleId,
} from '../../../src/icons/library/generate.js';
import { ICON_LIBRARY_SENTINEL_ERROR } from '../../../src/icons/ids.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import { serializeLucideIcon } from '../../../src/icons/providers/lucide.js';
import type { ResolvedLibraryIcon } from '../../../src/icons/library/types.js';
import { walkStaticImports } from './import-graph.js';

const io = {
  loadSource: async () => {
    throw new Error('unexpected file I/O — the default set needs none');
  },
  watchFile: () => undefined,
};

/** the REAL default-set resolution (lucide at build time, svgo pass) */
const defaultSet = async (): Promise<readonly ResolvedLibraryIcon[]> =>
  (await resolveLibraryInputs({}, io, createSafetyChecker({ mode: 'warn' }))).icons;

describe('the pure core imports no vite (root-script adapter contract)', () => {
  const src = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));

  test('generate.ts + script.ts static graphs contain no vite specifier', async () => {
    const generatorGraph = await walkStaticImports(src('../../../src/icons/library/generate.ts'));
    expect(generatorGraph.bareSpecifiers).not.toContain('vite');
    const scriptGraph = await walkStaticImports(src('../../../src/icons/library/script.ts'));
    expect(scriptGraph.bareSpecifiers).not.toContain('vite');
    // the pure core itself: no fs either (the script adapter may own fs)
    expect(generatorGraph.bareSpecifiers.some((spec) => spec.startsWith('node:fs'))).toBe(false);
  });
});

describe('the MEASURED default-set acceptance (38 built-ins, default options)', () => {
  test('chunk count, per-chunk byte totals and the artifact import list — from real output', async () => {
    const assets = await defaultSet();
    expect(assets).toHaveLength(38);

    const { artifact, chunks, report } = generateIconLibraryArtifacts(assets, {});

    // MEASURED (2026-09-06, lucide 0.472 canonical bytes, svgo no-op
    // pin): one chunk, 6602 serialized entry bytes, zero lazy chunks —
    // the default-config artifact is plugin-free by construction
    expect(report.iconCount).toBe(38);
    expect(report.chunkCount).toBe(1);
    expect([...report.chunkBytes.entries()]).toEqual([[0, 6602]]);
    expect(report.lazyChunks).toEqual([]);
    expect(report.warnings).toEqual([]);

    // the artifact's import list: zero virtual imports (plugin-free
    // tier), no lucide reference anywhere
    expect(artifact).not.toContain('virtual:jixoai-icons/chunk/');
    expect(artifact).not.toContain('lucide');

    // the inline core carries every name; the entry bytes stay under
    // the 20480 budget
    for (const name of ['arrowRight', 'check', 'type']) {
      expect(artifact).toContain(`  ${name}: {`);
    }
    expect([...report.chunkBytes.values()].every((total) => total <= 20480)).toBe(true);

    // chunk parity: the single chunk's module body matches the inline
    // entries byte-for-byte (same serializer, same data)
    const inlineEntries = artifact
      .split('const CHUNK_0: Readonly<Record<string, IconData>> = {')[1]!
      .split('\n};')[0]!;
    const chunkEntries = chunks.get(0)!.split('export default {')[1]!.split('\n};')[0]!;
    expect(inlineEntries).toBe(chunkEntries);
  });
});

describe('the artifact shape (design §6)', () => {
  test('GENERATED header, IconName union, ICON_NAMES, CHUNK_0/CHUNK_OF/LAZY, cache + API', async () => {
    const assets = await defaultSet();
    const { artifact } = generateIconLibraryArtifacts(assets, {});
    expect(artifact.startsWith('// GENERATED — do not edit (source: @jixoai/vite-plugin icons library face)\n')).toBe(true);
    expect(artifact).toContain("export type IconName =\n  | 'arrowRight'\n");
    expect(artifact).toContain("  | 'type'\n  ;");
    expect(artifact).toContain('] as readonly IconName[];');
    expect(artifact).toContain("export interface IconData { v: string; n: 'fill' | 'stroke'; d: string }");
    expect(artifact).toContain('const cache: Map<string, IconData> = new Map(Object.entries(CHUNK_0));');
    expect(artifact).toContain('export function getIcon(name: IconName): IconData | null {');
    expect(artifact).toContain('export async function loadIcon(name: IconName): Promise<IconData> {');
    expect(artifact).toContain('export function preloadIcons(names: Iterable<IconName>): Promise<unknown[]> {');
  });

  test('overflow layout: chunk 0 inline, overflow lazy, sentinel bytes in every LAZY catch', async () => {
    const assets = await defaultSet();
    const { artifact, report } = generateIconLibraryArtifacts(assets, { maxChunkBytes: 3000 });
    expect(report.chunkCount).toBeGreaterThan(1);
    expect(report.lazyChunks.length).toBeGreaterThan(0);

    // the sentinel message appears verbatim, once per lazy loader
    const sentinelLiteral = JSON.stringify(ICON_LIBRARY_SENTINEL_ERROR);
    const occurrences = artifact.split(sentinelLiteral).length - 1;
    expect(occurrences).toBe(report.lazyChunks.length);

    // every lazy index has exactly one virtual import
    for (const index of report.lazyChunks) {
      expect(artifact).toContain(`import('${chunkModuleId(index)}')`);
    }
    expect(artifact).not.toContain(`import('${chunkModuleId(0)}')`);
  });
});

describe('structured extraction (design §2)', () => {
  test('lucide stroke artwork → n=stroke, v=viewBox, d=children verbatim', () => {
    const svg = serializeLucideIcon(lucide.Check);
    const data = extractIconData(svg);
    expect(data.v).toBe('0 0 24 24');
    expect(data.n).toBe('stroke');
    expect(data.d).toBe('<path d="M20 6 9 17l-5-5"/>');
  });

  test("lucide's fill-dot child overrides SURVIVE in d (palette)", () => {
    const svg = serializeLucideIcon(lucide.Palette);
    const data = extractIconData(svg);
    expect(data.n).toBe('stroke'); // root stroke artwork wins
    expect(data.d).toContain('fill="currentColor"'); // the dots keep their paint
  });

  test('fill artwork → n=fill; root stroke="none" does not flip it', () => {
    const fill =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 1l2 5h5l-4 4 1 5-4-3-4 3 1-5-4-4h5z"/></svg>';
    expect(extractIconData(fill).n).toBe('fill');
    const noneStroke =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" stroke="none"><circle cx="8" cy="8" r="7"/></svg>';
    expect(extractIconData(noneStroke).n).toBe('fill');
  });

  test('child-level stroke artwork flips nature when the root carries none', () => {
    const childStroke =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 2l6 6" stroke="currentColor" fill="none"/></svg>';
    expect(extractIconData(childStroke).n).toBe('stroke');
  });

  test('root attrs are NOT stored: width/height and stroke props drop away', () => {
    const rootAttrs =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 1"/></svg>';
    const data = extractIconData(rootAttrs);
    expect(data.v).toBe('0 0 24 24');
    expect(data.d).toBe('<path d="M1 1"/>'); // only children survive
  });

  test('unparseable input throws the loud internal contract error', () => {
    expect(() => extractIconData('<div/>')).toThrowError(/no <svg> root/);
    expect(() => extractIconData('<svg viewBox="0 0 1 1"><path d="M1 1"/>')).toThrowError(/closing/);
    const noBox = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"/></svg>';
    expect(() => extractIconData(noBox)).toThrowError(/carries no viewBox/);
  });

  test('a svgo-emptied SELF-CLOSED root is legal (d = "")', () => {
    const emptied = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"/>';
    expect(extractIconData(emptied)).toEqual({ v: '0 0 24 24', n: 'stroke', d: '' });
  });
});

describe('the serializer control-char law (E4-r1 fix 2)', () => {
  // a raw newline is legal SVG text/attr content (e.g. a character ref
  // surviving an optimize:false pass) — the artifact's frozen
  // single-quote dialect MUST escape it or the generated TypeScript
  // breaks at the literal
  const multilineAsset: ResolvedLibraryIcon = {
    name: 'multilineProbe',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="1" y="2">a\nb\rc</text></svg>',
  };

  test('newlines/CRs inside payloads serialize as escapes, not raw bytes', () => {
    const { artifact } = generateIconLibraryArtifacts([multilineAsset], {});
    // the two-char escape sequences exist in the text…
    expect(artifact).toContain('<text x="1" y="2">a\\nb\\rc</text>');
    // …and no raw control byte rides inside the artifact between the
    // payload quotes (the entry line itself stays single-line)
    const entryLine = artifact.split('\n').find((line) => line.includes('multilineProbe'));
    expect(entryLine).toBeDefined();
    expect(entryLine).not.toMatch(/[\n\r]/);
  });

  test('the escaped literal round-trips through evaluation', () => {
    const { artifact } = generateIconLibraryArtifacts([multilineAsset], {});
    const literal = artifact.match(/d: ('(?:[^'\\]|\\.)*')/)?.[1];
    expect(literal).toBeDefined();
    // eslint-disable-next-line no-eval -- round-trip proof of the frozen dialect
    expect((0, eval)(literal)).toBe(multilineAsset.svg.match(/(<text[^>]*>.*<\/text>)/s)?.[1]);
  });
});
