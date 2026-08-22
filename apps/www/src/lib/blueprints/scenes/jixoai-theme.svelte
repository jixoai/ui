<!-- jixoai-theme blueprint: the token sheet as swatches — the one-hue
     law (a project's identity is a single --brand-hue; primary, ring and
     chart-1 all derive from it) over the surfaces family, every swatch
     painted from the live CSS variables the sheet installs. -->
<script lang="ts">
  const hueSamples: { hue: string; css: string }[] = [
    { hue: '210', css: 'oklch(0.6489 0.237 210)' },
    { hue: '109', css: 'oklch(0.6489 0.237 109)' },
    { hue: '260', css: 'oklch(0.6489 0.237 260)' },
  ];
  const tokens: { name: string; css: string }[] = [
    { name: 'primary', css: 'var(--primary)' },
    { name: 'secondary', css: 'var(--secondary)' },
    { name: 'accent', css: 'var(--accent)' },
    { name: 'muted', css: 'var(--muted)' },
    { name: 'border', css: 'var(--border)' },
    { name: 'card', css: 'var(--card)' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-7 p-10">
  <div class="flex items-center gap-5">
    <span class="font-nav text-muted-foreground w-[96px] flex-none text-[10px] uppercase tracking-[0.18em]"
      >--brand-hue</span
    >
    <div class="flex flex-1 gap-3">
      {#each hueSamples as sample (sample.hue)}
        <div class="flex-1">
          <div class="border-border h-11 w-full border" style="background: {sample.css}"></div>
          <span class="font-nav text-muted-foreground mt-1 block text-[9px]">{sample.hue}</span>
        </div>
      {/each}
    </div>
  </div>
  <div class="flex items-center gap-5">
    <span class="font-nav text-muted-foreground w-[96px] flex-none text-[10px] uppercase tracking-[0.18em]"
      >tokens</span
    >
    <div class="grid flex-1 grid-cols-6 gap-3">
      {#each tokens as token (token.name)}
        <div>
          <div class="border-border h-11 w-full border" style="background: {token.css}"></div>
          <span class="font-nav text-muted-foreground mt-1 block text-[9px]">{token.name}</span>
        </div>
      {/each}
    </div>
  </div>
  <div class="flex items-center gap-5">
    <span class="font-nav text-muted-foreground w-[96px] flex-none text-[10px] uppercase tracking-[0.18em]"
      >the law</span
    >
    <p class="text-muted-foreground text-[11.5px] leading-5">
      one hue is the whole identity — OKLCH everywhere, radius 0, hard offset shadows; the sheet
      is plain CSS variables, nothing to hydrate.
    </p>
  </div>
</div>
