<!--
  jixoai StepsItem (registry/files/ui/steps/steps-item.svelte,
  composition-first-apis, 2026-08-25).
  The li half of the steps family: an explicit REQUIRED `step` ordinal
  (shadcn-vue :step law) compared against the root's `current` — state
  is pure comparison, never registration order:

    step < current  → done    (paints the connector primary, ✓ marker)
    step = current  → current (aria-current=step)
    step > current  → todo    (inert — never aria-disabled: a step you
                               cannot reach yet is not a disabled
                               control, it is a place you have not
                               arrived)

  `onclick` fires ONLY from the done state and is what makes the
  Indicator render as a <button> (no-dead-affordance ruling); without a
  handler the Indicator stays an inert span. `label` feeds that
  button's accessible name — the Title lives in a sibling part, so the
  Item is the only place that knows it.
-->
<script lang="ts" module>
  /** per-item context surface the Item's parts (Indicator/Title) read */
  export interface StepsItemApi {
    readonly step: number;
    readonly state: 'done' | 'current' | 'todo';
    readonly label: string | undefined;
    readonly onclick: ((event: MouseEvent) => void) | undefined;
  }

  /** item context key — global symbol registry, like STEPS_KEY */
  export const STEPS_ITEM_KEY = Symbol.for('jx-steps-item');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext, setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { STEPS_KEY, type StepsApi } from './steps.svelte';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** REQUIRED explicit ordinal — compared against the root's current */
    step: number;
    /** accessible name for the done-marker button (the Title is authored
     *  in a sibling part; the Item is where the name is known) */
    label?: string;
    /** click-back handler — fires ONLY from the done state; presence is
     *  what turns the Indicator into a <button> */
    onclick?: (event: MouseEvent) => void;
    class?: string;
    children: Snippet;
  }

  // onclick is destructured OUT of rest on purpose: the interactive
  // element is the done Indicator's button, never the li itself
  let {
    step,
    label,
    onclick,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const steps = getContext<StepsApi>(STEPS_KEY);

  // pure comparison against caller truth — duplicates paint every
  // match current, gaps paint none; comparison cannot lie
  const state = $derived(step < steps.current ? 'done' : step === steps.current ? 'current' : 'todo');

  setContext<StepsItemApi>(STEPS_ITEM_KEY, {
    get step() {
      return step;
    },
    get state() {
      return state;
    },
    get label() {
      return label;
    },
    get onclick() {
      return onclick;
    },
  });
</script>

<li
  data-jx-step-item=""
  data-jx-step={state}
  class={cn('relative flex flex-1 items-start [gap:var(--jx-d-ctl-gap)] min-w-[9rem] [padding-inline-end:var(--jx-d-ctl-pad)]', className)}
  {...rest}
  aria-current={state === 'current' ? 'step' : undefined}
>
  {@render children()}
</li>
