<!-- highlight-lang-detector blueprint: the DLD default detector — a
     FOUR-layer waterfall where every layer is its own lazy module (a
     hit short-circuits; the deeper layers never load a byte). L1
     filename tables, L2 shebang/modeline, L3 Markdown-guarded
     structural probes (never a programming fingerprint), L4 betlang
     statistics (wasm via @jixoai/ui-betlang-wasm, ?url in the browser,
     real bytes under vitest). lang-canonical.ts is the authority every
     layer derives from. 'Four layers' counts the waterfall only — the
     card's detection rings stay three. betlangDetector() is L4
     standalone. Terminal diagram idiom; no live component (the
     surface is lib-level). -->
<script lang="ts">
  const layers = [
    { id: 'L1', name: 'filename', reads: 'ext + basename tables', out: 'typescript' },
    { id: 'L2', name: 'shebang', reads: 'interp + modeline', out: 'python' },
    { id: 'L3', name: 'structure', reads: 'json/svg/yaml/toml probes', out: 'json' },
    { id: 'L4', name: 'statistical', reads: 'betlang wasm · 48 labels', out: 'rust 0.97' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-lang-detector</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">the DLD waterfall</span>
    </div>
    <div class="flex flex-col gap-1">
      {#each layers as layer (layer.id)}
        <div class="flex items-baseline gap-3">
          <span class="w-[22px] flex-none font-bold text-primary">{layer.id}</span>
          <span class="w-[92px] flex-none text-[11px]">{layer.name}</span>
          <span class="flex-1 text-[11px] text-muted-foreground">{layer.reads}</span>
          <span class="text-[11px]">{'->'} {layer.out}</span>
        </div>
      {/each}
      <span class="text-[10px] text-muted-foreground">hit short-circuits · every layer its own lazy module · miss falls through</span>
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>detect({'{ code, filename }'}) -> {'{ lang, source, confidence? }'} · null = no opinion (cascade)</span>
      <span>framework-free · wasm rides @jixoai/ui-betlang-wasm (npm, betlang =0.1.1)</span>
      <span>optional capability: a bare code-card install carries zero DLD bytes</span>
    </div>
  </div>
</div>
