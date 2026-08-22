<!-- cascader blueprint: a complete three-level chain — registry / files /
     ui — every select in the row carrying its committed pick. -->
<script lang="ts">
  import Cascader from '$lib/ui/cascader.svelte';

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
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <Cascader label="path" bind:value={path} {options} />
</div>
