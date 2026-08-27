/**
 * fontIconProvider unit tests (P2.3, 2026-08-28).
 *
 * Fixtures are BUILT IN MEMORY with opentype.js's Font/Glyph/Path
 * constructors (no binary files in git, no filesystem I/O — the mock
 * ProviderContext hands bytes straight to the provider, mirroring the
 * frozen SourceDescriptor contract).
 *
 * opentype.js's font builder serializes CFF-flavored OTF, which the
 * provider must consume exactly like TTF (same parse entry point).
 */

import * as opentype from 'opentype.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProviderContext, SourceDescriptor } from '../../src/types.js';
import { fontIconProvider } from '../../src/providers/font.js';

// ── fixture font builder ───────────────────────────────────────────

interface FixtureGlyphSpec {
  readonly codepoint: number;
  /** polygon points in font units (y-up); null = glyph with no outline */
  readonly polygon: ReadonlyArray<readonly [number, number]> | null;
}

const UPEM = 1000;

function buildIconFont(glyphs: ReadonlyArray<FixtureGlyphSpec>): Uint8Array {
  const notdef = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: 0,
    path: new opentype.Path(),
  });
  const fontGlyphs = [
    notdef,
    ...glyphs.map((spec, i) => {
      const path = new opentype.Path();
      if (spec.polygon !== null) {
        const [first, ...rest] = spec.polygon;
        path.moveTo(first[0], first[1]);
        for (const [x, y] of rest) path.lineTo(x, y);
        path.close();
      }
      return new opentype.Glyph({
        name: `fixture-${i}`,
        unicode: spec.codepoint,
        advanceWidth: UPEM,
        path,
      });
    }),
  ];
  const font = new opentype.Font({
    familyName: 'JxTestIcons',
    styleName: 'Regular',
    unitsPerEm: UPEM,
    ascender: 800,
    descender: -200,
    glyphs: fontGlyphs,
  });
  return new Uint8Array(font.toArrayBuffer());
}

/** the canonical square: font bbox (100,0)–(700,600) → fills 24×24 exactly */
const SQUARE: FixtureGlyphSpec = {
  codepoint: 0xe901,
  polygon: [
    [100, 0],
    [700, 0],
    [700, 600],
    [100, 600],
  ],
};

/** the canonical triangle: bbox (0,0)–(1000,400), wider than tall */
const TRIANGLE: FixtureGlyphSpec = {
  codepoint: 0xe902,
  polygon: [
    [0, 0],
    [1000, 0],
    [1000, 400],
  ],
};

/** a different shape at the same codepoint — proves HMR re-extraction */
const DIAMOND_SQUARE: FixtureGlyphSpec = {
  codepoint: 0xe901,
  polygon: [
    [100, 300],
    [400, 0],
    [700, 300],
    [400, 600],
  ],
};

// ── mock ProviderContext ───────────────────────────────────────────

interface MockContext extends ProviderContext {
  readonly watchers: ReadonlyMap<string, () => void>;
}

function mockContext(getData: () => Uint8Array): MockContext {
  const watchers = new Map<string, () => void>();
  return {
    watchers,
    loadSource: async (path: string): Promise<SourceDescriptor> => ({
      data: getData(),
      path,
      // WOFF2 was already decompressed upstream — providers only ever see TTF
      mimeType: 'font/ttf',
    }),
    watchFile: (path: string, onChange: () => void): void => {
      watchers.set(path, onChange);
    },
  };
}

// ── helpers ────────────────────────────────────────────────────────

/** extract every number from an SVG path data string, in order */
function pathNumbers(d: string): number[] {
  const matches = d.match(/-?\d+(?:\.\d+)?/g);
  return (matches ?? []).map(Number);
}

function expectNumbersEqual(actual: number[], expected: number[]): void {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i]).toBeCloseTo(expected[i], 3);
  }
}

function pathD(svg: string): string {
  const match = /<path d="([^"]*)"/.exec(svg);
  if (match === null) throw new Error(`no <path d> in: ${svg}`);
  return match[1];
}

// ── tests ──────────────────────────────────────────────────────────

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('opentype.js');
});

describe('fontIconProvider', () => {
  it('extracts a glyph and normalizes it to the default 24×24 viewBox', async () => {
    const fontBytes = buildIconFont([SQUARE]);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.woff2',
      symbols: { calendar: 0xe901 },
    })(mockContext(() => fontBytes));

    const icon = provider.getIcon('calendar');
    expect(icon).not.toBeNull();
    expect(icon!.svg).toContain('viewBox="0 0 24 24"');
    expect(icon!.svg).toContain('fill="currentColor"');
    expect(icon!.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    // square 600×600 → fills the viewBox exactly; y-axis flipped (font y-up)
    expectNumbersEqual(pathNumbers(pathD(icon!.svg)), [0, 24, 24, 24, 24, 0, 0, 0]);
    expect(icon!.viewBox).toEqual({ width: 24, height: 24 });
    expect(icon!.nature).toBe('fill');
    expect(icon!.source).toEqual({
      kind: 'font-glyph',
      path: 'icons/jx.woff2',
      codepoint: 0xe901,
    });
  });

  it('contain-fits a wide glyph: uniform scale + centering + y-flip', async () => {
    const fontBytes = buildIconFont([TRIANGLE]);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { chevron: 0xe902 },
    })(mockContext(() => fontBytes));

    const d = pathD(provider.getIcon('chevron')!.svg);
    // scale = 24/1000; x centered: (24−1000·s)/2 = 0; y centered: (24−400·s)/2 = 7.2
    // (0,0)→(0,16.8)  (1000,0)→(24,16.8)  (1000,400)→(24,7.2) — top of glyph lands low in SVG
    expectNumbersEqual(pathNumbers(d), [0, 16.8, 24, 16.8, 24, 7.2]);
  });

  it('normalizes to a custom non-square viewBox', async () => {
    const fontBytes = buildIconFont([SQUARE]);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901 },
      viewBox: { width: 32, height: 16 },
    })(mockContext(() => fontBytes));

    const icon = provider.getIcon('calendar')!;
    expect(icon!.svg).toContain('viewBox="0 0 32 16"');
    expect(icon!.viewBox).toEqual({ width: 32, height: 16 });
    // scale = 16/600 (height-bound); the bbox left edge lands at (32−16)/2 = 8,
    // right edge at 24; baseline at y=16, top at y=0
    expectNumbersEqual(pathNumbers(pathD(icon!.svg)), [8, 16, 24, 16, 24, 0, 8, 0]);
  });

  it('serves multiple slots from one font and returns null for unmapped slots', async () => {
    const fontBytes = buildIconFont([SQUARE, TRIANGLE]);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901, chevron: 0xe902 },
    })(mockContext(() => fontBytes));

    const calendar = provider.getIcon('calendar');
    const chevron = provider.getIcon('chevron');
    expect(calendar).not.toBeNull();
    expect(chevron).not.toBeNull();
    expect(pathD(calendar!.svg)).not.toBe(pathD(chevron!.svg));
    expect(provider.getIcon('pipette')).toBeNull();
    expect(provider.getIcon('clear')).toBeNull();
  });

  it('parses a Uint8Array that is a subarray view of a larger buffer', async () => {
    const fontBytes = buildIconFont([SQUARE]);
    const padded = new Uint8Array(fontBytes.byteLength + 8);
    padded.set(fontBytes, 8);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901 },
    })(mockContext(() => padded.subarray(8)));

    expect(provider.getIcon('calendar')).not.toBeNull();
  });

  it('registers the font for HMR and swaps the cache after a change', async () => {
    let fontBytes = buildIconFont([SQUARE]);
    const ctx = mockContext(() => fontBytes);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901 },
    })(ctx);

    expect(ctx.watchers.has('icons/jx.ttf')).toBe(true);
    expectNumbersEqual(pathNumbers(pathD(provider.getIcon('calendar')!.svg)), [
      0, 24, 24, 24, 24, 0, 0, 0,
    ]);

    // file changed on disk → plugin fires the watcher → re-extraction
    const squareSvg = provider.getIcon('calendar')!.svg;
    fontBytes = buildIconFont([DIAMOND_SQUARE]);
    ctx.watchers.get('icons/jx.ttf')!();

    await vi.waitFor(() => {
      expect(provider.getIcon('calendar')!.svg).not.toBe(squareSvg);
    });
    // diamond (100,300)(400,0)(700,300)(400,600): same bbox as the square, but the
    // path pinches to the center: (0,12)(12,24)(24,12)(12,0)
    expectNumbersEqual(pathNumbers(pathD(provider.getIcon('calendar')!.svg)), [
      0, 12, 12, 24, 24, 12, 12, 0,
    ]);
  });

  it('keeps serving the previous cache when a post-change re-parse fails', async () => {
    let fontBytes = buildIconFont([SQUARE]);
    const ctx = mockContext(() => fontBytes);
    const provider = await fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901 },
    })(ctx);

    const before = provider.getIcon('calendar')!.svg;

    fontBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]); // corrupt mid-edit save
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    ctx.watchers.get('icons/jx.ttf')!();
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalled();
    });
    expect(provider.getIcon('calendar')!.svg).toBe(before);
  });

  it('throws a descriptive error for a codepoint with no cmap entry', async () => {
    const fontBytes = buildIconFont([SQUARE]);
    const factory = fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0x9999 },
    });
    await expect(factory(mockContext(() => fontBytes))).rejects.toThrow(
      /no glyph mapped at U\+9999.*slot "calendar"/s,
    );
  });

  it('throws for a mapped glyph with an empty outline', async () => {
    const fontBytes = buildIconFont([SQUARE, { codepoint: 0xe903, polygon: null }]);
    const factory = fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { clear: 0xe903 },
    });
    await expect(factory(mockContext(() => fontBytes))).rejects.toThrow(
      /slot "clear".*empty outline/s,
    );
  });

  it('throws for an out-of-range codepoint', async () => {
    const fontBytes = buildIconFont([SQUARE]);
    const factory = fontIconProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0x110000 },
    });
    await expect(factory(mockContext(() => fontBytes))).rejects.toThrow(/invalid codepoint/);
  });
});

describe('fontIconProvider without opentype.js installed', () => {
  it('fails with an install hint instead of a raw module error', async () => {
    vi.doMock('opentype.js', () => {
      throw new Error("Cannot find module 'opentype.js'");
    });
    const { fontIconProvider: freshProvider } = await import('../../src/providers/font.js');
    const factory = freshProvider({
      fontPath: 'icons/jx.ttf',
      symbols: { calendar: 0xe901 },
    });
    await expect(factory(mockContext(() => buildIconFont([SQUARE])))).rejects.toThrow(
      /requires opentype\.js/,
    );
  });
});
