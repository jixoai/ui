<!-- highlight-microlighter blueprint: the RANGE engine — the one
     backend that writes NO markup: the element stays a single text
     node and tokens register as CSS Custom Highlight API ranges,
     painted by a data-syntax-theme scoped stylesheet. Feature-gated
     (browsers without the API reject before touching the DOM);
     whole-document rescan per paint (its registry law). Known,
     test-locked limit: ranges do not survive the print freeze — pin a
     markup backend for paper. Terminal diagram idiom; no live
     component (the surface is lib-level). -->
<script lang="ts">
  const node = ['<code>x = 1</code>', 'ONE text node', 'nothing written inside'];
  const ranges = ['new Range()', '.set(node, 0, 5)', "CSS.highlights['kw']"];
  const paint = ['::highlight(kw)', '(scoped css)', 'no DOM change'];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-microlighter</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">zero markup · ranges</span>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex w-[158px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">the element</span>
        {#each node as line (line)}
          <span class="text-[11px]" class:text-muted-foreground={line !== node[0]}>{line}</span>
        {/each}
      </div>
      <span class="text-primary">-></span>
      <div class="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
        {#each ranges as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
        <span class="text-[10px] text-muted-foreground">Custom Highlight API · ranges over the text</span>
      </div>
      <span class="text-primary">-></span>
      <div class="flex w-[132px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">the paint</span>
        {#each paint as line (line)}
          <span class="text-[11px]" class:text-muted-foreground={line !== paint[0]}>{line}</span>
        {/each}
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>feature-gated (no API -> reject before the DOM) · whole-document rescan per paint</span>
      <span>ranges do NOT survive the print freeze — pin a markup backend for paper</span>
    </div>
  </div>
</div>
