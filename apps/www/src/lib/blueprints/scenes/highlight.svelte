<!-- highlight blueprint: the pluggable backends — three libraries feed
     ONE paint interface (a backend owns the <code> element), the
     context kernel holds the default, the card's backend prop
     overrides. Range backends paint zero markup (CSS Custom Highlight
     API); markup backends swap token spans. Terminal diagram idiom;
     no live component (the surface is lib-level). -->
<div class="flex h-full w-full items-center justify-center p-8">
  <div
    class="flex w-full max-w-2xl flex-col gap-3 border border-[color:var(--border)] bg-[color:var(--card)] p-6 font-mono text-[13px] leading-6"
  >
    <div class="flex items-center justify-between border-b border-[color:var(--border)] pb-3">
      <span class="font-bold uppercase tracking-widest text-[color:var(--primary)]">highlight</span>
      <span class="text-[11px] uppercase tracking-widest text-[color:var(--muted-foreground)]"
        >the backend owns the element</span
      >
    </div>
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <pre class="text-[color:var(--muted-foreground)]">shiki()      → token spans
prismjs()    → classed spans
microLighter() → ranges (0 markup)</pre>
      <span class="text-[color:var(--primary)]">─▶</span>
      <pre>HighlightBackend
  highlight(el, code, opts)
context default · backend prop</pre>
    </div>
    <div class="border-t border-[color:var(--border)] pt-3 text-[11px] text-[color:var(--muted-foreground)]">
      lazy-loaded · runtime-switchable · range backends degrade to plain text on paper (cloned DOM carries no ranges)
    </div>
  </div>
</div>
