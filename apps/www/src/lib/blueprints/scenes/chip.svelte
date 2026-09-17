<!-- chip blueprint: the ladder as compact activations — the four
     rungs on the control-scale hit lane (fill/tonal/outline/ghost),
     the hue-injection recipes, and the shape axis with the slot
     lanes. Ink is an ATTACHMENT now (effect-attachments, r4): the
     bevel ripple rides the component tag onto the stamped root. -->
<script lang="ts">
  import Chip from '$lib/ui/chip/chip.svelte';
  import { ripple } from '$lib/ui/press-button/press-button.svelte';
  import { pressEffect } from '$lib/ui/press-button';
  import Icon from '$lib/ui/icon';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.chipStage)}>
  <div class={cx(bpA.chipRow)}>
    <Chip>tonal</Chip>
    <Chip variant="fill">fill</Chip>
    <Chip variant="outline">outline</Chip>
    <Chip variant="ghost">ghost</Chip>
  </div>
  <div class={cx(bpA.chipRow)}>
    <Chip class="jx-hue-neutral">filter: all</Chip>
    <Chip class="jx-hue-success">deployed</Chip>
    <Chip class="jx-hue-error">failed</Chip>
  </div>
  <div class={cx(bpA.chipRow)}>
    <Chip shape="pill" onclick={() => {}}>pill</Chip>
    <Chip shape="pill" {@attach pressEffect(ripple({ shape: 'bevel' }))} onclick={() => {}}>
      {#snippet slotStart()}<Icon name="check" />{/snippet}
      bevel ink
    </Chip>
  </div>
</div>
