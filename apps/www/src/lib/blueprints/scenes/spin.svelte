<!-- spin blueprint: the bracket cursor, alone and in the container posture. -->
<script lang="ts">
  import Spin from '$lib/ui/spin.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <Spin label="loading checks" />
  <Spin label="building" class="border border-border">
    <div class="text-muted-foreground p-6 text-sm">building apps/www…</div>
  </Spin>
</div>
