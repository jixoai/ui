<!--
  jixoai StepsDescription (registry/files/ui/steps/steps-description.svelte,
  composition-first-apis, 2026-08-25).
  The muted helper line under a StepsTitle — a dumb part: state-free,
  children are the copy.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children }: Props = $props();
</script>

<span
  data-jx-step-description=""
  class={cn('text-xs leading-[1.45] text-muted-foreground opacity-80', className)}
>
  {@render children()}
</span>
