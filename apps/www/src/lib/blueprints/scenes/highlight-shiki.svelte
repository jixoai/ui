<!-- highlight-shiki blueprint: the DEFAULT engine of the matrix — the
     shiki() adapter over lib/shiki, zero new downloads. Grammars and
     themes load on demand as lazy chunks (cache after first ask); the
     default jixoai theme is the css-variables recipe bound to --tok-*
     (zero download). Markup output: real token spans, survives the
     print freeze. shiki({ langs }) slims one instance without touching
     the shared facade registry. Terminal diagram idiom; no live
     component (the surface is lib-level). -->
<script lang="ts">
  const lazy = ['grammar · ts.textmate', 'theme · css-variables', 'jixoai: --tok-* recipe'];
  const spans = ['<span', '  class="tok-kw">', '  const', '</span>'];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-shiki</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">the default engine</span>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex w-[164px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">on demand (lazy chunk)</span>
        {#each lazy as line (line)}
          <span class="text-[11px] text-muted-foreground">{line}</span>
        {/each}
      </div>
      <span class="text-primary">-></span>
      <div class="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span class="text-[12px] font-bold">shiki()</span>
        <span class="text-[11px]">highlight(el, code,</span>
        <span class="text-[11px]">{'  { lang, theme })'}</span>
        <span class="text-[10px] text-muted-foreground">DEFAULT_SHIKI_BACKEND · the stock singleton</span>
      </div>
      <span class="text-primary">-></span>
      <div class="flex w-[140px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">markup output</span>
        {#each spans as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>TextMate-grade accuracy · markup survives print · code-card's pinned default</span>
      <span>shiki({'{'} langs {'}'}) slims the instance — an allowlist, never the shared registry</span>
    </div>
  </div>
</div>
