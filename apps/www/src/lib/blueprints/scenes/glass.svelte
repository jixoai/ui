<!-- glass blueprint: the lens over the visual band — one iconic
     composition (the approved prototype's band: gradient text + 24px
     grid + the lens pill). Satori paints no backdrop-filter, so the
     frost/lens are simulated as translucent runs with a schematic rim
     (the progressive-blur scene's precedent), the grid as positioned
     1px runs — the schematic posture, structure real. -->
<script lang="ts">
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  // deterministic grid runs — satori-safe (absolute positioning, solid
  // 1px fills), exactly the band's 24px rhythm at scene scale
  const vLines = [40, 88, 136, 184, 232, 280, 328, 376, 424, 472];
  const hLines = [48, 96, 144];
  const knobRows = ['surface convex-squircle', 'bezel 22 · thickness 30', 'scale 55 · blur 0.2'];

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpA.glassStage)}>
  <div class={cx(bpA.glassBand)}>
    <span class={cx(bpA.glassEyebrow)}
      >the visual band · gradient text + 24px grid</span
    >
    <div class={cx(bpA.glassField)}>
      {#each vLines as x (x)}
        <div class={cx(bpA.glassVRun)} style={`left: ${x}px`}></div>
      {/each}
      {#each hLines as y (y)}
        <div class={cx(bpA.glassHRun)} style={`top: ${y}px`}></div>
      {/each}
      <!-- the gradient-text headline schematic: two runs fading like the
           white → pink → cyan clip -->
      <div class={cx(bpA.glassHeadlineBox)}>
        <span class={cx(bpA.glassHeadline)}>liquid glass</span>
        <span class={cx(bpA.glassSub)}>refraction — the lens bends what sits behind it</span>
      </div>
      <!-- the lens pill schematic: translucent run + the rim ring -->
      <div class={cx(bpA.glassLensRow)}>
        <div class={cx(bpA.glassLens)}>
          <span class={cx(bpA.glassLensLabel)}>lens · displacement + specular</span>
        </div>
        <div class={cx(bpA.glassFrost)}>
          <span class={cx(bpA.glassFrostLabel)}>frost — blur()</span>
        </div>
      </div>
      <span class={cx(bpA.glassFormula)}
        >d(s) = T.x/T.y · (H·thickness + bezel)</span
      >
    </div>
    <div class={cx(bpA.glassKnobRow)}>
      {#each knobRows as row (row)}
        <span class={cx(bpA.glassKnob)}>{row}</span>
      {/each}
    </div>
  </div>
</div>
