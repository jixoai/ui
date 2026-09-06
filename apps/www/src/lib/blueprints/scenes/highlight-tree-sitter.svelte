<!-- highlight-tree-sitter blueprint: the INCREMENTAL parser — source
     parses to a live syntax tree, .scm queries capture nodes into
     --tok-token-* classes (queries ride the item, MIT). The wasm
     assets come from the npm packages themselves (web-tree-sitter +
     tree-sitter-{typescript,javascript}), self-hosted through vite
     ?url imports — the supply chain is the lockfile; wasmBase
     overrides the origin. Markup output, so print survives. Terminal
     diagram idiom; no live component (the surface is lib-level). -->
<script lang="ts">
  const tree = ['(program', '  (lexical_declaration', '    (variable_declarator', '      (identifier))))'];
  const queries = ['("keyword" @tok-kw)', '(identifier @tok-var)'];
  const assets = ['web-tree-sitter.wasm', 'tree-sitter-tsx.wasm', 'npm source · vite ?url'];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-tree-sitter</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">tree + query captures</span>
    </div>
    <div class="flex items-center gap-3">
      <div class="flex w-[172px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">source -> the tree</span>
        {#each tree as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
      </div>
      <span class="text-primary">-></span>
      <div class="flex flex-1 flex-col gap-1 rounded-md border border-border bg-muted/40 px-3 py-2">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">.scm captures</span>
        {#each queries as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
        <span class="text-[10px] text-muted-foreground">queries ride the item (MIT)</span>
      </div>
      <span class="text-primary">-></span>
      <div class="flex w-[152px] flex-none flex-col gap-1">
        <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">paint + wasm</span>
        {#each assets as line (line)}
          <span class="text-[11px]">{line}</span>
        {/each}
        <span class="text-[10px] text-muted-foreground">--tok-token-* spans</span>
      </div>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>markup output · print survives · incremental reparse, not a rescan</span>
      <span>treeSitter({'{'} langs, wasmBase {'}'}) — supply chain = the lockfile (npm-hosted wasm)</span>
    </div>
  </div>
</div>
