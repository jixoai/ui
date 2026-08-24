<!--
  jixoai skeleton (registry/files/ui/skeleton.svelte).
  The loading placeholder block: muted surface with a terminal-style
  brightness pulse. aria-hidden is set here — the real accessibility
  contract for loading regions belongs to the consumer (aria-busy on the
  container, or a visually-hidden "loading…" live region), never to each
  placeholder block.

  Pure CSS, zero JS. Shape is the consumer's geometry: the element is a
  bare block; width/height/aspect come from the class prop or the parent
  layout. The pulse respects prefers-reduced-motion (static muted block).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { class: className = '', ...rest }: Props = $props();
</script>

<!-- aria-hidden lands after the spread: a placeholder block is scenery
     by contract — restProps (data-*, id…) pass through untouched -->
<div class="jx-skeleton {className}" {...rest} aria-hidden="true"></div>

<style>
  .jx-skeleton {
    background: var(--muted);
    box-shadow: 0 0 0 1px var(--border) inset;
    animation: jx-skeleton-pulse 1.4s ease-in-out infinite;
  }

  @keyframes jx-skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-skeleton {
      animation: none;
    }
  }
</style>
