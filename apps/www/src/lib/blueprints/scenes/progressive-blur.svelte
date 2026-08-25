<!-- progressive-blur blueprint: the docs-rail composition — a scrolling
     list whose top edge diffuses. Satori paints no backdrop-filter, so
     the band is simulated as stacked translucent runs (the ladder
     schematic: lighter inner edge → denser at the scrollport edge) with
     the real component present for structure. -->
<script lang="ts">
  const rows = [
    'accordion', 'alert', 'anchor', 'avatar', 'badge', 'card-grid',
    'carousel', 'checkbox', 'combobox', 'command', 'dialog', 'popover',
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <div class="flex w-[300px] flex-none flex-col gap-2">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >the docs rail · same-layer sticky</span
    >
    <div class="border-border relative h-[210px] overflow-hidden border">
      <div class="flex flex-col px-3 pt-6">
        {#each rows as row, i (row)}
          <div
            class={`text-muted-foreground font-mono py-[5px] text-[10.5px] ${i === 0 || i === 1 ? 'opacity-40' : 'opacity-80'}`}
          >
            {row}
          </div>
        {/each}
      </div>
      <!-- the ladder schematic: translucent runs stacking toward the edge -->
      <div class="absolute inset-x-0 top-0 h-[70px]">
        <div class="from-background/95 absolute inset-x-0 top-0 h-[58px] bg-gradient-to-b to-transparent"></div>
        <div class="from-background/80 absolute inset-x-0 top-0 h-[46px] bg-gradient-to-b to-transparent"></div>
        <div class="from-background/60 absolute inset-x-0 top-0 h-[34px] bg-gradient-to-b to-transparent"></div>
        <div class="from-background/40 absolute inset-x-0 top-0 h-[22px] bg-gradient-to-b to-transparent"></div>
      </div>
      <span class="text-primary font-nav absolute bottom-2 left-2.5 text-[9px]"
        >0.5 → 64px · reveal on scroll</span
      >
    </div>
  </div>
</div>
