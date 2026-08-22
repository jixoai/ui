<!-- toc-outline blueprint: the metadata export. Left: the content tree —
     plain h2/h3 headings, nothing else. Right: what derives from it — the
     outline (sections + children), extents (heading → next heading), and
     ids stamped back so ToC links are real fragments. -->
<script lang="ts">
  const outline: { id: string; label: string; level: number }[] = [
    { id: 'install', label: 'Install', level: 2 },
    { id: 'wiring', label: 'wiring', level: 3 },
    { id: 'theming', label: 'theming', level: 3 },
    { id: 'deploy', label: 'Deploy', level: 2 },
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the content root -->
  <div class="border-border relative h-[236px] w-[248px] flex-none border">
    <span class="font-nav text-muted-foreground absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.2em]"
      >content root · plain headings</span
    >
    <div class="mt-7 flex flex-col gap-2 px-4">
      <span class="text-foreground text-[15px] font-semibold">Install</span>
      <div class="border-border/50 ml-2 flex flex-col gap-1.5 border-l pl-3">
        <span class="text-foreground/80 text-[11.5px]">wiring</span>
        <span class="text-foreground/80 text-[11.5px]">theming</span>
      </div>
      <span class="text-foreground mt-1 text-[15px] font-semibold">Deploy</span>
    </div>
    <div class="border-primary absolute bottom-6 left-1 top-[58px] w-[3px] opacity-70"></div>
    <span class="text-primary font-nav absolute bottom-2 left-3 text-[9px]">extent = h2 → next h2</span>
  </div>

  <!-- the derived outline -->
  <div class="flex w-[300px] flex-none flex-col gap-2.5">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >derived · zero handwritten ids</span
    >
    {#each outline as entry (entry.id)}
      <div class={`border-border flex items-baseline gap-2 border px-3 py-2 ${entry.level === 3 ? 'ml-6 bg-muted/30' : ''}`}>
        <code class="text-primary text-[11px]">#{entry.id}</code>
        <span class="text-foreground text-[11.5px]">{entry.label}</span>
        <span class="text-muted-foreground ml-auto text-[9px]">h{entry.level}</span>
      </div>
    {/each}
    <span class="text-muted-foreground pl-1 text-[9.5px]"
      >toc-engine eats extents directly — no data-region markup</span
    >
  </div>
</div>
