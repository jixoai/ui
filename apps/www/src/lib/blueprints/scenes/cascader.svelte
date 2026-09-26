<!-- cascader blueprint: a complete three-level chain — registry / files /
     ui — every select in the row carrying its committed pick. -->
<script lang="ts">
  import Cascader from '$lib/ui/cascader/cascader.svelte';
  import Stack from '$lib/ui/stack';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const options = [
    {
      value: 'registry',
      label: 'registry',
      children: [
        {
          value: 'files',
          label: 'files',
          children: [
            { value: 'ui', label: 'ui' },
            { value: 'lib', label: 'lib' },
          ],
        },
        { value: 'themes', label: 'themes' },
      ],
    },
  ];

  let path = $state(['registry', 'files', 'ui']);

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

<Stack align="center" justify="center" class={cx(bpA.cascaderStage)}>
  <Cascader label="path" bind:value={path} {options} />
</Stack>
