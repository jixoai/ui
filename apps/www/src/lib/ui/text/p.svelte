<!--
  jixoai text · P (registry/files/ui/text/p.svelte) — thin sugar over
  <Text> (mark omitted → the frozen own 'p'; the learning-cost
  ruling): one vocabulary, two ergonomic forms, zero behavioral
  difference — same element, same data-jx-text hook, same class-merge
  order (consumer LAST).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text class={className} {...rest}>{@render children?.()}</Text>
