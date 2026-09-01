<!--
  jixoai StepsIndicator (registry/files/ui/steps/steps-indicator.svelte;
  state-vocabulary rebuild, 2026-09-01).
  The marker half — the state made visible (the NPC marker reading:
  ✓/✕/⋯/i/!/number). Two forms, decided by the Item's context:

    done + Item onclick → <button> — the interactive element (the repo
      ruling keeps future steps INERT, so the done marker is the only
      control; the button is never the li). child({ props }) is offered
      on THIS form only (the span form switches element kinds).
    everything else    → inert aria-hidden <span> — no handler, no dead
      affordance.

  State paint (border/background/token colors) is JS-known through the
  item context, so it rides conditional token utilities (tw4 law) — one
  rung per vocabulary word, all on the theme's semantic pairs:
  primary (done/current/emphasis), success, error, info, muted (todo/
  disabled). The pending glyph breathes (css; reduced-motion freezes).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
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

  const item = getContext<StepsItemApi>(STEPS_ITEM_KEY);

  // one rung per vocabulary word — the theme's semantic pairs
  const markerPaint = {
    done: 'border-primary bg-card text-primary',
    current: 'border-primary bg-primary text-primary-foreground',
    todo: 'border-border bg-card text-muted-foreground',
    pending: 'border-primary bg-card text-primary',
    success: 'border-success bg-success text-success-foreground',
    error: 'border-error bg-error text-error-foreground',
    hint: 'border-info bg-card text-info',
    emphasis: 'border-primary bg-primary text-primary-foreground',
    disabled: 'border-border bg-muted text-muted-foreground cursor-not-allowed',
  } as const;

  // the default glyph per state (children override; the number where
  // ordinal identity still speaks)
  const glyph = {
    done: '✓',
    current: String(item.step + 1),
    todo: String(item.step + 1),
    pending: '⋯',
    success: '✓',
    error: '✕',
    hint: 'i',
    emphasis: '!',
    disabled: String(item.step + 1),
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
  {@const props: HTMLButtonAttributes & { class: string } = {
    ...rest,
    type: 'button' as const,
    'data-jx-step-indicator': '',
    'aria-label': backLabel,
    class: cn(
      'flex-none inline-flex items-center justify-center [width:var(--jx-icon)] [height:var(--jx-icon)] border font-nav [font-size:var(--jx-text-secondary)] cursor-pointer hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
      markerPaint[item.state],
      className,
    ),
    onclick: item.onclick,
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
    class={cn(
      'flex-none inline-flex items-center justify-center [width:var(--jx-icon)] [height:var(--jx-icon)] border font-nav [font-size:var(--jx-text-secondary)]',
      markerPaint[item.state],
      className,
    )}
    {...rest}
    aria-hidden="true"
  >
    <span data-jx-step-index="">{#if children}{@render children()}{:else}{glyph[item.state]}{/if}</span>
  </span>
{/if}
