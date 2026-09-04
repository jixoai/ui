<!-- scroll-run blueprint: the ONE scrollable-region system as its most
     minimal consumer — a hand-rolled strip on the raw contract (the
     same host/run/chrome anatomy tabs and button-group ride). Satori
     paints no scroll: the strip is captured mid-travel with the
     verdict STAMPED (start-closed — the left chip gated off, the right
     chip painted over its frosted veil), the members' edge factors
     hinted as opacity+blur schematic runs toward the open edge. -->
<script lang="ts">
  const members = [
    'anchor', 'avatar', 'badge', 'card-grid', 'carousel', 'checkbox',
    'combobox', 'command', 'dialog', 'popover', 'select', 'table',
  ];
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-10">
  <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
    >the run IS the scroller · verdict start-closed</span
  >
  <!-- the host: one grid cell stacking run + veil + chips -->
  <div class="border-border grid w-[460px] grid-cols-[minmax(0,1fr)] border">
    <!-- the run mid-travel (overflow clamped for the static stage) -->
    <div class="flex gap-2 px-3 py-3" data-jx-scroll-run="" data-axis="horizontal">
      {#each members as member, i (member)}
        <div
          class={`border-border/60 bg-muted/30 flex-none border px-2.5 py-1.5 font-mono text-[10.5px] ${
            i < 2 ? 'opacity-40' : i < 4 ? 'opacity-70' : 'opacity-95'
          } ${i === 3 ? 'text-primary' : 'text-muted-foreground'}`}
        >
          {member}
        </div>
      {/each}
    </div>
    <!-- the veil schematic: translucent runs ramping toward the open edge -->
    <div class="pointer-events-none z-[1] col-start-1 row-start-1 h-[52px] self-center justify-self-end">
      <div class="from-background/95 absolute inset-y-0 right-0 w-[16px] bg-gradient-to-l to-transparent"></div>
      <div class="from-background/80 absolute inset-y-0 right-0 w-[12px] bg-gradient-to-l to-transparent"></div>
      <div class="from-background/60 absolute inset-y-0 right-0 w-[8px] bg-gradient-to-l to-transparent"></div>
      <div class="from-background/40 absolute inset-y-0 right-0 w-[4px] bg-gradient-to-l to-transparent"></div>
    </div>
    <!-- the open direction's frosted chip (a real button in the DOM) -->
    <div
      class="border-border/60 bg-background/80 z-[2] col-start-1 row-start-1 my-auto mr-[-8px] flex h-[26px] w-[26px] flex-none items-center justify-center border shadow-[1px_1px_2px_rgba(0,0,0,0.2)]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-foreground"><path d="m9 18 6-6-6-6" /></svg>
    </div>
  </div>
  <span class="text-primary font-nav text-[9px]"
    >--jx-edge-* consumed squared · chips gated by data-jx-scroll-state</span
  >
</div>
