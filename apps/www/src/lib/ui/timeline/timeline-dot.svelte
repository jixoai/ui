<!--
  jixoai TimelineDot (registry/files/ui/timeline/timeline-dot.svelte,
  composition-first-apis, 2026-08-25).
  The entry marker: a 10px primary square, absolutely pinned into the
  item's leading rail. The FILL is attribute paint — timeline.css fills
  it primary and hollows it when the owning item carries
  data-jx-tl-pending — so this part stays stateless (geometry and
  border are static token utilities).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
</script>

<span
  data-jx-tl-dot=""
  class={cn('absolute left-0 [top:var(--jx-stack)] [width:var(--jx-icon)] [height:var(--jx-icon)] box-border border border-primary', className)}
  {...rest}
  aria-hidden="true"
></span>
