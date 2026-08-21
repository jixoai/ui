/**
 * Hue runtime (apps/www/src/lib/hue-runtime.ts).
 *
 * The ui.jixoai.com brand hue maps the wall clock onto the 360° circle:
 * one full day = one full turn (4 minutes per degree, 24h = 360°).
 *
 * Phase machine (Owner spec, 2026-08-21):
 *
 *   entry     page load → 5s cubic-out spin from the time-of-day hue
 *             through a full 360° back to itself (a fast "hello" that
 *             showcases the whole spectrum before settling)
 *   cruising  hue = timeOfDayHue(now) — always derived from the wall
 *             clock, never accumulated; a 1s interval re-derives it,
 *             which is far more precise than 4min/deg requires
 *   paused    hue frozen (manual drag or explicit pause)
 *   resuming  2s cubic-out transition from the paused hue toward the
 *             current time-of-day hue (shortest angular path)
 *
 * Manual interaction (slider drag) auto-pauses; resuming activates the
 * 2s cubic-out rule. Reduced-motion skips all animations: entry and
 * resume land instantly at the target.
 */

import { get } from 'svelte/store';
import { writable } from 'svelte/store';

/** Reactive hue value (0–359, fractional degrees). */
export const currentHue = writable<number>(0);

/** Whether the auto-cycle is running (cruising, entry, or resuming). */
export const playing = writable<boolean>(true);

type Phase = 'entry' | 'cruising' | 'paused' | 'resuming';

let phase: Phase = 'entry';
let animRaf = 0;
let cruiseTimer = 0;
let animStart = 0;
let animFrom = 0;
let animDuration = 0;

/** Cubic-out easing: fast start, gentle settle. */
const cubicOut = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Map the wall clock onto the hue circle (one day = one full turn). */
function timeOfDayHue(now = new Date()): number {
  const seconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayFraction = seconds / 86_400;
  return dayFraction * 360;
}

let lastWrittenHue = -1;

function applyHue(value: number): void {
  const hue = Math.round(((value % 360) + 360) % 360);
  // 4min/deg means the integer hue changes only once every ~2.4 minutes;
  // skip redundant CSS writes when the rounded value hasn't moved
  if (hue === lastWrittenHue) return;
  lastWrittenHue = hue;
  currentHue.set(hue);
  document.documentElement.style.setProperty('--brand-hue', String(hue));
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Shared interval animation driver for entry (5s spin) and resume (2s ease).
 *  setInterval instead of rAF: rAF is throttled in some embedded browsers. */
function runAnimation(): void {
  clearInterval(animRaf);
  const step = (): void => {
    const t = Math.min(1, (performance.now() - animStart) / animDuration);
    const eased = cubicOut(t);

    if (phase === 'entry') {
      // spin: from the time-of-day hue, travel a full 360° back to itself
      applyHue(animFrom + eased * 360);
    } else if (phase === 'resuming') {
      // shortest angular path from animFrom to the current wall-clock hue
      const target = timeOfDayHue();
      let delta = target - animFrom;
      delta = ((delta + 540) % 360) - 180; // wrap to [-180, 180]
      applyHue(animFrom + eased * delta);
    }

    if (t >= 1) {
      clearInterval(animRaf);
      startCruising();
    }
  };
  animRaf = setInterval(step, 50) as unknown as number;
}

/** Entry: 5s cubic-out full spin from the time-of-day hue. */
function startEntry(): void {
  phase = 'entry';
  playing.set(true);
  animFrom = timeOfDayHue();
  animDuration = 5_000;
  animStart = performance.now();
  if (prefersReducedMotion()) {
    startCruising();
    return;
  }
  applyHue(animFrom);
  runAnimation();
}

/** Cruising: hue always derived from the wall clock (准时播报). */
function startCruising(): void {
  phase = 'cruising';
  playing.set(true);
  applyHue(timeOfDayHue());
  clearInterval(cruiseTimer);
  cruiseTimer = setInterval(() => {
    if (phase === 'cruising') {
      applyHue(timeOfDayHue());
    }
  }, 1_000);
}

/** Resuming: 2s cubic-out toward the wall-clock hue. */
function startResume(): void {
  phase = 'resuming';
  playing.set(true);
  animFrom = get(currentHue);
  animDuration = 2_000;
  animStart = performance.now();
  if (prefersReducedMotion()) {
    startCruising();
    return;
  }
  runAnimation();
}

function stopAll(): void {
  clearInterval(animRaf);
  clearInterval(cruiseTimer);
}

/** Start the runtime: entry spin → cruising. */
export function startHueRuntime(): void {
  startEntry();
}

/** Stop everything (page teardown). */
export function stopHueRuntime(): void {
  stopAll();
}

/** Pause: freeze the hue at its current value. */
export function pauseHue(): void {
  phase = 'paused';
  playing.set(false);
  stopAll();
}

/** Resume: 2s cubic-out transition from the paused hue to the wall-clock
 *  hue, then cruising. Activated by the play/pause toggle. */
export function resumeHue(): void {
  stopAll();
  startResume();
}

/** Toggle play/pause. */
export function toggleHuePlay(): void {
  if (get(playing)) pauseHue();
  else resumeHue();
}

/** Manually set the hue: auto-pauses (the user is in control). Resuming
 *  later activates the 2s cubic-out rule. */
export function setHueManually(value: number): void {
  phase = 'paused';
  playing.set(false);
  stopAll();
  applyHue(value);
}
