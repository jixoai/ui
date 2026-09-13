/**
 * stage-lens tests — the issue #21 camera model: clamp bounds, the
 * cursor-anchored zoom invariant, free pan, the wheel factor, and the
 * sessionStorage codec (structural storage fakes — no DOM dependency,
 * the selection.ts discipline).
 *
 * Original need: design-studio-r3 issue #21 (2026-09-12).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  STAGE_LENS_HOME,
  STAGE_LENS_MAX_SCALE,
  STAGE_LENS_MIN_SCALE,
  STAGE_LENS_STORE_KEY,
  STAGE_LENS_STEP,
  centerStageOn,
  clampStageScale,
  lerpStageLens,
  fitStageLens,
  formatStageZoom,
  isStageLensHome,
  panStageLens,
  parseStageLens,
  restoreStageLens,
  serializeStageLens,
  stageLensTransform,
  stageWheelFactor,
  zoomStageLens,
  zoomStageLensBy,
  type StageLensStorage,
} from './stage-lens.ts';

/* ── fixtures ───────────────────────────────────────────────────────── */

function memoryStorage(initial: Record<string, string> = {}): StageLensStorage & {
  dump(): Record<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key: string): string | null {
      return data.get(key) ?? null;
    },
    dump(): Record<string, string> {
      return Object.fromEntries(data);
    },
  };
}

/** project a canvas-space point through the lens (the invariant probe) */
function throughLens(lens: StageLens, u: { x: number; y: number }): { x: number; y: number } {
  return { x: lens.x + lens.scale * u.x, y: lens.y + lens.scale * u.y };
}

/* ── the clamp ───────────────────────────────────────────────────────── */

test('clampStageScale pins the 0.25–3.0 legal range', () => {
  assert.equal(clampStageScale(0.01), STAGE_LENS_MIN_SCALE);
  assert.equal(clampStageScale(99), STAGE_LENS_MAX_SCALE);
  assert.equal(clampStageScale(1), 1);
  assert.equal(clampStageScale(1.5), 1.5);
});

test('clampStageScale degrades non-finite input to home zoom', () => {
  assert.equal(clampStageScale(Number.NaN), 1);
  assert.equal(clampStageScale(Number.POSITIVE_INFINITY), 1);
});

/* ── the cursor-anchored zoom ────────────────────────────────────────── */

test('zoomStageLens keeps the anchor point visually pinned', () => {
  const lens = { scale: 1, x: 40, y: -20 };
  const anchor = { x: 300, y: 200 };
  const canvasPoint = { x: (anchor.x - lens.x) / lens.scale, y: (anchor.y - lens.y) / lens.scale };
  for (const next of [0.25, 0.5, 1.75, 3]) {
    const zoomed = zoomStageLens(lens, next, anchor);
    const screen = throughLens(zoomed, canvasPoint);
    assert.ok(Math.abs(screen.x - anchor.x) < 1e-9, `scale ${next}: x pinned`);
    assert.ok(Math.abs(screen.y - anchor.y) < 1e-9, `scale ${next}: y pinned`);
  }
});

test('zoomStageLens clamps the request and stays anchored', () => {
  const before = { scale: 2.9, x: 0, y: 0 };
  const anchor = { x: 100, y: 100 };
  const zoomed = zoomStageLens(before, 9, anchor);
  assert.equal(zoomed.scale, STAGE_LENS_MAX_SCALE);
  // the canvas point the cursor sat on at scale 2.9 must still project
  // to the cursor at the clamped scale 3 — even though the requested 9
  // was refused
  const canvasPoint = { x: anchor.x / before.scale, y: anchor.y / before.scale };
  assert.deepEqual(throughLens(zoomed, canvasPoint), anchor);
});

test('zoomStageLensBy compounds multiplicatively from the current scale', () => {
  const zoomed = zoomStageLensBy(STAGE_LENS_HOME, STAGE_LENS_STEP, { x: 0, y: 0 });
  assert.ok(Math.abs(zoomed.scale - STAGE_LENS_STEP) < 1e-12);
  const out = zoomStageLensBy(zoomed, 1 / STAGE_LENS_STEP, { x: 0, y: 0 });
  assert.ok(Math.abs(out.scale - 1) < 1e-12);
});

/* ── pan ─────────────────────────────────────────────────────────────── */

test('panStageLens is an unclamped screen-space delta (free canvas)', () => {
  const panned = panStageLens({ scale: 2, x: 10, y: 10 }, -500, 1234.5);
  assert.deepEqual(panned, { scale: 2, x: -490, y: 1244.5 });
});

test('panStageLens ignores non-finite deltas (a dropped pointer sample)', () => {
  const lens = { scale: 1, x: 5, y: 6 };
  assert.equal(panStageLens(lens, Number.NaN, 1), lens);
});

/* ── the auto camera's fit (#24) ──────────────────────────────────────── */

test('fitStageLens centers a sheet smaller than the stage at natural size (scale 1 ceiling)', () => {
  const fit = fitStageLens(1020, 900, 800, 600);
  assert.equal(fit.scale, 1);
  assert.equal(fit.x, (1020 - 800) / 2);
  assert.equal(fit.y, (900 - 600) / 2);
});

test('fitStageLens shrinks an oversized sheet to the binding axis, centered with padding clearance', () => {
  // the hero matrix: ~2500px natural width in a ~1020px stage — the
  // "1280 frame at 0.27×" world the r2 scale-to-fit produced
  const fit = fitStageLens(1020, 900, 2500, 1800, 48);
  assert.equal(fit.scale, (1020 - 96) / 2500);
  // the fitted sheet projects centered on BOTH axes
  const width = 2500 * fit.scale;
  const height = 1800 * fit.scale;
  assert.ok(Math.abs(fit.x - (1020 - width) / 2) < 1e-9, 'x centered');
  assert.ok(Math.abs(fit.y - (900 - height) / 2) < 1e-9, 'y centered');
  assert.ok(width <= 1020 - 48 + 1e-9 && height <= 900 - 48 + 1e-9, 'clears the padding');
});

test('fitStageLens respects the min-scale floor for absurd sheets', () => {
  const fit = fitStageLens(1020, 900, 100000, 100000);
  assert.equal(fit.scale, STAGE_LENS_MIN_SCALE);
});

test('fitStageLens degrades non-finite/non-positive inputs to identity (pre-metrics rest)', () => {
  assert.equal(fitStageLens(Number.NaN, 900, 800, 600), STAGE_LENS_HOME);
  assert.equal(fitStageLens(1020, 900, 0, 600), STAGE_LENS_HOME);
  assert.equal(fitStageLens(1020, 900, 800, -5), STAGE_LENS_HOME);
});

test('fitStageLens stays a fixed point: a stage-sized sheet fits at 1, offset 0', () => {
  const fit = fitStageLens(1000, 800, 1000 - 96, 800 - 96, 48);
  assert.equal(fit.scale, 1);
  assert.equal(fit.x, 48);
  assert.equal(fit.y, 48);
});

/* ── the anchor camera (#32) ──────────────────────────────────────────── */

test('centerStageOn keeps the zoom and centers a canvas-space box', () => {
  const lens = { scale: 0.5, x: 100, y: -40 };
  const centered = centerStageOn(lens, 1020, 900, { x: 400, y: 1200, width: 300, height: 500 });
  assert.equal(centered.scale, 0.5, 'zoom untouched');
  // the box's center projects to the stage's center
  assert.ok(Math.abs(centered.x + (400 + 150) * 0.5 - 510) < 1e-9, 'x centers');
  assert.ok(Math.abs(centered.y + (1200 + 250) * 0.5 - 450) < 1e-9, 'y centers');
});

test('centerStageOn degrades to the unchanged lens on non-finite input', () => {
  const lens = { scale: 1, x: 3, y: 4 };
  assert.equal(centerStageOn(lens, 1020, 900, { x: Number.NaN, y: 0, width: 10, height: 10 }), lens);
});

/* ── the tween frame (#39) ───────────────────────────────────────────── */

test('lerpStageLens: endpoints exact, zoom in log space, translate linear', () => {
  const from = { scale: 0.5, x: 0, y: 0 };
  const to = { scale: 2, x: 100, y: -40 };
  assert.equal(lerpStageLens(from, to, 0), from);
  assert.equal(lerpStageLens(from, to, 1), to);
  // midway (pre-ease t=.5 → eased .875): scale = 0.5·(4)^.875
  const mid = lerpStageLens(from, to, 0.5);
  assert.ok(Math.abs(mid.scale - 0.5 * 4 ** 0.875) < 1e-9, 'log-space zoom');
  assert.ok(Math.abs(mid.x - 100 * 0.875) < 1e-9, 'linear translate x');
  assert.ok(Math.abs(mid.y - -40 * 0.875) < 1e-9, 'linear translate y');
});

test('lerpStageLens degrades non-finite/out-of-range progress to endpoints', () => {
  const from = { scale: 1, x: 0, y: 0 };
  const to = { scale: 3, x: 9, y: 9 };
  assert.equal(lerpStageLens(from, to, Number.NaN), from);
  assert.equal(lerpStageLens(from, to, -1), from);
  assert.equal(lerpStageLens(from, to, 5), to);
});

/* ── the wheel factor ────────────────────────────────────────────────── */

test('stageWheelFactor: scroll down zooms out, up zooms in, |notch| ≈ 1.19×', () => {
  assert.ok(stageWheelFactor(-100) > 1, 'scroll up zooms in');
  assert.ok(stageWheelFactor(100) < 1, 'scroll down zooms out');
  const notch = stageWheelFactor(-100);
  assert.ok(notch > 1.1 && notch < 1.3, `a ±100px notch is a clean step (got ${notch.toFixed(3)})`);
  // symmetric: one tick in then one tick out returns to the scale
  const round = zoomStageLensBy(zoomStageLensBy(STAGE_LENS_HOME, notch, { x: 0, y: 0 }), 1 / notch, { x: 0, y: 0 });
  assert.ok(Math.abs(round.scale - 1) < 1e-12);
});

test('stageWheelFactor normalizes line/page deltaMode', () => {
  // 3 lines ≈ 48px — must differ from 3 raw pixels and match 48px
  assert.ok(Math.abs(stageWheelFactor(3, 1) - stageWheelFactor(48)) < 1e-12);
  assert.ok(Math.abs(stageWheelFactor(2, 2) - stageWheelFactor(200)) < 1e-12);
});

/* ── formats & css ───────────────────────────────────────────────────── */

test('formatStageZoom renders the clamped whole-percent readout', () => {
  assert.equal(formatStageZoom(1), '100%');
  assert.equal(formatStageZoom(0.25), '25%');
  assert.equal(formatStageZoom(3), '300%');
  assert.equal(formatStageZoom(1.174), '117%');
  assert.equal(formatStageZoom(99), '300%');
});

test('stageLensTransform is translate-then-scale (origin 0 0)', () => {
  assert.equal(stageLensTransform({ scale: 1, x: 0, y: 0 }), 'translate(0px, 0px) scale(1)');
  assert.equal(stageLensTransform({ scale: 0.5, x: -30, y: 12 }), 'translate(-30px, 12px) scale(0.5)');
});

test('isStageLensHome is exact-identity (fit restores the frozen home)', () => {
  assert.ok(isStageLensHome(STAGE_LENS_HOME));
  assert.ok(!isStageLensHome({ scale: 1, x: 0, y: 0.5 }));
  assert.ok(!isStageLensHome({ scale: 0.999, x: 0, y: 0 }));
});

/* ── the persistence codec ───────────────────────────────────────────── */

test('serialize → parse round-trips a real lens exactly', () => {
  const lens = zoomStageLens(panStageLens(STAGE_LENS_HOME, 33.5, -12.25), 1.75, { x: 10, y: 10 });
  assert.deepEqual(parseStageLens(serializeStageLens(lens)), lens);
});

test('parseStageLens rejects structural junk (→ null → home on restore)', () => {
  for (const junk of ['{', 'null', '"x"', '{"scale":"1","x":0,"y":0}', '{"scale":1,"x":0}', '[]']) {
    assert.equal(parseStageLens(junk), null, `junk ${junk}`);
  }
  assert.equal(parseStageLens(null), null);
});

test('parseStageLens rejects non-finite coordinates', () => {
  assert.equal(parseStageLens('{"scale":1,"x":1e999,"y":0}'), null); // Infinity via JSON overflow
});

test('parseStageLens clamps a stored scale that left the legal range', () => {
  const parsed = parseStageLens('{"scale":6,"x":-40,"y":80}');
  assert.deepEqual(parsed, { scale: STAGE_LENS_MAX_SCALE, x: -40, y: 80 });
});

test('restoreStageLens: empty storage → home, stored → lens, throwing → home', () => {
  assert.equal(restoreStageLens(memoryStorage()), STAGE_LENS_HOME);
  const stored = memoryStorage({ [STAGE_LENS_STORE_KEY]: serializeStageLens({ scale: 0.5, x: 12, y: -8 }) });
  assert.deepEqual(restoreStageLens(stored), { scale: 0.5, x: 12, y: -8 });
  const locked: StageLensStorage = {
    getItem(): string | null {
      throw new Error('SecurityError — private mode');
    },
  };
  assert.equal(restoreStageLens(locked), STAGE_LENS_HOME);
});
