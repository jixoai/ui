<!-- website-scaffold blueprint: the grid shell as a labeled diagram —
     the named container host, the one grid whose columns both layers
     subgrid, and the per-zone immersive law (navigation chrome leaves,
     the reading state compacts). The real shell owns the whole viewport
     scroll plane, so a nested live instance cannot fit the stage; the
     diagram documents the architecture instead (same approach as the
     component's own docs page). Grid era: Owner + Codex review,
     2026-08-23. -->
<script lang="ts">
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="border-border bg-background border">
    <!-- .jx-shell-host: the named container -->
    <div class="flex items-center justify-between p-3 pb-2">
      <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.2em]"
        >.jx-shell-host · container: jx-shell · 100dvh · overflow clip</span
      >
      <span class="text-primary font-nav text-[9px] uppercase tracking-[0.2em]"
        >forms: ≥1200 rail+content+toc · 900–1199 +toc · &lt;900 tocbar row</span
      >
    </div>

    <!-- the one grid: two layers, same columns -->
    <div class="border-border border p-2">
      <div class="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] gap-1.5">
        <!-- chrome plane -->
        <div class="border-primary/60 col-span-2 border border-dashed p-2">
          <div class="flex items-center justify-between">
            <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
              >.jx-top-layer — column-subgrid · rows [header][tocbar][stage] · z-40 · pointer-events: none→auto</span
            >
            <span class="text-primary font-nav text-[9px]">site-header vt-name</span>
          </div>
          <div class="bg-muted/60 mt-1.5 border px-3 py-1.5">
            <span class="font-nav text-[10px]"
              >.jx-scaffold-header — the nav band · scroll ↓ translateY(-101%) ↑ back</span
            >
          </div>
          <div class="mt-1.5 grid grid-cols-subgrid">
            <div class="px-2 py-1">
              <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
                >[data-area='tree'] — the catalog rail (wide)</span
              >
            </div>
            <div class="px-2 py-1 text-right">
              <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
                >[data-area='toc'] — never leaves · compacts by --jx-header-h</span
              >
            </div>
          </div>
        </div>
        <!-- scroll plane -->
        <div class="border-border border">
          <div class="border-border border-b px-3 py-1.5">
            <span class="font-nav text-[10px]"
              >main#main <span class="text-muted-foreground">— column-subgrid · [content] column</span></span
            >
            <div class="mt-1.5 flex flex-col gap-1.5 p-2 pl-4">
              <Skeleton class="h-3 w-4/5"></Skeleton>
              <Skeleton class="h-3 w-3/5"></Skeleton>
            </div>
          </div>
          <div class="bg-muted/40 px-3 py-1.5">
            <span class="font-nav text-muted-foreground text-[10px]">footer — in the content flow</span>
          </div>
        </div>
        <div class="border-border flex items-center border px-2">
          <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
            >[toc] 15rem — shared column, both layers subgrid it</span
          >
        </div>
      </div>
    </div>
    <div class="p-3 pt-2">
      <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
        >.jx-shell-body — THE scroll container · column-subgrid only · padding = --jx-header-h (+tocbar) · scroll-padding = --jx-toc-line</span
      >
    </div>
  </div>
</div>
