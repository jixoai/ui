<!--
  jixoai text · Mark (registry/files/ui/text/mark.svelte) — thin
  sugar over <Text mark="mark"> (the learning-cost ruling): one
  vocabulary, two ergonomic forms, zero behavioral difference — same
  element, same data-jx-text hook, same class-merge order (consumer
  LAST). The highlight ground + padding box live in the base's form
  map (the recorded override).
-->
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import Text from './text.svelte';

  // the sugar's props ARE Text's props with `mark` fixed (W3-B: the
  // eight-axis surface widened the union past the old hand-written
  // HTMLAttributes & TextStyleProps intersection — ComponentProps is
  // the item-checkbox/item-toggle precedent, and the rest spread
  // stays honest against the real surface)
  let { children, class: className = '', ...rest }: Omit<ComponentProps<typeof Text>, 'mark'> = $props();
</script>

<Text mark="mark" class={className} {...rest}>{@render children?.()}</Text>
