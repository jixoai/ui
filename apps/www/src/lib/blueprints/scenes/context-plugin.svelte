<!-- context-plugin blueprint: the def economy — defs are identity
     objects, a plugin targets one BY REFERENCE, and its hooks wrap
     the raw value as an onion (before outer→inner, after inner→
     outer) exposed as a read-only projection; the medium def is
     read-only — a plugin targeting it is rejected at the type level. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  const defs = [
    { name: 'DENSITY_DEF', note: 'Density | undefined', readOnly: false },
    { name: 'HUE_DEF', note: 'number', readOnly: false },
    { name: 'MEDIUM_DEF', note: 'read-only', readOnly: true },
  ];
  const onion = [
    { hook: 'before', note: 'outer → inner' },
    { hook: 'raw', note: 'never written back' },
    { hook: 'after', note: 'inner → outer' },
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

<div class={cx(bpA.contextPluginStage)}>
  <div class={cx(bpA.contextPluginEyebrow)}>
    definePlugin · targets bind defs by identity (not by string)
  </div>
  <Stack align="center" justify="center" gap="10">
    <Stack direction="column" gap="8">
      {#each defs as d (d.name)}
        <div
          class={cx(bpA.contextPluginDefCard, d.readOnly ? bpA.contextPluginDefReadOnly : bpA.contextPluginDefMutable)}
        >
          <span class={cx(bpA.contextPluginName)}>{d.name}</span>
          <span class={cx(bpA.contextPluginNote)}>{d.note}</span>
          {#if d.readOnly}
            <span class={cx(bpA.contextPluginNote)}>targets type-rejected</span>
          {/if}
        </div>
      {/each}
    </Stack>
    <div class={cx(bpA.contextPluginArrowColumn)}>
      <span>targets</span>
      <span class={cx(bpA.contextPluginArrowGlyph)}>→</span>
      <span>identity</span>
    </div>
    <Stack direction="column" gap="8">
      <div class={cx(bpA.contextPluginCard)}>
        <span class={cx(bpA.contextPluginName)}>printDensityPlugin</span>
        <span class={cx(bpA.contextPluginNote)}>targets: [DENSITY_DEF]</span>
      </div>
      {#each onion as o (o.hook)}
        <div class={cx(bpA.contextPluginHookRow)}>
          <span class={cx(bpA.contextPluginName)}>{o.hook}</span>
          <span class={cx(bpA.contextPluginNote)}>{o.note}</span>
        </div>
      {/each}
    </Stack>
    <div class={cx(bpA.contextPluginFlowArrow)}>→</div>
    <div class={cx(bpA.contextPluginCard)}>
      <span class={cx(bpA.contextPluginName)}>exposed</span>
      <span class={cx(bpA.contextPluginNote)}>the projection</span>
    </div>
  </Stack>
</div>
