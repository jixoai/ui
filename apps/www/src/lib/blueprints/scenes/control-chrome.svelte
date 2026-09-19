<!-- control-chrome blueprint: the frame/bare axis — one control,
     two chrome resolutions, the provider key between them. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const axis = [
    { row: 'frame', note: 'the default — border + surface, a control reads as an object' },
    { row: 'bare', note: 'embedded in chrome — paint dissolves, the slot carries the affordance' },
  ];

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

<Stack direction="column" justify="center" gap="16" class={cx(bpA.controlChromeStage)}>
  <div class={cx(bpA.controlChromeEyebrow)}>
    CONTROL_CHROME_KEY · explicit ?? ambient ?? 'frame'
  </div>
  {#each axis as a (a.row)}
    <div
      class={cx(bpA.controlChromeRow, a.row === 'frame' ? bpA.controlChromeFrame : bpA.controlChromeBare)}
    >
      <span class={cx(bpA.controlChromeName)}>{a.row}</span>
      <span class={cx(bpA.controlChromeNote)}>{a.note}</span>
    </div>
  {/each}
  <div class={cx(bpA.controlChromeFoot)}>providers: item-field / item-group · readers: the control families</div>
</Stack>
