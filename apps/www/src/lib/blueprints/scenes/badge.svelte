<!-- badge blueprint: the variant grammar as a status row — the
     prominence ladder (fill/tonal/outline) over the global tokens,
     then the hue-injection recipes for neutral/success/error statuses,
     plus the shape and slotStart axes. -->
<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-4 p-10">
  <div class="flex flex-wrap items-center gap-3">
    <Badge density="lg">tonal</Badge>
    <Badge variant="fill">fill</Badge>
    <Badge variant="outline">outline</Badge>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Badge>v0.1.0</Badge>
    <Badge class="[--jx-tonal:var(--muted-foreground)]">draft</Badge>
    <Badge class="[--jx-tonal:var(--success)]">passing</Badge>
    <Badge class="[--jx-tonal:var(--error)]">failing</Badge>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Badge shape="pill">pill shape</Badge>
    <Badge shape="pill" class="[--jx-tonal:var(--success)]">
      {#snippet slotStart()}{@html icons.check}{/snippet}
      checks passing
    </Badge>
  </div>
</div>
