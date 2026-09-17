<!-- heading blueprint: the em ladder — level sets the element and the
     size, the ambient scale flows by inheritance. -->
<script lang="ts">
  import Heading from '$lib/ui/heading/heading.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
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

<div class={cx(bpA.headingStage)}>
  <div class={cx(bpA.headingColumn)}>
    <Heading level={1}>The document title</Heading>
    <Heading level={2}>The section rung</Heading>
    <Heading level={3}>The subsection</Heading>
    <Heading level={4}>The minor label</Heading>
  </div>
  <div class={cx(bpA.headingRow)}>
    <Badge>em ladder · 1.875em → 1em</Badge>
    <Badge>level = the element</Badge>
    <Badge>zero own margins</Badge>
  </div>
</div>
