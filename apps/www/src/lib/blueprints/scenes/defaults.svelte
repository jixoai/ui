<!-- defaults blueprint: the slot resolution ladder — explicit beats
     ambient beats own, one Defaults object per family. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const ladder = [
    { row: 'explicit', note: 'variant="fill"' },
    { row: 'ambient', note: 'zone → ghost' },
    { row: 'own', note: "definePaintSlot(values, 'outline')" },
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

<div class={cx(bpA.defaultsStage)}>
  <div class={cx(bpA.defaultsEyebrow)}>
    DefaultsSlot · resolve({ '{'} variant {'}' }) → one line per family
  </div>
  {#each ladder as l (l.row)}
    <div class={cx(bpA.defaultsRow)}>
      <span class={cx(bpA.defaultsName)}>{l.row}</span>
      <span class={cx(bpA.defaultsNote)}>{l.note}</span>
    </div>
  {/each}
</div>
