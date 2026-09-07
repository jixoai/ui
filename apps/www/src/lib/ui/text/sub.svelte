<!--
  jixoai text · Sub (registry/files/ui/text/sub.svelte) — thin sugar
  over <Text mark="sub"> (the learning-cost ruling): one vocabulary,
  two ergonomic forms, zero behavioral difference — same element,
  same data-jx-text hook, same class-merge order (consumer LAST).
  The UA baseline shift is the law — no utilities.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text mark="sub" class={className} {...rest}>{@render children?.()}</Text>
