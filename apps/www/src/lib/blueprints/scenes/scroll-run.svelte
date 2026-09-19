<!-- scroll-run blueprint: the ONE scrollable-region system as its most
     minimal consumer — a hand-rolled strip on the raw contract (the
     same host/run/chrome anatomy tabs and button-group ride). Satori
     paints no scroll: the strip is captured mid-travel with the
     verdict STAMPED (start-closed — the left chip gated off, the right
     chip painted over its frosted veil), the members' edge factors
     hinted as opacity+blur schematic runs toward the open edge.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     opacity/ink ladders ride ternary atoms in the cx slot.) -->
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

  const members = [
    'anchor', 'avatar', 'badge', 'card-grid', 'carousel', 'checkbox',
    'combobox', 'command', 'dialog', 'popover', 'select', 'table',
  ];
</script>

<Stack direction="column" align="center" justify="center" gap="16" class={cx(bpB.scrollRunStage)}>
  <span class={cx(bpB.scrollRunLabel)}
    >the run IS the scroller · verdict start-closed</span
  >
  <!-- the host: one grid cell stacking run + veil + chips -->
  <div class={cx(bpB.scrollRunHost)}>
    <!-- the run mid-travel (overflow clamped for the static stage) -->
    <Stack gap="8" class={cx(bpB.scrollRunRun)} } data-jx-scroll-run="" data-axis="horizontal">
      {#each members as member, i (member)}
        <div
          class={cx(
            bpB.scrollRunChip,
            i < 2 ? bpB.scrollRunChipFar : i < 4 ? bpB.scrollRunChipMid : bpB.scrollRunChipNear,
            i === 3 ? bpB.scrollRunChipPrimary : bpB.scrollRunChipMuted,
          )}
        >
          {member}
        </div>
      {/each}
    </Stack>
    <!-- the veil schematic: translucent runs ramping toward the open edge -->
    <div class={cx(bpB.scrollRunVeil)}>
      <div class={cx(bpB.scrollRunVeilA)}></div>
      <div class={cx(bpB.scrollRunVeilB)}></div>
      <div class={cx(bpB.scrollRunVeilC)}></div>
      <div class={cx(bpB.scrollRunVeilD)}></div>
    </div>
    <!-- the open direction's frosted chip (a real button in the DOM) -->
    <Stack align="center" justify="center" class={cx(bpB.scrollRunChipBtn)} }>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={cx(bpB.scrollRunIcon)}><path d="m9 18 6-6-6-6" /></svg>
    </Stack>
  </div>
  <span class={cx(bpB.scrollRunCaption)}
    >--jx-edge-* consumed squared · chips gated by data-jx-scroll-state</span
  >
</Stack>
