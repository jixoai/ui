<!--
  jixoai TimelineTime (registry/files/ui/timeline/timeline-time.svelte,
  composition-first-apis, 2026-08-25).
  The timestamp line: a muted mono label wrapping a machine-readable
  <time datetime> — pass the ISO 8601 instant, author the displayed
  text as children (formatting is yours).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { timelineStyles } from './timeline.stylex';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    /** machine-readable instant (ISO 8601) for <time datetime> */
    datetime?: string;
    class?: string;
    children: Snippet;
  }

  let { datetime, class: className = '', children, ...rest }: Props = $props();

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

<p data-jx-tl-time="" class={cn(cx(timelineStyles.time), className)} {...rest}>
  <time datetime={datetime || undefined}>{@render children()}</time>
</p>
