<!--
  jixoai TimelineItem (registry/files/ui/timeline/timeline-item.svelte;
  W3 drawn-spine rework, Owner 2026-09-15; grid-engine rebuild 2026-09-01).
  The li half: a SUBGRID row (vertical) / column (horizontal) of the
  ol's 5-lane grid. Its only state is the in-flight `pending` flag,
  painted as the data-jx-tl-pending ATTRIBUTE (attribute paint, not
  part logic: the Dot and Title parts stay stateless).

  THE FLOOR LINE: every item auto-renders the default
  [data-jx-tl-line] — by grid essence it occupies the dot's two block
  neighbors plus the center, bridged into the next node. It is the
  NO-JS FLOOR (SSR and pre-hydration paint it; a degenerate box keeps
  it); once the root's measurement flips data-jx-spine to 'drawn',
  timeline.css retires it and the whole-list SVG spine owns the
  channel. The retired line(i) per-item seam is gone — the root's
  `spine` prop (presets or a geometry-payload snippet) is the only
  seam. Children compose the anatomy (Dot with its 8 directional
  slots, Content, …).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** in-flight entry: hollow dot + muted title (attribute paint) */
    pending?: boolean;
    class?: string;
    children: Snippet;
  }

  let { pending = false, class: className = '', children, ...rest }: Props = $props();
</script>

<li
  data-jx-tl-item=""
  data-jx-tl-pending={pending ? '' : undefined}
  class={cn('min-w-0', className)}
  {...rest}
>
  <span data-jx-tl-line="" aria-hidden="true"></span>
  {@render children()}
</li>
