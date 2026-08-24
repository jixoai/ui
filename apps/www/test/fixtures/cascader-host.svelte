<!--
  Test host for the cascader contract: named bridge, bindable path.
-->
<script lang="ts">
  import Cascader from '../../src/lib/ui/cascader/cascader.svelte';

  let { name = 'region' }: { name?: string } = $props();
  let value = $state<string[]>([]);
</script>

<Cascader
  {name}
  label="region"
  bind:value
  options={[
    {
      value: 'asia',
      label: 'Asia',
      children: [
        { value: 'japan', label: 'Japan' },
        { value: 'korea', label: 'Korea' },
      ],
    },
    {
      value: 'eu',
      label: 'Europe',
      children: [
        { value: 'no', label: 'Norway', disabled: true },
        { value: 'fr', label: 'France' },
      ],
    },
  ]}
/>
