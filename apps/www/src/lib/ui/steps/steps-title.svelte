<!--
  jixoai StepsTitle (registry/files/ui/steps/steps-title.svelte,
  composition-first-apis, 2026-08-25).
  The label line of a step: authored inside StepsItem, painted by the
  item's state through context (current → foreground, else muted — the
  states are JS-known, so conditional token utilities carry them).
  Outside a StepsItem this is a naming error — thrown with a searchable
  message, not a bare TypeError (2026-09-02).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { stepsStyles } from './steps.stylex';
  import { STEPS_ITEM_KEY, type StepsItemApi } from './steps-item.svelte';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const item = getContext<StepsItemApi>(STEPS_ITEM_KEY);
  // the family contract is named, not a bare TypeError (the
  // toggle-group-item precedent)
  if (!item) {
    throw new Error('jixoai steps: StepsTitle must live inside a StepsItem');
  }
</script>

<span
  data-jx-step-title=""
  class={cn(
    cx(
      stepsStyles.title,
      item.state === 'current' ? stepsStyles.titleCurrent : stepsStyles.titleRest,
    ),
    className,
  )}
  {...rest}
>
  {@render children()}
</span>
