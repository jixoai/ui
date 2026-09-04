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
 *
 * Context endorsement (context-plugin-system, 2026-08-30): the value
 * now flows through the ContextPlugin kernel as the 'hue' def — the
 * runtime's applyHue writes the RAW normalized hue into a withPlugins
 * pipeline (captured once at createHueContext, called from the site
 * layout's component init), and everything downstream (the currentHue
 * store AND the documentElement --brand-hue stamp) reads the chained
 * EXPOSED projection. Wall-clock behavior and the documentElement
 * write cadence (deduped on the rounded written value) are unchanged;
 * with zero plugins the pipeline is the identity fast path — no chain
 * is built and exposed === raw by reference. The document-global
 * nature (one documentElement custom property) is why the pipeline
 * sink is module-level; the PLUGIN registration itself stays
 * root-scoped in the kernel — this module holds no plugin list.
 */

import { getContext, setContext } from 'svelte';
import { get } from 'svelte/store';
import { writable } from 'svelte/store';
import {
  defineContextDef,
  getContextPlugins,
  withPlugins,
  type ContextDef,
  type PluginPipeline,
} from './context-plugin.svelte';

/** The hue def: 0–359 fractional degrees (rounded at the DOM seam).
 *  Exported so the print plugin can pin the projection to the def's
 *  OWN default (one source of truth for the pinned value). A factory
 *  product since context-plugin-v2: plugins bind THIS object's
 *  identity, never the 'hue' string. */
export const HUE_DEF: ContextDef<'hue', number> = defineContextDef({
  key: 'hue',
  defaults: () => 0,
  ssrSafe: 0,
});

/** Read-only hue context (getter-backed; the exposed chained value). */
export interface HueContext {
  readonly hue: number;
}

export const HUE_KEY = Symbol('jx-hue');

/** The document-global pipeline sink — assigned by createHueContext
 * (the site layout's init), read by applyHue. Null before creation
 * and on server renders that never start the runtime. */
let pipeline: PluginPipeline<number> | null = null;

/**
 * Create (and provide) the hue context. MUST run during a component's
 * initialisation (the site layout's) so the plugin chain visible there
 * is captured once, at context-instance creation — the kernel's
 * capture coordinate. Re-creation (HMR, a re-keyed layout) simply
 * re-points the document-global sink at the fresh pipeline.
 *
 * The DOM stamp lives in an $effect reading the EXPOSED projection:
 * it follows raw writes (the runtime's wall-clock ticks, manual sets)
 * AND environment changes (a print plugin pinning the hue flips the
 * stamp when the medium moves) — one write owner, same dedup law.
 * Effects never run during SSR, so the server render stays DOM-free.
 */
export function createHueContext(options: { root?: HTMLElement } = {}): HueContext {
  const instance = withPlugins(HUE_DEF, getContextPlugins());
  pipeline = instance;
  const context: HueContext = {
    get hue() {
      return instance.exposed;
    },
  };
  setContext(HUE_KEY, context);
  void options; // root is accepted for future element-scoped hue work

  $effect(() => {
    stampHue(instance.exposed);
  });
  return context;
}

export function getHueContext(): HueContext | undefined {
  return getContext<HueContext | undefined>(HUE_KEY);
}

/** Reactive hue value (0–359, integer degrees — the rounded exposed). */
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

const normalize = (value: number): number => ((value % 360) + 360) % 360;

let lastWrittenHue = -1;

/** The single DOM-stamp owner: round, dedup on the rounded WRITTEN
 *  value, mirror into the store, write documentElement. A plugin
 *  pinning the hue constant therefore stops the writes entirely. */
function stampHue(exposed: number): void {
  const hue = Math.round(normalize(exposed));
  // 4min/deg means the integer hue changes only once every ~2.4 minutes;
  // skip redundant CSS writes when the rounded value hasn't moved
  if (hue === lastWrittenHue) return;
  lastWrittenHue = hue;
  currentHue.set(hue);
  document.documentElement.style.setProperty('--brand-hue', String(hue));
}

function applyHue(value: number): void {
  const normalized = normalize(value);
  if (pipeline === null) {
    // no context instance (a stray runtime start before the layout
    // created one) — keep the pre-endorsement write path alive
    stampHue(normalized);
    return;
  }
  // the raw write (full fractional precision — plugins see the truth);
  // the stamp effect reads the chained EXPOSED projection from here
  pipeline.setRaw(normalized);
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
  }, 1_000) as unknown as number;
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
