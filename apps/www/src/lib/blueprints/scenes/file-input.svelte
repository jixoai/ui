<!-- file-input blueprint: the redesigned picker — dashed drop zone
     (upload glyph + CLICK OR DRAG FILES) with the ant-style row list
     below: kind-glyph thumbs, ellipsized names, formatted sizes,
     per-row remove. Two real Files bound; non-image kinds keep the
     serialization free of object URLs. -->
<script lang="ts">
  import FileInput from '$lib/ui/file-input/file-input.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  let files = $state<File[]>([
    new File(['export function press() {}'], 'press-button.svelte', { type: 'text/plain' }),
    new File(['%PDF-1.7 registry snapshot'], 'registry.pdf', { type: 'application/pdf' }),
  ]);

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

<div class={cx(bpA.fileInputStage)}>
  <div class={cx(bpA.fileInputFrame)}>
    <FileInput id="bp-file" label="evidence" multiple bind:files={files} />
  </div>
</div>
