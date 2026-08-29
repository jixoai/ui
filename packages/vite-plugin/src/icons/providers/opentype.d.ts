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
    /** build-time outline extraction: font units → SVG path (y-axis flipped) */
    getPath(x?: number, y?: number, fontSize?: number): Path;
    /** bounding box in font units (y-up), before normalization */
    getBoundingBox(): BoundingBox;
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
    /** cmap lookup → glyph index (0 = .notdef = "no glyph mapped") */
    charToGlyphIndex(s: string): number;
    charToGlyph(c: string): Glyph;
    /** serializes as CFF-flavored OTF — opentype.js's builder output format */
    toArrayBuffer(): ArrayBuffer;
  }

  /** NOTE: opentype.parse requires a plain ArrayBuffer — a Uint8Array view throws */
  export function parse(buffer: ArrayBuffer): Font;
}
