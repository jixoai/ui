/**
 * The playground typed state object (apps/www/src/lib/playground/
 * play-state.svelte.ts, canvas-floor-lab 2026-08-30, task 2.1).
 *
 * The lab contract, consolidated: a docs page holds ONE typed rune
 * state object for its canvas controls — `playState(defaults)` — and
 * every Play* kit control binds into `play.current.<key>` (the deep
 * $state proxy keeps each binding reactive). The canvas never owns
 * this state; it projects it (stage demo, code panel, output lane).
 *
 *   const play = playState({ variant: 'tonal', shape: 'square' });
 *   // controls:   <PlaySelect bind:value={play.current.variant} … />
 *   // reset:      onreset={() => play.reset()}
 *   // projection: output={playOutputs(play.current)}
 *   // code panel: the page's $derived usage snippet over play.current
 *                (authored ONCE — the taught string IS the shown string)
 *
 * `reset()` writes key-by-key into the SAME proxy, so live bindings
 * keep firing (no object swap that orphans the compiled accessors).
 * `playOutputs` projects the state into the canvas's read-only output
 * lane rows (`variant=tonal · shape=square`), and `defaults` stays a
 * frozen snapshot of the documented defaults for equality checks.
 *
 * Coexistence with schema mode: pages driving the canvas through
 * `schema` + `bind:values` (the press-button flagship) already hold a
 * typed state object — this kit serves the Play*-snippet route, and
 * the playground snippet keeps escape-hatch precedence either way.
 */
import type { PlayOutput } from '$lib/ui/component-canvas/component-canvas.svelte';

/** the value domain the kit controls bind (jsonSchema-representable) */
export type PlayValue = string | number | boolean;

export interface PlayState<T extends Record<string, PlayValue>> {
  /** the live control state — bind Play* controls into its keys */
  current: T;
  /** frozen snapshot of the documented defaults */
  defaults: Readonly<T>;
  /** restore the documented defaults in place (bindings stay live) */
  reset(): void;
}

/**
 * Create the page-owned playground state. `defaults` is cloned — the
 * page's literal stays untouched, `defaults` reads stay stable, and
 * `reset()` can never mutate the author's copy.
 */
export function playState<T extends Record<string, PlayValue>>(defaults: T): PlayState<T> {
  const current = $state(structuredClone(defaults));
  const frozen = Object.freeze(structuredClone(defaults));
  return {
    current,
    defaults: frozen,
    reset(): void {
      for (const key of Object.keys(frozen) as (keyof T)[]) {
        current[key] = frozen[key];
      }
    },
  };
}

/**
 * Project the state into the canvas's read-only output lane rows —
 * one `label=value` pair per control key, in declaration order.
 */
export function playOutputs(state: Record<string, PlayValue>): PlayOutput[] {
  return Object.entries(state).map(([label, value]) => ({ label, value }));
}
