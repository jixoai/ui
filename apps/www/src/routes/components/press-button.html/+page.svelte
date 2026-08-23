<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton, { pulse, rainbow, ripple, shimmer } from '$lib/ui/press-button.svelte';
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
  import PressButton, { shimmer, pulse, rainbow, ripple } from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover grows the shadow, active presses -->`;
  const usageTail = `
<PressButton variant="secondary">invite</PressButton>
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="ghost">dismiss</PressButton>
<PressButton variant="destructive">delete</PressButton>
<PressButton variant="link">details</PressButton>
<PressButton variant="copied">copied</PressButton>

<!-- one opt-in effect loop per button — typed builders from the module script -->
<PressButton variant="primary" effect={shimmer()}>deploy</PressButton>
<PressButton variant="primary" effect={pulse({ variant: 'ring' })}>deploy</PressButton>
<PressButton variant="outline" effect={rainbow()}>upgrade</PressButton>
<PressButton variant="primary" effect={ripple({ duration: 800 })}>deploy</PressButton>

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
  // calls back — snapshot + reset + echo projection + live usage. The
  // select speaks effect NAMES; the builders run in the map below.
  type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'copied';
  type EffectName = 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectBuilders = {
    none: undefined,
    shimmer: () => shimmer(),
    pulse: () => pulse(),
    rainbow: () => rainbow(),
    ripple: () => ripple(),
  } as const;
  const canvasInitial = { variant: 'primary' as Variant, effect: 'none' as EffectName };
  let variant = $state(canvasInitial.variant);
  let effect = $state(canvasInitial.effect);
  function resetCanvas(): void {
    variant = canvasInitial.variant;
    effect = canvasInitial.effect;
  }
  // free text must become a legal string literal (q() = JSON.stringify)
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`${usageHead}
<PressButton variant=${q(variant)}${effect === 'none' ? '' : ` effect={${effect}()}`}>deploy</PressButton>${usageTail}`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Press button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai press-button component: restrained press law — hover grows the shadow only (the body never moves), active presses the body 1px into the page while the shadow layer stays anchored — in seven surfaces plus four opt-in paint-only effect loops: shimmer, pulse, rainbow, ripple."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content column in the DOM — desktop
       sticky right column, mobile the glass bar under the scaffold header
       (height 0, see toc.css); the content column reserves its clearance -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="press-button — one physics, seven surfaces, four effects"
        summary="The only button in the grammar, and the animation is deliberately quiet: hover never moves the body — the hard shadow alone grows from xs to sm; active presses the body one pixel into the page while the shadow stays exactly where it was. Variants change the surface, never the physics — primary for the one action that matters, secondary when primary is taken, outline for the rest, ghost and link for the quiet seats, destructive to warn, copied as the 1.6s feedback state. One opt-in effect loop adds attention without breaking the restraint: shimmer (a spark walks the perimeter), pulse (sonar rings breathe outward), rainbow (a gradient flows around the border), ripple (ink expands from the press point) — typed builders with options, all frozen under reduced motion."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">hover: shadow only</span>
          <span class="pill">active: anchored press</span>
          <span class="pill">shimmer · pulse · rainbow · ripple</span>
          <span class="pill">motion-reduce safe</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="press-button"
        description="The press-law button: hover grows the shadow only (xs → sm, the body never moves); active presses the body +1px into the page while the shadow layer stays anchored. The playground drives the lower instance; the echo line tracks the variant."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
        {files}
        onreset={resetCanvas}
        echo={[
          { label: 'variant', value: variant },
          { label: 'effect', value: effect },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class="flex flex-col items-center gap-6">
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>primary</span>
              <PressButton variant="primary">deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>secondary</span>
              <PressButton variant="secondary">invite</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>outline</span>
              <PressButton variant="outline">cancel</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ghost</span>
              <PressButton variant="ghost">dismiss</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>destructive</span>
              <PressButton variant="destructive">delete</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>link</span>
              <PressButton variant="link">details</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>copied</span>
              <PressButton variant="copied">copied</PressButton>
            </label>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 border-t border-border pt-5">
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>shimmer</span>
              <PressButton variant="primary" effect={shimmer()}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>pulse · ring</span>
              <PressButton variant="primary" effect={pulse({ variant: 'ring' })}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>rainbow</span>
              <PressButton variant="outline" effect={rainbow()}>upgrade</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>rainbow · primary</span>
              <PressButton variant="primary" effect={rainbow()}>deploy</PressButton>
            </label>
            <label class="text-muted-foreground flex items-center gap-2.5 text-xs">
              <span>ripple — press me</span>
              <PressButton variant="primary" effect={ripple({ duration: 800 })}>deploy</PressButton>
            </label>
          </div>
          <div class="flex flex-col items-center gap-2.5 border-t border-border pt-5">
            <span class="text-muted-foreground font-nav text-[10px] uppercase tracking-[0.24em]">
              driven by the playground
            </span>
            <PressButton {variant} effect={effect === 'none' ? undefined : effectBuilders[effect]()}>
              {variant}
            </PressButton>
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
                <option value="secondary">secondary</option>
                <option value="outline">outline</option>
                <option value="ghost">ghost</option>
                <option value="destructive">destructive</option>
                <option value="link">link</option>
                <option value="copied">copied</option>
              </NativeSelect>
            </div>
            <div class="jx-play-field">
              <NativeSelect
                label="effect"
                onchange={(event) => {
                  effect = event.currentTarget.value as EffectName;
                }}
              >
                <option value="none">none</option>
                <option value="shimmer">shimmer</option>
                <option value="pulse">pulse</option>
                <option value="rainbow">rainbow</option>
                <option value="ripple">ripple</option>
              </NativeSelect>
            </div>
            <p class="jx-play-help">
              every surface shares one physics — <code class="text-accent">variant</code> changes
              only the paint. Hover one: the shadow grows, the body never moves. Press one: the
              body slides +1px,+1px into the page while its box-shadow counter-shrinks 1px (the
              theme's <code class="text-accent">.jx-press</code> law swaps to the
              <code class="text-accent">*-press</code> pose — the shadow paint stays put).
              <code class="text-accent">effect</code> adds ONE attention loop — a perimeter spark
              (shimmer), sonar rings (pulse), a border gradient flow (rainbow), or press-point ink
              (ripple) — built by typed constructors from the component's module script, and
              reduced motion freezes them all.
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
              <code class="text-accent">secondary</code>, <code class="text-accent">outline</code>,
              <code class="text-accent">ghost</code>, <code class="text-accent">destructive</code>,
              <code class="text-accent">link</code>, <code class="text-accent">copied</code> — the
              press law is the theme's shared <code class="text-accent">.jx-press</code> class, one
              source for every button in the grammar</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the shadow is the body's own <code class="text-accent">box-shadow</code>: hover
              grows it (xs → sm) and nothing else; active slides the body +1px while the shadow's
              offsets counter-shrink 1px (the theme's
              <code class="text-accent">*-press</code> poses) — the shadow's paint never moves on
              screen, no pseudo layer involved</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">effect</code> accepts ONE typed builder exported from
              the component's module script —
              <code class="text-accent">shimmer()</code> (a conic spark walks the perimeter),
              <code class="text-accent">pulse()</code> (sonar rings from the body's silhouette,
              three variants), <code class="text-accent">rainbow()</code> (a gradient flows around
              the border, optional under-glow),
              <code class="text-accent">ripple()</code> (ink circles from the exact press point,
              center on keyboard activation) — every loop takes typed options
              (<code class="text-accent">speed</code>, <code class="text-accent">color</code>,
              <code class="text-accent">distance</code>, …), modeled on the animation-svelte
              reference</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span><code class="text-accent">href</code> switches the element to an anchor;
              hrefs not starting with <code class="text-accent">/</code> open a new tab with
              <code class="text-accent">noreferrer</code> automatically</span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>the label is a snippet, so icons compose inline — spacing comes from the
              component's own <code class="text-accent">gap-2.5</code></span></li>
          <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
            <span>reduced motion ships inside the <code class="text-accent">.jx-press</code> law:
              <code class="text-accent">prefers-reduced-motion</code> drops every press transition
              to none</span></li>
        </ul>
      </SectionCard>
    </div>
  </div>
</div>
