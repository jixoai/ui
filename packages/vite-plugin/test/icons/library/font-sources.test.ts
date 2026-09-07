/**
 * font-sources.test.ts — the library face's font lane (B1/B2/B3,
 * openspec icon-library-presets design §2 / spec delta).
 *
 * The `{font, code}` / `{font, liga}` sources, driven through the REAL
 * plugin lifecycle wherever the lane's inherited machinery matters
 * (the woff2-roundtrip precedent):
 *
 *   - woff2 decompression is INHERITED from loadSource (a genuine wOF2
 *     container on disk → buildStart → the artifact carries the glyph,
 *     fill-nature, no font bytes anywhere)
 *   - woff1 stays the hard error; ttf/otf paths are accepted directly
 *   - the codepoint lane: cmap hit → contain-fitted outline (the shared
 *     font-extract math — the slot-face square fixture, 24×24 exact);
 *     a codepoint absent from cmap and an empty outline fail by name
 *     (the slot-face precedents)
 *   - the ligature lane: a REAL GSUB type-4 ligature resolves (the
 *     JetBrains Mono fraction set — @fontsource/jetbrains-mono in
 *     devDeps); a miss fails by name listing the font's resolvable
 *     ligature sequences; a font with NO parsable GSUB falls back to
 *     the glyph-name/cmap hint
 *   - the font file joins watchFile (HMR rides the {file} refresh path)
 *   - the SCRIPT twin (gen:icons / verify:icons) REJECTS font sources
 *     with the named svg-only error (the decided v1 scope)
 *
 * opentype.js cannot AUTHOR GSUB tables (its Font builder writes
 * glyphs + cmap only) — the in-memory fixture font therefore carries
 * codepoint glyphs but no ligatures; the liga HIT path uses the real
 * JetBrains Mono woff2 instead (declared limitation, not faked).
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import * as opentype from 'opentype.js';
import { afterAll, describe, expect, test } from 'vitest';
import type { Plugin } from 'vite';
import { createIconPlugin } from '../../../src/icons/vite-plugin.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import { extractIconData } from '../../../src/icons/library/generate.js';
import {
  findLigatureGlyph,
  ligatureNames,
  loadOpentype,
  toArrayBuffer,
} from '../../../src/icons/library/font-extract.js';
import {
  checkIconLibraryArtifact,
  writeIconLibraryArtifact,
} from '../../../src/icons/library/script.js';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import type { ProviderContext, SourceDescriptor } from '../../../src/icons/types.js';

// ── the fixture font (the font.test.ts geometry contract) ──────────

const UPEM = 1000;
const SQUARE_CODEPOINT = 0xe901;
const EMPTY_CODEPOINT = 0xe903;

/** the canonical square: font bbox (100,0)–(700,600) → fills 24×24 exactly */
function buildFixtureFont(withEmpty = false): Uint8Array {
  const square = new opentype.Path();
  square.moveTo(100, 0);
  square.lineTo(700, 0);
  square.lineTo(700, 600);
  square.lineTo(100, 600);
  square.close();
  const glyphs = [
    new opentype.Glyph({ name: '.notdef', unicode: 0, advanceWidth: 0, path: new opentype.Path() }),
    new opentype.Glyph({ name: 'fixture-square', unicode: SQUARE_CODEPOINT, advanceWidth: UPEM, path: square }),
  ];
  if (withEmpty) {
    glyphs.push(
      new opentype.Glyph({ name: 'fixture-empty', unicode: EMPTY_CODEPOINT, advanceWidth: UPEM, path: new opentype.Path() }),
    );
  }
  const font = new opentype.Font({
    familyName: 'JxLibIcons',
    styleName: 'Regular',
    unitsPerEm: UPEM,
    ascender: 800,
    descender: -200,
    glyphs,
  });
  return new Uint8Array(font.toArrayBuffer());
}

// ── shared fixtures root + the REAL plugin lifecycle harness ───────

let fixtureRoot: string;
afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const freshFixture = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'jixoai-lib-font-'));
  fixtureRoot = dir;
  return dir;
};

interface PluginLifecycle {
  configResolved(config: { root: string }): void;
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): Promise<string | null>;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

/** drive the REAL plugin (loadSource: woff2 sniff+decompress, woff1 error, mime) */
const pluginArtifact = async (
  root: string,
  icons: Record<string, { font: string; code: number } | { font: string; liga: string }>,
): Promise<{ artifact: string; consoleWarns: string[] }> => {
  const warn = console.warn;
  const consoleWarns: string[] = [];
  console.warn = (message: string) => consoleWarns.push(message);
  try {
    const plugin = createIconPlugin({ library: { includeDefaults: false, icons } });
    lifecycle(plugin).configResolved({ root });
    await lifecycle(plugin).buildStart();
    const artifactPath = join(root, 'src/lib/icon-set.gen.ts');
    return { artifact: (await lifecycle(plugin).load(artifactPath)) ?? '', consoleWarns };
  } finally {
    console.warn = warn;
  }
};

const wawoff2 = await import('wawoff2').catch(() => null);

// ── the codepoint lane ─────────────────────────────────────────────

describe('{ font, code } — the primary lane', () => {
  test('a ttf glyph lands in the artifact as fill-nature artwork (real plugin)', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());

    const { artifact } = await pluginArtifact(root, { brand: { font: ttfPath, code: SQUARE_CODEPOINT } });
    expect(artifact).toContain("'brand'");
    expect(artifact).toContain("n: 'fill'");
    expect(artifact).toContain("v: '0 0 24 24'");
    // the canonical square contain-fitted exactly (the shared math).
    // svgo may ELIDE the closing Z on fill-only artwork (an open
    // subpath fills as if closed — SVG 1.1 F.7; pre-existing behavior
    // drift in the svgo pin, byte-equal rendering), so the Z is optional
    expect(artifact).toMatch(
      /d: '<path d="M0 24L24 24L24 0L0 0Z?" fill="currentColor"\/>/,
    );
    // the artifact is pure SVG — no font bytes cross the boundary
    expect(artifact).not.toMatch(/woff|OTTO|trueType/i);
  });

  test.skipIf(wawoff2 === null)('a genuine woff2 container decompresses through loadSource (inherited)', async () => {
    const root = await freshFixture();
    const ttf = buildFixtureFont();
    const woff2 = new Uint8Array(await wawoff2!.compress(Buffer.from(ttf)));
    expect(String.fromCharCode(...woff2.slice(0, 4))).toBe('wOF2'); // a real container
    const woff2Path = join(root, 'icons.woff2');
    await writeFile(woff2Path, woff2);

    const { artifact } = await pluginArtifact(root, { brand: { font: woff2Path, code: SQUARE_CODEPOINT } });
    expect(artifact).toContain("'brand'");
    expect(artifact).toContain("n: 'fill'");
  });

  test('woff1 stays the hard loadSource error', async () => {
    const root = await freshFixture();
    const woff1Path = join(root, 'icons.woff');
    await writeFile(woff1Path, new Uint8Array([0x77, 0x4f, 0x46, 0x46, 0, 0, 0, 0])); // "wOFF"
    await expect(pluginArtifact(root, { bad: { font: woff1Path, code: SQUARE_CODEPOINT } })).rejects.toThrowError(
      /WOFF 1\.0 is not supported/,
    );
  });

  test('the font file joins watchFile (HMR rides the {file} refresh path)', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());

    const watched: string[] = [];
    const io: ProviderContext = {
      async loadSource(path) {
        const data = new Uint8Array(await readFile(path));
        const descriptor: SourceDescriptor = { data, path, mimeType: 'font/ttf' };
        return descriptor;
      },
      watchFile(path) {
        watched.push(path);
      },
    };
    const { icons } = await resolveLibraryInputs(
      { includeDefaults: false, icons: { brand: { font: ttfPath, code: SQUARE_CODEPOINT } } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    expect(watched).toEqual([ttfPath]);
    expect(extractIconData(icons[0]!.svg).n).toBe('fill');
  });

  test('a codepoint absent from cmap fails by name (the slot-face precedent)', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());
    await expect(
      pluginArtifact(root, { miss: { font: ttfPath, code: 0x9999 } }),
    ).rejects.toThrowError(/no glyph mapped at U\+9999.*check the codepoint against the font's cmap/s);
  });

  test('an empty outline fails by name (never an invisible icon)', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont(true));
    await expect(
      pluginArtifact(root, { blank: { font: ttfPath, code: EMPTY_CODEPOINT } }),
    ).rejects.toThrowError(/empty outline.*configuration error/s);
  });

  test('an out-of-range codepoint fails by name', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());
    await expect(
      pluginArtifact(root, { bad: { font: ttfPath, code: 0x110000 } }),
    ).rejects.toThrowError(/codepoint.*is not a legal Unicode scalar/s);
  });

  test('a non-font file fails the mime law', async () => {
    const root = await freshFixture();
    const svgPath = join(root, 'not-a-font.svg');
    await writeFile(svgPath, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/>');
    await expect(
      pluginArtifact(root, { bad: { font: svgPath, code: SQUARE_CODEPOINT } }),
    ).rejects.toThrowError(/image\/svg\+xml, not font\/ttf/);
  });
});

// ── the ligature lane (best-effort, B3) ────────────────────────────

/** the real GSUB-carrying woff2 (declared devDep — resolution is real) */
const JETBRAINS_WOFF2 = (() => {
  const require = createRequire(pathToFileURL('./src/'));
  return require.resolve('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2');
})();

describe('{ font, liga } — the best-effort lane', () => {
  test('a REAL GSUB type-4 ligature resolves (JetBrains Mono fractions)', async () => {
    const root = await freshFixture();
    const { artifact } = await pluginArtifact(root, { quarter: { font: JETBRAINS_WOFF2, liga: '1/4' } });
    expect(artifact).toContain("'quarter'");
    expect(artifact).toContain("n: 'fill'");
    // the onequarter outline (glyph names: one + slash + four)
    expect(artifact).toMatch(/d: '<path d="M[^"]+/);
  });

  test.skipIf(wawoff2 === null)('GSUB coverage FORMAT 2 resolves + enumerates (codex r2 M1)', async () => {
    // opentype.js emits format-2 coverage as `ranges` (verified against
    // dist/opentype.module.js's lookupCoverage — the walker's earlier
    // `rangeRecords` spelling is the OpenType-spec table name, not the
    // parser's field, so every format-2 font silently missed). JetBrains
    // Mono ships format 1; this rewrites its REAL parsed coverage into
    // the equivalent format-2 shape the parser would emit and proves
    // the walker honors it on real glyph data.
    const ttf = new Uint8Array(await wawoff2!.decompress(readFileSync(JETBRAINS_WOFF2)));
    const font = (await loadOpentype()).parse(toArrayBuffer(ttf));
    const lookups = (font.tables.gsub?.lookups ?? []) as ReadonlyArray<{
      lookupType?: number;
      subtables?: unknown[];
    }>;
    const lookup = lookups.find((candidate) => candidate.lookupType === 4);
    expect(lookup).toBeDefined();
    const subtable = lookup!.subtables![0] as {
      coverage: {
        format: number;
        glyphs?: number[];
        ranges?: Array<{ start: number; end: number; index: number }>;
      };
    };
    expect(subtable.coverage.format).toBe(1); // the fixture font is format 1
    subtable.coverage = {
      format: 2,
      ranges: subtable.coverage.glyphs!.map((glyph, index) => ({
        start: glyph,
        end: glyph,
        index,
      })),
    };
    expect(findLigatureGlyph(font, '1/4')).not.toBeNull();
    expect(ligatureNames(font)).toContain('one_slash_four');
  });

  test('a ligature miss lists the font\'s resolvable ligature sequences', async () => {
    const root = await freshFixture();
    await expect(
      pluginArtifact(root, { miss: { font: JETBRAINS_WOFF2, liga: 'no-such-ligature' } }),
    ).rejects.toThrowError(
      /ligature "no-such-ligature" cannot be resolved.*resolvable ligatures include: .*one_slash_four/s,
    );
  });

  test('a font with no parsable GSUB falls back to the glyph-name/cmap hint', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());
    await expect(
      pluginArtifact(root, { miss: { font: ttfPath, liga: 'no-such-ligature' } }),
    ).rejects.toThrowError(
      /exposes no ligature table for this font.*glyph names include: .*fixture-square/s,
    );
  });

  test('a single-character liga is refused (a ligature needs a sequence)', async () => {
    const root = await freshFixture();
    const ttfPath = join(root, 'icons.ttf');
    await writeFile(ttfPath, buildFixtureFont());
    await expect(
      pluginArtifact(root, { miss: { font: ttfPath, liga: 'x' } }),
    ).rejects.toThrowError(/cannot be resolved.*glyph names include/s);
  });
});

// ── the script twin rejects font sources (the decided v1 scope) ────

describe('the SCRIPT twin (gen:icons / verify:icons)', () => {
  test('write mode rejects font sources with the named svg-only error', async () => {
    const target = join(await freshFixture(), 'icon-set.gen.ts');
    await expect(
      writeIconLibraryArtifact(
        { includeDefaults: false, icons: { brand: { font: './x.woff2', code: 0xe002 } } },
        target,
      ),
    ).rejects.toThrowError(
      /"brand" uses a font source.*root-script adapter.*svg-only.*vite plugin's loadSource lane/s,
    );
  });

  test('check mode rejects font sources the same way (no silent mime lie)', async () => {
    const target = join(await freshFixture(), 'icon-set.gen.ts');
    await expect(
      checkIconLibraryArtifact(
        { includeDefaults: false, icons: { brand: { font: './x.woff2', liga: 'md-logo' } } },
        target,
      ),
    ).rejects.toThrowError(/svg-only by design/);
  });
});
