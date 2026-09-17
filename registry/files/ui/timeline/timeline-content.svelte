<!--
  jixoai TimelineContent (registry/files/ui/timeline/timeline-content.svelte,
  composition-first-apis, 2026-08-25).
  The text column of an entry: Time, Title and whatever body the
  consumer authors as free children — a dumb layout part.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { timelineStyles } from './timeline.stylex';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
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

<div data-jx-tl-content="" class={cn(cx(timelineStyles.content), className)} {...rest}>
  {@render children()}
</div>
