/**
 * @jixoai/vite-plugin (icons) — the ink-baking law (icons-docs ICON-3,
 * 2026-09-02).
 *
 * BYTE-EQUIVALENT PORT of the iconUri/iconSvg serializer in css-laws
 * (packages/css-laws/src/icon-uris.ts, icons spec 2026-08-29 — SAME
 * SOURCE, mirrored here). This package ships zero runtime dependencies
 * and must stay self-sufficient, so the law lives as an independent
 * single file instead of an import of css-laws. The equivalence is
 * LOCKED by test/icons/ink-equivalence.test.ts: for the default lucide
 * glyphs the bytes baked here === the bytes css-laws bakes === the
 * frozen sheet fixtures in css-laws' test suite. Drift on either side
 * fails that suite red.
 *
 * Why bake at all: a data-URI SVG is its own document — it cannot
 * inherit author color (currentColor computes to the initial black)
 * and the dark sheet needs a literal white flip. The law, mirroring
 * the source:
 *   - the ROOT tag's stroke becomes the ink; artwork without a stroke
 *     attribute GAINS one (the source law assigns unconditionally).
 *     A forced strokeWidth replaces the artwork's own weight; when
 *     omitted the artwork's weight is preserved (the source law's sw-2
 *     default only ever met lucide geometry, which is 2 anyway).
 *   - child elements with fill='currentColor' swap to ink plus a
 *     trailing stroke='none' (fill-painted dots must not inherit the
 *     root stroke — the palette glyph's dots).
 *   - attribute quoting normalizes to the frozen dialect's single
 *     quotes (inside tags only — text content is never touched).
 *   - percent-encoding: ONLY '<' '>' '#'. One defensive extension
 *     beyond the frozen dialect: a raw '"' encodes as %22. Lucide
 *     artwork carries none after quote normalization (a no-op on the
 *     frozen bytes), but user-sourced SVG may hold one in text
 *     content, and a raw quote would terminate the url("") string.
 */

import type { IconSlot } from './types.js';

// ── the inks ────────────────────────────────────────────────────────

/** the two alpha inks the vocabulary paints (mask ink vs dark-mode ink) */
export type IconInk = '#000' | '#fff';

/** ink-baking knobs (mirrors css-laws' IconUriOptions) */
export interface BakeInkOptions {
  /** stroke ink substituted for the artwork's stroke (default #000) */
  readonly ink?: IconInk;
  /** forced stroke-width override — omitted preserves the artwork's own */
  readonly strokeWidth?: number;
}

// ── the serializer (flat-string twin of css-laws' IconNode law) ─────

/** the root <svg …> opening tag */
const ROOT_TAG = /<svg\b[^>]*>/i;

/** a double-quoted attribute (the leading \s keeps attribute names whole:
 *  `stroke` can never match inside `stroke-width`) */
const DOUBLE_QUOTED_ATTR = /(\s)([^\s"'=<>]+)\s*=\s*"([^"]*)"/g;

/** the root's stroke attribute, post quote-normalization */
const STROKE_ATTR = /(\s)stroke\s*=\s*'([^']*)'/;

/** the root's stroke-width attribute, post quote-normalization */
const STROKE_WIDTH_ATTR = /(\s)stroke-width\s*=\s*'([^']*)'/;

/** any element opening/self-closing tag (closing tags start `</`) */
const CHILD_TAG = /<[a-zA-Z][^<>]*>/g;

/** the fill attribute the law swaps (the palette dots' paint) */
const FILL_CURRENT_COLOR = /(\s)fill\s*=\s*'currentColor'/;

/**
 * normalize double-quoted attributes to the dialect's single quotes —
 * INSIDE tags only, so text content (a <text> node's body) is never
 * rewritten.
 */
function normalizeAttrQuotes(svg: string): string {
  return svg.replace(/<[^<>]*>/g, (tag) =>
    tag.replace(DOUBLE_QUOTED_ATTR, (_match, lead: string, name: string, value: string) => `${lead}${name}='${value}'`),
  );
}

/**
 * bake the root tag: stroke → ink (appended when absent), a forced
 * stroke-width replaces the artwork's own. Append order mirrors the
 * source law's assignment order: stroke first, then stroke-width.
 */
function bakeRootTag(tag: string, ink: IconInk, strokeWidth: number | undefined): string {
  const appended: string[] = [];
  let out = tag;
  if (STROKE_ATTR.test(out)) {
    out = out.replace(STROKE_ATTR, `$1stroke='${ink}'`);
  } else {
    appended.push(`stroke='${ink}'`);
  }
  if (strokeWidth !== undefined) {
    const weight = String(strokeWidth);
    if (STROKE_WIDTH_ATTR.test(out)) {
      out = out.replace(STROKE_WIDTH_ATTR, `$1stroke-width='${weight}'`);
    } else {
      appended.push(`stroke-width='${weight}'`);
    }
  }
  if (appended.length === 0) return out;
  const selfClosing = out.endsWith('/>');
  const body = selfClosing ? out.slice(0, -2) : out.slice(0, -1);
  return `${body} ${appended.join(' ')}${selfClosing ? '/>' : '>'}`;
}

/**
 * bake the children region: every element whose fill is currentColor
 * swaps to the ink and GAINS a trailing stroke='none' (the committed
 * byte order — appended after all of the element's own attributes).
 */
function bakeChildTags(region: string, ink: IconInk): string {
  return region.replace(CHILD_TAG, (tag) => {
    if (!FILL_CURRENT_COLOR.test(tag)) return tag;
    const swapped = tag.replace(FILL_CURRENT_COLOR, `$1fill='${ink}'`);
    const selfClosing = swapped.endsWith('/>');
    const body = selfClosing ? swapped.slice(0, -2) : swapped.slice(0, -1);
    return `${body} stroke='none'${selfClosing ? '/>' : '>'}`;
  });
}

/**
 * Bake literal ink into a complete SVG string, returning the frozen
 * dialect's un-encoded form (single-quoted attributes, substituted
 * stroke/fill values).
 *
 * @throws when the input carries no `<svg …>` root tag
 */
export function bakeInkSvg(svg: string, opts: BakeInkOptions = {}): string {
  const ink = opts.ink ?? '#000';
  const normalized = normalizeAttrQuotes(svg);
  const root = ROOT_TAG.exec(normalized);
  if (root === null) {
    throw new Error('bakeInkSvg: no <svg> root element to bake ink into');
  }
  const rootTag = bakeRootTag(root[0], ink, opts.strokeWidth);
  return rootTag + bakeChildTags(normalized.slice(root[0].length), ink);
}

/** percent-encode exactly the bytes the dialect encodes (+ the defensive %22) */
const encodeDataUri = (svg: string): string =>
  svg.replaceAll('<', '%3C').replaceAll('>', '%3E').replaceAll('#', '%23').replaceAll('"', '%22');

/**
 * Bake ink and wrap as the frozen `url("data:image/svg+xml,…")` token —
 * the exact token dialect the standard layer's vocabulary ships, so a
 * slot served at the defaults is byte-identical to the sheet's own
 * fallbacks.
 */
export function bakeInkUri(svg: string, opts?: BakeInkOptions): string {
  return `url("data:image/svg+xml,${encodeDataUri(bakeInkSvg(svg, opts))}")`;
}

// ── the derivation map (the css-laws INK_QUARTET twin) ──────────────

/** the derived ink vocabulary variables a concept slot can bake */
export type InkVocab = 'calendar-ink' | 'clock-ink' | 'valid-ink' | 'invalid-ink';

/** how one concept slot derives its ink variable */
export interface InkDerivation {
  /** the vocabulary variable the concept bakes (`--jx-icon-<vocab>`) */
  readonly vocab: InkVocab;
  /** the forced stroke width (the quartet's weights — plain slots keep the artwork's own) */
  readonly strokeWidth: number;
}

/**
 * concept slot → derived ink variable (icons-docs design §1). Covering
 * a concept re-bakes its whole ink family from the SAME asset — a
 * mixed plain/ink pair cannot occur. `invalid` is ink-only (the
 * vocabulary declares no plain invalid variable); every other concept
 * slot derives nothing.
 */
export const INK_DERIVATIONS: Readonly<Partial<Record<IconSlot, InkDerivation>>> = {
  calendar: { vocab: 'calendar-ink', strokeWidth: 2 },
  clock: { vocab: 'clock-ink', strokeWidth: 2 },
  check: { vocab: 'valid-ink', strokeWidth: 2.5 },
  invalid: { vocab: 'invalid-ink', strokeWidth: 2.5 },
};
