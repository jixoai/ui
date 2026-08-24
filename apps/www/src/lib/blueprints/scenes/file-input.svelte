<!-- file-input blueprint: the redesigned picker — dashed drop zone
     (upload glyph + CLICK OR DRAG FILES) with the ant-style row list
     below: kind-glyph thumbs, ellipsized names, formatted sizes,
     per-row remove. Two real Files bound; non-image kinds keep the
     serialization free of object URLs. -->
<script lang="ts">
  import FileInput from '$lib/ui/file-input/file-input.svelte';

  let files = $state<File[]>([
    new File(['export function press() {}'], 'press-button.svelte', { type: 'text/plain' }),
    new File(['%PDF-1.7 registry snapshot'], 'registry.pdf', { type: 'application/pdf' }),
  ]);
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="w-full max-w-[440px]">
    <FileInput id="bp-file" label="evidence" multiple bind:files={files} />
  </div>
</div>
