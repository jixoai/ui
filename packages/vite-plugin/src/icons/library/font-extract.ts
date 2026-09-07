/**
 * @jixoai/vite-plugin (icons) — the SHARED font-glyph extraction helpers
 * (B1, openspec icon-library-presets design §2).
 *
 * Factored from providers/font.ts so the library face's font sources
 * ({ font, code } / { font, liga }) reuse the slot face's EXACT math.
 * SHARED here: opentype.js loading, the ArrayBuffer normalization, the
 * glyph → viewBox contain-fit normalization, and the bbox-emptiness
 * predicate. NOT shared (by law): decompression — it lives in the vite
 * plugin's loadSource, never fontIconProvider's, so the library lane
 * inherits woff2 decompress / the woff1 hard error / ttf-otf mime
 * detection through `io.loadSource` — and `extractGlyph` with its
 * slot-labeled error strings STAYS in font.ts (test-locked,
 * font.test.ts:281-303). Slot-face behavior must not change: sharing
 * helpers is legal, changing the slot face is not.
 */

import type { Font as OtFont, Glyph as OtGlyph } from 'opentype.js';

/** the glyph bbox shape opentype.js reports */
export interface GlyphBBox {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/** path-data precision: 3 decimals on a ≤ few-hundred-px viewBox is sub-pixel */
export const PATH_DECIMALS = 3;

// ── opentype.js loading (optional dependency) ──────────────────────

export async function loadOpentype(): Promise<typeof import('opentype.js')> {
  try {
    return await import('opentype.js');
  } catch (error) {
    throw new Error(
      'fontIconProvider requires opentype.js to parse fonts. ' +
        'Install it in the consuming project (e.g. `npm i -D opentype.js`) ' +
        'or convert the font to pre-extracted SVG icons.',
      { cause: error },
    );
  }
}

/**
 * opentype.parse builds a DataView over its argument, so a Uint8Array
 * view throws ("First argument to DataView constructor must be an
 * ArrayBuffer"). `slice()` always yields a fresh, exact-fit buffer,
 * which also defends against subarray views into larger buffers.
 */
export function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.slice().buffer;
}

/** is the outline empty? (zero-width or zero-height bbox — .notdef-shaped) */
export function hasEmptyOutline(bbox: GlyphBBox): boolean {
  return !(bbox.x2 - bbox.x1 > 0) || !(bbox.y2 - bbox.y1 > 0);
}

/**
 * Map the glyph's bounding box — uniformly scaled, centered — onto the
 * target viewBox (contain-fit, aspect ratio preserved).
 *
 * opentype.js `getPath(x, y, fontSize)` maps font units (u, v) to
 * `X = x + u·s, Y = y − v·s` with `s = fontSize / unitsPerEm` (it also
 * flips the y-axis: font y-up → SVG y-down). Solving x, y, fontSize for
 * a centered bbox fit gives the closed form below — one getPath call,
 * no manual command rewriting.
 */
export function normalizeGlyph(
  glyph: OtGlyph,
  unitsPerEm: number,
  bbox: GlyphBBox,
  viewBox: { readonly width: number; readonly height: number },
): { pathData: string } {
  const bboxWidth = bbox.x2 - bbox.x1;
  const bboxHeight = bbox.y2 - bbox.y1;
  const scale = Math.min(viewBox.width / bboxWidth, viewBox.height / bboxHeight);
  const fontSize = unitsPerEm * scale;

  // center the scaled bbox inside the viewBox
  const x = (viewBox.width - bboxWidth * scale) / 2 - bbox.x1 * scale;
  const y = (viewBox.height - bboxHeight * scale) / 2 + bbox.y2 * scale;

  const pathData = glyph.getPath(x, y, fontSize).toPathData(PATH_DECIMALS);
  return { pathData };
}

// ── the library face's GSUB ligature lane (B3, best-effort) ────────

/** one parsed GSUB type-4 ligature subtable (opentype.js's shape) */
interface LigatureSubtable {
  readonly substFormat: number;
  readonly coverage: {
    readonly format: number;
    /** format 1: the covered first-glyph ids */
    readonly glyphs?: readonly number[];
    /** format 2: ordered ranges — the field the PARSER emits is
     *  `ranges` (dist/opentype.module.js lookupCoverage, verified
     *  2026-09-07); `rangeRecords` is the OpenType-spec table name,
     *  never the runtime shape (codex r2 M1: the spec name made every
     *  format-2 coverage silently miss) */
    readonly ranges?: ReadonlyArray<{
      readonly start: number;
      readonly end: number;
      readonly index: number;
    }>;
  };
  readonly ligatureSets: ReadonlyArray<
    ReadonlyArray<{
      readonly ligGlyph: number;
      readonly components: readonly number[];
    }>
  >;
}

/** is the lookup object a GSUB type-4 (ligature) lookup? */
function isLigatureLookup(lookup: unknown): lookup is { subtables: readonly unknown[] } {
  if (typeof lookup !== 'object' || lookup === null) return false;
  const record = lookup as Record<string, unknown>;
  return record.lookupType === 4 && Array.isArray(record.subtables);
}

/** narrow a raw subtable into the type-4 shape this walker consumes */
function isLigatureSubtable(subtable: unknown): subtable is LigatureSubtable {
  if (typeof subtable !== 'object' || subtable === null) return false;
  const record = subtable as Record<string, unknown>;
  return (
    typeof record.substFormat === 'number' &&
    typeof record.coverage === 'object' &&
    record.coverage !== null &&
    Array.isArray(record.ligatureSets)
  );
}

/** coverage index of glyphId, or -1 (formats 1 and 2 — the parser's
 *  own lookupCoverage logic mirrored against its real field names) */
function coverageIndexOf(
  coverage: LigatureSubtable['coverage'],
  glyphId: number,
): number {
  if (coverage.format === 1 && Array.isArray(coverage.glyphs)) {
    return coverage.glyphs.indexOf(glyphId);
  }
  if (coverage.format === 2 && Array.isArray(coverage.ranges)) {
    for (const range of coverage.ranges) {
      if (glyphId >= range.start && glyphId <= range.end) {
        return range.index + (glyphId - range.start);
      }
    }
  }
  return -1;
}

/** glyphs.get is typed non-null but a corrupt table can point at ids
 *  the font does not carry — degrade to null instead of a raw TypeError */
function glyphAt(font: OtFont, id: number): OtGlyph | null {
  try {
    const glyph = font.glyphs.get(id);
    return typeof glyph === 'object' && glyph !== null ? glyph : null;
  } catch {
    return null;
  }
}

/** every parsed GSUB type-4 (ligature) subtable the font exposes */
function ligatureSubtables(font: OtFont): readonly LigatureSubtable[] {
  const lookups = font.tables.gsub?.lookups;
  if (!Array.isArray(lookups)) return [];
  const subtables: LigatureSubtable[] = [];
  for (const lookup of lookups) {
    if (!isLigatureLookup(lookup)) continue;
    for (const subtable of lookup.subtables) {
      if (isLigatureSubtable(subtable)) subtables.push(subtable);
    }
  }
  return subtables;
}

/**
 * Best-effort ligature resolution (design §2): walk the parsed GSUB
 * type-4 subtables for a ligature glyph covering the text's glyph
 * sequence. opentype.js's high-level GSUB API is thin — this walker is
 * deliberately conservative: anything unparsable yields null (the
 * caller's NAMED miss error then carries the hints below).
 */
export function findLigatureGlyph(font: OtFont, text: string): OtGlyph | null {
  const sequence = font.stringToGlyphs(text);
  if (sequence.length < 2) return null;
  const ids = sequence.map((glyph) => glyph.index);
  for (const subtable of ligatureSubtables(font)) {
    const setIndex = coverageIndexOf(subtable.coverage, ids[0]!);
    if (setIndex < 0) continue;
    for (const ligature of subtable.ligatureSets[setIndex] ?? []) {
      const components = ligature.components;
      if (
        components.length === ids.length - 1 &&
        components.every((component, i) => component === ids[i + 1])
      ) {
        const ligatureGlyph = glyphAt(font, ligature.ligGlyph);
        if (ligatureGlyph !== null) return ligatureGlyph;
      }
    }
  }
  return null;
}

/** the covered first-glyph ids in coverage order (formats 1 and 2),
 *  bounded by `limit` — the enumeration order contract */
function coveredFirstGlyphs(
  coverage: LigatureSubtable['coverage'],
  limit: number,
): number[] {
  const ids: number[] = [];
  if (coverage.format === 1 && Array.isArray(coverage.glyphs)) {
    for (const id of coverage.glyphs) {
      if (ids.length >= limit) return ids;
      ids.push(id);
    }
  }
  if (coverage.format === 2 && Array.isArray(coverage.ranges)) {
    for (const range of coverage.ranges) {
      for (let id = range.start; id <= range.end; id += 1) {
        if (ids.length >= limit) return ids;
        ids.push(id);
      }
    }
  }
  return ids;
}

/**
 * the resolvable ligature names, for the miss error (design §2: "a
 * miss is a NAMED build error listing the font's resolvable ligature
 * names WHEN THE PARSER EXPOSES THEM"). Returns [] when the font
 * exposes no parsable type-4 data — the caller then falls back to the
 * glyph-name/cmap hint. Names are the sequence's glyph names joined
 * with '_' (the parser gives ids, not characters). Coverage order:
 * format 1 array order, format 2 range order then id order.
 */
export function ligatureNames(font: OtFont, limit = 12): string[] {
  const names: string[] = [];
  for (const subtable of ligatureSubtables(font)) {
    for (const first of coveredFirstGlyphs(subtable.coverage, limit * 4)) {
      const setIndex = coverageIndexOf(subtable.coverage, first);
      for (const ligature of subtable.ligatureSets[setIndex] ?? []) {
        const glyphNames = [first, ...ligature.components]
          .map((id) => glyphAt(font, id)?.name);
        if (glyphNames.every((name) => typeof name === 'string')) {
          names.push(glyphNames.join('_'));
          if (names.length >= limit) return names;
        }
      }
    }
  }
  return names;
}

/** a short glyph-name/cmap hint for fonts with NO parsable liga data */
export function glyphNameHint(font: OtFont, limit = 12): string[] {
  const names: string[] = [];
  for (let i = 0; i < font.numGlyphs && names.length < limit; i += 1) {
    const glyph = glyphAt(font, i);
    if (glyph !== null && glyph.unicode !== undefined && glyph.name !== '.notdef') {
      names.push(glyph.name);
    }
  }
  return names;
}
