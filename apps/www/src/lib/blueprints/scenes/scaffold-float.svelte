<!-- scaffold-float blueprint: the portal adoption diagram — float content
     is CREATED at the consumer's authoring position (full Svelte
     ownership) and ADOPTED into the scaffold's top layer, so it rides
     the immersive slide with the header by construction. The real portal
     needs the WebsiteScaffold context to exist around it, which the
    fixed stage cannot host honestly — the diagram shows the mechanism. -->
<script lang="ts">
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-5 p-10">
  <div class="flex w-full items-stretch gap-4">
    <!-- authoring position: where the consumer writes it -->
    <div class="border-border flex flex-1 flex-col gap-2 border border-dashed p-3">
      <span class="font-nav text-muted-foreground text-[9px] uppercase tracking-[0.2em]"
        >consumer DOM · authoring position</span
      >
      <div class="border-border bg-muted/50 mt-1 flex items-center gap-2 border px-2 py-1.5 opacity-70">
        <span class="bg-primary h-2 w-2 flex-none"></span>
        <span class="font-nav text-[10px]">float content — created here, owned by Svelte</span>
      </div>
      <span class="font-nav text-muted-foreground text-[9px]">.jx-float-anchor — hidden, keeps the slot</span>
    </div>

    <div class="text-muted-foreground flex items-center" aria-hidden="true">
      {@html icons.arrowRight}
    </div>

    <!-- adoption target: the top layer -->
    <div class="border-primary/60 flex flex-1 flex-col border p-3">
      <span class="text-primary font-nav text-[9px] uppercase tracking-[0.2em]"
        >.jx-top-layer · adoption target</span
      >
      <div class="border-border bg-muted/60 mt-2 border px-2 py-1.5">
        <span class="font-nav text-muted-foreground text-[10px]">.jx-scaffold-header</span>
      </div>
      <div class="border-primary mt-2 border px-2 py-2">
        <div class="bg-primary text-primary-foreground font-nav inline-flex items-center gap-2 px-2 py-1 text-[10px]">
          <span class="h-1.5 w-1.5 flex-none border border-current"></span>
          adopted node — rides the immersive slide
        </div>
      </div>
    </div>
  </div>
  <p class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.18em]">
    scaffold-float — live DOM adoption, teardown returns the nodes
  </p>
</div>
