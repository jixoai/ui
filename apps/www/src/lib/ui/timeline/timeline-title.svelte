<!--
  jixoai TimelineTitle (registry/files/ui/timeline/timeline-title.svelte,
  composition-first-apis, 2026-08-25).
  The headline of an entry: terminal micro-label typography. Its COLOR
  is attribute paint — timeline.css paints it foreground and mutes it
  when the owning item carries data-jx-tl-pending — so the part stays
  stateless.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { timelineStyles } from './timeline.stylex';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<p data-jx-tl-title="" class={cn(cx(timelineStyles.title), className)} {...rest}>
  {@render children()}
</p>
