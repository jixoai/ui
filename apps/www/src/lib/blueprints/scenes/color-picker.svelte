<!-- color-picker blueprint: the brand hue committed — the SV pad + full
     spectrum bar forced open over the trigger ({@attach fromAction(forceShowPopovers)}),
     swatch and mono readout on the closed control. -->
<script lang="ts">
  import ColorPicker from '$lib/ui/color-picker/color-picker.svelte';
  import { fromAction } from 'svelte/attachments';
  import { forceShowPopovers } from '$lib/blueprints/force-show';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  let brand = $state('#007924');

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

<div class={cx(bpA.colorPickerStage)} {@attach fromAction(forceShowPopovers)}>
  <div class={cx(bpA.colorPickerFrame)}>
    <ColorPicker id="bp-color" label="brand" bind:value={brand} />
  </div>
</div>
