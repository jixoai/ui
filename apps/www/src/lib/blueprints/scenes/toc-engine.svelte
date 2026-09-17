<!-- toc-engine blueprint: the framework-free geometry engine as a
     diagram — ONE rAF snapshot reads live rects and derives IoM weights
     (intersection area / min(block, viewport)) plus the line pick (the
     margin-resolves-downward law). Left: the viewport frame over the
     tracked data-region blocks with the line drawn in; right: the rule
     rail any consumer can derive from the engine's update.

     site-polish F8 (measure-then-fit): every text run must fit its box
     inside the 640x360 stage — the straddling block grew to hold its
     full paragraph (it used to overflow onto the #below block), and
     the arrow glyphs (←/↑) are gone (the blueprint fonts' latin subsets
     have no arrows; they painted as tofu boxes next to "the line" and
     "line pick"). build-blueprints' overflow probe fails the build if
     any text run escapes the stage or overlaps another again.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms; the
     picked/plain poses fold the former class: directive cluster into
     ternary atoms in the cx slot.) -->
<script lang="ts">
  import { bpB } from '../../surface/blueprints-b.stylex';

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

  const rows: { label: string; weight: string; picked: boolean }[] = [
    { label: '#above', weight: '0.00', picked: false },
    { label: '#straddling', weight: '0.42', picked: true },
    { label: '#below', weight: '0.00', picked: false },
  ];
</script>

<div class={cx(bpB.tocEngineStage)}>
  <!-- the tracked document and the line -->
  <div class={cx(bpB.tocEngineDoc)}>
    <span class={cx(bpB.tocEngineViewportTag)}
      >viewport</span
    >
    <!-- the line -->
    <div class={cx(bpB.tocEngineLine)}></div>
    <span class={cx(bpB.tocEngineLineLabel)}>the line</span>
    <!-- block above the fold -->
    <div class={cx(bpB.tocEngineBlockAbove)}>
      <span class={cx(bpB.tocEngineBlockTag)}>#above · weight 0</span>
    </div>
    <!-- straddling block: intersection shading; sized to HOLD its
         paragraph (title 15px + mt-2 8px + 3 lines × 16px + pt 4px
         = 75px of content in an 88px box) -->
    <div class={cx(bpB.tocEngineBlockStraddle)}>
      <span class={cx(bpB.tocEngineBlockTitle)}>#straddling · IoM 0.42</span>
      <p class={cx(bpB.tocEngineBlockBody)}>
        intersection ÷ min(block, viewport) — the line in a margin resolves DOWNWARD to this
        block.
      </p>
    </div>
    <!-- block below the fold -->
    <div class={cx(bpB.tocEngineBlockBelow)}>
      <span class={cx(bpB.tocEngineBlockTag)}>#below · weight 0</span>
    </div>
  </div>

  <!-- the derived rail -->
  <div class={cx(bpB.tocEngineRail)}>
    <span class={cx(bpB.tocEngineRailLabel)}
      >the derived rail</span
    >
    {#each rows as row (row.label)}
      <div class={cx(bpB.tocEngineRailRow)}>
        <span
          class={cx(bpB.tocEngineSwatch, row.picked ? bpB.tocEngineSwatchPicked : bpB.tocEngineSwatchPlain)}
        ></span>
        <span
          class={cx(bpB.tocEngineRailItem, row.picked ? bpB.tocEngineRailItemPicked : bpB.tocEngineRailItemPlain)}
        >
          {row.label}
        </span>
        <span class={cx(bpB.tocEngineRailWeight)}>{row.weight}</span>
      </div>
      {#if row.picked}
        <span class={cx(bpB.tocEnginePick)}>line pick</span>
      {/if}
    {/each}
  </div>
</div>
