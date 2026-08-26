<!--
  jixoai TimelineItem (registry/files/ui/timeline/timeline-item.svelte,
  composition-first-apis, 2026-08-25).
  The li half of the timeline family: one timestamped entry. Its only
  state is the in-flight `pending` flag, painted as the
  data-jx-tl-pending ATTRIBUTE — the hollow dot and the muted title
  derive from it in timeline.css (attribute paint, not part logic: the
  Dot and Title parts stay stateless). Children compose the anatomy
  (Dot, Connector, Content…).
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
  class={cn('relative flex [gap:var(--jx-gap)] [padding-block-end:var(--jx-stack)] [padding-inline-start:var(--jx-inset)]', className)}
  {...rest}
>
  {@render children()}
</li>
