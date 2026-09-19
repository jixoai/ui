<!-- anchor blueprint: the fragment-link rail beside the very headings it
     tracks — real ids, real links; the shared scroll-spy paints the
     active pick (first heading at this scroll position). -->
<script lang="ts">
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import AnchorItem from '$lib/ui/anchor/anchor-item.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.anchorStage)}>
  <Stack direction="column" gap="12" class={cx(bpA.anchorColumn)}>
    <h2 id="bp-anchor-what" class={cx(bpA.anchorHeading)}>what it does</h2>
    <p class={cx(bpA.anchorBody)}>
      nav of real fragment links — native navigation, native smooth scrolling, no second pick
      algorithm.
    </p>
    <h2 id="bp-anchor-pick" class={cx(bpA.anchorHeading, bpA.anchorHeadingGap)}>the line pick</h2>
    <p class={cx(bpA.anchorBody)}>
      the active link follows the one shared scroll-spy: which section owns the pick line.
    </p>
    <h2 id="bp-anchor-lease" class={cx(bpA.anchorHeading, bpA.anchorHeadingGap)}>the lease</h2>
    <p class={cx(bpA.anchorBody)}>
      scroll-margin-top is set on demand and restored — consumer markup is never permanently
      mutated.
    </p>
  </Stack>
  <aside class={cx(bpA.anchorAside)}>
    <Anchor label="on this page" offset={8}>
      <AnchorItem href="#bp-anchor-what">what it does</AnchorItem>
      <AnchorItem href="#bp-anchor-pick">the line pick</AnchorItem>
      <AnchorItem href="#bp-anchor-lease">the lease</AnchorItem>
    </Anchor>
  </aside>
</div>
