/**
 * woff2-roundtrip.test.ts — follow-up C3 (2026-08-28): a REAL WOFF2
 * file through the full pipeline.
 *
 * The earlier suites passed TTF bytes named ".woff2" (providers see
 * post-normalization bytes, so the mock hid the gap). Here the fixture
 * is built in memory (opentype.js Font → CFF-flavored OTF bytes) and
 * compressed with wawoff2 — the same library loadSource uses for
 * decompression — so the bytes handed to the plugin are a genuine
 * WOFF2 container with the "wOF2" magic.
 *
 * Pipeline under test (real createIconPlugin lifecycle, NO serializer mock):
 *   WOFF2 bytes on disk → loadSource (magic sniff + decompress)
 *   → fontIconProvider (opentype.js parses the decompressed TTF)
 *   → SvgAsset → serializeIcon → the virtual CSS module.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import * as opentype from 'opentype.js';
import { describe, expect, test } from 'vitest';
import { fontIconProvider } from '../../src/icons/providers/font.js';
import type {
  IconProviderFactory,
  SourceDescriptor,
} from '../../src/icons/types.js';
import { createIconPlugin, VIRTUAL_MODULE_ID } from '../../src/icons/vite-plugin.js';

// wawoff2 ships no type declarations — the minimal surface this test
// uses lives in the sibling ambient wawoff2.d.ts (an inline
// `declare module` cannot augment a module that resolves to a real,
// untyped .js under this tsconfig)

// ── fixture font builder (same geometry contract as providers/font.test.ts) ──

const UPEM = 1000;
/** the canonical square: font bbox (100,0)–(700,600) → fills 24×24 exactly */
const SQUARE_CODEPOINT = 0xe901;

function buildIconFont(): Uint8Array {
  const square = new opentype.Path();
  square.moveTo(100, 0);
  square.lineTo(700, 0);
  square.lineTo(700, 600);
  square.lineTo(100, 600);
  square.close();

  const notdef = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 0,
    path: new opentype.Path(),
  });
  const glyph = new opentype.Glyph({
    name: 'fixture-square',
    unicode: SQUARE_CODEPOINT,
    advanceWidth: UPEM,
    path: square,
  });
  const font = new opentype.Font({
    familyName: 'JxTestIcons',
    styleName: 'Regular',
    unitsPerEm: UPEM,
    ascender: 800,
    descender: -200,
    glyphs: [notdef, glyph],
  });
  return new Uint8Array(font.toArrayBuffer());
}

// ── wawoff2 availability (optional dependency) ─────────────────────

const wawoff2 = await import('wawoff2').catch(() => null);

/** extract every number from an SVG path data string, in order */
function pathNumbers(d: string): number[] {
  const matches = d.match(/-?\d+(?:\.\d+)?/g);
  return (matches ?? []).map(Number);
}

// ── tests ──────────────────────────────────────────────────────────

describe.skipIf(wawoff2 === null)('WOFF2 real round-trip (C3)', () => {
  test('wawoff2.compress produces a genuine wOF2 container from the OTF fixture', async () => {
    const ttf = buildIconFont();
    const woff2 = new Uint8Array(await wawoff2!.compress(Buffer.from(ttf)));

    expect(String.fromCharCode(...woff2.slice(0, 4))).toBe('wOF2');
    expect(woff2.byteLength).toBeGreaterThan(0);
    expect(woff2.byteLength).toBeLessThan(ttf.byteLength); // Brotli does its job
  });

  test('WOFF2 bytes → loadSource decompress → fontIconProvider → SvgAsset → CSS module', async () => {
    const ttf = buildIconFont();
    const woff2 = new Uint8Array(await wawoff2!.compress(Buffer.from(ttf)));

    const dir = await mkdtemp(join(tmpdir(), 'jixoai-icons-woff2-'));
    try {
      const fontPath = join(dir, 'icons.woff2');
      await writeFile(fontPath, woff2);

      // capture what loadSource hands providers: proof the decompression
      // ran (TTF/OTF magic + font/ttf mime — never wOF2/font-woff2)
      let observed: SourceDescriptor | undefined;
      const inner = fontIconProvider({
        fontPath,
        symbols: { calendar: SQUARE_CODEPOINT },
      });
      const factory: IconProviderFactory = async (ctx) => {
        observed = await ctx.loadSource(fontPath);
        return inner(ctx);
      };

      const plugin = createIconPlugin({ icons: factory });
      const hooks = plugin as unknown as {
        buildStart(): Promise<void>;
        resolveId(id: string, importer?: string): string | null;
        load(id: string): Promise<string | null>;
      };
      await hooks.buildStart();

      // 1. loadSource transparently decompressed the WOFF2 container
      const descriptor = observed;
      expect(descriptor).toBeDefined();
      expect(descriptor!.mimeType).toBe('font/ttf');
      expect(descriptor!.path).toBe(resolve(fontPath));
      expect([...descriptor!.data.slice(0, 4)]).toEqual([...ttf.slice(0, 4)]); // "OTTO"
      expect(descriptor!.data.byteLength).toBe(ttf.byteLength);

      // 2. the provider parsed the decompressed TTF into an SvgAsset…
      const css = await hooks.load(
        hooks.resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css')!,
      );
      expect(css).toBeTruthy();

      // 3. …and the serializer embedded it in the virtual CSS module
      // (ink-baked frozen dialect: single-quoted attrs, literal ink —
      // the fill glyph's currentColor becomes #000 + stroke='none')
      expect(css).toContain('--jx-icon-calendar: url("data:image/svg+xml,');
      const decoded = decodeURIComponent(css!);
      expect(decoded).toContain("viewBox='0 0 24 24'");
      expect(decoded).toContain("fill='#000'");
      expect(decoded).toContain("stroke='none'");
      const pathMatch = /<path d='([^']*)'/.exec(decoded);
      expect(pathMatch).not.toBeNull();
      expect(pathMatch?.[1]).toBeDefined();
      // the canonical square, contain-fitted: (0,24)(24,24)(24,0)(0,0)
      expect(pathNumbers(pathMatch?.[1] ?? '')).toEqual([0, 24, 24, 24, 24, 0, 0, 0]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('a decompressed round-trip re-parses to the same glyph (compress ∘ decompress identity)', async () => {
    const ttf = buildIconFont();
    const woff2 = await wawoff2!.compress(Buffer.from(ttf));
    const back = new Uint8Array(
      await wawoff2!.decompress(Buffer.from(woff2.buffer, woff2.byteOffset, woff2.byteLength)),
    );
    expect(back.byteLength).toBe(ttf.byteLength);

    const font = opentype.parse(back.slice().buffer);
    const glyph = font.charToGlyph(String.fromCodePoint(SQUARE_CODEPOINT));
    const bbox = glyph.getBoundingBox();
    expect(bbox).toEqual({ x1: 100, y1: 0, x2: 700, y2: 600 });
  });
});
