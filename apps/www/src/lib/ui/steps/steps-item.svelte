<!--
  jixoai StepsItem (registry/files/ui/steps/steps-item.svelte;
  state-vocabulary rebuild, 2026-09-01).
  The li half of the steps family: an explicit REQUIRED `step` ordinal
  (shadcn-vue :step law) compared against the root's `current` — the
  derived trio is pure comparison, never registration order:

    step < current  → done    (✓ marker, connector painted primary)
    step = current  → current (aria-current=step, filled marker)
    step > current  → todo    (inert — a step you cannot reach yet is
                               not a disabled control, it is a place you
                               have not arrived)

  THE STATE VOCABULARY (Owner extension, 2026-09-01 — steps is the
  state-focused sibling of timeline: restrained, no spatial slots).
  `state` OVERRIDES the derived trio for the in-between and semantic
  states the trio cannot express — think a wizard form AND the markers
  over an NPC's head:

    auto      the derived trio (default)
    pending   the middle state — submitted, in flight (⋯ breathing)
    success   the terminal win (✓ on the success pair)
    error     the terminal failure (✕ on the error pair)
    hint      informational (i on the info pair)
    emphasis  the "look here" marker — the quest-giver ! (hollow+halo)
    disabled  genuinely out of reach NOW (dashed ring, reduced contrast)

  AT VISIBILITY (2026-09-02, the C-6 ruling): the marker glyphs are
  aria-hidden chrome (the done button names itself through its own
  aria-label), so EVERY item speaks its effective state as an sr-only
  status text — the vocabulary reaches screen readers as words, not
  data attributes. `disabled` rides that TEXT too ("unavailable"):
  aria-disabled on a non-control li is ignored by AT, and the li now
  carries tabindex=-1 as the family's programmatic focus-resting slot
  (the C-16 focus law: a done-marker button that unmounts after its
  click parks focus on its own item, never on body).

  `onclick` fires ONLY from the done state and is what makes the
  Indicator render as a <button> (no-dead-affordance ruling); without a
  handler the Indicator stays an inert span. `label` feeds that
  button's accessible name.

  The anatomy is the item's own grid (steps.css): marker | body (title
  over description) | tail (the connector lane) — the connector never
  strikes the labels again.
-->
<script lang="ts" module>
  /** the family's state vocabulary — derived trio + semantic overrides */
  export type StepState =
    | 'auto'
    | 'done'
    | 'current'
    | 'todo'
    | 'pending'
    | 'success'
    | 'error'
    | 'hint'
    | 'emphasis'
    | 'disabled';

  /** per-item context surface the Item's parts (Indicator/Title) read */
  export interface StepsItemApi {
    readonly step: number;
    readonly state: Exclude<StepState, 'auto'>;
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
    /** the state vocabulary override ('auto' = the derived trio) */
    state?: StepState;
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
    state = 'auto',
    label,
    onclick,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const steps = getContext<StepsApi>(STEPS_KEY);

  // pure comparison against caller truth — duplicates paint every
  // match current, gaps paint none; comparison cannot lie
  const derived = $derived(
    step < steps.current ? 'done' : step === steps.current ? 'current' : 'todo',
  );
  // the explicit override wins; 'auto' rides the derived trio (the
  // annotation keeps the rune's type stable for the template reads)
  const effective: Exclude<StepState, 'auto'> = $derived(
    state === 'auto' ? derived : state,
  );

  // the state's AT-readable name — the vocabulary is data-jx-step paint
  // (invisible to AT), so every item SPEAKS its state as text (C-6).
  // disabled rides this text ("unavailable"): aria-disabled on a
  // non-control li is ignored by screen readers. Static map — the
  // template's [effective] lookup is the reactive read
  const statusText: Record<Exclude<StepState, 'auto'>, string> = {
    done: 'completed',
    current: 'current step',
    todo: 'not started',
    pending: 'in progress',
    success: 'succeeded',
    error: 'failed',
    hint: 'information',
    emphasis: 'attention',
    disabled: 'unavailable',
  };

  setContext<StepsItemApi>(STEPS_ITEM_KEY, {
    get step() {
      return step;
    },
    get state() {
      return effective;
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
  data-jx-step={effective}
  class={cn('flex-1 min-w-[9rem]', className)}
  {...rest}
  tabindex="-1"
  aria-current={effective === 'current' ? 'step' : undefined}
>
  <span class="sr-only">{statusText[effective]}</span>
  {@render children()}
</li>
