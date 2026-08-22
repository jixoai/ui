<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import pressButtonSource from '$lib/ui/press-button.svelte?raw';
  import SectionCard from '$lib/ui/section-card.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // ToC outline: the anchors demo + the closing law, in page order. The
  // engine pairs these ids with the SectionCard data-family extents +
  // header data-region leaves rendered below.
  const tocSections = [
    { id: 'anchors', label: 'Button or anchor' },
    { id: 'law', label: 'Why the shadow is the affordance' },
  ];

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: head/tail halves so the drawer's live overlay and
  // the body CodeBlock assemble from the SAME template (no second copy)
  const usageHead = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover lifts, active presses -->`;
  const usageTail = `
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="copied">copied</PressButton>

<!-- href renders an anchor instead; hrefs outside "/" open a new tab -->
<PressButton variant="primary" href="/docs.html">read the docs</PressButton>`;
  const usage = `${usageHead}
<PressButton variant="primary">deploy</PressButton>${usageTail}`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'registry/files/ui/press-button.svelte', content: pressButtonSource },
    { name: 'src/lib/ui/press-button-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + echo projection + live usage
  type Variant = 'primary' | 'outline' | 'copied';
  const canvasInitial = { variant: 'primary' as Variant };
  let variant = $state(canvasInitial.variant);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
  }
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`${usageHead}
<PressButton variant=${q(variant)}>deploy</PressButton>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Press button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai press-button component: brutalist press physics — hover lifts toward the viewer, active presses back into the page — in three surfaces: primary, outline, and the copied feedback state."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: aside precedes the content column in the DOM — desktop
       sticky right column, mobile the glass bar under the scaffold header
       (height 0, see toc.css); the content column reserves its clearance -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="press-button — one physics, three surfaces"
        summary="The only button in the grammar. The shadow is the affordance: hover grows it from xs to sm while the face lifts half a pixel toward the viewer, active presses back into the page. Variants change the surface, never the physics — primary for the one action that matters, outline for the rest, copied as the 1.6s feedback state after a clipboard write."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">hover lifts · active presses</span>
          <span class="pill">button or anchor</span>
          <span class="pill">copied feedback surface</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="press-button"
        description="The brutalist press-physics button: hover lifts toward the viewer (shadow xs → sm), active presses back into the page. The playground drives the lower instance; the echo line tracks the variant."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
        {files}
        onreset={resetCanvas}
        echo={[{ label: 'variant', value: variant }]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>primary</span>
              <PressButton variant="primary">deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>outline</span>
              <PressButton variant="outline">cancel</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>copied</span>
              <PressButton variant="copied">copied</PressButton>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <PressButton {variant}>{variant}</PressButton>
          </div>
        </div>
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field">
              <NativeSelect
                label="variant"
                onchange={(event) => {
                  variant = event.currentTarget.value as Variant;
                }}
              >
                <option value="primary">primary</option>
                <option value="outline">outline</option>
                <option value="copied">copied</option>
              </NativeSelect>
            </div>
            <p class="jx-play-help">
              hover lifts every surface the same way — <code class="text-accent">variant</code>
              changes only the paint, never the physics. Press one: active translates +1px,+1px and
              drops the shadow; keyboard users get the identical cues through
              <code class="text-accent">:focus-visible</code> and Enter/Space activation, and
              reduced-motion users get instant state changes.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="anchors" data-reveal="" use:reveal>
      <SectionCard
        family="anchors"
        headerRegion="anchors"
        eyebrow="demo"
        title="Button or anchor"
        summary="href switches the element from button to anchor — internal hrefs navigate in place, anything else opens a new tab with noreferrer automatically. The label is a snippet, so icons compose inline with the component's own gap."
      >
        <div class="flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-x-8 gap-y-5">
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>internal → same tab</span>
              <PressButton variant="primary" href="/components.html">overview</PressButton>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>external → new tab</span>
              <PressButton variant="outline" href="https://github.com/jixoai/ui">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  class="h-[13px] w-[13px]"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span>github</span>
              </PressButton>
            </div>
            <div class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>button → no navigation</span>
              <PressButton variant="copied">copied</PressButton>
            </div>
          </div>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>

    <div id="law" data-reveal="" use:reveal>
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="Why the shadow is the affordance"
        summary="No fills-in-motion, no glows, no ripple. The one-hue grammar expresses state through elevation alone, so the button reads identically in light and dark themes and survives the hue runtime without a second rule."
      >
        <ul class="flex flex-col gap-2 text-[13px] leading-6">
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">variant</code> selects only the surface pair
              (background + foreground): <code class="text-accent">primary</code>,
              <code class="text-accent">outline</code>, <code class="text-accent">copied</code> — the
              transform/shadow transition string is shared verbatim</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">href</code> switches the element to an anchor;
              hrefs not starting with <code class="text-accent">/</code> open a new tab with
              <code class="text-accent">noreferrer</code> automatically</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the label is a snippet, so icons compose inline — spacing comes from the
              component's own <code class="text-accent">gap-2.5</code></span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">motion-reduce:transition-none</code> ships in the base
              class: reduced-motion users get instant state changes</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
