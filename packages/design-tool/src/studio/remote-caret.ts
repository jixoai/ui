/**
 * @jixoai/ui-design (studio) — remote-caret v2: the ZERO-WIDTH SPAN
 * MIRROR method behind the shared text caret + selection highlight
 * (presence-liveness P4, 2026-09-17; the Owner-named reference
 * implementation's method, adapted to the studio's pure/DOM split).
 *
 * A remote player's panel focus carries `selection {start, end}` —
 * offsets into the field's value (equal ends = a collapsed caret; a
 * range = a selection highlight). Rendering player-colored marks at
 * those offsets needs the PIXEL geometry of an arbitrary offset,
 * which the platform only computes for the LOCAL selection.
 *
 * THE MIRROR LAW (the reference's method, verbatim in spirit): a
 * hidden div styled EXACTLY like the field (MIRROR_PROPS copied from
 * the computed style) receives the value's text SPLIT at the offset
 * with a zero-width marker span between the halves — the marker's
 * getBoundingClientRect() IS the caret's box, soft wraps included.
 *
 * SPLIT (the pure/DOM discipline, selection.ts's law):
 *   - clampCaretOffset/caretLineSplit/mirrorPlanOf/selectionRects are
 *     PURE and node-tested (offset splits, the marker plan, the
 *     multi-line range segmentation — structural fakes, no fonts);
 *   - measureCaretMetrics/measureSelectionMetrics/trackFieldSelection
 *     are the thin DOM halves (the mirror div + computed copies +
 *     document selectionchange), untestable in node and pinned by
 *     source-law instead (presence-tree-panel.test.ts).
 *
 * v2 HONESTY NOTES (upgrades over v1's approximation):
 *   - SOFT wraps are HONEST now — the mirror wraps `pre-wrap` exactly
 *     like a textarea, so a caret past a soft wrap reads on the
 *     wrapped line (v1 read it on the opening line);
 *   - a single-line INPUT's text is vertically CENTERED in its box —
 *     the y is the centered line, not the content-box top;
 *   - CRLF never appears in an input's .value (the platform
 *     normalizes to `\n`), so `pre-wrap`'s `\n` handling suffices.
 *
 * Original need: presence-visuals task group 2 (2026-09-17); the
 * zero-width-span rewrite is presence-liveness P4 (2026-09-17).
 */

/** the minimal text-shape surface the pure half needs from a field */
export interface CaretFieldLike {
  readonly value: string;
}

/** where a caret sits inside a (possibly multi-line) field — pixels
 *  relative to the field's border box */
export interface CaretGeometry {
  readonly x: number;
  readonly y: number;
}

/** the caret bar's box: geometry + the line's height (the bar's px height) */
export interface CaretMetrics extends CaretGeometry {
  readonly height: number;
}

/** clamp an offset into a value's code-unit range ([-∞, len] → [0, len]);
 *  NaN — unordered garbage — reads as "no caret" (0) */
export function clampCaretOffset(value: string, offset: number): number {
  if (Number.isNaN(offset)) return 0;
  return Math.max(0, Math.min(Math.trunc(offset), value.length));
}

/**
 * Split a caret offset into (lineIndex, linePrefix): the 0-based line
 * the caret sits on (by explicit `\n`) and the text BETWEEN the line's
 * start and the caret. The DOM half no longer needs this to measure
 * (the marker span measures directly) — it stays the honest pure
 * model of "which line is this offset on" for callers and tests.
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
 * The zero-width marker (SOURCE-ESCAPED — six ASCII characters,
 * never a literal: the output pipeline strips invisible characters
 * from literals, the icon-component-pipeline lesson). The marker
 * spans zero horizontal space but owns a full line box, so its
 * rect measures the offset's line position.
 */
export const ZERO_WIDTH_MARKER = '\u200b';

/** the mirror-div child plan for one offset — PURE: the text node
 *  before the marker, the marker itself, the text node after */
export interface MirrorPlan {
  readonly before: string;
  readonly marker: string;
  readonly after: string;
}

/** build the zero-width span sequence for an offset (node-tested:
 *  the split lands AT the clamped offset, marker in the middle) */
export function mirrorPlanOf(value: string, offset: number): MirrorPlan {
  const clamped = clampCaretOffset(value, offset);
  return { before: value.slice(0, clamped), marker: ZERO_WIDTH_MARKER, after: value.slice(clamped) };
}

/* ── the selection range segmentation (PURE) ──────────────────────────── */

/** one highlight rectangle — border-box-relative pixels */
export interface SelectionRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Segment a selection range (from/to = the measured caret boxes of
 * start and end) into highlight rectangles:
 *   - same line → ONE rect spanning from.x → to.x;
 *   - wrapped/multi-line → the first line's tail (from.x → the content
 *     width), full-width middle lines, and the last line's head
 *     (0 → to.x). Line stepping is the caret height (the line pitch).
 * Degenerate ranges collapse to a 2px sliver (the collapsed-caret
 * honesty — a visible minimum, never a zero-width nothing).
 */
export function selectionRects(
  from: CaretMetrics,
  to: CaretMetrics,
  lineHeight: number,
  contentWidth: number,
): SelectionRect[] {
  const width = Math.max(2, to.x - from.x);
  if (Math.abs(to.y - from.y) < 1) {
    return [{ x: from.x, y: from.y, width, height: from.height }];
  }
  const rects: SelectionRect[] = [
    { x: from.x, y: from.y, width: Math.max(2, contentWidth - from.x), height: from.height },
  ];
  const pitch = lineHeight > 0 ? lineHeight : from.height;
  for (let y = from.y + pitch; y < to.y - 1; y += pitch) {
    rects.push({ x: 0, y, width: Math.max(0, contentWidth), height: from.height });
  }
  rects.push({ x: 0, y: to.y, width: Math.max(2, to.x), height: to.height });
  return rects;
}

/* ── the DOM half (thin; source-law pinned) ──────────────────────────── */

/**
 * The typography/padding/border styles the mirror MUST copy from the
 * field for the text to wrap identically (the reference's full list —
 * camelCase so `computed[prop]` reads AND `mirror.style[prop]` writes
 * resolve the same property).
 */
export const MIRROR_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'fontStretch',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'textTransform',
  'textIndent',
  'textAlign',
  'direction',
  'tabSize',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderRightStyle',
  'borderBottomStyle',
  'borderLeftStyle',
] as const;

/** the mirror's out-of-layout base style: fixed off-flow, invisible,
 *  inert (the reference's cssText, property-by-property here so the
 *  width overrides below land cleanly) */
const MIRROR_BASE_STYLE =
  'position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;z-index:-1;margin:0;overflow:hidden;box-sizing:border-box;';

/** one cached mirror div per document (the reference keeps a single
 *  mirror; the studio document lives as long as the page) */
const mirrorByDocument = new WeakMap<Document, HTMLDivElement>();

function mirrorOf(doc: Document): HTMLDivElement | null {
  const cached = mirrorByDocument.get(doc);
  if (cached !== undefined && cached.isConnected) return cached;
  if (doc.body === null) return null;
  const mirror = doc.createElement('div');
  mirror.setAttribute('aria-hidden', 'true');
  mirror.setAttribute('style', MIRROR_BASE_STYLE);
  doc.body.appendChild(mirror);
  mirrorByDocument.set(doc, mirror);
  return mirror;
}

/** the input's effective line height (px) — the fallback pitch when
 *  the marker's own height reads 0 */
export function inputLineHeight(input: HTMLInputElement | HTMLTextAreaElement): number {
  const computed = input.ownerDocument?.defaultView?.getComputedStyle(input) ?? null;
  if (computed === null) return 0;
  const lineHeight = Number.parseFloat(computed.lineHeight);
  if (Number.isFinite(lineHeight)) return lineHeight;
  // 'normal' — approximate by the font size's default pitch
  const fontSize = Number.parseFloat(computed.fontSize);
  return Number.isFinite(fontSize) ? fontSize * 1.2 : 0;
}

/**
 * Lay the mirror out exactly like `input` with `plan`'s children and
 * return the marker span's rect (or null when the mirror cannot host
 * — a body-less document). Shared by the caret and selection measures.
 */
function measureMarker(
  input: HTMLInputElement | HTMLTextAreaElement,
  plan: MirrorPlan,
): { rect: DOMRect; lineHeight: number } | null {
  const doc = input.ownerDocument;
  const mirror = doc === null ? null : mirrorOf(doc);
  if (doc === null || mirror === null) return null;
  const view = doc.defaultView;
  const computed = view?.getComputedStyle(input) ?? null;
  const inputRect = input.getBoundingClientRect();

  mirror.style.left = `${inputRect.left}px`;
  mirror.style.top = `${inputRect.top}px`;
  mirror.style.width = `${inputRect.width}px`;
  if (computed !== null) {
    for (const prop of MIRROR_PROPS) mirror.style[prop] = computed[prop];
  }
  // a single-line input never wraps (pre); a textarea wraps exactly
  // like `pre-wrap` with break-word — SOFT wraps are honest now
  mirror.style.whiteSpace = input instanceof HTMLInputElement ? 'pre' : 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.wordWrap = 'break-word';

  const marker = doc.createElement('span');
  marker.textContent = plan.marker; // ZERO_WIDTH_MARKER — a measurable line box
  mirror.replaceChildren(doc.createTextNode(plan.before), marker, doc.createTextNode(plan.after));

  return { rect: marker.getBoundingClientRect(), lineHeight: inputLineHeight(input) };
}

/**
 * The caret bar's geometry RELATIVE TO THE FIELD's border box, by the
 * zero-width marker: x = the marker's left minus the field's left and
 * horizontal scroll; y = the marker's line top (a single-line input's
 * text is vertically centered — the reference's centering law);
 * height = the marker's own line height (the pitch fallback).
 */
export function measureCaretMetrics(input: HTMLInputElement | HTMLTextAreaElement, offset: number): CaretMetrics {
  const inputRect = input.getBoundingClientRect();
  const measured = measureMarker(input, mirrorPlanOf(input.value, offset));
  if (measured === null) return { x: 0, y: 0, height: inputLineHeight(input) };
  const height = measured.rect.height > 0 ? measured.rect.height : measured.lineHeight;
  const x = measured.rect.left - inputRect.left - input.scrollLeft;
  const y =
    input instanceof HTMLInputElement
      ? Math.max(0, (inputRect.height - height) / 2)
      : Math.max(0, measured.rect.top - inputRect.top - input.scrollTop);
  return { x: Math.max(0, x), y, height };
}

/** the x-only convenience (the brief-named seam, v1 parity) */
export function measureCaretX(input: HTMLInputElement | HTMLTextAreaElement, offset: number): number {
  return measureCaretMetrics(input, offset).x;
}

/**
 * Both endpoints of a selection range + the field's content width
 * (the line-tail segment bound) — the highlight's whole input.
 */
export interface SelectionMetrics {
  readonly from: CaretMetrics;
  readonly to: CaretMetrics;
  readonly contentWidth: number;
}

/** measure the selection's start and end carets (the pure
 *  selectionRects turns the pair into highlight rectangles) */
export function measureSelectionMetrics(
  input: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
): SelectionMetrics {
  return {
    from: measureCaretMetrics(input, start),
    to: measureCaretMetrics(input, end),
    contentWidth: input.clientWidth,
  };
}

/* ── the UP-side tracker (selectionchange main + rAF coalesce) ────────── */

/** the event-host seam trackFieldSelection binds to (the real document
 *  in the studio; a structural fake in the node tests) */
export interface SelectionHost {
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

/** the rAF seam — the studio's requestAnimationFrame; a synchronous or
 *  queued fake in the node tests */
export type SelectionScheduler = (fn: () => void) => void;

export interface SelectionTracker {
  stop(): void;
}

/**
 * Track the document's selection changes over text fields (the UP
 * lane's main event — keyboard, mouse, paste, undo, context-menu
 * selections all fire it; the panel's delegated events stay as the
 * FALLBACK family, the reference's belt-and-braces). Reads coalesce
 * to ONE per animation frame (the rAF throttle): a burst of
 * selectionchange events inside one frame answers one read.
 *
 * `getActiveField` decides whether the document's active element is a
 * trackable text field (the panel's reportable-field law); the read
 * reports the CURRENT selectionStart/End — never a stale event payload.
 */
export function trackFieldSelection(
  host: SelectionHost,
  getActiveField: () => HTMLInputElement | HTMLTextAreaElement | null,
  onSelection: (field: HTMLInputElement | HTMLTextAreaElement, start: number, end: number) => void,
  schedule: SelectionScheduler = (fn) => requestAnimationFrame(fn),
): SelectionTracker {
  let pending = false;
  const read = (): void => {
    pending = false;
    const field = getActiveField();
    if (field === null) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number') return; // selectionless types
    onSelection(field, start, end);
  };
  const onSelectionChange = (): void => {
    if (pending) return; // rAF-coalesced — one read per frame
    pending = true;
    schedule(read);
  };
  host.addEventListener('selectionchange', onSelectionChange);
  return {
    stop(): void {
      host.removeEventListener('selectionchange', onSelectionChange);
    },
  };
}
