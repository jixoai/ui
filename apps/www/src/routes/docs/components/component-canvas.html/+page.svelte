<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import { registrySourceUrl } from '$lib/registry-source';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import componentCanvasSource from '$lib/ui/component-canvas/component-canvas.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ToC outline: the workbench + the closing law, in page order.

  // Playground: toggles the inner canvas's optional playground dock BODY
  // (absent snippet = the chrome-only dock chip; present = body + chevron).
  let innerPlayground = $state(false);

  // Playground protocol (P1): the page owns the state snapshot.
  const canvasInitial = { innerPlayground: false };
  function resetCanvas(): void {
    innerPlayground = canvasInitial.innerPlayground;
  }

  // Live usage: the sample tracks the toggle — snippet present or absent,
  // exactly what the stage renders (free text would go through q(); the
  // toggle is a closed boolean so it splices structurally instead). The
  // source link is DERIVED from the registry path projection — never a
  // hand-written github href.
  const usageLive = $derived(`<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import PressButton from '@ui/press-button.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayRow, PlaySelect } from '$lib/playground';
${close}

<!-- files: flat TreeFile list; the drawer's tree pane splits their "/"
     paths into levels — one shape at every file count -->
<ComponentCanvas
  title="press-button"
  description="hover grows the shadow, active presses on an anchored shadow."
  install="press-button"
  sourceUrl={registrySourceUrl('press-button')}
  files={[{ name: 'src/lib/ui/press-button-usage.svelte', content: usage }]}
>
  <PressButton variant="fill">deploy</PressButton>${innerPlayground ? `
  {#snippet playground()}
    <PlayFields>
      <PlayRow label="variant">
        <PlaySelect bind:value={variant} options={variantOptions} />
      </PlayRow>
    </PlayFields>
  {/snippet}` : ''}
</ComponentCanvas>`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/component-canvas/component-canvas.svelte', content: componentCanvasSource },
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
<PressButton variant="fill">deploy</PressButton>`;

  const innerFiles = [{ name: 'src/lib/ui/press-button-usage.svelte', content: innerUsage }];

  // Usage snippet for the Material3 usage section (static, drawer-free).
  const usageCode = `<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
${close}

<!-- files: flat TreeFile list; the drawer's tree pane splits their "/"
     paths into levels — one shape at every file count -->
<ComponentCanvas
  title="press-button"
  description="hover grows the shadow, active presses on an anchored shadow."
  install="press-button"
  sourceUrl={registrySourceUrl('press-button')}
  files={[{ name: 'src/lib/ui/press-button-usage.svelte', content: usage }]}
>
  <PressButton variant="fill">deploy</PressButton>
</ComponentCanvas>`;
</script>

<svelte:head>
  <title>Component canvas · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai component-canvas component: the documentation workbench — a full-width LIVE demo stage, the FLOATING playground dock (theme/density chrome on every canvas, a collapsible controls body, horizontally draggable), and a collapsible code drawer combining tree-view with code-card. This page renders it recursively: the LIVE stage holds a simplified second canvas, capped at depth two."
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
      summary="One bordered surface per component: header (font-nav title, description, copy-command badge, Source anchor), a LIVE demo stage on the muted tint so components prove themselves on a differently-toned ground — and, floating over the stage's top-right corner, the playground dock: a collapsed-size chrome row (theme icon button, density select) that ships on EVERY canvas, expanding into consumer-authored controls or schema-lowered rows inside one integrated ItemGroup, collapsible to its head chip and horizontally draggable. Re-theming and re-densifying ride the dock's chrome without touching the page. Below the stage, a collapsible code drawer: the file tree pane beside one code-card, stacking under the canvas's narrow tier. Every component page on this site is one canvas — this one renders the component inside itself."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">LIVE stage · muted tint</span>
        <span class="pill">floating dock · theme + density chrome</span>
        <span class="pill">collapsible · draggable</span>
        <span class="pill">tree drawer · container queries</span>
        <span class="pill">recursion · depth 2</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the recursive demo -->
  <div id="canvas-workbench" data-region="canvas-workbench" data-reveal="">
    <ComponentCanvas
      title="component-canvas"
      description="The canvas rendering a canvas: the LIVE stage below embeds a simplified second instance. The Playground checkbox toggles the inner canvas's dock BODY — its chevron appears and disappears with it — and the usage file in this drawer tracks it. The dock chrome (theme button, density select) re-scopes THIS stage only; the inner canvas's dock keeps its own seats."
      sourceUrl={registrySourceUrl('component-canvas')}
      install="component-canvas"
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
          description="The inner canvas — a simplified instance living in the outer LIVE stage. Its dock chrome re-scopes ITS stage only; the outer canvas keeps its seats (the scoping law). Without a playground snippet, its dock stands as the chrome chip alone."
          sourceUrl={registrySourceUrl('press-button')}
          files={innerFiles}
          stage="center"
        >
          <PressButton variant="fill">deploy</PressButton>
          {#if innerPlayground}
            {#snippet playground()}
              <PlayFields>
                <PlayHelp>
                  The optional playground dock body — absent by default, present only when the
                  consumer authors the snippet. Toggled from the outer canvas's dock.
                </PlayHelp>
              </PlayFields>
            {/snippet}
          {/if}
        </ComponentCanvas>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="inner dock body">
            <PlayToggle bind:value={innerPlayground} />
          </PlayRow>
          <PlayHelp>
            The playground is a passed snippet: absent when unauthored, the dock stands as its
            chrome chip alone — no chevron, no body, exactly what this control flips inside the
            second-level canvas. The usage file in the drawer follows the same truth.
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
              <span>CSS container queries — the dock's <code class="text-accent">clamp(240px, 30cqi, 300px)</code> width and the drawer's tree/code tiers switch on the canvas's own inline size, not the viewport</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">grid-template-rows: 0fr→1fr</code> + the <code class="text-accent">inert</code> attribute — the drawer collapse and its tab-order removal</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">what the workbench adds</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the layer law: the stage's muted tint (42%) under the dock's surface-card ground — components prove themselves on a differently-toned ground while the floating controls sit on true background</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the P1 playground protocol: <code class="text-accent">onreset</code> / <code class="text-accent">output</code> / <code class="text-accent">resolveFileContent</code> — the page owns every byte of state, the canvas only calls back</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>deterministic aria ids slug-derived from the title (SSR/client agree), with the explicit <code class="text-accent">id</code> prop as the documented collision escape</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- the same-source amendment (typography-context-and-parts §7): the
       id is the extraction key; the drawer's usage file may compose
       from the extracted children -->
  <div id="same-source" data-reveal="">
    <SectionCard
      family="same-source"
      headerRegion="same-source"
      eyebrow="law"
      title="Same-source — the id is the extraction key"
      summary="An id-carrying canvas is EXTRACTABLE: the canvasPlugin compiler (packages/vite-plugin, standalone — never the jixoai() umbrella) parses the page and serves its own per-page module, virtual:jixoai-canvas/<route>/+page, whose resolveRawCode(id) returns THIS canvas's children markup — dedented, direct-child canvas-protocol snippets stripped, comments kept, byte-honest. The page composes that string into the usage TreeFile (usageFile from $lib/canvas-usage) and the Usage CodeBlock: one source, two surfaces — the drawer's code sample can never drift from the stage again."
    >
      <div class="flex flex-col gap-3 text-[13px] leading-6">
        <p class="m-0">
          The contract is opt-in per canvas: <strong>no id = no extraction</strong> (zero cost —
          the unextracted posture keeps hand-authored usage samples). An id must be a static
          string literal and unique on its page; the extractor named-errors duplicates and
          non-static ids. The self-containment guard rejects slices that reference page-level
          identifiers (a snippet defined outside the canvas, a page const): the emitted usage
          must be copy-paste-runnable — move the snippet into the canvas or drop the id.
        </p>
        <p class="m-0">
          The same <code class="text-accent">id</code> also feeds the aria slug
          (<code class="text-accent">jx-canvas-&lt;id&gt;-title</code>), so id-carrying canvases
          are collision-free by construction — the explicit-id collision escape and the
          extraction key are ONE mechanism, not two.
        </p>
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
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The code drawer and the dock body are disclosures: aria-expanded/controls plus inert keeps collapsed content out of the tab order. The dock's drag is decorative and pointer-only — every function stays keyboard-reachable without it."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through header, dock chrome and body controls, then the open drawer' }, { key: 'Enter / Space', action: 'Toggles the code drawer and dock disclosures; triggers copy, theme, and reset buttons' }]} aria={[{ name: 'aria-expanded', value: 'boolean', description: 'On the drawer toggle and the dock collapse chevron; tracks the 0fr/1fr grid collapse' }, { name: 'aria-controls', value: '{id}-drawer / {id}-dock-body', description: 'Pairs each toggle with its collapsible region' }, { name: 'inert', value: 'when collapsed', description: 'Removes collapsed drawer and dock-body content from tab and screen-reader order' }, { name: 'aria-pressed', value: 'boolean', description: 'On the dock theme button — carries the light/dark state' }, { name: 'aria-label', value: 'string', description: 'On the source link, the stage ("{title} demo"), the dock ("Controls for {title}"), and copy buttons' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="The canvas is chrome, not a density-scaled control: it sizes from its own type ramp and container queries, and carries the press shadow tokens for its buttons. The dock's theme button and density select are the scoped re-theming surface — they stamp data-theme/data-density (plus the theme sheet's dark/jx-light token-scope classes) on the stage element only."><div class="flex flex-col gap-6"><p class="text-muted-foreground text-[13px] leading-6">the DensityDemo four-copy row is retired by the dock chrome: flip the dock head's theme button or density select above to preview the stage in dark or at any Density rung (xs / sm / default / lg) — the docs chrome, the ToC, and every sibling canvas keep their seats. Toggle state is page-owned through <code class="text-accent">bind:theme</code>/<code class="text-accent">bind:density</code>; the dock itself is a bordered surface card on true background, so it reads on both stage themes.</p><TokenTable tokens={[{ name: '--jx-press-shadow', default: '0 1px 2px rgb(0 0 0 / 0.08)', source: 'component' }, { name: '--jx-press-shadow-hover', default: 'grown shadow', source: 'component' }, { name: '--jx-press-shadow-active', default: 'anchored press', source: 'component' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the canvas Props interface; snippets are render seams, callbacks keep state page-owned."><PropsTable props={[{ name: 'title', type: 'string', default: '—', description: 'Component name shown in the header.', required: true }, { name: 'description', type: 'string', default: '—', description: 'One-line description under the title.' }, { name: 'sourceUrl', type: 'string', default: '—', description: 'GitHub source link (header right, icon-only external anchor). The value is page-side DERIVED from the registry path projection ($lib/registry-source) — never hand-written.' }, { name: 'install', type: 'string', default: '—', description: 'Registry item name — renders the header copy-command badge (npx jixoai-ui add <name>) with a clipboard flash.' }, { name: 'files', type: 'TreeFile[]', default: '—', description: 'Demo code files; flat list, names may carry paths. The drawer\'s tree pane splits their "/" paths into levels — one shape at every file count. Content comes from the page\'s ?raw imports.', required: true }, { name: 'children', type: 'Snippet', default: '—', description: 'LIVE demo area — the consumer renders the component instance.', required: true }, { name: 'stage', type: "'fill' | 'center' | 'start'", default: "'fill'", description: 'Stage posture: fill, center (intrinsic, centered), or start (intrinsic, left).' }, { name: 'scroll', type: "'capped' | 'grow'", default: "'capped'", description: 'Stage scroll posture: capped bounds the scroll layer at min(32rem, 60vh) with native auto-scroll; grow lifts the cap for full-composition demos whose own stacking is the presentation.' }, { name: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Stage preview theme — page-owned bindable, flipped by the dock head\'s icon button. Projects data-theme + the theme sheet dark/jx-light scope onto the stage element only.' }, { name: 'density', type: 'Density', default: "'default'", description: 'Stage preview density — page-owned bindable, the REPO-STANDARD union (xs | sm | default | lg) driven by the dock head\'s select. Stamped as data-density on the stage element directly; the old comfortable/compact mapping is retired.' }, { name: 'playground', type: 'Snippet', default: '—', description: 'Consumer-authored controls, rendered inside the floating dock\'s body — an unauthored playground leaves the dock as its chrome chip (no chevron, no body); the stage is full-width either way. Takes precedence over schema rows (escape-hatch law).' }, { name: 'schema', type: 'CanvasSchema', default: '—', description: 'jsonSchema control mode: a LOWERED schema (toJSONSchema) whose control rows the DOCK renders inside its integrated ItemGroup.' }, { name: 'values', type: 'Record<string, unknown>', default: 'schema defaults', description: 'Schema-mode dock values — two-way; initialized from schema defaults when the page binds none.', bindable: true }, { name: 'onvalue', type: '(key: string, value: unknown) => void', default: '—', description: 'Schema-mode change seam: the page intercepts and owns value semantics for non-representable props (effect builders, …), writing back through bind:values.' }, { name: 'onreset', type: '() => void', default: '—', description: 'Page-owned reset: shows the dock body foot\'s reset button and calls back; absent, schema mode falls back to schema defaults.' }, { name: 'output', type: 'readonly PlayOutput[]', default: '—', description: 'Read-only state projection rows at the dock\'s foot — body-bearing on its own: an output-only canvas still gets a dock body.' }, { name: 'resolveFileContent', type: '(file: TreeFile) => string', default: '—', description: 'Code-drawer content override — lets usage files track live state.' }, { name: 'id', type: 'string', default: 'slug(title)', description: "Explicit aria-id override when two canvases would slug-collide — AND the canvas same-source extraction key: an id-carrying canvas's children are extracted by canvasPlugin into the page's virtual:jixoai-canvas module (resolveRawCode(id) composes the usage file + the Usage CodeBlock; no id = no extraction). See the same-source law above." }, { name: 'class', type: 'string', default: '—', description: 'Class passthrough to the root element.' }]} /></SectionCard></div>
</div>
