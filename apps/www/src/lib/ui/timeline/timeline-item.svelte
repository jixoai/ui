<!--
  jixoai TimelineItem (registry/files/ui/timeline/timeline-item.svelte;
  grid-engine rebuild, 2026-09-01).
  The li half: a SUBGRID row (vertical) / column (horizontal) of the
  root's 5-lane grid. Its only state is the in-flight `pending` flag,
  painted as the data-jx-tl-pending ATTRIBUTE (attribute paint, not
  part logic: the Dot and Title parts stay stateless).

  THE LINE IS AUTHORED-FREE: every item auto-renders the default
  [data-jx-tl-line] — by grid essence it occupies the dot's two block
  neighbors plus the center, bridged into the next node. When the root
  carries a `line` snippet, the item renders THAT instead (keyed by the
  SSR-honest context index). Children compose the anatomy (Dot with its
  8 directional slots, Content, …).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import type { TimelineApi } from './timeline.svelte';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** in-flight entry: hollow dot + muted title (attribute paint) */
    pending?: boolean;
    class?: string;
    children: Snippet;
  }

  let { pending = false, class: className = '', children, ...rest }: Props = $props();

  const ctx = getContext<TimelineApi>('jx-timeline');
  // instantiation order is document order on the server AND the client —
  // the counter needs no lifecycle to stay honest
  const index = ctx?.nextIndex() ?? -1;
</script>

<li
  data-jx-tl-item=""
  data-jx-tl-pending={pending ? '' : undefined}
  class={cn('relative min-w-0', className)}
  {...rest}
>
  {#if ctx?.line}
    {@render ctx.line(index)}
  {:else}
    <span data-jx-tl-line="" aria-hidden="true"></span>
  {/if}
  {@render children()}
</li>
