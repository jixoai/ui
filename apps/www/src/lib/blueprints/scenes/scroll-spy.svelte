<!-- scroll-spy blueprint: the ONE plain line-pick — a capture-phase
     scroll listener, the last target whose top sits at/past the offset
     line is the pick. Left: the targets with the line drawn in; right:
     the link list any consumer derives (the surface anchor.svelte
     renders). Composed as representative HTML: the engine itself is
     DOM-read-only logic with no box of its own. -->
<script lang="ts">
  const targets: { id: string; holds: boolean }[] = [
    { id: 'install', holds: false },
    { id: 'tokens', holds: true },
    { id: 'deploy', holds: false },
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <!-- the tracked targets and the line -->
  <div class="border-border relative h-[236px] w-[248px] flex-none border">
    <span class="font-nav text-muted-foreground absolute left-2 top-1.5 text-[9px] uppercase tracking-[0.2em]"
      >targets · capture-phase scroll</span
    >
    <div class="mt-6 flex flex-col">
      {#each targets as target (target.id)}
        <div class={`border-border border-y px-3 py-4 ${target.holds ? 'bg-muted/60' : 'bg-transparent'}`}>
          <span
            class="font-nav text-muted-foreground text-[10px]"
            class:text-foreground={target.holds}
            >#{target.id}{target.holds ? ' — holds the line' : ''}</span
          >
        </div>
      {/each}
    </div>
    <div class="border-primary absolute inset-x-0 top-[92px] border-t-2"></div>
    <span class="text-primary font-nav absolute right-1 top-[98px] text-[9px]">← offset 96</span>
  </div>

  <!-- the derived pick list -->
  <nav class="flex w-[150px] flex-none flex-col gap-3" aria-label="blueprint scroll spy">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]">pick</span>
    {#each targets as target (target.id)}
      {#if target.holds}
        <span class="text-primary border-primary font-nav border-l-2 pl-2 text-[11px] font-bold"
          >{target.id}</span
        >
      {:else}
        <span class="font-nav text-muted-foreground pl-2 text-[11px]">{target.id}</span>
      {/if}
    {/each}
  </nav>
</div>
