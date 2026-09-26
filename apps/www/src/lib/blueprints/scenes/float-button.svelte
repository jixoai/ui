<!-- float-button blueprint: the plain idiom — a lone fixed corner action
     over muted page context. The serializer clamps position:fixed into
     the stage; the glyph is the shared arrowRight icon rotated upright. -->
<script lang="ts">
  import FloatButton from '$lib/ui/float-button/float-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import Icon from '$lib/ui/icon';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
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
</script>

<Stack direction="column" justify="center" gap="16" class={cx(bpA.floatButtonStage)}>
  <Skeleton class={cx(bpA.floatButtonSkeletonA)}></Skeleton>
  <Skeleton class={cx(bpA.floatButtonSkeletonB)}></Skeleton>
  <Skeleton class={cx(bpA.floatButtonSkeletonC)}></Skeleton>
</Stack>

<FloatButton label="back to top">
  <span class={cx(bpA.floatButtonGlyph)} aria-hidden="true"><Icon name="arrowRight" /></span>
</FloatButton>
