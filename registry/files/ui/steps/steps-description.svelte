<!--
  jixoai StepsDescription (registry/files/ui/steps/steps-description.svelte,
  composition-first-apis, 2026-08-25).
  The muted helper line under a StepsTitle — a dumb part: state-free,
  children are the copy.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<span
  data-jx-step-description=""
  class={cn('[font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] text-muted-foreground opacity-80', className)}
  {...rest}
>
  {@render children()}
</span>
