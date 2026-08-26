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

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<p data-jx-tl-title="" class={cn('m-0 font-nav [font-size:var(--jx-text)] [line-height:var(--jx-line)] tracking-[0.08em] uppercase', className)} {...rest}>
  {@render children()}
</p>
