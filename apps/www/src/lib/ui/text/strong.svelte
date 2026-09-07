<!--
  jixoai text · Strong (registry/files/ui/text/strong.svelte) — thin
  sugar over <Text mark="strong"> (the learning-cost ruling): one
  vocabulary, two ergonomic forms, zero behavioral difference — same
  element, same data-jx-text hook, same class-merge order (consumer
  LAST). The 600 weight settle lives in the base's form map.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import type { TextStyleProps } from '$lib/text-style.svelte';
  import Text from './text.svelte';

  // TextStyleProps (typing-only): the six modifier props ride the
  // shared kernel inside <Text> — the rest spread was already honest
  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> & TextStyleProps = $props();
</script>

<Text mark="strong" class={className} {...rest}>{@render children?.()}</Text>
