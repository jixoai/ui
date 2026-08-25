<!--
  jixoai BreadcrumbEllipsis (registry/files/ui/breadcrumb/breadcrumb-ellipsis.svelte,
  2026-08-25).
  A MANUAL gap glyph — the author's own "pages were omitted here"
  decoration (aria-hidden; screen readers hear the nav label and the
  links, not the gaps). For the live fold (ellipsis that links to the
  first hidden page) use BreadcrumbCollapse instead.
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<span
  data-jx-breadcrumb-ellipsis=""
  class={cn('text-muted-foreground tracking-normal select-none', className)}
  aria-hidden="true"
>…</span>
