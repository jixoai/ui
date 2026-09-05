<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import ScrollChrome from '$lib/ui/scroll-run/scroll-chrome.svelte';
  import {
    createScrollStamp,
    progressBlur,
    ramp,
    shadow,
    type ScrollEffect,
  } from '$lib/ui/scroll-run/scroll-run.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import scrollRunCssSource from '$lib/ui/scroll-run/scroll-run.css?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { createScrollStamp, ramp } from '@ui/scroll-run';
  import ScrollChrome from '@ui/scroll-run';
${close}

<div class="jx-scroll-host grid max-w-full [grid-template-columns:minmax(0,1fr)]">
  <!-- the run IS the scroller: one element, the shared sheet styles it
       (data-axis 'horizontal' | 'vertical' picks the measuring axis and
       the chip edges). NEVER hand-stamp data-scroll-effect — ScrollChrome
       owns the effect attributes -->
  <div
    bind:this={runEl}
    data-jx-scroll-run=""
    data-axis="horizontal"
    class="flex gap-2 overflow-x-auto"
  >
    <!-- …the strip's members… -->
  </div>
  <!-- the DOM half of the chrome: veil layer + chevron chips. Custom
       chip content = snippet children (the frost/gating/button law stay,
       the glyph retires) -->
  <ScrollChrome scrollEffect={ramp()} run={runEl} backwardLabel="Scroll back" forwardLabel="Scroll on" />
</div>

<script lang="ts">
  // the JS half: the verdict + the edge factors, one machine
  $effect(() => {
    const run = runEl;
    if (!run) return;
    const stamp = createScrollStamp({
      run,
      host: hostEl,
      members: () => [...run.children].filter((c) => c instanceof HTMLElement),
      ramps: true, // stamp --jx-edge-* only under ramp()
    });
    return () => stamp.destroy();
  });
${close}`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-run/scroll-run.css', content: scrollRunCssSource },
    { name: 'src/lib/ui/scroll-run/usage.svelte', content: usage },
  ];

  // the live demo: a hand-rolled strip on the RAW contract — no tabs,
  // no button-group, proof the system is family-neutral. bind:this
  // targets are $state so the chrome props and the stamp effect see
  // the mounted elements
  let hostEl = $state<HTMLDivElement>();
  let runEl = $state<HTMLDivElement>();
  let stamp: ReturnType<typeof createScrollStamp> | undefined;

  // round 2: the axis toggle (vertical support), the merged ramp picker,
  // and the custom-chip-content switch
  let axis = $state<'horizontal' | 'vertical'>('horizontal');
  const kinds = ['ramp', 'ramp·no-blur', 'progressBlur', 'shadow'] as const;
  let kind = $state<(typeof kinds)[number]>('ramp');
  let customChips = $state(false);
  let chipsDisabled = $state(false);
  // round 5: the insufficient-content law, demoable — 3 lanes fit in
  // the stage (either axis), the verdict flips to 'none' and the
  // chrome retires wholesale (the childList observer re-verdicts)
  let fitting = $state(false);
  const lanes = $derived(fitting ? 3 : 14);

  const effect = $derived.by(() => {
    switch (kind) {
      case 'ramp·no-blur':
        return ramp({ blur: false });
      case 'progressBlur':
        return progressBlur();
      case 'shadow':
        return shadow();
      default:
        return ramp();
    }
  });

  $effect(() => {
    void (effect as ScrollEffect).type; // flips re-arm the machine
    void axis; // axis flips re-arm it too (the machine reads data-axis)
    const run = runEl;
    if (!run) return;
    stamp = createScrollStamp({
      run,
      host: hostEl,
      members: () => [...run.children].filter((c): c is HTMLElement => c instanceof HTMLElement),
      ramps: kind === 'ramp' || kind === 'ramp·no-blur',
    });
    return () => {
      stamp?.destroy();
      stamp = undefined;
    };
  });

  const chips = $derived(Array.from({ length: lanes }, (_, i) => `lane-${String(i + 1).padStart(2, '0')}`));
</script>

<svelte:head>
  <title>Scroll run · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai scroll-run system: ONE law set for every scrollable region — the run is the scroller, a JS-stamped verdict gates the chrome, per-member edge factors are consumed squared, and the ScrollEffect builders pick the treatment. Tabs and button-group are consumers; this is the adoption contract."
  />
</svelte:head>

<!-- the demo's custom chip glyphs: lucide ARROWS (head + stem —
     deliberately DIFFERENT geometry than the default chevrons, so the
     toggle reads at a glance), per-axis; proof the custom lane takes
     ANY content (the frost/gating/button law stay, the glyph retires,
     the content centers in the chip) -->
{#snippet arrLeft()}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="black" stroke-width="2" aria-hidden="true"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>{/snippet}
{#snippet arrRight()}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="black" stroke-width="2" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>{/snippet}
{#snippet arrUp()}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="black" stroke-width="2" aria-hidden="true"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>{/snippet}
{#snippet arrDown()}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="black" stroke-width="2" aria-hidden="true"><path d="m19 12-7 7-7-7" /><path d="M12 5v14" /></svg>{/snippet}

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · shared system"
      title="scroll run — one law set for every scrollable region"
      summary="Born twice (tabs 2026-09-01, button-group 2026-09-04) and unified the same day by Owner ruling: the scrollable strip is not a tabs feature, it is a SYSTEM. The run is the scroller itself; a JS machine stamps the scrollability verdict (data-jx-scroll-state) that the css trusts for every overlay gate, plus per-member edge factors consumed SQUARED — the eased curve where light clips barely treat and deep clips ramp to full. The chrome (frosted edge chips, the merged veil layer) is real DOM keyed on that verdict; the treatment is a typed builder. Consumers keep only their tuning."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">the run IS the scroller</span><span class="pill">both axes</span>
        <span class="pill">JS-stamped verdict</span>
        <span class="pill">squared edge factors · one ramp() builder</span>
        <span class="pill">RTL three-engine funnel</span>
      </div>
    </SectionCard>
  </div>

  <div id="srun-demo" data-region="srun-demo" data-family="srun-demo" data-reveal="">
    <ComponentCanvas
      title="scroll run"
      description="THE raw contract, live — no tabs, no button-group, just the three parts wired by hand (this is exactly what a future scrollable region copies): a one-cell grid host, the run carrying its data hooks, ScrollChrome for the DOM half, and one createScrollStamp effect for the JS half. Round 2: flip the AXIS (the same contract against the block edges — up/down glyphs, block lane, block-axis veil), flip the treatment (the ONE ramp builder with its toggles), and switch on CUSTOM CHIPS (lucide ARROW snippets inside the frosted buttons — deliberately distinct geometry so the switch reads at a glance; centered, re-aiming with the axis). Round 3: the chips sit IN-BOARD flush against their edge, centered on the cross axis; the four direction glyphs are four separate css vars. Round 4: declare the chips DISABLED — they vanish from the DOM entirely (consumer-declared absence; the verdict stays the automatic gate for rendered chips). Flip CONTENT: FITS and the whole chrome retires — three lanes fit the stage, the verdict stamps 'none' (the childList observer re-verdicts; shrinking the stage does the same)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-run/scroll-run.svelte.ts"
      files={canvasFiles}
    >
      <div class="flex w-full flex-col gap-4">
        <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Demo controls">
          <button
            type="button"
            aria-pressed={axis === 'horizontal'}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {axis === 'horizontal' ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (axis = 'horizontal')}
          >
            axis: horizontal
          </button>
          <button
            type="button"
            aria-pressed={axis === 'vertical'}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {axis === 'vertical' ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (axis = 'vertical')}
          >
            axis: vertical
          </button>
          <span class="bg-border/60 mx-1 inline-block h-4 w-px self-center"></span>
          {#each kinds as k (k)}
            <button
              type="button"
              aria-pressed={kind === k}
              class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
                border px-2 py-1 {kind === k ? 'text-primary' : 'text-muted-foreground'}"
              onclick={() => (kind = k)}
            >
              {k === 'ramp·no-blur' ? 'ramp({ blur: false })' : `${k}()`}
            </button>
          {/each}
          <span class="bg-border/60 mx-1 inline-block h-4 w-px self-center"></span>
          <button
            type="button"
            aria-pressed={!fitting}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {!fitting ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (fitting = false)}
          >
            content: overflows
          </button>
          <button
            type="button"
            aria-pressed={fitting}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {fitting ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (fitting = true)}
          >
            content: fits
          </button>
          <span class="bg-border/60 mx-1 inline-block h-4 w-px self-center"></span>
          <button
            type="button"
            aria-pressed={customChips}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {customChips ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (customChips = !customChips)}
          >
            custom chips
          </button>
          <button
            type="button"
            aria-pressed={chipsDisabled}
            class="border-border bg-background/55 hover:bg-muted/50 font-mono text-[11px]
              border px-2 py-1 {chipsDisabled ? 'text-primary' : 'text-muted-foreground'}"
            onclick={() => (chipsDisabled = !chipsDisabled)}
          >
            chips disabled
          </button>
        </div>
        <div class="border-border border p-4">
          <div
            bind:this={hostEl}
            class="jx-scroll-host grid max-w-full [grid-template-columns:minmax(0,1fr)]"
          >
            {#if axis === 'horizontal'}
              <div
                bind:this={runEl}
                data-jx-scroll-run=""
                data-axis="horizontal"
                class="flex w-full gap-2"
              >
                {#each chips as chip, i (chip)}
                  <span
                    class="border-border/60 bg-muted/30 flex-none border px-3 py-2 font-mono text-[11px] {i === 3 ? 'text-primary' : ''}"
                  >
                    {chip}
                  </span>
                {/each}
              </div>
            {:else}
              <div
                bind:this={runEl}
                data-jx-scroll-run=""
                data-axis="vertical"
                class="flex max-h-56 w-full flex-col gap-2"
              >
                {#each chips as chip, i (chip)}
                  <span
                    class="border-border/60 bg-muted/30 flex-none border px-3 py-2 font-mono text-[11px] {i === 3 ? 'text-primary' : ''}"
                  >
                    {chip}
                  </span>
                {/each}
              </div>
            {/if}
            {#if customChips}
              <ScrollChrome
                scrollEffect={effect}
                run={runEl}
                backwardLabel="Scroll back"
                forwardLabel="Scroll on"
                backwardContent={axis === 'horizontal' ? arrLeft : arrUp}
                forwardContent={axis === 'horizontal' ? arrRight : arrDown}
                backwardDisabled={chipsDisabled}
                forwardDisabled={chipsDisabled}
              />
            {:else}
              <ScrollChrome
                scrollEffect={effect}
                run={runEl}
                backwardLabel="Scroll back"
                forwardLabel="Scroll on"
                backwardDisabled={chipsDisabled}
                forwardDisabled={chipsDisabled}
              />
            {/if}
          </div>
        </div>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          pre-hydration the strip is naked — no chips, no veils — until the first verdict lands; a
          direction that cannot travel never paints its chip, and CONTENT: FITS retires the
          chrome wholesale (the verdict follows the content — a childList observer re-stamps
          when members come or go, so growing back to 14 lanes re-arms it);
          reduced motion keeps the blur and fades, killing only the translate. The progressBlur
          ladder rides EITHER axis — block edges (top/bottom) on a vertical run, visually
          distinct from the shadow veil's contrast bands.
          The four chevron glyphs are four separate css vars — swap any one arrow without
          touching the other three; the chips sit in-board, centered on their cross axis (an
          override re-places them — everything rides zero-specificity :where()).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="srun-law" data-reveal="">
    <SectionCard
      family="srun-law"
      headerRegion="srun-law"
      eyebrow="the technique"
      title="The three parts"
    >
      <p class="text-muted-foreground text-pretty text-[13px] leading-6">
        <strong class="text-foreground">scroll-run.svelte.ts</strong> is the JS half:
        createScrollStamp owns the measurement pass — the verdict
        (none | start-closed | end-closed | open) stamped on the run, the host's
        --jx-scroll-progress (RTL-normalized), and each member's --jx-edge-start/end clipped
        fractions, with ResizeObserver plus visibilitychange/focus wake so a background tab
        restamps on return. The RTL trio (detectRtlScrollModel, rtlScrollToCanonical,
        rtlScrollFromCanonical) funnels all three engine models into one canonical
        [−max, 0] coordinate space; nudgeRun steps a page minus the padding lane.
        <strong class="text-foreground">scroll-run.css</strong> is the law sheet: the run
        contract, the squared consumption, the chip and veil paint, the verdict gates.
        <strong class="text-foreground">scroll-chrome.svelte</strong> is the DOM half of the
        chrome — the veil layer (progressBlur ladder or shadow bands) and the two chevron
        chips as real focusable buttons wired to nudgeRun.
      </p>
      <CodeBlock
        code={/* css */ `/* the eased curve — every ramp effect is this one shape:
   the clipped fraction, consumed squared */
opacity: calc(1 - max(var(--jx-edge-start, 0), var(--jx-edge-end, 0))
                * max(var(--jx-edge-start, 0), var(--jx-edge-end, 0)));`}
        lang="css"
        meta="the squared law"
      />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="The treatment is a typed builder product (the press-button effect convention); the verdict is a four-state stamp; the host law is one grid cell.">
    <div class="grid gap-4 min-[760px]:grid-cols-3">
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">ramp(&#123; opacity, blur, translate &#125;)</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">The ONE member-ramp builder (the round-2 merge): each member is treated by its own clipped fraction as it crosses an edge — fade, blur, translate, any combination. Every toggle defaults ON; a toggle off never pays its css property (ramp(&#123; blur: false &#125;) is the old cheapest slide). Factors stamp only under ramp.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">progressBlur(&#123; blurLevels, width &#125;)</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">The veil: the progressive-blur ladder pinned as grid items of the host cell, entering by scroll-driven translate over the outer 15% of travel. The ladder is capped (max 4px by default tuning) for short strips.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">shadow(&#123; width &#125;)</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">The contrast ghost: the separator INK law as an edge band — backdrop-filter contrast() subtracts color toward mid tone (light dims, dark lifts), never adds black. One band per edge, mask-ramped.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">the verdict stamp</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">data-jx-scroll-state: none (cannot scroll at all), start-closed / end-closed (that edge is exhausted), open. Every overlay gate keys on it — a dead direction never paints, and content that cannot scroll paints nothing at all: the verdict FOLLOWS the content (a childList MutationObserver re-stamps when members come or go).</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">the one-cell host</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">.jx-scroll-host stacks the run, the veil layer and the chips in one grid cell — grid positions them, z-index layers them (run base · veil 1 · chips 2), never position:*. Either axis: the run's data-axis picks the measuring axis and the chip edges (inline or block), glyphs included.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">mirrors</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">A companion element can ride a member's factors (tabs mirrors them onto its selection indicator, so the bar exits with its trigger). Pure stamp-side wiring — the css needs nothing new.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The whole adoption contract: host, run hooks, chrome, and one effect. This is every line a future scrollable region adds."><CodeBlock code={usage} lang="svelte" meta="the raw contract" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The chips are real buttons with REQUIRED labels; the veils are scenery; nothing paints before the first verdict."><A11yTable keys={[{ key: 'ArrowLeft / ArrowRight', action: 'The run is a native scroller — keyboard travel is free; the chips are shortcuts, not the only path' }]} aria={[{ name: 'backwardLabel / forwardLabel', value: 'required', description: 'Each chevron chip is a real focusable button; its accessible name is the consumer\'s call (tabs says "Scroll tabs backward")' }, { name: 'aria-hidden', value: 'veils', description: 'The veil layer and its bands are pure scenery — no name, no role, pointer-transparent' }, { name: 'prefers-reduced-motion', value: 'translate: none', description: 'The translate dies (member ramps and veil entrances); blur and opacity stay — a CLOSED edge hides its veil outright instead of parking it in place' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The glyph/veil knobs ride the HOST (the overlays are the run's siblings — a var on the run never reaches them); the ramp magnitudes are chrome-stamped on the RUN; the glyphs are FOUR swappable css vars, one per direction."><TokenTable tokens={[{ name: '--jx-scroll-veil', default: 'calc(var(--jx-inset) * 1.5)', source: 'component', description: 'Veil band width; tabs overrides to inset·6 (its snap lane parks readable text inboard)' }, { name: '--jx-scroll-chevron-chip', default: 'oklab(1 0 0 / 0.8)', source: 'component', description: 'The frosted chip ink — near-white at 80%, readable over any content through the 2px blur' }, { name: '--jx-scroll-chevron-chip-hover', default: 'oklab(1 0 0 / 0.95)', source: 'component', description: 'The RAISED ink hover paints (round 10) — the frost goes near-opaque (a hair of translucency stays so the blur reads) and the lift deepens; swap the VALUE, not the rule' }, { name: '--jx-scroll-chevron-size', default: '14px', source: 'component', description: 'The glyph size (the SVG canvas; the ink spans the middle half)' }, { name: '--jx-scroll-chevron-left / -right / -up / -down', default: 'lucide chevrons', source: 'component', description: 'The FOUR direction glyphs as url() css vars — one customization slot per PHYSICAL direction (axis + edge + page direction pick which slot paints; RTL swaps the inline pair). Swap any one arrow without touching the other three.' }, { name: '--jx-scroll-edge-slide / --jx-scroll-edge-blur', default: 'builder-set', source: 'component', description: 'The ramp magnitudes — ScrollChrome stamps them on the run from the builder\'s distance/radius; a toggle off never sets its var (a consumer never hand-writes them)' }]} /></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Two functions, one component, three builders — the whole surface. Consumers: tabs (TabsList scrollEffect) and button-group (overflow='scroll' + scrollEffect, both axes)."><div class="flex flex-col gap-6"><PropsTable title="createScrollStamp(options) → ScrollStamp" props={[{ name: 'run', type: 'HTMLElement', default: '—', description: 'The scroller itself — must carry data-jx-scroll-run; its data-axis (horizontal | vertical) picks the measuring axis. The verdict lands on it.', required: true }, { name: 'host', type: 'HTMLElement', default: '—', description: 'The one-cell grid host (.jx-scroll-host) — the progress var and the css-var knobs land on it.', required: true }, { name: 'members', type: '() => HTMLElement[]', default: '—', description: 'The ramp audience, re-read every pass; a childList MutationObserver re-verdicts when membership changes (content that stops overflowing retires the chrome).', required: true }, { name: 'ramps', type: 'boolean', default: '—', description: 'Stamp the per-member --jx-edge-* factors — true only under ramp(); the veil effects never pay the stamp loop.', required: true }, { name: 'mirrors', type: "() => { target, source }[]", default: '—', description: "Companion elements that ride a member's factors (tabs' indicator mirrors its active trigger)." }, { name: 'returns', type: 'ScrollStamp', default: '—', description: '{ update() — restamp by hand (e.g. after DOM surgery), destroy() — tear down listeners and observers }.' }]} /><PropsTable title="ScrollChrome props" props={[{ name: 'scrollEffect', type: 'ScrollEffect', default: '—', description: 'A builder product. THIS component owns the run\'s effect surface: the data-scroll-effect type key, the ramp\'s data-ramp-* toggle flags AND its magnitude vars (--jx-scroll-edge-slide/blur from the builder\'s distance/radius) — the consumer never hand-stamps any of them.', required: true }, { name: 'run', type: 'HTMLElement', default: '—', description: 'The scroller — the chips nudge it via nudgeRun (axis- and RTL-normalized), and its data-axis drives the chrome\'s axis awareness.', required: true }, { name: 'backwardLabel / forwardLabel', type: 'string', default: "'Scroll backward' / 'Scroll forward'", description: 'The chips\' accessible names — tabs passes "Scroll tabs backward", button-group "Scroll actions backward".' }, { name: 'backwardContent / forwardContent', type: 'Snippet', default: '—', description: 'THE custom scroll-button lane: snippet children render INSIDE the chip buttons, CENTERED by the chip\'s own box law — the frost, the shape, the verdict gating and the focusable-button law all stay (the tabs-indicator paint-override pattern); only the glyph layer retires. Swapping just the glyph? Override the --jx-scroll-chevron-left/-right/-up/-down url vars instead (four independent slots).' }, { name: 'backwardDisabled / forwardDisabled', type: 'boolean', default: 'false (rendered)', description: 'DECLARED absence (round 4, semantics finalized round 7): a disabled chip does not render AT ALL — no DOM node, no paint, no a11y entry. The verdict stays the AUTOMATIC gate for rendered chips (a closed edge or a cannot-scroll run never paints).' }] } /><PropsTable title="builders (the press-button effect convention; round 2 — the merged ramp)" props={[{ name: 'ramp', type: "(options?: { opacity?, blur?, translate?, distance?, radius? }) => ScrollEffect", default: "all toggles true · distance '8px' · radius '4px'", description: 'The ONE member-ramp builder. Each member ramps by its clipped fraction as it crosses an edge (consumed squared); every toggle defaults ON, and a toggle off never pays its css property. ramp({ blur: false }) is the cheapest posture (the old slide), ramp({ translate: false }) the old blur.' }, { name: 'progressBlur', type: "(options?: { blurLevels?, width? }) => ScrollEffect", default: "capped ladder", description: 'The progressive-blur veil pair on EITHER axis (inline edges start/end, block edges top/bottom — the grid dialect of the component); width overrides --jx-scroll-veil inline.' }, { name: 'shadow', type: "(options?: { width? }) => ScrollEffect", default: '—', description: 'The contrast-ink veil pair — backdrop contrast subtracts color, never adds black; axis-aware (block-edge bands on a vertical run).' }] } /></div></SectionCard></div>
</div>
