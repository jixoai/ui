/**
 * Ambient type declarations for the subset of opentype.js consumed by
 * fontIconProvider (P2.3, 2026-08-28).
 *
 * Why ambient instead of @types/opentype.js: opentype.js is an OPTIONAL
 * dependency (absent installs must still typecheck), and opentype.js@1.x
 * ships no bundled types. Verified: this declaration passes strict tsc
 * both when the package is absent and when @types/opentype.js is also
 * installed (ambient shadows without conflict).
 *
 * The Font/Glyph/Path constructors are declared because the TEST suite
 * builds fixture fonts in memory through them (no binary fixtures).
 *
 * Extended for icon-library-presets (B1/B3, 2026-09-07): glyph ids /
 * names / unicodes, the GlyphSet, numGlyphs, stringToGlyphs and the
 * loosely-typed tables surface — the library face's ligature lane
 * narrows GSUB type-4 data with runtime guards (font-extract.ts).
 *
 * TODO: delete this file if @types/opentype.js ever becomes a hard
 * devDependency — the real declarations cover a larger surface.
 */

declare module 'opentype.js' {
  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export class Path {
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    close(): void;
    toPathData(decimalPlaces?: number): string;
  }

  export class Glyph {
    constructor(options: {
      name?: string;
      unicode?: number;
      advanceWidth?: number;
      path?: Path;
    });
    /** the glyph's id inside the font (GSUB tables speak ids) */
    index: number;
    /** the font's own glyph name (post table) */
    name: string;
    /** the cmap-mapped codepoint, when one exists */
    unicode?: number;
    /** build-time outline extraction: font units → SVG path (y-axis flipped) */
    getPath(x?: number, y?: number, fontSize?: number): Path;
    /** bounding box in font units (y-up), before normalization */
    getBoundingBox(): BoundingBox;
  }

  /** the id → Glyph map every parsed font carries */
  export interface GlyphSet {
    get(index: number): Glyph;
    length: number;
  }

  export class Font {
    constructor(options: {
      familyName?: string;
      styleName?: string;
      unitsPerEm?: number;
      ascender?: number;
      descender?: number;
      glyphs?: Glyph[];
    });
    unitsPerEm: number;
    /** glyph count (the id → glyph range is 0..numGlyphs-1) */
    numGlyphs: number;
    glyphs: GlyphSet;
    /**
     * the parsed sfnt tables — loosely typed by law: opentype.js's
     * high-level GSUB API is thin and the raw table shapes vary;
     * consumers narrow with runtime type guards (see
     * library/font-extract.ts's ligature lane)
     */
    tables: { readonly gsub?: { readonly lookups?: readonly unknown[] } };
    /** cmap lookup → glyph index (0 = .notdef = "no glyph mapped") */
    charToGlyphIndex(s: string): number;
    charToGlyph(c: string): Glyph;
    /** per-character cmap resolution (a ligature's input sequence) */
    stringToGlyphs(s: string): Glyph[];
    /** serializes as CFF-flavored OTF — opentype.js's builder output format */
    toArrayBuffer(): ArrayBuffer;
  }

  /** NOTE: opentype.parse requires a plain ArrayBuffer — a Uint8Array view throws */
  export function parse(buffer: ArrayBuffer): Font;
}
