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

  State paint (border/background/token colors) is JS-known through the
  item context, so it rides conditional token utilities (tw4 law) — one
  rung per vocabulary word, all on the theme's semantic pairs. The
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
  // the family contract is named, not a bare TypeError (the
  // toggle-group-item precedent): rendering this part outside its Item
  // is an authoring error worth a searchable message
  if (!item) {
    throw new Error('jixoai steps: StepsIndicator must live inside a StepsItem');
  }

  // one rung per vocabulary word — the theme's semantic pairs, shaped
  // per the distinct-pairs law above (V2-6)
  const markerPaint = {
    done: 'border-primary bg-primary text-primary-foreground hover:bg-primary/90',
    current: 'border-primary bg-primary text-primary-foreground',
    todo: 'border-border bg-card text-muted-foreground',
    pending: 'border-primary bg-card text-primary',
    success: 'border-success bg-success text-success-foreground',
    error: 'border-error bg-error text-error-foreground',
    hint: 'border-info bg-card text-info',
    emphasis: 'border-primary bg-card text-primary ring-1 ring-primary ring-offset-2 ring-offset-card',
    disabled: 'border-dashed border-border/60 bg-transparent text-muted-foreground/60 cursor-not-allowed',
  } as const;

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
      // consumer attributes land verbatim
      'flex-none inline-flex items-center justify-center [width:var(--jx-icon)] [height:var(--jx-icon)] border font-nav [font-size:var(--jx-text-secondary)] cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
      markerPaint[item.state],
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
