<!--
  jixoai PaginationEllipsis (registry/files/ui/pagination/pagination-ellipsis.svelte,
  2026-08-25).
  The collapsed-pages glyph, rendered wherever pageRange() yields an
  'ellipsis-start' | 'ellipsis-end' token — aria-hidden decoration:
  screen readers hear the nav label, the numbered links and
  aria-current, not the gaps.
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
</script>

<span
  data-jx-page-gap=""
  class={cn('inline-flex items-center px-[var(--jx-inset)] text-muted-foreground select-none', className)}
  {...rest}
  aria-hidden="true"
>…</span>
