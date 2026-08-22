<!-- press-button blueprint: the three variants in one row. -->
<script lang="ts">
  import PressButton from '$lib/ui/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10">
  <div class="flex flex-wrap items-center gap-4">
    <PressButton variant="primary">Deploy</PressButton>
    <PressButton variant="outline">Cancel</PressButton>
    <PressButton variant="copied">Copied</PressButton>
  </div>
  <div class="flex flex-col gap-3">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
</div>
