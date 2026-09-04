<!-- paint blueprint: the axis ladder — zone value domains with link
     fenced to PressButton's explicit prop. -->
<script lang="ts">
  const tiers = [
    { name: 'fill', zone: true },
    { name: 'tonal', zone: true },
    { name: 'outline', zone: true },
    { name: 'ghost', zone: true },
    { name: 'link', zone: false },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-2.5 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    PAINT_ZONE_KEY · newVariant ?? legacyVariant ?? own
  </div>
  {#each tiers as t (t.name)}
    <div class="flex max-w-[22rem] items-center justify-between rounded-md border px-4 py-2 {t.zone ? 'border-border bg-card' : 'border-dashed border-border bg-transparent'}">
      <span class="font-mono text-[13px]">{t.name}</span>
      <span class="text-[11px] text-muted-foreground">{t.zone ? 'zone-able' : 'explicit-prop only'}</span>
    </div>
  {/each}
</div>
