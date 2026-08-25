<!--
  jixoai StepsIndicator (registry/files/ui/steps/steps-indicator.svelte,
  composition-first-apis, 2026-08-25).
  The marker half of the steps family: the numbered square that becomes
  a ✓ when its Item is done. Two forms, decided by the Item's context:

    done + Item onclick → <button> — the interactive element (the repo
      ruling keeps future steps INERT, so the done marker is the only
      control; the button is never the li). child({ props }) is offered
      on THIS form only (the span form switches element kinds).
    everything else    → inert aria-hidden <span> — no handler, no dead
      affordance.

  State paint (border/background/token colors) is JS-known through the
  item context, so it rides conditional token utilities (tw4 law).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { STEPS_ITEM_KEY, type StepsItemApi } from './steps-item.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** replaces the default glyph content (✓ when done, the number
     *  otherwise) */
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

  const item = getContext<StepsItemApi>(STEPS_ITEM_KEY);

  const markerPaint = {
    done: 'border-primary bg-card text-primary',
    current: 'border-primary bg-primary text-primary-foreground',
    todo: 'border-border bg-card text-muted-foreground',
  } as const;

  // the no-dead-affordance law: a handler exists AND the step is done
  const interactive = $derived(item.state === 'done' && item.onclick !== undefined);

  const backLabel = $derived(
    item.label ? `completed: ${item.label} — go back` : 'completed — go back',
  );
</script>

{#if interactive}
  // rest spreads FIRST so the authored wiring (type, aria-label,
  // onclick) wins any name collision — consumer attributes land verbatim
  {@const props = {
    ...rest,
    type: 'button',
    'data-jx-step-indicator': '',
    'aria-label': backLabel,
    class: cn(
      'flex-none inline-flex items-center justify-center size-6 border font-nav text-[0.6875rem] cursor-pointer hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
      markerPaint[item.state],
      className,
    ),
    onclick: item.onclick,
  }}
  {#if child}
    {@render child({ props })}
  {:else}
    <button {...props}>
      <span data-jx-step-index="" aria-hidden="true">{#if children}{@render children()}{:else}✓{/if}</span>
    </button>
  {/if}
{:else}
  <span
    data-jx-step-indicator=""
    class={cn(
      'flex-none inline-flex items-center justify-center size-6 border font-nav text-[0.6875rem]',
      markerPaint[item.state],
      className,
    )}
    {...rest}
    aria-hidden="true"
  >
    <span data-jx-step-index="">{#if children}{@render children()}{:else}{item.step + 1}{/if}</span>
  </span>
{/if}
