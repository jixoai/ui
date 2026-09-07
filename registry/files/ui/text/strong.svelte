<!--
  jixoai text · Strong (registry/files/ui/text/strong.svelte) — thin
  sugar over <Text mark="strong"> (the learning-cost ruling): one
  vocabulary, two ergonomic forms, zero behavioral difference — same
  element, same data-jx-text hook, same class-merge order (consumer
  LAST). The 600 weight settle lives in the base's form map.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text mark="strong" class={className} {...rest}>{@render children?.()}</Text>
