<!-- scroll-area blueprint: the two scrollbar variants side by side. Left:
     native — the theme law (thin themed bar over a transparent track,
     both-edges gutter, symmetric compensated inset). Right: overlay — the
     custom virtual scrollbar (square theme-token thumb floating over
     full-width content, fine pointers only). -->
<script lang="ts">
  const rows = ['layout shell', 'release notes', 'terminal log', 'data table', 'command palette'];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- native variant -->
  <div class="flex w-[300px] flex-none flex-col gap-2">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >scrollbar="native" · the theme law</span
    >
    <div class="border-border relative h-[210px] border">
      <div class="flex h-full flex-col px-3.5 py-2">
        {#each rows as row, i (row)}
          <div
            class={`border-border/40 bg-muted/40 mb-1.5 border px-2 py-2.5 text-[10.5px] ${i === 2 ? 'opacity-100' : 'opacity-80'}`}
          >
            {row}
          </div>
        {/each}
      </div>
      <!-- the thin themed bar + the mirrored empty gutter -->
      <div class="bg-primary absolute bottom-1 right-0.5 top-1 w-[9px] opacity-80"></div>
      <div class="border-border/50 absolute bottom-1 left-0.5 top-1 w-[9px] border"></div>
      <span class="text-primary font-nav absolute bottom-2 left-2.5 text-[9px]"
        >both-edges gutter · pad compensated</span
      >
    </div>
  </div>

  <!-- overlay variant -->
  <div class="flex w-[300px] flex-none flex-col gap-2">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >scrollbar="overlay" · the virtual bar</span
    >
    <div class="border-border relative h-[210px] border">
      <div class="flex h-full flex-col px-2 py-2">
        {#each rows as row, i (row)}
          <div
            class={`border-border/40 bg-muted/40 mb-1.5 border px-2 py-2.5 text-[10.5px] ${i === 2 ? 'opacity-100' : 'opacity-60'}`}
          >
            {row}
          </div>
        {/each}
      </div>
      <!-- the floating square thumb — full-width content beneath -->
      <div class="bg-primary absolute right-1 top-[52px] h-[64px] w-[9px]"></div>
      <span class="text-primary font-nav absolute bottom-2 left-2.5 text-[9px]"
        >(pointer: fine) only · touch keeps native</span
      >
    </div>
  </div>
</div>
