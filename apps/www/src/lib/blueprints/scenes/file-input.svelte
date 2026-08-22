<!-- file-input blueprint: the list variant with two real Files bound —
     the "</>" code glyph and the pdf glyph, formatted sizes, remove
     affordances under the outline trigger. -->
<script lang="ts">
  import FileInput from '$lib/ui/file-input.svelte';

  // real File objects (same constructor args every run); non-image kinds
  // keep the serialization free of object URLs
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
