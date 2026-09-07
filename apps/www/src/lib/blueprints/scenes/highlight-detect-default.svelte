<!-- highlight-detect-default blueprint: the DLD context provider as a
     ~10-line CHILDREN wrapper — form ① of the two equivalent wirings,
     whose implementation IS the hand-written form ② (one setContext at
     init). Svelte context spreads downward only: wrapped cards eat the
     DLD default for lang='auto', sibling subtrees outside stay
     untouched, nested wrappers take the nearest, and the langDetector
     prop always outranks whatever is wired here. Zero styling, zero
     behavior beyond the wiring. Terminal diagram idiom; the live
     component is one setContext line (not worth a stage — the tree is
     the story). -->
<script lang="ts">
  const inside = ['lang="auto" · filename="main.ts"', 'lang="auto" · no filename -> L4', 'lang="ts" · untouched path'];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-detect-default</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">the children wrapper</span>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span class="text-[12px] font-bold">&lt;HighlightDetectDefault&gt;</span>
        <span class="text-[10px] text-muted-foreground">setContext(HIGHLIGHT_DETECT_KEY,</span>
        <span class="text-[10px] text-muted-foreground">{'  { detector: defaultLangDetector() })'}</span>
        <span class="text-[10px] text-muted-foreground">{'{@render children()}'}</span>
      </div>
      <span class="text-primary">-></span>
      <div class="flex flex-1 flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">the wrapped subtree</span>
        {#each inside as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>context spreads downward only · siblings outside untouched · nearest wrapper wins</span>
      <span>form ② = the same one line, hand-written at any subtree root (zero components)</span>
    </div>
  </div>
</div>
