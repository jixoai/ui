<!-- icon-set blueprint: the generated artifact — the inline-core
     glyph wall (every name answers getIcon() synchronously; SSR
     paints, hydration matches) plus the chunk-law annotation the
     generator emits. -->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import { ICON_NAMES } from '$lib/icon-set.gen';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

  // a curated wall, not all 38 — the stage is 640×360
  const wall: typeof ICON_NAMES[number][] = [
    'arrowRight',
    'calendar',
    'check',
    'chevronDown',
    'clock',
    'copy',
    'eye',
    'file',
    'folder',
    'image',
    'languages',
    'link',
    'mail',
    'monitor',
    'moon',
    'palette',
    'phone',
    'rotateCcw',
    'search',
    'sun',
    'upload',
    'x',
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

<Stack direction="column" justify="center" gap="16" class={cx(bpA.iconSetStage)}>
  <div class={cx(bpA.iconSetEyebrow)}>
    icon-set.gen · {ICON_NAMES.length} names · 1 inline chunk · 0 lazy — plugin-free by construction
  </div>
  <div class={cx(bpA.iconSetWall)}>
    {#each wall as name (name)}
      <Icon {name} size={14} class={cx(bpA.iconSetGlyph)} />
    {/each}
  </div>
  <div class={cx(bpA.iconSetFoot)}>
    getIcon() sync · loadIcon() cached · preloadIcons() ahead-of-mount
  </div>
</Stack>
