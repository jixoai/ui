/**
 * Hue runtime (apps/www/src/lib/hue-runtime.ts).
 *
 * The ui.jixoai.com brand hue runs free: on entry the hue maps the time of
 * day onto the 360° circle (midnight = 0°, one full day = one full turn),
 * then from that base it cycles linearly — a full 360° every 30 seconds.
 * The cycle plays by default; the palette popover's toggle pauses/resumes.
 *
 * One source of truth: every consumer reads `currentHue` (Svelte state) or
 * listens to the CSS custom-property change on the root. The runtime owns
 * the ONLY write path to `--brand-hue` — no other code writes it while
 * this module is mounted.
 */

import { get } from 'svelte/store';
import { writable } from 'svelte/store';

/** Full cycle duration in ms (Owner spec: 30s). */
const CYCLE_MS = 30_000;

/** Reactive hue value (0–359, integer degrees). */
export const currentHue = writable<number>(0);

/** Whether the auto-cycle is running. */
export const playing = writable<boolean>(true);

let interval = 0;
let startTime = 0;
let baseHue = 0;
let manual = false;

/** Map the wall clock onto the hue circle (one day = one full turn). */
function timeOfDayHue(now = new Date()): number {
  const seconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayFraction = seconds / 86_400;
  return Math.round(dayFraction * 360);
}

function applyHue(value: number): void {
  const hue = ((value % 360) + 360) % 360;
  currentHue.set(hue);
  document.documentElement.style.setProperty('--brand-hue', String(Math.round(hue)));
}

function tick(): void {
  if (!get(playing)) return;
  const elapsed = performance.now() - startTime;
  const delta = (elapsed / CYCLE_MS) * 360;
  applyHue(baseHue + delta);
}

/** Start the runtime: seed from time of day, begin cycling. */
export function startHueRuntime(): void {
  baseHue = timeOfDayHue();
  startTime = performance.now();
  applyHue(baseHue);
  interval = setInterval(tick, 100);
}

/** Stop the interval (page teardown). */
export function stopHueRuntime(): void {
  clearInterval(interval);
}

/** Pause the auto-cycle (hue freezes at its current value). */
export function pauseHue(): void {
  playing.set(false);
}

/** Resume the auto-cycle from the current hue (no jump: re-bases). */
export function resumeHue(): void {
  playing.set(true);
  // re-base so resuming from the current hue doesn't jump
  baseHue = get(currentHue);
  startTime = performance.now();
}

/** Toggle play/pause. */
export function toggleHuePlay(): void {
  if (get(playing)) pauseHue();
  else resumeHue();
}

/** Manually set the hue (pauses the auto-cycle: the user is in control). */
export function setHueManually(value: number): void {
  manual = true;
  playing.set(false);
  applyHue(value);
}

/** Check if hue was manually set (for UI state). */
export function isManual(): boolean {
  return manual;
}
