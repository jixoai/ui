<!--
  jixoai BreadcrumbSeparator (registry/files/ui/breadcrumb/breadcrumb-separator.svelte,
  2026-08-25).
  The chevron between trail steps — pure decoration (aria-hidden by
  construction). The glyph itself is a pseudo-element build in
  breadcrumb.css (D1-exempt residue: a rotated border square cannot be
  expressed as utilities), keyed on this part's data hook.
-->
<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<span data-jx-breadcrumb-separator="" class={cn(className)} aria-hidden="true"></span>
