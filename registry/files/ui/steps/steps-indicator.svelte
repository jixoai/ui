<!--
  jixoai StepsIndicator (registry/files/ui/steps/steps-indicator.svelte;
  state-vocabulary rebuild, 2026-09-01).
  The marker half — the state made visible (the NPC marker reading:
  ✓/✕/⋯/i/!/number). Two forms, decided by the Item's context:

    done + Item onclick → <button> — the interactive element (the repo
      ruling keeps future steps INERT, so the done marker is the only
      control; the button is never the li). child({ props }) is offered
      on THIS form only (the span form switches element kinds).
      FOCUS LAW (2026-09-02, C-16): the button's click flips current,
      which unmounts the button itself (done → current ⇒ span form) —
      the wrapped handler then parks focus on the item (tabindex=-1)
      inside a microtask, after the DOM swap, instead of losing it to
      body.
    everything else    → inert aria-hidden <span> — no handler, no dead
      affordance.

  State paint (border/background/token colors) rides steps.css keyed
  on the li's data-jx-step state (tailwindless W1, 2026-09-17 — the
  connector repaint's own law; one rung per vocabulary word, all on
  the theme's semantic pairs; the atoms carry geometry only). The
  DISTINCT-PAIRS law (2026-09-02, V2-6): the three confusable pairs are
  shape-separated, not glyph-only —

    done vs pending    done is SOLID primary + ✓; pending stays hollow
                       (border-primary on card) + the breathing ⋯
    current vs emphasis  current is the SOLID fill carrying its number;
                       emphasis switches to HOLLOW + a halo ring (!)
    disabled vs todo   disabled is the DASHED ring at reduced contrast
                       (and speaks "unavailable"); todo is the plain
                       hollow ring at full contrast

  The pending glyph breathes (css; reduced-motion freezes it).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { stepsStyles } from './steps.stylex';
  import { STEPS_ITEM_KEY, type StepsItemApi } from './steps-item.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** replaces the default glyph content (the state's glyph, or the
     *  step number where the vocabulary says so) */
    children?: Snippet;
    /** child({ props }) — offered ONLY on the interactive button form
     *  (done + Item onclick); the replacement element must preserve the
     *  button role. props.class carries the part's classes — append
     *  own utilities via class={cn(props.class, 'own')} so they win by
     *  the layer law. */
    child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;
    class?: string;
  }

  let { children, child, class: className = '', ...rest }: Props = $props();

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const item = getContext<StepsItemApi>(STEPS_ITEM_KEY);
  // the family contract is named, not a bare TypeError (the
  // toggle-group-item precedent): rendering this part outside its Item
  // is an authoring error worth a searchable message
  if (!item) {
    throw new Error('jixoai steps: StepsIndicator must live inside a StepsItem');
  }

  // the default glyph per state (children override; the number where
  // ordinal identity still speaks). $derived (2026-09-02, C-16): a
  // plain const froze String(item.step + 1) at first mount — the glyph
  // went stale when the item's ordinal prop changed
  const glyph = $derived({
    done: '✓',
    current: String(item.step + 1),
    todo: String(item.step + 1),
    pending: '⋯',
    success: '✓',
    error: '✕',
    hint: 'i',
    emphasis: '!',
    disabled: String(item.step + 1),
  } as const);

  // the no-dead-affordance law: a handler exists AND the step is done
  const interactive = $derived(item.state === 'done' && item.onclick !== undefined);

  const backLabel = $derived(
    item.label ? `completed: ${item.label} — go back` : 'completed — go back',
  );

  // the C-16 focus law: run the consumer's handler, then — after the
  // reactive swap that retires this button — rest focus on the item's
  // tabindex=-1 slot. queueMicrotask (not lifecycle): enqueued after
  // Svelte's own flush microtask, so the DOM swap lands first
  const clickWithFocusRest = (event: MouseEvent): void => {
    const li = (event.currentTarget as HTMLButtonElement).closest('[data-jx-step-item]');
    item.onclick?.(event);
    queueMicrotask(() => {
      if (li instanceof HTMLElement) li.focus();
    });
  };
</script>

{#if interactive}
  {@const props: HTMLButtonAttributes & { class: string } = {
    ...rest,
    type: 'button' as const,
    'data-jx-step-indicator': '',
    'aria-label': backLabel,
    class: cn(
      // rest spreads FIRST in the props object above, so the authored
      // wiring (type, aria-label, onclick) wins name collisions —
      // consumer attributes land verbatim. The state PAINT rides
      // steps.css keyed on the li's data-jx-step (the connector
      // repaint's own law); atoms carry the geometry + the cursor
      cx(stepsStyles.marker, stepsStyles.markerButton),
      className,
    ),
    onclick: clickWithFocusRest,
  }}
  {#if child}
    {@render child({ props })}
  {:else}
    <button {...props}>
      <span data-jx-step-index="" aria-hidden="true">{#if children}{@render children()}{:else}{glyph[item.state]}{/if}</span>
    </button>
  {/if}
{:else}
  <span
    data-jx-step-indicator=""
    class={cn(cx(stepsStyles.marker), className)}
    {...rest}
    aria-hidden="true"
  >
    <span data-jx-step-index="">{#if children}{@render children()}{:else}{glyph[item.state]}{/if}</span>
  </span>
{/if}
