<!--
  jixoai text · Ins (registry/files/ui/text/ins.svelte) — thin sugar
  over <Text mark="ins"> (the learning-cost ruling): one vocabulary,
  two ergonomic forms, zero behavioral difference — same element,
  same data-jx-text hook, same class-merge order (consumer LAST).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import Text from './text.svelte';

  let { children, class: className = '', ...rest }: HTMLAttributes<HTMLElement> = $props();
</script>

<Text mark="ins" class={className} {...rest}>{@render children?.()}</Text>
