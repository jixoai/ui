<!-- toast blueprint: the corner viewport with two live toasts pushed
     on mount (the real store → real viewport path).
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import ToastViewport from '$lib/ui/toast/toast-viewport.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { createToastStore } from '$lib/toast-store';
  import { onMount } from 'svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  const toast = createToastStore();

  onMount(() => {
    toast.api.push({ title: 'Deployed', description: 'ui.jixoai.com is live' });
    toast.api.push({ title: 'Registry synced', description: '77 items published' });
  });
</script>

<Stack direction="column" justify="center" gap="16" class={cx(bpB.toastStage)}>
  <div class={cx(bpB.toastSkel)}>
    <Skeleton class={cx(bpB.toastSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.toastSkelB)}></Skeleton>
    <Skeleton class={cx(bpB.toastSkelC)}></Skeleton>
  </div>
</Stack>

<ToastViewport store={toast} />
