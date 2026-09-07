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
  import type { TextStyleProps } from '$lib/text-style.svelte';
  import Text from './text.svelte';

  // TextStyleProps (typing-only): the six modifier props ride the
  // shared kernel inside <Text> — the rest spread was already honest
  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> & TextStyleProps = $props();
</script>

<Text mark="mark" class={className} {...rest}>{@render children?.()}</Text>
