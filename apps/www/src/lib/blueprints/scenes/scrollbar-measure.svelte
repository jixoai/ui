<!-- scrollbar-measure blueprint: the shadow-DOM probe. Left: the invisible
     measurement chamber (offscreen probes under thin/auto); right: the CSS
     variables it publishes on :root. Composed as representative HTML — the
     probe itself is display-none chrome with no box of its own. -->
<script lang="ts">
  const widths = [
    { key: '--jx-scrollbar-thin', value: '11px', note: 'macOS classic · thin' },
    { key: '--jx-scrollbar-auto', value: '15px', note: 'default-width lane' },
    { key: 'overlay systems', value: '0px', note: 'nothing reserved — compensation degrades to authored padding' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the measurement chamber -->
  <div class="border-border relative h-[236px] w-[300px] flex-none border">
    <span
      class="font-nav text-muted-foreground absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.2em]"
      >jx-scrollbar-measure · shadow dom</span
    >
    <div class="mt-6 flex gap-3 px-3">
      <div class="border-border relative h-[150px] w-[120px] border bg-muted/30">
        <span class="font-nav text-muted-foreground absolute bottom-1 left-1 text-[9px]">thin</span>
        <div class="bg-primary absolute bottom-1 right-0.5 top-1 w-[9px] opacity-80"></div>
        <div class="border-border/60 absolute inset-y-1 left-1 right-3 border-t border-b"></div>
      </div>
      <div class="border-border relative h-[150px] w-[120px] border bg-muted/30">
        <span class="font-nav text-muted-foreground absolute bottom-1 left-1 text-[9px]">auto</span>
        <div class="bg-foreground/70 absolute bottom-1 right-0.5 top-1 w-[13px]"></div>
        <div class="border-border/60 absolute inset-y-1 left-1 right-3.5 border-t border-b"></div>
      </div>
    </div>
    <span class="text-primary font-nav absolute bottom-2 right-2 text-[9px]"
      >offsetWidth − clientWidth</span
    >
  </div>

  <!-- the published variables -->
  <div class="flex w-[330px] flex-none flex-col gap-3">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >:root inline style · one-shot, then removed</span
    >
    {#each widths as row (row.key)}
      <div class="border-border flex items-baseline justify-between border px-3 py-2.5">
        <code class="text-foreground text-[12px]">{row.key}</code>
        <code class="text-primary text-[12px]">{row.value}</code>
      </div>
      <span class="text-muted-foreground -mt-2 pl-1 text-[9.5px]">{row.note}</span>
    {/each}
  </div>
</div>
