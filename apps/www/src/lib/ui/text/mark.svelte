<!--
  jixoai text · Mark (registry/files/ui/text/mark.svelte) — thin
  sugar over <Text mark="mark"> (the learning-cost ruling): one
  vocabulary, two ergonomic forms, zero behavioral difference — same
  element, same data-jx-text hook, same class-merge order (consumer
  LAST). The highlight ground + padding box live in the base's form
  map (the recorded override).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text mark="mark" class={className} {...rest}>{@render children?.()}</Text>
