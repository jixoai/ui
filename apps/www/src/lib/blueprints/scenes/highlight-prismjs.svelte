<!-- highlight-prismjs blueprint: the CLASSIC markup engine as its own
     item — manual-mode core with dependency-ordered grammar chains
     (markup -> clike -> javascript -> jsx; each link is a lazy load),
     lazy stock theme stylesheets, one active theme per document
     (Prism's own model: last requested wins). Markup output survives
     the print freeze. prismjs({ langs }) slims an instance; prism 1.30
     no longer ships svelte/vue (reject with a hint). Terminal diagram
     idiom; no live component (the surface is lib-level). -->
<script lang="ts">
  const plain = 'rounded-md border border-border px-2.5 py-1 text-[11px]';
  const hot = 'rounded-md border border-border bg-muted/70 px-2.5 py-1 text-[11px] font-bold';
  const chain = [
    { grammar: 'markup', cls: plain },
    { grammar: 'clike', cls: plain },
    { grammar: 'javascript', cls: hot },
    { grammar: 'jsx', cls: plain },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-prismjs</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">the classic markup engine</span>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
        >the grammar chain (dependency-ordered lazy loads)</span
      >
      <div class="flex items-center gap-2.5">
        {#each chain as link, i (link.grammar)}
          {#if i > 0}<span class="text-primary">-></span>{/if}
          <span class={link.cls}>{link.grammar}</span>
        {/each}
        <span class="ml-3 text-[11px] text-muted-foreground">classed spans · token classes in the DOM</span>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">the theme lane</span>
      <div class="flex items-center gap-2.5">
        <span class="rounded-md border border-dashed border-border px-2.5 py-1 text-[11px]"
          >prism.min.css (lazy stylesheet)</span
        >
        <span class="text-[11px] text-muted-foreground">one active theme per document · last requested wins</span>
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>markup output · survives print · prismjs({'{'} langs {'}'}) slims the instance</span>
      <span>prism 1.30 no longer ships svelte/vue — reject with a hint, card falls back to plain text</span>
    </div>
  </div>
</div>
