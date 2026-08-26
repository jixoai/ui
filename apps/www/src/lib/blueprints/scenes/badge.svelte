<!-- badge blueprint: the four tones as a status row. -->
<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-4 p-10">
  <div class="flex flex-wrap items-center gap-3">
    <Badge density="lg">default</Badge>
    <Badge tone="primary">primary</Badge>
    <Badge tone="outline">outline</Badge>
    <Badge tone="destructive">destructive</Badge>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Badge>v0.1.0</Badge>
    <Badge tone="primary">passing</Badge>
    <Badge tone="destructive">failing</Badge>
    <Badge tone="outline">draft</Badge>
  </div>
</div>
