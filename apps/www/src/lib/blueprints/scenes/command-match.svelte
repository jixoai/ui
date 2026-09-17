<!-- command-match blueprint: the frozen predicate — pure inclusion,
     never reorder; authored tree order is the walk order. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const rows = [
    { label: 'Dialog', visible: true },
    { label: 'Command Palette', visible: true },
    { label: 'z-order helper', visible: false },
    { label: 'Popover', visible: true },
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

<div class={cx(bpA.commandMatchStage)}>
  <div class={cx(bpA.commandMatchEyebrow)}>
    match(item, query) → boolean · visible/hidden only
  </div>
  {#each rows as r (r.label)}
    <div
      class={cx(bpA.commandMatchRow, r.visible ? bpA.commandMatchVisible : bpA.commandMatchHidden)}
    >
      <span class={cx(bpA.commandMatchLabel)}>{r.label}</span>
    </div>
  {/each}
</div>
