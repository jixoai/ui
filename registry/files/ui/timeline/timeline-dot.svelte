<!--
  jixoai TimelineDot (registry/files/ui/timeline/timeline-dot.svelte,
  composition-first-apis, 2026-08-25).
  The entry marker: a 10px primary square, absolutely pinned into the
  item's leading rail. The FILL is attribute paint — timeline.css fills
  it primary and hollows it when the owning item carries
  data-jx-tl-pending — so this part stays stateless (geometry and
  border are static token utilities).
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<span
  data-jx-tl-dot=""
  aria-hidden="true"
  class={cn('absolute left-0 top-[0.3125rem] w-2.5 h-2.5 box-border border border-primary', className)}
></span>
