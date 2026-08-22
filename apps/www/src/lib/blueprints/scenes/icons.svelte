<!-- icons blueprint: the actual glyphs from $lib/icons — one shared
     geometry per symbol (16px square, stroke currentColor, round caps),
     printed through {@html} exactly as consumers print them. -->
<script lang="ts">
  import { icons } from '$lib/icons';

  const entries: { name: string; svg: string }[] = [
    { name: 'arrow-right', svg: icons.arrowRight },
    { name: 'chevron-down', svg: icons.chevronDown },
    { name: 'x', svg: icons.x },
    { name: 'external', svg: icons.externalLink },
    { name: 'check', svg: icons.check },
  ];
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-6 p-10">
  <div class="flex gap-4">
    {#each entries as entry (entry.name)}
      <div class="border-border flex w-[88px] flex-col items-center gap-3 border px-2 py-4">
        <span class="text-foreground inline-flex">{@html entry.svg}</span>
        <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.14em]"
          >{entry.name}</span
        >
      </div>
    {/each}
  </div>
  <p class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.18em]">
    icons.ts — one geometry per glyph · aria-hidden · sized by the consumer
  </p>
</div>
