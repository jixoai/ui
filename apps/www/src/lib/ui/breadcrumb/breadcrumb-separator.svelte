<!--
  jixoai BreadcrumbSeparator (registry/files/ui/breadcrumb/breadcrumb-separator.svelte,
  2026-08-25).
  The chevron between trail steps — pure decoration (aria-hidden by
  construction). The glyph itself is a pseudo-element build in
  breadcrumb.css (D1-exempt residue: a rotated border square cannot be
  expressed as utilities), keyed on this part's data hook.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { resolveDensity, getDensityContext } from '$lib/density.svelte';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(undefined, getDensityContext()));
</script>

<span data-jx-breadcrumb-separator="" data-density={resolvedDensity} class={cn(className)} {...rest} aria-hidden="true"></span>
