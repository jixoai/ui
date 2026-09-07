<!--
  jixoai text · Sup (registry/files/ui/text/sup.svelte) — thin sugar
  over <Text mark="sup"> (the learning-cost ruling): one vocabulary,
  two ergonomic forms, zero behavioral difference — same element,
  same data-jx-text hook, same class-merge order (consumer LAST).
  The UA baseline shift is the law — no utilities.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text mark="sup" class={className} {...rest}>{@render children?.()}</Text>
