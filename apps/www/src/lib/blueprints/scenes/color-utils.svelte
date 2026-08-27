<!-- color-utils blueprint: the framework-free color bridge as a
     diagram (lib-scene precedent). The one-hue law lives in OKLCH;
     canvas/tailwind speak rgb()/hex — this lib is the only translator.
     Shows the conversion lattice every surface rides on. -->
<script lang="ts">
  const lattice = [
    { from: 'oklch(L C H)', arrow: '→', to: 'parseColor()', note: 'hex · hsl · oklch in' },
    { from: 'oklchToRgb()', arrow: '→', to: 'rgb(r g b)', note: 'canvas fillStyle out' },
    { from: 'rgbToOklch()', arrow: '→', to: 'oklch()', note: 'round-trip proof' },
    { from: 'hsvToOklch()', arrow: '→', to: 'oklch()', note: 'the hue picker path' },
  ];
</script>

<div class="flex h-full w-full items-center justify-center gap-10 p-10">
  <div class="flex flex-col items-start gap-4 font-mono text-[13px]">
    <div class="text-muted-foreground">// one-hue law lives in OKLCH; the canvas speaks rgb</div>
    {#each lattice as row (row.from)}
      <div class="flex items-center gap-3">
        <span class="rounded-none border border-border bg-muted px-2 py-1 shadow-2xs">{row.from}</span>
        <span class="text-primary">{row.arrow}</span>
        <span class="rounded-none border border-border px-2 py-1">{row.to}</span>
        <span class="text-muted-foreground text-[11px]">{row.note}</span>
      </div>
    {/each}
    <div class="text-muted-foreground mt-2">// parseColor never throws — null is the contract</div>
  </div>
</div>
