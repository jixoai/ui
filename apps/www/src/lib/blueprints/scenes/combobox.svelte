<!-- combobox blueprint: the searchable select forced open — the input
     carries the committed display, the panel shows the filtered rows
     with the selected edge line ({@attach fromAction(forceShowPopovers)}). -->
<script lang="ts">
  import Combobox, { type ComboboxOption } from '$lib/ui/combobox/combobox.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const options: ComboboxOption[] = [
    { value: 'node-pty', label: 'node-pty', description: 'conpty / forkpty addon' },
    { value: 'bun-terminal', label: 'Bun.Terminal', description: 'linux/macos 1.3.13+, windows 1.3.14' },
    { value: '@sigma/pty-ffi', label: '@sigma/pty-ffi', description: 'deno FFI over rust portable-pty' },
  ];

  let backend = $state('node-pty');

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

<Stack direction="column" justify="center" class={cx(bpA.comboboxStage)} } {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpA.comboboxFrame)}>
    <Combobox id="bp-combobox" label="backend" bind:value={backend} {options} />
  </div>
</Stack>
