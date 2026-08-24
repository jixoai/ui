<!-- combobox blueprint: the searchable select forced open — the input
     carries the committed display, the panel shows the filtered rows
     with the selected edge line (use:forceShowPopovers). -->
<script lang="ts">
  import Combobox, { type ComboboxOption } from '$lib/ui/combobox/combobox.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

  const options: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty addon' },
    { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos 1.3.13+, windows 1.3.14' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
  ];

  let backend = $state('node-pty');
</script>

<div class="flex h-full w-full flex-col justify-center p-10" use:forceShowPopovers>
  <div class="w-full max-w-[420px]">
    <Combobox id="bp-combobox" label="backend" bind:value={backend} {options} />
  </div>
</div>
