<!--
  Test host for the toggle-group contract: three options in single or
  multiple mode.
-->
<script lang="ts">
  import ToggleGroup from '../../src/lib/ui/toggle-group.svelte';

  let { multiple = false }: { multiple?: boolean } = $props();
</script>

<ToggleGroup
  name="style"
  label="text style"
  type={multiple ? 'multiple' : 'single'}
  options={[
    { value: 'bold', label: 'bold' },
    { value: 'italic', label: 'italic' },
    { value: 'underline', label: 'underline' },
  ]}
/>
