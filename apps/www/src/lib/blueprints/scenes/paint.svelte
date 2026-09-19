<!-- paint blueprint: the axis ladder — zone value domains with link
     fenced to PressButton's explicit prop.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     zone/plain frame pose rides a ternary in the cx slot.) -->
<script lang="ts">
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

  const tiers = [
    { name: 'fill', zone: true },
    { name: 'tonal', zone: true },
    { name: 'outline', zone: true },
    { name: 'ghost', zone: true },
    { name: 'link', zone: false },
  ];
</script>

<Stack direction="column" justify="center" gap="10" class={cx(bpB.paintStage)}>
  <div class={cx(bpB.paintKey)}>
    PAINT_ZONE_KEY · newVariant ?? legacyVariant ?? own
  </div>
  {#each tiers as t (t.name)}
    <div class={cx(bpB.paintRow, t.zone ? bpB.paintRowZone : bpB.paintRowPlain)}>
      <span class={cx(bpB.paintName)}>{t.name}</span>
      <span class={cx(bpB.paintNote)}>{t.zone ? 'zone-able' : 'explicit-prop only'}</span>
    </div>
  {/each}
</Stack>
