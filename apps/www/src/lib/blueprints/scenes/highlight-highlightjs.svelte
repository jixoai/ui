<!-- highlight-highlightjs blueprint: the flagship VOLUME channel —
     lib/core with zero languages bundled, then registerLanguage() per
     need (register ONLY what you ship; highlightJs({ langs }) defaults
     to the curated set, an instance allowlist never the shared
     registry). hljs 11.12 ships NO tsx/jsx/svelte/vue — those reject
     with a use-shiki hint. The jixoai theme maps hljs-* classes to
     --tok-* in item CSS (zero download). Terminal diagram idiom; no
     live component (the surface is lib-level). -->
<script lang="ts">
  const core = ['lib/core', '(no languages inside)', '+ registerLanguage', 'ts · js · css · bash'];
  const gap = ['tsx · jsx', 'svelte · vue', '-> reject', 'use shiki'];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-highlightjs</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">core + selective registration</span>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
        {#each core as line, i (line)}
          <span class="text-[11px]" class:font-bold={i === 0}>{line}</span>
        {/each}
        <span class="text-[10px] text-muted-foreground">register ONLY what you ship</span>
      </div>
      <div class="flex w-[178px] flex-none flex-col gap-1 rounded-md border border-dashed border-border px-3 py-2">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">not in hljs 11.12</span>
        {#each gap as line (line)}
          <span class="text-[11px] text-muted-foreground">{line}</span>
        {/each}
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>markup output · survives print · hljs-* classes map to --tok-* (zero download)</span>
      <span>highlightJs({'{'} langs {'}'}) = the flagship slim channel vs the full bundle</span>
    </div>
  </div>
</div>
