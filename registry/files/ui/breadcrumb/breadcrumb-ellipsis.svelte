<!--
  jixoai BreadcrumbEllipsis (registry/files/ui/breadcrumb/breadcrumb-ellipsis.svelte,
  2026-08-25).
  A MANUAL gap glyph — the author's own "pages were omitted here"
  decoration (aria-hidden; screen readers hear the nav label and the
  links, not the gaps). For the live fold (ellipsis that links to the
  first hidden page) use BreadcrumbCollapse instead.
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

<span
  data-jx-breadcrumb-ellipsis=""
  data-density={resolvedDensity}
  class={cn('text-muted-foreground tracking-normal select-none', className)}
  {...rest}
  aria-hidden="true"
>…</span>
