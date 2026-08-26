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
  const usage = `<Separator />                        <!-- hr: thematic break -->
<Separator orientation="vertical" />  <!-- ARIA div: inline peer split -->

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
    content="The jixoai separator: W3C-first — the horizontal separator IS the native hr; only the vertical posture takes the ARIA route. 1px var(--border), geometry from the consumer's layout."
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
        summary="The W3C already built this one: <hr> carries thematic-break semantics, announcements, and styling for free. Only the vertical posture — splitting inline peers — has no native element, so it takes the ARIA route: a div with role=separator. No props beyond orientation; length is your layout's job."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;hr&gt;</span>
          <span class="pill">role=separator vertical</span>
          <span class="pill">1px var(--border)</span>
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
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="One color decision and no density footprint: the 1px line is var(--border), length comes from layout."><div class="flex flex-col gap-6"><DensityDemo><div class="flex h-8 items-stretch gap-4 text-[13px]"><span>a</span><Separator orientation="vertical" /><span>b</span></div></DensityDemo><TokenTable tokens={[{ name: '--border', default: '1px line', source: 'color', description: 'The only paint decision the component makes' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Separator Props interface — everything else rides through as native hr attributes."><PropsTable props={[{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'horizontal renders the native hr; vertical renders the role=separator div.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough — width/height/margin live here, by design.' }, { name: '...rest', type: 'HTMLAttributes<HTMLHRElement>', default: 'spread', description: 'Every other attribute lands on the element (vertical spreads onto the div).' }]} /></SectionCard></div>
</div>
