<!-- color-picker blueprint: the brand hue committed — the SV pad + full
     spectrum bar forced open over the trigger ({@attach fromAction(forceShowPopovers)}),
     swatch and mono readout on the closed control. -->
<script lang="ts">
  import ColorPicker from '$lib/ui/color-picker/color-picker.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';

  let brand = $state('#007924');
</script>

<div class="flex h-full w-full flex-col justify-center p-10" {@attach fromAction(forceShowPopovers)}>
  <div class="w-full max-w-[300px]">
    <ColorPicker id="bp-color" label="brand" bind:value={brand} />
  </div>
</div>
