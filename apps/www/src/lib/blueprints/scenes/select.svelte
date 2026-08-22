<!-- select blueprint: the rich listbox forced open (use:forceShowPopovers)
     — the committed row carries the primary edge line, the trigger shows
     the commit, one row stays disabled. -->
<script lang="ts">
  import Select, { type SelectOption } from '$lib/ui/select.svelte';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

  const options: SelectOption[] = [
    { value: 'node', label: 'node', description: 'node-pty backend — ConPTY on windows, forkpty elsewhere' },
    { value: 'bun', label: 'bun', description: 'Bun.Terminal — linux/macos since 1.3.13' },
    { value: 'deno', label: 'deno', description: '@sigma/pty-ffi — FFI over rust portable-pty' },
    { value: 'wasi', label: 'wasi — coming soon', description: 'reserved route, not implemented yet', disabled: true },
  ];

  let runtime = $state('node');
</script>

<div class="flex h-full w-full flex-col justify-center p-10" use:forceShowPopovers>
  <div class="w-full max-w-[400px]">
    <Select id="bp-select" label="runtime" placeholder="pick a runtime…" bind:value={runtime} {options} />
  </div>
</div>
