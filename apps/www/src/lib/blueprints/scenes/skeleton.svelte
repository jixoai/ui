<!-- skeleton blueprint: the loading placeholder in a page-shaped layout.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

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
</script>

<div class={cx(bpB.skeletonStage)}>
  <Skeleton class={cx(bpB.skeletonHead)}></Skeleton>
  <Skeleton class={cx(bpB.skeletonLineA)}></Skeleton>
  <Skeleton class={cx(bpB.skeletonLineB)}></Skeleton>
  <div class={cx(bpB.skeletonPair)}>
    <Skeleton class={cx(bpB.skeletonTile)}></Skeleton>
    <Skeleton class={cx(bpB.skeletonTile)}></Skeleton>
  </div>
  <Skeleton class={cx(bpB.skeletonTail)}></Skeleton>
</div>
