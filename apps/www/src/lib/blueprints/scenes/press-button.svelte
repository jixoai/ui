<!-- press-button blueprint: the variant row + one effect loop. -->
<script lang="ts">
  import PressButton, { rainbow, shimmer } from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-6 p-10">
  <div class="flex flex-wrap items-center gap-4">
    <PressButton variant="primary" effect={shimmer()}>Deploy</PressButton>
    <PressButton variant="secondary">Invite</PressButton>
    <PressButton variant="outline" effect={rainbow()}>Cancel</PressButton>
    <PressButton variant="ghost">Dismiss</PressButton>
    <PressButton variant="destructive">Delete</PressButton>
  </div>
  <div class="flex flex-col gap-3">
    <Skeleton class="h-3 w-3/4"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
  </div>
</div>
