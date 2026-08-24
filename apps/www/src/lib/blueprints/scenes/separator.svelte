<!-- separator blueprint: horizontal thematic break + vertical posture. -->
<script lang="ts">
  import Separator from '$lib/ui/separator/separator.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-5 p-10">
  <p class="text-sm">section one</p>
  <Separator />
  <div class="flex items-center gap-5">
    <span class="text-sm">left</span>
    <Separator orientation="vertical" class="h-8" />
    <span class="text-sm">right</span>
  </div>
</div>
