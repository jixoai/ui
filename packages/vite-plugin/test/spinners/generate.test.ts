/**
 * generate.test.ts — the pure generator's output contract (P4, design
 * §5/§6): the DEFAULT artifact's content (the blocks-wave union + the
 * getSpin payload byte-equal to the vendored svg modulo root
 * extraction), determinism (identical inputs → identical bytes), the
 * extraction semantics mirrored from the icons law (nature detection,
 * root-attr drop, byte-faithful children incl. `<animate>`), and the
 * serializer's control-char dialect.
 *
 * Pure-core discipline: importing generate.ts transitively imports NO
 * vite module and NO fs — asserted here so the root-script adapter's
 * no-vite contract stays honest (the icons' generate.test.ts pin).
 */

import { describe, expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { generateSpinSet, extractSpinData } from '../../src/spinners/generate.js';
import { resolveSpinnerInputs } from '../../src/spinners/resolve.js';
import { BLOCKS_WAVE_SVG } from '../../src/spinners/manifest.js';
import { createSafetyChecker } from '../../src/icons/safety.js';
import type { ResolvedSpinner } from '../../src/spinners/types.js';
import { walkStaticImports } from '../icons/library/import-graph.js';

const io = {
  loadSource: async () => {
    throw new Error('unexpected file I/O — the default set needs none');
  },
  watchFile: () => undefined,
};

/** the REAL default-set resolution (the vendored manifest, RAW checked) */
const defaultSet = async (): Promise<readonly ResolvedSpinner[]> =>
  (await resolveSpinnerInputs({}, io, createSafetyChecker({ mode: 'warn' }))).spinners;

/** the vendored svg's children inner-HTML — the byte-equality oracle */
const blocksWaveChildren = (): string => {
  const rootEnd = BLOCKS_WAVE_SVG.indexOf('>') + 1;
  return BLOCKS_WAVE_SVG.slice(rootEnd, BLOCKS_WAVE_SVG.lastIndexOf('</svg>'));
};

describe('the pure core imports no vite / no fs (root-script adapter contract)', () => {
  const src = (relative: string): string => fileURLToPath(new URL(relative, import.meta.url));

  test('generate.ts static graph contains no vite and no node:fs specifier', async () => {
    const generatorGraph = await walkStaticImports(src('../../src/spinners/generate.ts'));
    expect(generatorGraph.bareSpecifiers).not.toContain('vite');
    expect(generatorGraph.bareSpecifiers.some((spec) => spec.startsWith('node:fs'))).toBe(false);
    const scriptGraph = await walkStaticImports(src('../../src/spinners/script.ts'));
    expect(scriptGraph.bareSpecifiers).not.toContain('vite');
  });
});

describe('the default artifact (design §6 item a — MEASURED from real output)', () => {
  test('the blocks-wave union + SPIN_NAMES + the single inline module shape', async () => {
    const assets = await defaultSet();
    expect(assets).toHaveLength(1);
    const { artifact, report } = generateSpinSet(assets);
    expect(report).toEqual({ spinnerCount: 1, warnings: [] });

    expect(artifact.startsWith(
      '// GENERATED — do not edit (source: @jixoai/ui-vite-plugin spinners face — regenerate via npm run gen:spins)\n',
    )).toBe(true);
    expect(artifact).toContain("export type SpinName =\n  | 'blocks-wave'\n  ;");
    expect(artifact).toContain("export const SPIN_NAMES = [\n  'blocks-wave',\n] as readonly SpinName[];");
    expect(artifact).toContain("export interface SpinData { v: string; n: 'fill' | 'stroke'; d: string }");
    expect(artifact).toContain('const SPINNERS: Readonly<Record<SpinName, SpinData>> = {');
    expect(artifact).toContain('export function getSpin(name: SpinName): SpinData | null {');
    // the own-property lookup guard (the icons diff-r1 M2 law)
    expect(artifact).toContain('return Object.hasOwn(SPINNERS, name) ? SPINNERS[name] : null;');
    // no lazy tier, no virtual ids, no plugin prerequisite (design §5)
    expect(artifact).not.toContain('import(');
    expect(artifact).not.toContain('virtual:');
  });

  test('the getSpin payload is byte-equal to the vendored svg modulo root extraction', async () => {
    const assets = await defaultSet();
    const { artifact } = generateSpinSet(assets);

    // the row: quoted kebab key + the structured payload
    const row = artifact.split('\n').find((line) => line.includes("'blocks-wave':"));
    expect(row).toBeDefined();
    expect(row).toContain("'blocks-wave': { v: '0 0 24 24', n: 'fill', d: ");
    expect(row).toContain('<rect '); // sanity: this IS the artwork row

    // the d literal round-trips through evaluation to the EXACT vendored
    // children bytes (9 rects, 36 animates, syncbase ids untouched)
    const literal = artifact.match(/d: ('(?:[^'\\]|\\.)*')/)?.[1];
    expect(literal).toBeDefined();
    // eslint-disable-next-line no-eval -- round-trip proof of the frozen dialect
    const d = (0, eval)(literal!) as string;
    expect(d).toBe(blocksWaveChildren());
    expect(d).toHaveLength(BLOCKS_WAVE_SVG.length - BLOCKS_WAVE_SVG.indexOf('>') - 1 - '</svg>'.length);
    expect((d.match(/<rect /g) ?? []).length).toBe(9);
    expect((d.match(/<animate /g) ?? []).length).toBe(36);
    expect(d).toContain('id="spinner_oJFS"');
    expect(d).toContain('begin="spinner_oJFS.begin+0.1s"');
  });
});

describe('determinism (design §6 item e)', () => {
  test('identical inputs produce byte-identical outputs — generator AND pipeline', async () => {
    const assets = await defaultSet();
    expect(generateSpinSet(assets).artifact).toBe(generateSpinSet(assets).artifact);

    // the full adapter pipeline too (two fresh resolutions, same bytes)
    const first = generateSpinSet(await defaultSet()).artifact;
    const second = generateSpinSet(await defaultSet()).artifact;
    expect(first).toBe(second);
  });

  test('packing order = input order: built-ins first, customs after', () => {
    const custom: ResolvedSpinner = {
      name: 'my-loader',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
    };
    const assets: readonly ResolvedSpinner[] = [{ name: 'blocks-wave', svg: BLOCKS_WAVE_SVG }, custom];
    const { artifact } = generateSpinSet(assets);
    expect(artifact.indexOf("'blocks-wave'")).toBeLessThan(artifact.indexOf("'my-loader'"));
    // kebab keys are quoted (never bare identifiers)
    expect(artifact).toContain("  'my-loader': {");
  });

  test('the empty set stays total (never union, empty names, null lookups)', () => {
    const { artifact, report } = generateSpinSet([]);
    expect(report.spinnerCount).toBe(0);
    expect(artifact).toContain('export type SpinName = never;');
    expect(artifact).toContain('export const SPIN_NAMES = [\n] as readonly SpinName[];');
    expect(artifact).toContain('const SPINNERS: Readonly<Record<SpinName, SpinData>> = {\n};');
  });
});

describe('structured extraction (design §3 — the icons law mirrored)', () => {
  test('fill artwork (blocks-wave root) → n=fill, v=viewBox, d byte-faithful', () => {
    const data = extractSpinData(BLOCKS_WAVE_SVG);
    expect(data.v).toBe('0 0 24 24');
    expect(data.n).toBe('fill');
    expect(data.d).toBe(blocksWaveChildren());
  });

  test('root stroke artwork wins; stroke="none" does not flip fill', () => {
    const stroke =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d="M12 3a9 9 0 1 1-9 9"/></svg>';
    expect(extractSpinData(stroke).n).toBe('stroke');
    const noneStroke =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" stroke="none"><circle cx="8" cy="8" r="7"/></svg>';
    expect(extractSpinData(noneStroke).n).toBe('fill');
  });

  test('child-level stroke artwork flips nature when the root carries none', () => {
    const childStroke =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M2 2l6 6" stroke="currentColor" fill="none"/></svg>';
    expect(extractSpinData(childStroke).n).toBe('stroke');
  });

  test('root attrs are NOT stored: xmlns/width/height and paint props drop away', () => {
    const rootAttrs =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 1"/></svg>';
    const data = extractSpinData(rootAttrs);
    expect(data.v).toBe('0 0 24 24');
    expect(data.d).toBe('<path d="M1 1"/>');
  });

  test('a SELF-CLOSED empty root is legal (d = "")', () => {
    const emptied = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"/>';
    expect(extractSpinData(emptied)).toEqual({ v: '0 0 24 24', n: 'fill', d: '' });
  });

  test('unparseable input throws the loud internal contract error', () => {
    expect(() => extractSpinData('<div/>')).toThrowError(/no <svg> root/);
    expect(() => extractSpinData('<svg viewBox="0 0 1 1"><path d="M1 1"/>')).toThrowError(/closing/);
    const noBox = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M1 1"/></svg>';
    expect(() => extractSpinData(noBox)).toThrowError(/carries no viewBox/);
  });
});

describe('the serializer control-char law (the icons E4-r2 hardening, carried over)', () => {
  // a raw newline is legal SVG text content — the frozen single-quote
  // dialect MUST escape it or the generated TypeScript breaks at the
  // literal. U+2028/U+2029 spelled with explicit \u escapes here —
  // invisible literals are tool-fragile.
  const LS = '\u2028';
  const PS = '\u2029';
  const multilineAsset: ResolvedSpinner = {
    name: 'multiline-probe',
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
      `<text x="1" y="2">a\nb\rc${LS}d${PS}</text></svg>`,
  };

  test('control chars inside payloads serialize as escapes, not raw bytes', () => {
    const { artifact } = generateSpinSet([multilineAsset]);
    expect(artifact).toContain('<text x="1" y="2">a\\nb\\rc\\u2028d\\u2029</text>');
    const entryLine = artifact.split('\n').find((line) => line.includes('multiline-probe'));
    expect(entryLine).toBeDefined();
    expect(entryLine).not.toMatch(/[\n\r]/);
  });

  test('the escaped literal round-trips through evaluation', () => {
    const { artifact } = generateSpinSet([multilineAsset]);
    const literal = artifact.match(/d: ('(?:[^'\\]|\\.)*')/)?.[1];
    expect(literal).toBeDefined();
    // eslint-disable-next-line no-eval -- round-trip proof of the frozen dialect
    expect((0, eval)(literal!)).toBe(multilineAsset.svg.match(/(<text[^>]*>.*<\/text>)/s)?.[1]);
  });
});
