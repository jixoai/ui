<!-- highlight blueprint: the CONTRACT the engine matrix plugs into —
     ONE HighlightBackend interface, two output models (markup backends
     write token spans and survive the print freeze; range backends
     paint zero markup via the CSS Custom Highlight API and degrade on
     paper), the zero-dependency HIGHLIGHT_KEY seam, and the
     prop -> context -> app-default resolution lane. The core item
     ships NO engine — the six factories install as their own registry
     items (highlight-shiki is code-card's pinned default). Terminal
     diagram idiom; no live component (the surface is lib-level). -->
<script lang="ts">
  const engines = [
    { factory: 'shiki()', model: 'markup' },
    { factory: 'prismjs()', model: 'markup' },
    { factory: 'highlightJs()', model: 'markup' },
    { factory: 'sugarHigh()', model: 'markup' },
    { factory: 'treeSitter()', model: 'markup' },
    { factory: 'microLighter()', model: 'range' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div
    class="flex w-full max-w-2xl flex-col gap-3 border border-[color:var(--border)] bg-[color:var(--card)] p-6 font-mono text-[13px] leading-6"
  >
    <div class="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
      <span class="font-bold uppercase tracking-widest text-[color:var(--primary)]">highlight</span>
      <span class="text-[11px] uppercase tracking-widest text-[color:var(--muted-foreground)]"
        >the engine-agnostic contract</span
      >
    </div>
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div class="flex flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]"
          >engine items (lazy-loaded)</span
        >
        {#each engines as engine (engine.factory)}
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-[11px]">{engine.factory}</span>
            <span
              class="text-[10px] text-[color:var(--muted-foreground)]"
              class:font-bold={engine.model === 'range'}>{engine.model}</span
            >
          </div>
        {/each}
      </div>
      <span class="text-[color:var(--primary)]">-></span>
      <div class="flex flex-col gap-1">
        <pre class="font-bold">HighlightBackend
  highlight(el, code, opts)</pre>
        <pre class="text-[11px] text-[color:var(--muted-foreground)]">seam: HIGHLIGHT_KEY (plain getContext)
resolve: backend prop
  -> context default -> app default</pre>
      </div>
    </div>
    <div class="border-t border-[color:var(--border)] pt-3 text-[11px] leading-5 text-[color:var(--muted-foreground)]">
      zero npm deps · zero engine imports ride the core · markup survives print, ranges do not (pin a markup backend for
      paper)
    </div>
  </div>
</div>
