<!-- skeleton blueprint: the loading placeholder in a page-shaped layout. -->
<script lang="ts">
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col gap-4 p-10">
  <Skeleton class="h-6 w-2/5"></Skeleton>
  <Skeleton class="h-3 w-4/5"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
  <div class="mt-2 flex gap-4">
    <Skeleton class="h-24 w-1/2"></Skeleton>
    <Skeleton class="h-24 w-1/2"></Skeleton>
  </div>
  <Skeleton class="h-9 w-32"></Skeleton>
</div>
