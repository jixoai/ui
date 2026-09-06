/**
 * fontIconProvider — extract glyph outlines from ANY font as fill-based SVG
 * icons (P2.3, original request: 2026-08-28 ui-plugin-package design §6;
 * helpers factored shared into library/font-extract.ts 2026-09-07,
 * openspec icon-library-presets design §2).
 *
 * Orthogonal intents:
 * 1. Factory (async): load font bytes via ctx.loadSource (the plugin
 *    auto-decompresses WOFF2 → TTF transparently — this file NEVER sees
 *    woff2) and pre-build a slot → SvgAsset cache with opentype.js.
 * 2. Glyph → viewBox normalization: uniform contain-fit + centering from
 *    font units (unitsPerEm, y-up) into the target viewBox (y-down).
 * 3. HMR: ctx.watchFile → background re-extraction, cache swapped when
 *    ready (getIcon stays sync per the frozen IconProvider contract).
 *
 * Deviations from the design snippet (declared):
 * - the emitted <svg> carries an xmlns attribute: the serializer embeds
 *   these as standalone image/svg+xml data URIs, which do not render
 *   without an explicit namespace.
 * - a codepoint with no cmap entry (or an empty outline) THROWS at
 *   factory time instead of yielding an invisible icon — a mapped slot
 *   that silently resolves to .notdef is a configuration error.
 *
 * SHARED-surface law (icon-library-presets B1): loadOpentype /
 * toArrayBuffer / normalizeGlyph / the bbox-emptiness check live in
 * library/font-extract.ts — imported here, byte-identical behavior.
 * extractGlyph + its slot-labeled error strings STAY here (their
 * messages are test-locked, font.test.ts:281-303); decompression is NOT
 * this provider's (it lives in the vite plugin's loadSource).
 */

import type { Font as OtFont, Glyph as OtGlyph } from 'opentype.js';
import {
  hasEmptyOutline,
  loadOpentype,
  normalizeGlyph,
  toArrayBuffer,
} from '../library/font-extract.js';
import type {
  IconProvider,
  IconProviderFactory,
  IconSlot,
  ProviderContext,
  SvgAsset,
} from '../types.js';

// ── options ────────────────────────────────────────────────────────

export interface FontIconProviderOptions {
  /** font file path — resolved + read by the vite plugin (never by us) */
  readonly fontPath: string;
  /** slot → Unicode codepoint mapping (cmap lookup, NOT glyph index) */
  readonly symbols: { readonly [slot in IconSlot]?: number };
  /** target viewBox (default 24×24, the lucide convention) */
  readonly viewBox?: { readonly width: number; readonly height: number };
}

const DEFAULT_VIEW_BOX = { width: 24, height: 24 } as const;

// ── provider ───────────────────────────────────────────────────────

/**
 * Build an IconProviderFactory that extracts font glyphs as SVG paths.
 * The vite plugin awaits the factory at build start; the returned
 * provider answers getIcon() synchronously from the pre-built cache.
 */
export function fontIconProvider(options: FontIconProviderOptions): IconProviderFactory {
  return async (ctx: ProviderContext): Promise<IconProvider> => {
    const { fontPath, symbols } = options;
    const viewBox = options.viewBox ?? DEFAULT_VIEW_BOX;

    /** (re)parse the font + rebuild the slot cache */
    const buildCache = async (): Promise<Map<IconSlot, SvgAsset>> => {
      const opentype = await loadOpentype();
      // WOFF2 was already decompressed by loadSource — data is always TTF/OTF here
      const source = await ctx.loadSource(fontPath);
      const font = opentype.parse(toArrayBuffer(source.data));

      const cache = new Map<IconSlot, SvgAsset>();
      for (const slot of Object.keys(symbols) as IconSlot[]) {
        const codepoint = symbols[slot];
        if (typeof codepoint !== 'number') continue;
        cache.set(slot, extractGlyph(font, { slot, codepoint, fontPath, viewBox }));
      }
      return cache;
    };

    let cache = await buildCache();

    // HMR: fire-and-forget rebuild; keep serving the old cache until the
    // new one lands so a mid-edit broken font never blocks getIcon().
    ctx.watchFile(fontPath, () => {
      void buildCache().then(
        (next) => {
          cache = next;
        },
        (error: unknown) => {
          console.warn(
            `[fontIconProvider] failed to re-extract "${fontPath}" after change; keeping previous icons`,
            error,
          );
        },
      );
    });

    return {
      getIcon(slot: IconSlot): SvgAsset | null {
        return cache.get(slot) ?? null;
      },
    };
  };
}

// ── glyph extraction ───────────────────────────────────────────────

interface GlyphRequest {
  readonly slot: IconSlot;
  readonly codepoint: number;
  readonly fontPath: string;
  readonly viewBox: { readonly width: number; readonly height: number };
}

function extractGlyph(font: OtFont, req: GlyphRequest): SvgAsset {
  const { slot, codepoint, fontPath, viewBox } = req;
  const codepointHex = `U+${codepoint.toString(16).toUpperCase().padStart(4, '0')}`;

  if (!Number.isInteger(codepoint) || codepoint < 0 || codepoint > 0x10ffff) {
    throw new Error(
      `fontIconProvider: slot "${slot}" maps to invalid codepoint ${String(codepoint)} (${codepointHex}) in "${fontPath}"`,
    );
  }

  const char = String.fromCodePoint(codepoint);
  if (font.charToGlyphIndex(char) === 0) {
    throw new Error(
      `fontIconProvider: font "${fontPath}" has no glyph mapped at ${codepointHex} (slot "${slot}") — check the symbols mapping`,
    );
  }

  const glyph: OtGlyph = font.charToGlyph(char);
  const bbox = glyph.getBoundingBox();
  if (hasEmptyOutline(bbox)) {
    throw new Error(
      `fontIconProvider: glyph at ${codepointHex} (slot "${slot}") in "${fontPath}" has an empty outline`,
    );
  }

  const { pathData } = normalizeGlyph(glyph, font.unitsPerEm, bbox, viewBox);

  const { width, height } = viewBox;
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${pathData}" fill="currentColor"/></svg>`,
    viewBox: { width, height },
    nature: 'fill',
    source: { kind: 'font-glyph', path: fontPath, codepoint },
  };
}
