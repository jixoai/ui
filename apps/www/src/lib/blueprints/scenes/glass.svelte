<!-- glass blueprint: the lens over the visual band — one iconic
     composition (the approved prototype's band: gradient text + 24px
     grid + the lens pill). Satori paints no backdrop-filter, so the
     frost/lens are simulated as translucent runs with a schematic rim
     (the progressive-blur scene's precedent), the grid as positioned
     1px runs — the schematic posture, structure real. -->
<script lang="ts">
  // deterministic grid runs — satori-safe (absolute positioning, solid
  // 1px fills), exactly the band's 24px rhythm at scene scale
  const vLines = [40, 88, 136, 184, 232, 280, 328, 376, 424, 472];
  const hLines = [48, 96, 144];
  const knobRows = ['surface convex-squircle', 'bezel 22 · thickness 30', 'scale 55 · blur 0.2'];
</script>

<div class="flex h-full w-full flex-col items-center justify-center p-8">
  <div class="flex w-[520px] flex-col gap-3">
    <span class="font-nav text-muted-foreground text-[10px] uppercase tracking-[0.24em]"
      >the visual band · gradient text + 24px grid</span
    >
    <div class="relative h-[190px] w-full overflow-hidden bg-[#101014]">
      {#each vLines as x (x)}
        <div class="absolute top-0 h-full w-px bg-white/15" style={`left: ${x}px`}></div>
      {/each}
      {#each hLines as y (y)}
        <div class="absolute left-0 h-px w-full bg-white/15" style={`top: ${y}px`}></div>
      {/each}
      <!-- the gradient-text headline schematic: two runs fading like the
           white → pink → cyan clip -->
      <div class="absolute left-4 top-4 flex flex-col gap-1">
        <span class="text-[16px] font-bold text-white/90">liquid glass</span>
        <span class="text-[10px] text-white/55">refraction — the lens bends what sits behind it</span>
      </div>
      <!-- the lens pill schematic: translucent run + the rim ring -->
      <div class="absolute bottom-6 left-4 flex items-center gap-3">
        <div
          class="flex h-[40px] w-[190px] items-center rounded-[20px] border border-white/45 bg-white/10 px-3"
        >
          <span class="text-[9.5px] text-white/90">lens · displacement + specular</span>
        </div>
        <div class="flex h-[40px] w-[130px] items-center rounded-[20px] bg-white/5 px-3">
          <span class="text-[9.5px] text-white/65">frost — blur()</span>
        </div>
      </div>
      <span class="text-primary font-nav absolute bottom-1.5 right-2.5 text-[8.5px]"
        >d(s) = T.x/T.y · (H·thickness + bezel)</span
      >
    </div>
    <div class="flex items-center justify-between">
      {#each knobRows as row (row)}
        <span class="text-muted-foreground font-mono text-[9px]">{row}</span>
      {/each}
    </div>
  </div>
</div>
