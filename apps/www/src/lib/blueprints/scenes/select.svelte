<!-- select blueprint: the rich listbox forced open ({@attach fromAction(forceShowPopovers)})
     — the committed row carries the primary edge line, the trigger shows
     the commit, one row stays disabled.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Select, { type SelectOption } from '$lib/ui/select/select.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

  const options: SelectOption[] = [
    { value: 'node', label: 'node', description: 'node-pty backend — ConPTY on windows, forkpty elsewhere' },
    { value: 'bun', label: 'bun', description: 'Bun.Terminal — linux/macos since 1.3.13' },
    { value: 'deno', label: 'deno', description: '@sigma/pty-ffi — FFI over rust portable-pty' },
    { value: 'wasi', label: 'wasi — coming soon', description: 'reserved route, not implemented yet', disabled: true },
  ];

  let runtime = $state('node');
</script>

<Stack direction="column" justify="center" class={cx(bpB.selectStage)} } {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpB.selectCard)}>
    <Select id="bp-select" label="runtime" placeholder="pick a runtime…" bind:value={runtime} {options} />
  </div>
</Stack>
