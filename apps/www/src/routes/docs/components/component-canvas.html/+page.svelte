<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import componentCanvasSource from '$lib/ui/component-canvas/component-canvas.svelte?raw';

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
  import { PlayFields, PlayRow, PlaySelect } from '$lib/playground';
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
    <PlayFields>
      <PlayRow label="variant">
        <PlaySelect bind:value={variant} options={variantOptions} />
      </PlayRow>
    </PlayFields>
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

  // Usage snippet for the Material3 usage section (static, drawer-free).
  const usageCode = `<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
${close}

<!-- files: flat TreeFile list; paths split on "/" build the tree levels -->
<ComponentCanvas
  title="press-button"
  description="hover grows the shadow, active presses on an anchored shadow."
  sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/press-button.svelte"
  files={[{ name: 'src/lib/ui/press-button-usage.svelte', content: usage }]}
>
  <PressButton variant="primary">deploy</PressButton>
</ComponentCanvas>`;
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
  <div data-reveal="">
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
  <div id="canvas-workbench" data-region="canvas-workbench" data-reveal="">
    <ComponentCanvas
      title="component-canvas"
      description="The canvas rendering a canvas: the LIVE stage below embeds a simplified second instance. The Playground checkbox toggles the inner pane — and the usage file in this drawer tracks it."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/component-canvas.svelte"
      {files}
      stage="fill"
      onreset={resetCanvas}
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
          stage="center"
        >
          <PressButton variant="primary">deploy</PressButton>
          {#if innerPlayground}
            {#snippet playground()}
              <PlayFields>
                <PlayHelp>
                  The optional Playground pane — absent by default, present only when the consumer
                  authors it. Toggled from the outer canvas controls.
                </PlayHelp>
              </PlayFields>
            {/snippet}
          {/if}
        </ComponentCanvas>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="inner pane disclosure">
            <PlayToggle bind:value={innerPlayground} />
          </PlayRow>
          <PlayHelp>
            The pane is a passed snippet: absent when unauthored, so the stage takes the full width
            — exactly the toggle this control flips inside the second-level canvas. The usage file
            in the drawer follows the same truth.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the canvas law: what the platform gives, what the workbench adds -->
  <div id="canvas-law" data-reveal="">
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Canvas variants" summary="Stage posture and drawer shape: how the workbench adapts to the specimen it hosts.">
    <div class="grid gap-4 min-[760px]:grid-cols-3">
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">stage="fill"</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">Default — children span the stage width; full-bleed demos.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">stage="center"</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">Intrinsic specimens shrink and center — buttons, badges, single controls.</p></div>
      <div class="border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">stage="start"</span><p class="text-muted-foreground mt-2 text-[13px] leading-6">Intrinsic specimens, packed to the inline-start edge.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Children are the LIVE stage; files feed the drawer; the playground snippet is optional."><CodeBlock code={usageCode} lang="svelte" meta="ComponentCanvas usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The drawer is a disclosure: aria-expanded/controls plus inert keeps collapsed content out of the tab order."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through header, playground controls, then the open drawer' }, { key: 'Enter / Space', action: 'Toggles the code drawer disclosure; triggers copy and reset buttons' }]} aria={[{ name: 'aria-expanded', value: 'boolean', description: 'On the drawer toggle; tracks the 0fr/1fr grid collapse' }, { name: 'aria-controls', value: '{id}-drawer', description: 'Pairs the toggle with the drawer region' }, { name: 'inert', value: 'when collapsed', description: 'Removes collapsed drawer content from tab and screen-reader order' }, { name: 'aria-label', value: 'string', description: 'On the source link, stage ("{title} demo"), controls, and copy button' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The canvas is chrome, not a density-scaled control: it sizes from its own type ramp and container queries, and carries the press shadow tokens for its buttons."><div class="flex flex-col gap-6"><DensityDemo><ComponentCanvas title="canvas" description="density sample" files={innerFiles} stage="center"><PressButton variant="primary">deploy</PressButton></ComponentCanvas></DensityDemo><TokenTable tokens={[{ name: '--jx-press-shadow', default: '0 1px 2px rgb(0 0 0 / 0.08)', source: 'component' }, { name: '--jx-press-shadow-hover', default: 'grown shadow', source: 'component' }, { name: '--jx-press-shadow-active', default: 'anchored press', source: 'component' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the canvas Props interface; snippets are render seams, callbacks keep state page-owned."><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'Component name shown in the header.', required: true }, { name: 'description', type: 'string', default: '—', description: 'One-line description under the title.' }, { name: 'sourceUrl', type: 'string', default: '—', description: 'GitHub source link (header right, icon-only external anchor).' }, { name: 'files', type: 'TreeFile[]', default: '—', description: 'Demo code files; flat list, names may carry paths.', required: true }, { name: 'children', type: 'Snippet', default: '—', description: 'LIVE demo area — the consumer renders the component instance.', required: true }, { name: 'stage', type: "'fill' | 'center' | 'start'", default: "'fill'", description: 'Stage posture: fill, center (intrinsic, centered), or start (intrinsic, left).' }, { name: 'playground', type: 'Snippet', default: '—', description: 'Consumer-authored controls pane; absent pane yields a full-width stage.' }, { name: 'onreset', type: '() => void', default: '—', description: 'Page-owned reset: shows the pane reset button and calls back.' }, { name: 'output', type: 'readonly PlayOutput[]', default: '—', description: 'Read-only state projection rows under the controls.' }, { name: 'resolveFileContent', type: '(file: TreeFile) => string', default: '—', description: 'Code-drawer content override — lets usage files track live state.' }, { name: 'id', type: 'string', default: 'slug(title)', description: 'Explicit id override when two canvases would slug-collide.' }, { name: 'class', type: 'string', default: '—', description: 'Class passthrough to the root element.' }]} /></SectionCard></div>
</div>
