<!-- toc-engine blueprint: the framework-free geometry engine as a
     diagram — ONE rAF snapshot reads live rects and derives IoM weights
     (intersection area / min(block, viewport)) plus the line pick (the
     margin-resolves-downward law). Left: the viewport frame over the
     tracked data-region blocks with the line drawn in; right: the rule
     rail any consumer can derive from the engine's update. -->
<script lang="ts">
  const rows: { label: string; weight: string; picked: boolean }[] = [
    { label: '#above', weight: '0.00', picked: false },
    { label: '#straddling', weight: '0.42', picked: true },
    { label: '#below', weight: '0.00', picked: false },
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the tracked document and the line -->
  <div class="border-primary/70 relative h-[236px] w-[264px] flex-none border-2 border-dashed">
    <span class="bg-primary text-primary-foreground font-nav absolute left-0 top-0 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]"
      >viewport</span
    >
    <!-- the line -->
    <div class="border-primary absolute inset-x-0 top-8 border-t-2"></div>
    <span class="text-primary font-nav absolute right-1 top-[38px] text-[9px]">← the line</span>
    <!-- block above the fold -->
    <div class="border-border absolute inset-x-3 top-[52px] h-[44px] border bg-muted/40 pt-1 pl-2">
      <span class="font-nav text-muted-foreground text-[9px]">#above · weight 0</span>
    </div>
    <!-- straddling block: intersection shading -->
    <div class="border-border absolute inset-x-3 top-[96px] bottom-[72px] border bg-muted/70 pt-1 pl-2">
      <span class="font-nav text-[10px]">#straddling · IoM 0.42</span>
      <p class="text-muted-foreground mt-2 px-2 text-[10px] leading-4">
        intersection area ÷ min(block, viewport) — saturates to 1 in both directions; the line in
        a margin resolves DOWNWARD to this block.
      </p>
    </div>
    <!-- block below the fold -->
    <div class="border-border absolute inset-x-3 bottom-2 h-[48px] border bg-muted/40 pt-1 pl-2">
      <span class="font-nav text-muted-foreground text-[9px]">#below · weight 0</span>
    </div>
  </div>

  <!-- the derived rail -->
  <div class="flex w-[168px] flex-none flex-col gap-4">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >the derived rail</span
    >
    {#each rows as row (row.label)}
      <div class="flex items-center gap-2.5">
        <span
          class="h-2.5 w-2.5 flex-none border-2"
          class:border-primary={row.picked}
          class:bg-primary={row.picked}
          class:border-border={!row.picked}
          class:bg-transparent={!row.picked}
        ></span>
        <span
          class="font-nav text-[11px]"
          class:text-primary={row.picked}
          class:font-bold={row.picked}
          class:text-muted-foreground={!row.picked}
        >
          {row.label}
        </span>
        <span class="font-nav text-muted-foreground ml-auto text-[9px]">{row.weight}</span>
      </div>
      {#if row.picked}
        <span class="text-primary font-nav text-[9px] uppercase tracking-[0.14em]">↑ line pick</span>
      {/if}
    {/each}
  </div>
</div>
