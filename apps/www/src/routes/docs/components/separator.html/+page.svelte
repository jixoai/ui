<!--
  Docs page for the separator family (ink-engine ruling, 2026-09-01).
  Intents:
  1. Hero + canvas: the native hr / ARIA-div pair over the contrast
     ghost (the hero summary is hand-written here — this page predates
     the CATALOG binding; the registry description is ZCode's lane).
  2. Ink-engine gallery: line · dashed · dense · dotted · wavy (masks
     over the ghost) + fade (the blend engine), with the auto-adaptive
     proof box over a light→dark→light tonal ramp.
  3. Length-is-layout demo, the W3C foundation, a11y/theming/api.
  (2026-09-02 fix wave: fade peak α 0.9→0.6; the proof-box captions
  ride solid chips so they stay legible across the ramp, and the copy
  no longer over-claims the fade at exact mid-gray — difference's one
  blind spot.)
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // ToC outline: the length demo + the native base, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import separatorSource from '$lib/ui/separator/separator.svelte?raw';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<Separator />                        <!-- hr: the contrast ghost -->
<Separator orientation="vertical" />  <!-- ARIA div: inline peer split -->
<Separator variant="dashed" />        <!-- 6/4 dashes over the ghost -->
<Separator variant="wavy" />          <!-- the SVG sine mask -->
<Separator variant="fade" />          <!-- blend: transparent→dark→transparent -->

<!-- length is layout: -->
<Separator class="my-6" />
<div class="h-5"><Separator orientation="vertical" /></div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/separator.svelte', content: separatorSource },
    { name: 'src/lib/ui/separator-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Separator · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai separator: W3C-first — the horizontal separator IS the native hr; the vertical takes the ARIA route. The ink is the backdrop's own contrast ghost (backdrop-filter: contrast(0.5), auto-adaptive over any ground); dashed/dense/dotted/wavy are masks over it, fade rides a mix-blend-mode difference gradient — zero color tokens."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="separator — <hr> is the separator"
        summary="The W3C already built this one: <hr> carries thematic-break semantics, announcements, and styling for free. Only the vertical posture — splitting inline peers — has no native element, so it takes the ARIA route: a div with role=separator. The ink paints no color: the default line is the backdrop's own contrast ghost, and every shaped variant rides the same engine."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;hr&gt;</span>
          <span class="pill">role=separator vertical</span>
          <span class="pill">contrast ghost ink</span>
          <span class="pill">6 variants · mask + blend</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="separator"
        description="Horizontal renders the native hr; vertical renders the ARIA div and stretches its container's cross axis."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/separator.svelte"
        files={canvasFiles}
        stage="center"
      >
        <div class="flex w-full max-w-md flex-col gap-4">
          <p class="text-[13px] leading-6">A paragraph of ordinary copy above the rule.</p>
          <Separator />
          <div class="flex items-center gap-4 text-[13px]">
            <span>first</span>
            <Separator orientation="vertical" class="h-4" />
            <span>second</span>
            <Separator orientation="vertical" class="h-4" />
            <span>third</span>
          </div>
          <p class="text-[13px] leading-6">And copy below it — the thematic break reads natively.</p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              one prop, <code>orientation</code> — everything else is the
              element's own semantics. Width/height come from the class prop or the parent layout;
              the component ships no length API on purpose.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="variants" data-reveal="">
      <SectionCard
        family="variants"
        headerRegion="variants"
        eyebrow="ink engine"
        title="The ink engine — no color, only physics"
        summary="A separator paints no color (Owner ruling, 2026-09-01): border-color is for borders. The default ink is the backdrop's own CONTRAST GHOST — a backdrop-filter: contrast(0.5) strip reads as a tonal shift over any ground. Dashed, dense, dotted and wavy are MASKS over that same strip; fade rides the BLEND engine — an alpha-ramped white gradient under mix-blend-mode: difference, inverting the backdrop toward mid exactly as its alpha ramps: transparent → light → dark → light → transparent."
      >
        <div class="flex flex-col gap-6">
          <div class="flex w-full max-w-lg flex-col gap-4">
            {#each [['line', 'the contrast ghost (default)'], ['dashed', '6/4 dashes'], ['dense', '3/3 dense dashes'], ['dotted', 'a chain of dots'], ['wavy', 'the SVG sine mask'], ['fade', 'blend: transparent → dark → transparent']] as [v, label]}
              <div class="flex flex-col gap-1.5">
                <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">{v}</span>
                <Separator variant={v} />
                <span class="text-muted-foreground text-[12px]">{label}</span>
              </div>
            {/each}
          </div>
          <div class="flex w-full max-w-lg flex-col gap-4 border border-border p-4"
            style="background: linear-gradient(90deg, oklch(0.98 0 0), oklch(0.35 0 0), oklch(0.98 0 0))"
          >
            <span class="w-fit self-start rounded-sm bg-background px-1.5 py-0.5 font-nav text-[11px] uppercase tracking-[0.24em] text-foreground">auto-adaptive proof — over a light→dark→light gradient</span>
            <Separator />
            <Separator variant="dashed" />
            <Separator variant="fade" />
            <span class="w-fit self-start rounded-sm bg-background px-1.5 py-0.5 text-[12px] text-foreground">the ghost and its masks track the whole ramp; the fade's blend eases toward exact mid-gray — its one blind spot — and stays a tonal shift everywhere else. No color token anywhere.</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="length-layout" data-reveal="">
      <SectionCard
        family="length-layout"
        headerRegion="length-layout"
        eyebrow="demo"
        title="Length is layout"
        summary="The component draws the line; the consumer decides how long it is. Horizontal rules stretch to their container (or any width class); vertical rules stretch the container's cross axis — put one in a fixed-height flex row and it fills it."
      >
        <div class="flex w-full max-w-md flex-col gap-5">
          <div class="flex flex-col">
            <span class="text-muted-foreground text-[11px]">full width — the default stretch</span>
            <Separator />
          </div>
          <div class="flex flex-col">
            <span class="text-muted-foreground text-[11px]">class="w-1/2" — any width class</span>
            <Separator class="w-1/2" />
          </div>
          <div class="flex flex-col">
            <span class="text-muted-foreground text-[11px]">class="my-6" — length is also rhythm</span>
            <Separator class="my-6" />
          </div>
          <div class="flex h-8 items-stretch gap-4 text-[13px]">
            <span>h-8 row</span>
            <Separator orientation="vertical" />
            <span>the rule fills the cross axis</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="separator-base" data-reveal="">
      <SectionCard
        family="separator-base"
        headerRegion="separator-base"
        eyebrow="W3C foundation"
        title="What the platform gives"
        summary="No ARIA to maintain on the horizontal path — the browser announces <hr> as a separator to assistive tech. The vertical path is the WAI-ARIA separator pattern, aria-orientation included."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two postures: the native hr for thematic breaks, the ARIA div for inline peer splits.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-56 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">horizontal (default)</span><Separator /><span class="text-muted-foreground text-[12.5px]">the native hr — thematic break between blocks</span></div>
      <div class="flex min-w-56 flex-col items-center gap-3 border border-border p-4"><span class="font-nav text-primary self-start text-[11px] uppercase tracking-[0.24em]">vertical</span><div class="flex h-10 items-stretch gap-4 text-[13px]"><span>first</span><Separator orientation="vertical" /><span>second</span></div><span class="text-muted-foreground self-start text-[12.5px]">role=separator div — splits inline peers, stretches the cross axis</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="One prop, no length API on purpose — length is your layout's job."><CodeBlock code={usage} lang="svelte" meta="Separator usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Horizontal needs no ARIA at all — the browser announces hr natively; vertical carries the WAI-ARIA separator pattern."><A11yTable keys={[]} aria={[{ name: 'hr', value: 'native', description: 'Announced as a separator/thematic break by the platform — zero wiring owed' }, { name: 'role', value: 'separator', description: 'On the vertical path only (component-owned, not overridable)' }, { name: 'aria-orientation', value: '"vertical"', description: 'Set with the role on the vertical path' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No color decision at all — the ink is physics, not tokens: the contrast ghost adapts to whatever ground it crosses, the blend fade inverts it. Length comes from layout."><div class="flex flex-col gap-6"><DensityDemo><div class="flex h-8 items-stretch gap-4 text-[13px]"><span>a</span><Separator orientation="vertical" /><span>b</span></div></DensityDemo><TokenTable tokens={[{ name: 'contrast ghost', default: 'backdrop-filter: contrast(0.5)', source: 'ink engine', description: 'The default ink — the backdrop\'s own tonal shift, over any ground' }, { name: 'blend fade', default: 'mix-blend-mode: difference', source: 'ink engine', description: 'The alpha-ramped gradient inverts the backdrop toward mid: transparent → light → dark → light → transparent' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Separator Props interface — everything else rides through as native hr attributes."><PropsTable props={[{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'horizontal renders the native hr; vertical renders the role=separator div. The mask axis swaps with it.' }, { name: 'variant', type: "'line' | 'dashed' | 'dense' | 'dotted' | 'wavy' | 'fade'", default: "'line'", description: 'The ink geometry: line is the bare contrast ghost; dashed (6/4), dense (3/3), dotted and wavy are masks over it; fade rides the blend engine. Own default, not ambient (ink geometry is never a paint-zone rung).' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough — width/height/margin live here, by design.' }, { name: '...rest', type: 'HTMLAttributes<HTMLHRElement>', default: 'spread', description: 'Every other attribute lands on the element (vertical spreads onto the div).' }]} /></SectionCard></div>
</div>
