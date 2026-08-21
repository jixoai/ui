<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import pressButtonSource from '$lib/ui/press-button.svelte?raw';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select from '$lib/ui/select.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover lifts, active presses -->
<PressButton variant="primary">deploy</PressButton>
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="copied">copied</PressButton>

<!-- href renders an anchor instead; hrefs outside "/" open a new tab -->
<PressButton variant="primary" href="/docs.html">read the docs</PressButton>`;

  // the exact same-source copy this site consumes, embedded verbatim
  const files: TreeFile[] = [
    { name: 'src/lib/ui/press-button.svelte', content: pressButtonSource },
    { name: 'src/lib/ui/press-button-usage.svelte', content: usage },
  ];

  type Variant = 'primary' | 'outline' | 'copied';
  let variant = $state<Variant>('primary');
</script>

<svelte:head>
  <title>Press button · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai press-button component: brutalist press physics — hover lifts toward the viewer, active presses back into the page — in three surfaces: primary, outline, and the copied feedback state."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Interactive"
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
      description="The brutalist press-physics button: hover lifts toward the viewer (shadow xs → sm), active presses back into the page."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
      {files}
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
        <Select
          label="variant"
          onchange={(event) => {
            variant = event.currentTarget.value as Variant;
          }}
        >
          <option value="primary">primary</option>
          <option value="outline">outline</option>
          <option value="copied">copied</option>
        </Select>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard
      eyebrow="law"
      title="Why the shadow is the affordance"
      summary="No fills-in-motion, no glows, no ripple. The one-hue grammar expresses state through elevation alone, so the button reads identically in light and dark themes and survives the hue runtime without a second rule."
    >
      <div class="flex flex-col gap-5">
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
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
</div>
