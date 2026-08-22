<!-- toast blueprint: the corner viewport with two live toasts pushed
     on mount (the real store → real viewport path). -->
<script lang="ts">
  import ToastViewport from '$lib/ui/toast-viewport.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import { createToastStore } from '$lib/toast-store';
  import { onMount } from 'svelte';

  const toast = createToastStore();

  onMount(() => {
    toast.api.push({ title: 'Deployed', description: 'ui.jixoai.com is live' });
    toast.api.push({ title: 'Registry synced', description: '77 items published' });
  });
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-4 w-2/3"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-3/5"></Skeleton>
  </div>
</div>

<ToastViewport store={toast} />
