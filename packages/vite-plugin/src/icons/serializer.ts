/**
 * @jixoai/vite-plugin (icons) — the serializer (P3.1)
 *
 * The ONLY code that turns an SvgAsset into consumable output:
 * - 'css-var'    → url("data:image/svg+xml,…") — a CSS custom property
 *                  VALUE with literal ink baked in (src/icons/ink.ts —
 *                  the byte-equivalent port of css-laws' iconUri law;
 *                  the vite plugin composes `--jx-icon-<slot>: <value>;`)
 * - 'dom-string' → the SVG string itself (for {@html} DOM injection —
 *                  the clear slot's × button; design.md §3)
 * - serializeInkVariant() → the derived ink family (theme matrix and
 *                  the ink quartet's forced weights — icons-docs §2)
 *
 * DOM safety contract (design.md §3): the safety checker runs BEFORE
 * serialization in BOTH modes — no unvalidated SVG ever reaches output.
 * A failed check in warn mode logs a warning and the icon is REJECTED
 * (null — the standard layer's inline fallback serves instead; warn
 * means "don't crash the build", NOT "let unvalidated content through").
 * A failed check in error mode throws.
 */

import { bakeInkUri, type IconInk } from './ink.js';
import type {
  IconSlot,
  SafetyChecker,
  SerializeMode,
  SvgAsset,
} from './types.js';
import { SLOT_NAMES } from './types.js';

/** prefix for all serializer diagnostics */
const LOG_PREFIX = '[jixoai-icons]';

/** derive a human-readable label from the asset's source metadata */
function describeSource(source: SvgAsset['source']): string {
  switch (source.kind) {
    case 'file':
      return source.path !== undefined ? `file ${source.path}` : 'file';
    case 'font-glyph':
      return source.codepoint !== undefined
        ? `font-glyph U+${source.codepoint.toString(16).toUpperCase().padStart(4, '0')}`
        : 'font-glyph';
    case 'inline':
      return 'inline';
  }
}

function formatIssueMessages(messages: readonly string[]): string {
  return messages.map((message) => `  - ${message}`).join('\n');
}

/**
 * run the checker with the serializer's semantics: false = a warn-mode
 * check rejected the asset (null — the fallback serves); throws when an
 * error-mode check fails. Derived variants substitute only fixed
 * attribute values into the checked source, so gating the asset gates
 * every byte the law can derive from it.
 */
function enforceSafety(asset: SvgAsset, checker: SafetyChecker): boolean {
  const source = describeSource(asset.source);
  const result = checker.check(asset.svg, source);
  if (result.passed) return true;
  const detail = formatIssueMessages(
    result.issues.map((issue) => issue.message),
  );
  const hasErrors = result.issues.some(
    (issue) => issue.severity === 'error',
  );
  if (hasErrors) {
    throw new Error(
      `${LOG_PREFIX} SVG safety check failed (${source}):\n${detail}`,
    );
  }
  // warn mode: reject, don't pass through — the standard layer's
  // inline fallback serves instead (design.md §3)
  console.warn(
    `${LOG_PREFIX} SVG safety check rejected the icon (${source}); serving the inline fallback:\n${detail}`,
  );
  return false;
}

/**
 * Serialize a structured SVG asset into its consumable form.
 *
 * @param asset   the SvgAsset to serialize
 * @param mode    'css-var' (default) → CSS custom property value with
 *                black ink baked at the artwork's own stroke width;
 *                'dom-string' → raw SVG string for {@html} injection
 * @param checker optional safety checker; when omitted the asset is
 *                serialized UNCHECKED (trusted local build-pipeline
 *                files — design.md §5)
 * @returns the serialized string, or null when a warn-mode check
 *          rejected the asset (the caller falls back)
 * @throws when an error-mode check fails (opt-in, HTTP-sourced icons)
 */
export function serializeIcon(
  asset: SvgAsset,
  mode: SerializeMode = 'css-var',
  checker?: SafetyChecker,
): string | null {
  if (checker !== undefined && !enforceSafety(asset, checker)) return null;

  if (mode === 'dom-string') {
    return asset.svg;
  }
  return bakeInkUri(asset.svg);
}

/** options for {@link serializeInkVariant} */
export interface InkVariantOptions {
  /** the ink to bake ('#000' light / '#fff' dark matrix) */
  readonly ink: IconInk;
  /**
   * forced stroke width (the ink quartet's weights — 2 / 2.5). Omitted:
   * the artwork's own weight is preserved (the plain-slot flip).
   */
  readonly strokeWidth?: number;
}

/**
 * Serialize a derived ink variant of an asset — the theme matrix and
 * the ink quartet's forced weights ride this path (icons-docs §2).
 * Same safety contract as {@link serializeIcon}: warn-mode rejection
 * returns null (the standard layer's ink fallback serves); error mode
 * throws.
 *
 * @param asset   the source SvgAsset (already gated when the caller
 *                serialized the plain value — the checker may then be
 *                omitted without letting unvalidated content through)
 */
export function serializeInkVariant(
  asset: SvgAsset,
  opts: InkVariantOptions,
  checker?: SafetyChecker,
): string | null {
  if (checker !== undefined && !enforceSafety(asset, checker)) return null;
  return bakeInkUri(asset.svg, opts);
}

/**
 * Walk every registered slot and serialize whatever the lookup supplies.
 * SLOT_NAMES (derived from SLOT_REGISTRY in types.ts) is consumed here —
 * the slot registry is defined exactly once, in types.ts.
 *
 * Slots the provider does not serve — or whose asset fails a warn-mode
 * check — are omitted from the result, so the standard layer's inline
 * fallbacks serve for them.
 *
 * @param getIcon  a slot → SvgAsset lookup (an IconProvider's getIcon)
 * @param mode     passed through to serializeIcon
 * @param checker  passed through to serializeIcon
 * @throws when an error-mode check fails (propagates — the build fails)
 */
export function serializeAllSlots(
  getIcon: (slot: IconSlot) => SvgAsset | null,
  mode: SerializeMode = 'css-var',
  checker?: SafetyChecker,
): Partial<Record<IconSlot, string>> {
  const serialized: Partial<Record<IconSlot, string>> = {};
  for (const slot of SLOT_NAMES) {
    const asset = getIcon(slot);
    if (asset === null) continue;
    const value = serializeIcon(asset, mode, checker);
    if (value === null) continue;
    serialized[slot] = value;
  }
  return serialized;
}
