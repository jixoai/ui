<!-- icon-set blueprint: the generated artifact — the inline-core
     glyph wall (every name answers getIcon() synchronously; SSR
     paints, hydration matches) plus the chunk-law annotation the
     generator emits. -->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import { ICON_NAMES } from '$lib/icon-set.gen';

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
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    icon-set.gen · {ICON_NAMES.length} names · 1 inline chunk · 0 lazy — plugin-free by construction
  </div>
  <div class="grid max-w-[30rem] grid-cols-11 items-center gap-x-2 gap-y-3">
    {#each wall as name (name)}
      <Icon {name} size={14} class="text-muted-foreground" />
    {/each}
  </div>
  <div class="font-mono text-[10px] text-muted-foreground">
    getIcon() sync · loadIcon() cached · preloadIcons() ahead-of-mount
  </div>
</div>
