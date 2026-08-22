<!-- toggle-group blueprint: the joined-button set — single mode with one
     pressed, multiple mode with two pressed. -->
<script lang="ts">
  import ToggleGroup from '$lib/ui/toggle-group.svelte';

  const alignOptions = [
    { value: 'left', label: 'left' },
    { value: 'center', label: 'center' },
    { value: 'right', label: 'right' },
  ];
  const styleOptions = [
    { value: 'bold', label: 'bold' },
    { value: 'italic', label: 'italic' },
    { value: 'mono', label: 'mono' },
    { value: 'underline', label: 'underline' },
  ];

  let align = $state('center');
  let style = $state<string[]>(['bold', 'mono']);
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-6 p-10">
  <div class="flex flex-col gap-2">
    <ToggleGroup label="alignment" type="single" options={alignOptions} bind:value={align} />
    <ToggleGroup label="text style" type="multiple" options={styleOptions} bind:value={style} />
  </div>
</div>
