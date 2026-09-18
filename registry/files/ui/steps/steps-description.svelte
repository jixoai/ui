<!--
  jixoai StepsDescription (registry/files/ui/steps/steps-description.svelte,
  composition-first-apis, 2026-08-25).
  The muted helper line under a StepsTitle — a dumb part: state-free,
  children are the copy.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { stepsStyles } from './steps.stylex';

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
</script>

<span
  data-jx-step-description=""
  class={cn(cx(stepsStyles.description), className)}
  {...rest}
>
  {@render children()}
</span>
