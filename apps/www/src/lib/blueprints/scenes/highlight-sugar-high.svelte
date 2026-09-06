<!-- highlight-sugar-high blueprint: the MINIMAL engine — ~10KB in the
     TS lane (the matrix's smallest), 29 canonical languages with
     JS/TS/JSX as native strength, highlight(code, { lang }) returns
     the HTML string directly (no DOM dependency). Zero options: the
     engine IS the minimal config (the spec's exemption). Bar lengths
     follow the upstream README baseline (measured on 2.2.2): sugar-high
     9.9KB vs prism 14.6KB vs hljs 29.5KB. Terminal diagram idiom; no
     live component (the surface is lib-level). -->
<script lang="ts">
  const bars = [
    { label: 'sugar-high', kb: '9.9KB', w: 'w-[42px]', fill: 'bg-primary', labelCls: 'font-bold' },
    { label: 'prism', kb: '14.6KB', w: 'w-[62px]', fill: 'bg-muted', labelCls: '' },
    { label: 'highlight.js', kb: '29.5KB', w: 'w-[126px]', fill: 'bg-muted', labelCls: '' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center p-8">
  <div class="flex w-full max-w-2xl flex-col gap-3 border border-border bg-card p-6 font-mono text-[12px] leading-6">
    <div class="flex items-center justify-between border-b border-border pb-3">
      <span class="text-[13px] font-bold uppercase tracking-widest text-primary">highlight-sugar-high</span>
      <span class="font-nav text-[11px] uppercase tracking-widest text-muted-foreground">the ~10KB engine</span>
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">direct output · no DOM dependency</span>
      <div class="flex items-center gap-2.5">
        <span class="text-[11px]">highlight(code, {'{'} lang {'}'})</span>
        <span class="text-primary">-></span>
        <span class="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-bold">html string</span>
      </div>
    </div>
    <div class="flex flex-col gap-1.5">
      <span class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
        >bundle weight (upstream README baseline, 2.2.2)</span
      >
      {#each bars as bar (bar.label)}
        <div class="flex items-center gap-2.5">
          <span class="w-[86px] flex-none text-[11px] {bar.labelCls}">{bar.label}</span>
          <span class="h-[10px] flex-none rounded-[2px] {bar.w} {bar.fill}"></span>
          <span class="text-[11px] text-muted-foreground">{bar.kb}</span>
        </div>
      {/each}
    </div>
    <div class="flex flex-col border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
      <span>29 canonical languages · JS/TS/JSX native strength · markup output, survives print</span>
      <span>zero options — the engine itself is the minimal config (no langs channel)</span>
    </div>
  </div>
</div>
