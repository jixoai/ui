<!-- scroll-area blueprint: the family after the 2026-09-15 rework — one
     hand-drawn law + a platform sibling on the shared kit. Left: the
     styled component — ALWAYS hand-drawn (capsule thumb, full radius,
     the scrollbar-token law's currentColor family; idle-fades with the
     four auto-hide pins). Right: the native-scroll-area sibling — zero
     drawn chrome, the platform bar under the same token law with the
     packaged capability styles (stable gutter, scoped color-scheme). -->
<script lang="ts">
  const rows = ['layout shell', 'release notes', 'terminal log', 'data table', 'command palette'];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the hand-drawn law (scroll-area) -->
  <div class="flex w-[300px] flex-none flex-col gap-2">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >scroll-area · hand-drawn, always</span
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
      <!-- the capsule thumb — full radius over full-width content -->
      <div class="bg-primary absolute right-1 top-[46px] h-[64px] w-[9px] rounded-full opacity-80"></div>
      <span class="text-primary font-nav absolute bottom-2 left-2.5 text-[9px]"
        >capsule · idle fade · the four pins</span
      >
    </div>
  </div>

  <!-- the platform sibling (native-scroll-area) -->
  <div class="flex w-[300px] flex-none flex-col gap-2">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >native-scroll-area · the platform bar</span
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
      <!-- the platform bar + the mirrored reserved gutter -->
      <div class="bg-primary absolute bottom-1 right-0.5 top-1 w-[9px] opacity-80"></div>
      <div class="border-border/50 absolute bottom-1 left-0.5 top-1 w-[9px] border"></div>
      <span class="text-primary font-nav absolute bottom-2 left-2.5 text-[9px]"
        >stable gutter · scoped scheme · no drawn chrome</span
      >
    </div>
  </div>
</div>
