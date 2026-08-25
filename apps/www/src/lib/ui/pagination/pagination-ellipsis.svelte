<!--
  jixoai PaginationEllipsis (registry/files/ui/pagination/pagination-ellipsis.svelte,
  2026-08-25).
  The collapsed-pages glyph, rendered wherever pageRange() yields an
  'ellipsis-start' | 'ellipsis-end' token — aria-hidden decoration:
  screen readers hear the nav label, the numbered links and
  aria-current, not the gaps.
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<span
  data-jx-page-gap=""
  class={cn('inline-flex items-center px-1 text-muted-foreground select-none', className)}
  aria-hidden="true"
>…</span>
