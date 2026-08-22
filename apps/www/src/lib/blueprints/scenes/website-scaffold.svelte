<!-- website-scaffold blueprint: the layered overlay shell as a labeled
     layer diagram — the absolute top layer (header band + float slot)
     riding as ONE unit above the body's own scroll plane, with the
     measured padding reservation called out. The real shell owns the
     whole viewport scroll plane, so a nested live instance cannot fit
     the stage; the diagram documents the architecture instead (same
     approach as the component's own docs page). -->
<script lang="ts">
  import Skeleton from '$lib/ui/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <div class="border-border bg-background border">
    <!-- .jx-shell -->
    <div class="flex flex-col p-3">
      <div class="flex items-center justify-between">
        <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.2em]"
          >.jx-shell · min-h-svh · relative</span
        >
        <span class="text-primary font-nav text-[9px] uppercase tracking-[0.2em]"
          >.jx-top-layer — one moving unit · z-40</span
        >
      </div>
      <!-- top layer: dashed overlay plane -->
      <div class="border-primary/60 mt-2 border border-dashed p-2">
        <div class="border-border bg-muted/60 flex items-center justify-between border px-3 py-2">
          <span class="font-nav text-[10px]">.jx-scaffold-header — the nav band</span>
          <span class="text-primary font-nav text-[9px]">view-transition-name: site-header</span>
        </div>
        <div class="mt-2 px-2 py-1.5">
          <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.18em]"
            >.jx-float-slot — portal insertion point (scaffold-float)</span
          >
        </div>
      </div>
      <!-- body: the scroll plane -->
      <div class="border-border mt-2 border">
        <div class="border-border border-b px-3 py-2">
          <span class="font-nav text-[10px]"
            >main#main <span class="text-muted-foreground">— padding-top = measured header height</span></span
          >
          <div class="mt-2 flex flex-col gap-2 p-2 pl-4">
            <Skeleton class="h-3 w-4/5"></Skeleton>
            <Skeleton class="h-3 w-3/5"></Skeleton>
          </div>
        </div>
        <div class="bg-muted/40 px-3 py-2">
          <span class="font-nav text-muted-foreground text-[10px]">footer — optional band</span>
        </div>
      </div>
      <span class="font-nav text-muted-foreground mt-2 text-[9px] uppercase tracking-[0.18em]"
        >.jx-shell-body — THE scroll container · scroll ↓ slides the top layer out, ↑ returns it</span
      >
    </div>
  </div>
</div>
