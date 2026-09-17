/**
 * @jixoai/ui-design (studio) — remote-caret: the mirror-measurement
 * math behind the shared text caret (presence-visuals ruling 4).
 *
 * A remote player's panel focus may carry `caret` — an integer offset
 * into the field's value. Rendering a player-colored caret bar at that
 * offset needs the PIXEL x (and, for textareas, the line's y) of the
 * offset, which the platform only computes for the LOCAL selection.
 * The mirror law: measure `value.slice(0, offset)` in a hidden span
 * that replicates the input's font metrics — the classic autocomplete
 * trick, one caret at a time.
 *
 * SPLIT (the pure/DOM discipline, selection.ts's law):
 *   - caretLineSplit/caretGeometry are PURE and take an INJECTED
 *     measure fn (node-tested with a monospace fake: offset splits,
 *     line approximations, clamping);
 *   - measureCaretX/measureCaretMetrics are the thin DOM halves
 *     (mirror span + computed padding/scroll), untestable in node and
 *     pinned by source-law instead.
 *
 * v1 HONEST APPROXIMATIONS (recorded, by ruling):
 *   - a TEXTAREA is measured line-locally by explicit `\n` only —
 *     SOFT wraps (the textarea reflowing a long line) are ignored, so
 *     a caret past a soft wrap reads at the wrapped run's line-start
 *     x plus the run prefix. Single-line inputs are EXACT.
 *   - CRLF never appears in an input's .value (the platform
 *     normalizes to `\n`), so `\n` is the only break counted.
 *
 * Original need: presence-visuals task group 2 (2026-09-17).
 */

/** the minimal text-shape surface the pure half needs from a field */
export interface CaretFieldLike {
  readonly value: string;
}

/** where a caret sits inside a (possibly multi-line) value */
export interface CaretGeometry {
  /** pixels from the field's content-box left edge to the caret */
  readonly x: number;
  /** pixels from the field's first line's top to the caret line's top */
  readonly y: number;
}

/** the injected width measurer (px) — the mirror span in the DOM half,
 *  a monospace fake in tests */
export type TextWidthMeasurer = (text: string) => number;

/** clamp an offset into a value's code-unit range ([-∞, len] → [0, len]);
 *  NaN — unordered garbage — reads as "no caret" (0) */
export function clampCaretOffset(value: string, offset: number): number {
  if (Number.isNaN(offset)) return 0;
  return Math.max(0, Math.min(Math.trunc(offset), value.length));
}

/**
 * Split a caret offset into (lineIndex, linePrefix): the 0-based line
 * the caret sits on (by explicit `\n`) and the text BETWEEN the line's
 * start and the caret — the string whose width IS the caret's x.
 */
export function caretLineSplit(value: string, offset: number): { lineIndex: number; linePrefix: string } {
  const clamped = clampCaretOffset(value, offset);
  const before = value.slice(0, clamped);
  const lastBreak = before.lastIndexOf('\n');
  if (lastBreak === -1) return { lineIndex: 0, linePrefix: before };
  let lineIndex = 0;
  for (let i = 0; i < before.length; i += 1) {
    if (before.charCodeAt(i) === 10) lineIndex += 1;
  }
  return { lineIndex, linePrefix: before.slice(lastBreak + 1) };
}

/**
 * The caret's geometry from an injected measure: x = the line-prefix
 * width, y = lineIndex × lineHeight (the v1 approximation — explicit
 * breaks only, soft wraps read on their opening line).
 */
export function caretGeometry(
  field: CaretFieldLike,
  offset: number,
  lineHeight: number,
  measure: TextWidthMeasurer,
): CaretGeometry {
  const { lineIndex, linePrefix } = caretLineSplit(field.value, offset);
  return { x: measure(linePrefix), y: lineIndex * lineHeight };
}

/* ── the DOM half (thin; source-law pinned) ──────────────────────────── */

const MIRROR_SPAN_STYLE =
  'position:absolute;visibility:hidden;white-space:pre;z-index:-1;';

/** the computed font metrics a mirror span must replicate to measure
 *  like the input renders (letter-spacing included — kerning lies);
 *  kebab-case so getPropertyValue AND setProperty both resolve them */
const MIRROR_COPIED_STYLES = [
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'letter-spacing',
  'text-transform',
  'word-spacing',
  'tab-size',
  '-webkit-text-size-adjust',
] as const;

function readNumber(computed: CSSStyleDeclaration, property: string): number {
  const value = Number.parseFloat(computed.getPropertyValue(property));
  return Number.isFinite(value) ? value : 0;
}

/**
 * Measure `text` in a hidden mirror span styled like `input` — the
 * width the input would give those glyphs. Appended to the input's own
 * document body (out of layout: absolute + invisible), removed in a
 * finally.
 */
function mirrorMeasure(input: HTMLInputElement | HTMLTextAreaElement, text: string): number {
  const doc = input.ownerDocument;
  if (doc === null || doc.body === null) return 0;
  const span = doc.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.setAttribute('style', MIRROR_SPAN_STYLE);
  const computed = doc.defaultView?.getComputedStyle(input) ?? null;
  if (computed !== null) {
    for (const property of MIRROR_COPIED_STYLES) {
      const value = computed.getPropertyValue(property);
      if (value !== '') span.style.setProperty(property, value);
    }
  }
  span.textContent = text;
  doc.body.appendChild(span);
  try {
    return span.getBoundingClientRect().width;
  } finally {
    span.remove();
  }
}

/** the input's effective line height (px) — the textarea row pitch */
export function inputLineHeight(input: HTMLInputElement | HTMLTextAreaElement): number {
  const computed = input.ownerDocument?.defaultView?.getComputedStyle(input) ?? null;
  if (computed === null) return 0;
  const lineHeight = Number.parseFloat(computed.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;
  // 'normal' — approximate by the font size's default pitch
  return readNumber(computed, 'font-size') * 1.2;
}

/**
 * The caret bar's geometry RELATIVE TO THE INPUT's border box:
 * content x (mirror-measured) + padding-inline-start + border, minus
 * the field's own horizontal scroll (long values scroll the content).
 */
export function measureCaretMetrics(input: HTMLInputElement | HTMLTextAreaElement, offset: number): CaretGeometry & { height: number } {
  const computed = input.ownerDocument?.defaultView?.getComputedStyle(input) ?? null;
  const padInlineStart = computed === null ? 0 : readNumber(computed, 'padding-inline-start') || readNumber(computed, 'padding-left');
  const borderStart = computed === null ? 0 : readNumber(computed, 'border-inline-start-width') || readNumber(computed, 'border-left-width');
  const geometry = caretGeometry(input, offset, inputLineHeight(input), (text) => mirrorMeasure(input, text));
  return {
    x: Math.max(0, padInlineStart + borderStart + geometry.x - input.scrollLeft),
    y: Math.max(0, geometry.y - input.scrollTop),
    height: inputLineHeight(input),
  };
}

/** the x-only convenience (the brief's named seam) */
export function measureCaretX(input: HTMLInputElement | HTMLTextAreaElement, offset: number): number {
  return measureCaretMetrics(input, offset).x;
}
