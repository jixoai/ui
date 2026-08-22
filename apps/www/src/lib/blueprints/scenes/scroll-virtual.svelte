<!-- scroll-virtual blueprint: the window. Left: the full list as a faded
     column (100k rows exist in data); the visible window + overscan bands
     are the only DOM. Right: the wiring facts — spacer = count × estimate,
     rows absolute-positioned, measureElement automatic. Strong TanStack
     association, thin coupling. -->
<script lang="ts">
  const rendered = ['row 41,996', 'row 41,997', 'row 41,998', 'row 41,999', 'row 42,000'];
  const facts = [
    ['window', 'visible + overscan only'],
    ['spacer', 'count × estimateSize'],
    ['rows', 'absolute · translateY(start)'],
    ['measure', 'item.measureElement — ours'],
    ['escape', 'getVirtualizer() → TanStack'],
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the window over the full list -->
  <div class="border-border relative h-[236px] w-[248px] flex-none border">
    <span class="font-nav text-muted-foreground absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.2em]"
      >100,000 rows · one window in the dom</span
    >
    <div class="mt-6 flex flex-col gap-[3px] px-4 opacity-40">
      {#each Array(12) as _, i (i)}
        <div class="border-border/40 h-[10px] w-full border"></div>
      {/each}
    </div>
    <div class="border-primary absolute inset-x-2 top-[88px] h-[92px] border-2 bg-background">
      <div class="flex h-full flex-col justify-center gap-[3px] px-2">
        {#each rendered as row (row)}
          <div class="bg-muted/60 text-foreground px-2 py-[3px] text-[9.5px]">{row}</div>
        {/each}
      </div>
    </div>
    <span class="text-primary font-nav absolute right-1.5 top-[76px] text-[9px]">overscan ↑</span>
    <span class="text-primary font-nav absolute bottom-1.5 right-1.5 text-[9px]">overscan ↓</span>
  </div>

  <!-- the wiring facts -->
  <div class="flex w-[300px] flex-none flex-col gap-2.5">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >@tanstack/svelte-virtual · dom wiring only</span
    >
    {#each facts as [key, value] (key)}
      <div class="border-border flex items-baseline justify-between border px-3 py-2">
        <code class="text-foreground text-[11px]">{key}</code>
        <span class="text-muted-foreground text-[10px]">{value}</span>
      </div>
    {/each}
  </div>
</div>
