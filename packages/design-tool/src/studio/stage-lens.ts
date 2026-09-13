/**
 * @jixoai/ui-design (studio) — the stage lens model (design-studio r3,
 * issue #21: canvas zoom / pan / reset).
 *
 * The LENS LAW (frame-view.svelte's scale-to-fit is the precedent):
 * the stage zooms the VIEWPORT'S VIEW of the canvas, never the canvas
 * — scale + translate ride ONE css transform on the wrapper around
 * the iframe, so the iframe's layout size (its real viewport) and its
 * URL are invariant under every lens operation. Transform is ink,
 * layout is law.
 *
 *     screen = translate + scale · canvas      (transform-origin 0 0)
 *
 *     zoom(next, anchor): keep the canvas point under `anchor`
 *                         visually pinned (cursor-anchored zoom)
 *     pan(dx, dy):        free translate — out-of-bounds is LEGAL
 *                         (free-canvas semantics; fit is the one-key way back)
 *
 * PURE functions only (the selection.ts discipline): stage-view.svelte
 * owns the DOM; this module is the node-tested math + the
 * sessionStorage codec (structural storage input — tests hand-roll
 * fakes, no DOM dependency).
 *
 * Original need: Owner 2026-09-11 —「中间的画布要能支持缩放拖动复位等操作」
 * (design-studio-r3 issue #21, 2026-09-12).
 */

/* ── the model ───────────────────────────────────────────────────────── */

/** the lens: one zoom + one translate, the whole camera state */
export interface StageLens {
  /** zoom factor, clamped to [STAGE_LENS_MIN_SCALE, STAGE_LENS_MAX_SCALE] */
  readonly scale: number;
  /** translate x in stage px (free — out-of-bounds allowed) */
  readonly x: number;
  /** translate y in stage px */
  readonly y: number;
}

/** a stage-local anchor point (cursor or stage center) */
export interface StageAnchor {
  readonly x: number;
  readonly y: number;
}

export const STAGE_LENS_MIN_SCALE = 0.25;
export const STAGE_LENS_MAX_SCALE = 3;
/** identity — the pre-metrics fallback; once canvas metrics arrive the
 *  auto camera replaces it with fitStageLens (#24) */
export const STAGE_LENS_HOME: StageLens = Object.freeze({ scale: 1, x: 0, y: 0 });
/** the +/- HUD step (multiplicative — perceptually uniform) */
export const STAGE_LENS_STEP = 1.2;
/** sessionStorage key — the selection store's sibling (same pattern) */
export const STAGE_LENS_STORE_KEY = 'jx-design:stage-lens';

/* ── the math ────────────────────────────────────────────────────────── */

/** clamp into the legal zoom range (non-finite degrades to home zoom) */
export function clampStageScale(scale: number): number {
  if (!Number.isFinite(scale)) return 1;
  return Math.min(STAGE_LENS_MAX_SCALE, Math.max(STAGE_LENS_MIN_SCALE, scale));
}

/** identity check (drives the shifted-canvas outline affordance) */
export function isStageLensHome(lens: StageLens): boolean {
  return lens.scale === 1 && lens.x === 0 && lens.y === 0;
}

/** the wrapper's css transform (translate THEN scale, origin 0 0) */
export function stageLensTransform(lens: StageLens): string {
  return `translate(${lens.x}px, ${lens.y}px) scale(${lens.scale})`;
}

/**
 * Zoom to `nextScale` keeping the canvas point under `anchor` visually
 * pinned: u = (anchor − t) / z stays put, so t' = anchor − u·z'. This
 * is the cursor-anchored zoom every canvas tool uses; HUD buttons pass
 * the stage center as the anchor.
 */
export function zoomStageLens(lens: StageLens, nextScale: number, anchor: StageAnchor): StageLens {
  const scale = clampStageScale(nextScale);
  const ux = (anchor.x - lens.x) / lens.scale;
  const uy = (anchor.y - lens.y) / lens.scale;
  return { scale, x: anchor.x - ux * scale, y: anchor.y - uy * scale };
}

/**
 * The AUTO camera (#24): fit a content sheet of contentW×contentH into
 * the stage with `padding` clearance on all sides, centered. Scale is
 * capped at 1 (natural size is the ceiling — blowing a small canvas UP
 * past 100% on load reads as an accident, not a fit). Non-finite or
 * non-positive inputs degrade to identity (the pre-metrics camera).
 */
export function fitStageLens(
  stageW: number,
  stageH: number,
  contentW: number,
  contentH: number,
  padding = 48,
): StageLens {
  if (![stageW, stageH, contentW, contentH].every((n) => Number.isFinite(n) && n > 0)) {
    return STAGE_LENS_HOME;
  }
  const scale = clampStageScale(
    Math.min((stageW - padding * 2) / contentW, (stageH - padding * 2) / contentH, 1),
  );
  return {
    scale,
    x: (stageW - contentW * scale) / 2,
    y: (stageH - contentH * scale) / 2,
  };
}

/**
 * The ANCHOR camera (#32, the tree's page-folder seam): keep the zoom,
 * center a canvas-space box in the stage — the folder click becomes a
 * camera move (the r2 hash-append rebuilt the whole iframe per click;
 * every frame reloaded on a mere expand). Non-finite input degrades to
 * the unchanged lens.
 */
export function centerStageOn(
  lens: StageLens,
  stageW: number,
  stageH: number,
  box: { x: number; y: number; width: number; height: number },
): StageLens {
  if (![box.x, box.y, box.width, box.height, stageW, stageH].every((n) => Number.isFinite(n))) {
    return lens;
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  return { scale: lens.scale, x: stageW / 2 - cx * lens.scale, y: stageH / 2 - cy * lens.scale };
}

/**
 * One tween frame (#39, the smooth anchor): interpolate `from → to` at
 * progress `t` (0–1). The zoom rides LOG space — equal perceptual steps
 * at any magnification (a linear scale tween visibly crawls at the
 * start and snaps at the end); translate rides linear. Non-finite
 * guards degrade to the endpoints.
 */
export function lerpStageLens(from: StageLens, to: StageLens, t: number): StageLens {
  if (!Number.isFinite(t) || t <= 0) return from;
  if (t >= 1) return to;
  const eased = 1 - (1 - t) ** 3; // easeOutCubic — fast away, gentle arrival
  const scale = from.scale * (to.scale / from.scale) ** eased;
  return {
    scale,
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
  };
}

/** zoom by a multiplicative factor (wheel ticks, HUD +/- steps) */
export function zoomStageLensBy(lens: StageLens, factor: number, anchor: StageAnchor): StageLens {
  return zoomStageLens(lens, lens.scale * factor, anchor);
}

/**
 * The wheel tick → multiplicative factor. exp() makes trackpad pixel
 * deltas feel smooth (many small ticks compound) while a discrete
 * mouse notch (±100px) lands at a clean ~1.19× step; deltaY > 0
 * (scroll down) zooms OUT. deltaMode 1 (lines) / 2 (pages) normalize
 * to px equivalents first.
 */
export function stageWheelFactor(deltaY: number, deltaMode = 0): number {
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? 100 : 1;
  return Math.exp(-(deltaY * unit) * 0.00175);
}

/**
 * Pan by a screen-space delta. NO bounds clamping — the free-canvas
 * semantics (drag the canvas off-center, fit brings it home).
 */
export function panStageLens(lens: StageLens, dx: number, dy: number): StageLens {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return lens;
  return { scale: lens.scale, x: lens.x + dx, y: lens.y + dy };
}

/** the HUD's percentage readout ("100%", "25%", "300%") */
export function formatStageZoom(scale: number): string {
  return `${Math.round(clampStageScale(scale) * 100)}%`;
}

/* ── the persistence codec (sessionStorage, selection's pattern) ─────── */

/** the minimal storage surface restore reads (real sessionStorage fits) */
export interface StageLensStorage {
  getItem(key: string): string | null;
}

export function serializeStageLens(lens: StageLens): string {
  return JSON.stringify({ scale: lens.scale, x: lens.x, y: lens.y });
}

/**
 * Parse a stored lens. Validation is forgiving-by-part: a legal scale
 * outside the range clamps (a range change between sessions must not
 * strand the camera), but structurally wrong input (junk JSON, wrong
 * types, non-finite) is null → home.
 */
export function parseStageLens(raw: string | null): StageLens | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as { scale?: unknown; x?: unknown; y?: unknown };
    if (typeof value.scale !== 'number' || typeof value.x !== 'number' || typeof value.y !== 'number') {
      return null;
    }
    if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return null;
    return { scale: clampStageScale(value.scale), x: value.x, y: value.y };
  } catch {
    return null;
  }
}

/** restore from a storage (missing/junk/private-mode → home) */
export function restoreStageLens(storage: StageLensStorage): StageLens {
  try {
    return parseStageLens(storage.getItem(STAGE_LENS_STORE_KEY)) ?? STAGE_LENS_HOME;
  } catch {
    return STAGE_LENS_HOME;
  }
}
