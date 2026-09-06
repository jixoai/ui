<!-- icon blueprint: the named-glyph renderer — the type-safe name
     law (a typo is a compile error) and the per-instance override
     axes (size / strokeWidth) replacing the old [&_svg]:* wrapper
     hacks. -->
<script lang="ts">
  import Icon from '$lib/ui/icon';

  const sizes = [12, 16, 24, 32] as const;
  const strokes = [1.5, 2, 2.5] as const;
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    &lt;Icon name&gt; · size / strokeWidth — per-instance, no wrapper classes
  </div>
  <div class="flex items-end gap-4">
    {#each sizes as s (s)}
      <div class="flex flex-col items-center gap-2">
        <Icon name="search" size={s} />
        <span class="font-mono text-[10px] text-muted-foreground">{s}</span>
      </div>
    {/each}
  </div>
  <div class="flex items-center gap-4">
    {#each strokes as sw (sw)}
      <div class="flex flex-col items-center gap-2">
        <Icon name="check" size={20} strokeWidth={sw} />
        <span class="font-mono text-[10px] text-muted-foreground">sw {sw}</span>
      </div>
    {/each}
  </div>
  <div class="flex items-center gap-3 text-muted-foreground">
    <Icon name="folderOpen" size={14} />
    <Icon name="chevronRight" size={14} />
    <Icon name="fileCode" size={14} />
    <Icon name="braces" size={14} />
    <span class="font-mono text-[10px]">name: IconName — typo ⇒ compile error</span>
  </div>
</div>
