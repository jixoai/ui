<!-- icon blueprint: the named-glyph renderer — the type-safe name
     law (a typo is a compile error) and the per-instance override
     axes (size / strokeWidth) replacing the old [&_svg]:* wrapper
     hacks. -->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  const sizes = [12, 16, 24, 32] as const;
  const strokes = [1.5, 2, 2.5] as const;

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

<div class={cx(bpA.iconStage)}>
  <div class={cx(bpA.iconEyebrow)}>
    &lt;Icon name&gt; · size / strokeWidth — per-instance, no wrapper classes
  </div>
  <div class={cx(bpA.iconSizeRow)}>
    {#each sizes as s (s)}
      <div class={cx(bpA.iconCell)}>
        <Icon name="search" size={s} />
        <span class={cx(bpA.iconCellLabel)}>{s}</span>
      </div>
    {/each}
  </div>
  <div class={cx(bpA.iconStrokeRow)}>
    {#each strokes as sw (sw)}
      <div class={cx(bpA.iconCell)}>
        <Icon name="check" size={20} strokeWidth={sw} />
        <span class={cx(bpA.iconCellLabel)}>sw {sw}</span>
      </div>
    {/each}
  </div>
  <div class={cx(bpA.iconNameRow)}>
    <Icon name="folderOpen" size={14} />
    <Icon name="chevronRight" size={14} />
    <Icon name="fileCode" size={14} />
    <Icon name="braces" size={14} />
    <span class={cx(bpA.iconNameRowLabel)}>name: IconName — typo ⇒ compile error</span>
  </div>
</div>
