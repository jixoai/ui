<!--
  jixoai ItemChevron — the decorative trailing glyph inside ItemEnd.
  The shared inline chevronRight geometry ($lib/icons, icon law); NO
  policy, NO inheritance — links show a chevron exactly when the
  author writes this leaf (Owner ruling 2026-08-25).
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';

  let { class: className = '' }: { class?: string } = $props();
</script>

<span data-slot="item-chevron" aria-hidden="true" class={cn(className)}>{@html icons.chevronRight}</span>
