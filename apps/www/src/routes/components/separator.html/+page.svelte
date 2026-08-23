<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Separator from '$lib/ui/separator.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the length demo + the native base, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import separatorSource from '$lib/ui/separator.svelte?raw';

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
    <div data-reveal="" use:reveal>
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

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="separator"
        description="Horizontal renders the native hr; vertical renders the ARIA div and stretches its container's cross axis."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/separator.svelte"
        files={canvasFiles}
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
          <div class="jx-play-fields">
            <p class="jx-play-help">
              one prop, <code class="text-accent">orientation</code> — everything else is the
              element's own semantics. Width/height come from the class prop or the parent layout;
              the component ships no length API on purpose.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="length-layout" data-reveal="" use:reveal>
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

    <div id="separator-base" data-reveal="" use:reveal>
      <SectionCard
        family="separator-base"
        headerRegion="separator-base"
        eyebrow="NativeHTML 基座"
        title="What the platform gives"
        summary="No ARIA to maintain on the horizontal path — the browser announces <hr> as a separator to assistive tech. The vertical path is the WAI-ARIA separator pattern, aria-orientation included."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>
