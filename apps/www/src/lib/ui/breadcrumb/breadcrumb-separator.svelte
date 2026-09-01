<!--
  jixoai BreadcrumbSeparator (registry/files/ui/breadcrumb/breadcrumb-separator.svelte,
  2026-08-25 → separator-review 2026-09-01).
  The chevron between trail steps — pure decoration (aria-hidden by
  construction). The DEFAULT glyph is a pseudo-element build in
  breadcrumb.css (D1-exempt residue: a rotated border square cannot be
  expressed as utilities), keyed on data-glyph="chevron". A `children`
  snippet REPLACES the glyph outright (a slash, an arrow, any mark —
  shadcn's children-prop law, snippet form): the part then carries
  data-glyph="custom" and the pseudo build stands down.
  (props-discipline sweep, 2026-08-25)
  (separator-review 2026-09-01): the css import lives HERE — the part
  that owns the hook owns its stylesheet (alert-dialog/tabs law); the
  file had gone unimported, which rendered every separator invisible.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { resolveDensity, getDensityContext } from '$lib/density.svelte';
  import './breadcrumb.css';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    /** glyph override: replaces the chevron build (aria-hidden stays) */
    children?: Snippet;
    class?: string;
  }

  let { children, class: className = '', ...rest }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(undefined, getDensityContext()));
</script>

<span
  data-jx-breadcrumb-separator=""
  data-glyph={children ? 'custom' : 'chevron'}
  data-density={resolvedDensity}
  class={cn(className)}
  {...rest}
  aria-hidden="true"
>{@render children?.()}</span>
