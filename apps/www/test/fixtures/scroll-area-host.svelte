<!--
  Test host for the scroll-area family specs: real children snippet, props
  passthrough, and the instance surface exposed through the host's own
  exports (rendered.component.getArea()). Reworked 2026-09-15: the
  scrollbar variant prop retired with the dual-mode era.
-->
<script lang="ts">
  import ScrollArea from '$lib/ui/scroll-area/scroll-area.svelte';
  import type { ViewportScrollEvent } from '$lib/ui/scroll-area/scroll-area.svelte';

  let {
    orientation = 'vertical',
    label = 'test area',
    pad,
    onscroll,
  }: {
    orientation?: 'vertical' | 'horizontal' | 'both';
    label?: string;
    pad?: string;
    onscroll?: (event: ViewportScrollEvent) => void;
  } = $props();

  let area = $state<{
    getViewport(): HTMLDivElement | null;
    scrollTo(options?: ScrollToOptions): void;
  } | null>(null);

  export function getArea(): typeof area {
    return area;
  }
</script>

<ScrollArea bind:this={area} {orientation} {label} {pad} {onscroll} data-testid="passthrough">
  <p data-content>content</p>
</ScrollArea>
