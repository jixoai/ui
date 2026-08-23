<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Checkbox from '$lib/ui/checkbox.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import componentCanvasSource from '$lib/ui/component-canvas.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the workbench + the closing law, in page order.

  // Playground: toggles the inner canvas's optional Playground pane.
  let innerPlayground = $state(false);

  // Playground protocol (P1): the page owns the state snapshot.
  const canvasInitial = { innerPlayground: false };
  function resetCanvas(): void {
    innerPlayground = canvasInitial.innerPlayground;
  }

  // Live usage: the sample tracks the toggle — snippet present or absent,
  // exactly what the stage renders (free text would go through q(); the
  // toggle is a closed boolean so it splices structurally instead).
  const usageLive = $derived(`<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import PressButton from '@ui/press-button.svelte';
  import NativeSelect from '@ui/native-select.svelte';
${close}

<!-- files: flat TreeFile list; paths split on "/" build the tree levels -->
<ComponentCanvas
  title="press-button"
  description="hover grows the shadow, active presses on an anchored shadow."
  sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
  files={[{ name: 'src/lib/ui/press-button-usage.svelte', content: usage }]}
>
  <PressButton variant="primary">deploy</PressButton>${innerPlayground ? `
  {#snippet playground()}
    <NativeSelect label="variant">
      <option value="primary">primary</option>
      <option value="outline">outline</option>
    </NativeSelect>
  {/snippet}` : ''}
</ComponentCanvas>`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/component-canvas.svelte', content: componentCanvasSource },
    { name: 'src/lib/ui/component-canvas-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // Inner (second-level) canvas: one tiny file for its drawer, a PressButton
  // for its LIVE stage. Recursion demo only — see the markup comment below.
  const innerUsage = `<script lang="ts">
  import PressButton from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover grows the shadow, active presses -->
<PressButton variant="primary">deploy</PressButton>`;

  const innerFiles = [{ name: 'src/lib/ui/press-button-usage.svelte', content: innerUsage }];
</script>

<svelte:head>
  <title>component-canvas · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai component-canvas component: the documentation workbench — a LIVE demo stage, an optional Playground controls pane, and a collapsible code drawer combining tree-view with code-card. This page renders it recursively: the LIVE stage holds a simplified second canvas, capped at depth two."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Docs Tooling"
      title="component-canvas — the documentation workbench"
      summary="One bordered surface per component: header (font-nav title, description, Source press button), a LIVE demo stage on the muted tint so components prove themselves on a differently-toned ground, an optional Playground pane of consumer-authored controls, and a collapsible code drawer pairing the tree-view file tree with code-card highlighting. Every component page on this site is one canvas — this one renders the component inside itself."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">LIVE stage · muted tint</span>
        <span class="pill">playground pane</span>
        <span class="pill">tree-view × code-card drawer</span>
        <span class="pill">recursion · depth 2</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the recursive demo -->
  <div id="canvas-workbench" data-region="canvas-workbench" data-reveal="" use:reveal>
    <ComponentCanvas
      title="component-canvas"
      description="The canvas rendering a canvas: the LIVE stage below embeds a simplified second instance. The Playground checkbox toggles the inner pane — and the usage file in this drawer tracks it."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/component-canvas.svelte"
      {files}
      onreset={resetCanvas}
      echo={[{ label: 'inner playground', value: innerPlayground }]}
      resolveFileContent={resolveUsage}
    >
      <!-- Recursion demo, capped at depth 2: the inner canvas is simplified —
           its LIVE stage holds only a PressButton (never a third canvas) and
           its code drawer keeps a single tiny file and stays closed in the
           demo. Unbounded nesting would recurse forever, so the composition
           law is: a canvas may showcase a canvas exactly one level down. -->
      <div class="w-full max-w-[38rem]">
        <ComponentCanvas
          title="press-button"
          description="The inner canvas — a simplified instance living in the outer LIVE stage."
          sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
          files={innerFiles}
        >
          <PressButton variant="primary">deploy</PressButton>
          {#if innerPlayground}
            {#snippet playground()}
              <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
                The optional Playground pane — absent by default, present only when the consumer
                authors it. Toggled from the outer canvas controls.
              </p>
            {/snippet}
          {/if}
        </ComponentCanvas>
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <div class="jx-play-field">
            <Checkbox
              label="inner playground pane"
              labelSide="right"
              checked={innerPlayground}
              onchange={(event) => {
                innerPlayground = event.currentTarget.checked;
              }}
            />
          </div>
          <p class="jx-play-help">
            The pane is a passed snippet: absent when unauthored, so the stage takes the full width
            — exactly the toggle this control flips inside the second-level canvas. The usage file
            in the drawer follows the same truth.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the canvas law: what the platform gives, what the workbench adds -->
  <div id="canvas-law" data-reveal="" use:reveal>
    <SectionCard
      family="canvas-law"
      headerRegion="canvas-law"
      eyebrow="law"
      title="Snippets, containment, collapse — platform first"
      summary="The canvas adds almost no mechanism of its own: every structural behavior is a platform feature composed into the workbench contract, and the seams the page needs (state, reset, live source) are callbacks, never state pushed into the canvas."
    >
      <div class="grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the platform gives</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>Svelte 5 snippets — <code class="text-accent">children</code> and <code class="text-accent">playground</code> are real render seams, so the stage stays LIVE by construction</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>CSS container queries — the side-by-side stage/pane split and the drawer's tree column switch on the canvas's own inline size, not the viewport</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">grid-template-rows: 0fr→1fr</code> + the <code class="text-accent">inert</code> attribute — the drawer collapse and its tab-order removal</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the workbench adds</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the layer law: stage tint (muted 42%) vs playground tint (12%) — components must prove themselves on a differently-toned ground</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the P1 playground protocol: <code class="text-accent">onreset</code> / <code class="text-accent">echo</code> / <code class="text-accent">resolveFileContent</code> — the page owns every byte of state, the canvas only calls back</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>deterministic aria ids slug-derived from the title (SSR/client agree), with the explicit <code class="text-accent">id</code> prop as the documented collision escape</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>
  </div>
</div>
