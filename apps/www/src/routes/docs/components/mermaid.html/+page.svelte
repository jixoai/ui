<!--
  mermaid — canonical page (katex-mermaid, 2026-09-06). The diagram
  surface: the code-card progressive-enhancement law (source floor →
  lazy SVG swap), token-derived theming, zoom/pan, the standing error
  floor. The page mounts MULTIPLE instances — the render-id collision
  contract's live demo surface (the browser probe asserts distinct svg
  ids). Full demo-standard skeleton: Intro → Install → Usage →
  Examples → API → See Also (in-scope, hard-fail).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import Mermaid from '$lib/ui/mermaid';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { registrySourceUrl } from '$lib/registry-source';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'mermaid')?.summary;
  if (!heroSummary) throw new Error('catalog entry "mermaid" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copies this
  // site runs — one ?raw import (audit P1-A2).
  import mermaidSource from '$lib/ui/mermaid/mermaid.svelte?raw';
  import mermaidEngineSource from '$lib/mermaid-engine.ts?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- diagram sources (runtime string props — the code-card rule) ----
  const flowchartSource = `flowchart TD
    A[write the diagram source] --> B{which engine?}
    B -- math --> C[lib/katex]
    B -- diagram --> D[lib/mermaid-engine]
    C --> E[(registry payload)]
    D --> E
    E --> F[npx jixoai-ui add]
    F --> G[consumer site]`;

  const sequenceSource = `sequenceDiagram
    participant P as page
    participant S as surface
    participant E as engine
    P->>S: mount — the source floor paints (zero JS)
    S->>E: renderDiagram(source, id)
    E->>E: readThemeTokens(themeRoot)
    E->>E: initialize + render (serial queue)
    E-->>S: sanitized svg
    S-->>P: fade-in swap over the floor`;

  const stateSource = `stateDiagram-v2
    [*] --> floor
    floor --> rendering : hydration lazy-loads
    rendering --> rendered : parse ok
    rendering --> error : parse fail
    error --> rendering : source change
    rendered --> rendering : theme flip re-derives
    rendered --> [*]`;

  const pieSource = `pie showData
    title Registry payload share by lane
    "math engine" : 38
    "diagram engine" : 52
    "tokens + utils" : 10`;

  // a source mermaid's parser rejects outright — the error-floor demo
  const invalidSource = `this is not a diagram
    (the parser rejects it)`;

  // ---- workbench: the live flowchart, theme swapped from the playground -
  type DemoTheme = 'auto' | 'light' | 'dark';
  const themeOptions: { value: DemoTheme; label: string }[] = [
    { value: 'auto', label: 'auto (follow the live scope)' },
    { value: 'light', label: 'light (pin)' },
    { value: 'dark', label: 'dark (pin)' },
  ];
  const canvasInitial = { theme: 'auto' as DemoTheme };
  let theme = $state<DemoTheme>(canvasInitial.theme);
  function resetCanvas(): void {
    theme = canvasInitial.theme;
  }

  const usageLive = $derived(`<script lang="ts">
  import Mermaid from '@ui/mermaid';
${close}

<!-- source is a runtime prop; theme follows the site by default -->
<Mermaid name="deploy-flow.mmd" theme=${JSON.stringify(theme)} source={flowchartSource} />`);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/mermaid/mermaid.svelte', content: mermaidSource },
    { name: 'registry/files/lib/mermaid-engine.ts', content: mermaidEngineSource },
    { name: 'src/lib/ui/mermaid-usage.svelte', content: '' },
  ];
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  // static usage sample for the standard Usage section (the workbench
  // drawer above tracks its own live copy)
  const usageCode = `<script lang="ts">
  import Mermaid from '@ui/mermaid';
${close}

<!-- the source prop is a runtime string (the code-card rule);
     the prerendered floor shows it verbatim until hydration swaps
     the rendered svg in -->
<Mermaid
  name="deploy-flow.mmd"
  source={flowchartSource}
/>

<!-- an explicit pin reads the target sheet even under the opposite
     live theme — no observer, no global class mutation -->
<Mermaid theme="dark" source={stateSource} zoomable={false} />`;

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  const mermaidKindsDemo = `<script lang="ts">
  import Mermaid from '@ui/mermaid';

const sequenceSource = \`${sequenceSource}\`;
const stateSource = \`${stateSource}\`;
const pieSource = \`${pieSource}\`;
${close}

<div class="flex flex-col gap-5">
  <div class="border border-border p-4">
    <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
      sequenceDiagram — the surface's own lifecycle
    </p>
    <Mermaid source={sequenceSource} class="w-full max-w-[40rem]" />
  </div>
  <div class="grid gap-5 min-[760px]:grid-cols-2">
    <div class="border border-border p-4">
      <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        stateDiagram-v2 — the data-state machine
      </p>
      <Mermaid source={stateSource} class="w-full" />
    </div>
    <div class="border border-border p-4">
      <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        pie showData — the cScale rides the chart tokens
      </p>
      <Mermaid source={pieSource} class="w-full" />
    </div>
  </div>
</div>`;

  const mermaidKindsFiles: TreeFile[] = [
    { name: 'mermaid-kinds-demo.svelte', content: mermaidKindsDemo, kind: 'usage' },
  ];

  const mermaidThemeDemo = `<script lang="ts">
  import Mermaid from '@ui/mermaid';

const stateSource = \`${stateSource}\`;
${close}

<div class="grid gap-5 min-[760px]:grid-cols-2">
  <div class="flex flex-col gap-2">
    <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
      theme="light" (pinned)
    </p>
    <Mermaid theme="light" source={stateSource} zoomable={false} copyable={false} class="w-full" />
  </div>
  <div class="flex flex-col gap-2">
    <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
      theme="dark" (pinned)
    </p>
    <Mermaid theme="dark" source={stateSource} zoomable={false} copyable={false} class="w-full" />
  </div>
</div>`;

  const mermaidThemeFiles: TreeFile[] = [
    { name: 'mermaid-theme-demo.svelte', content: mermaidThemeDemo, kind: 'usage' },
  ];

  // ---- backdrop demo (Owner 2026-09-15, W2): the fixture pair the
  // contrast probe samples — dark pin on the light stage, veil on/off
  // (TD + short labels: the fixture renders inside the half-grid card
  // without pan overflow, so sampling never meets a scrollbar)
  const backdropSource = `flowchart TD
    A[source floor] --> B[hydrated svg]
    B -- theme flip --> C[re-derived palette]
    B --> D[zoom + pan]
    C --> E([registry payload])
    D --> E`;

  const mermaidBackdropDemo = `<script lang="ts">
  import Mermaid from '@ui/mermaid';
${close}

<div class="grid gap-5 min-[760px]:grid-cols-2">
  <div class="flex flex-col gap-2">
    <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
      theme="dark" + backdrop (default on)
    </p>
    <Mermaid theme="dark" source={backdropSource} zoomable={false} copyable={false} class="w-full" />
  </div>
  <div class="flex flex-col gap-2">
    <p class="font-nav text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
      theme="dark" + backdrop={'{false}'}
    </p>
    <Mermaid theme="dark" backdrop={false} source={backdropSource} zoomable={false} copyable={false} class="w-full" />
  </div>
</div>`;

  const mermaidBackdropFiles: TreeFile[] = [
    { name: 'mermaid-backdrop-demo.svelte', content: mermaidBackdropDemo, kind: 'usage' },
  ];

  const mermaidZoomDemo = `<script lang="ts">
  import Mermaid from '@ui/mermaid';

const sequenceSource = \`${sequenceSource}\`;
${close}

<div class="border border-border p-4">
  <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
    zoom the sequence above 100% and pan
  </p>
  <Mermaid source={sequenceSource} class="w-full max-w-[36rem]" />
</div>`;

  const mermaidZoomFiles: TreeFile[] = [
    { name: 'mermaid-zoom-demo.svelte', content: mermaidZoomDemo, kind: 'usage' },
  ];

  const mermaidErrorDemo = `<script lang="ts">
  import Mermaid from '@ui/mermaid';

const invalidSource = \`${invalidSource}\`;
${close}

<div class="border border-border p-4">
  <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
    a source the parser rejects
  </p>
  <Mermaid source={invalidSource} class="w-full max-w-[36rem]" />
</div>`;

  const mermaidErrorFiles: TreeFile[] = [
    { name: 'mermaid-error-demo.svelte', content: mermaidErrorDemo, kind: 'usage' },
  ];
  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<Mermaid size={18} density="small">…</Mermaid>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/mermaid-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Mermaid diagram · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai mermaid component: the diagram surface — the escaped source paints as a readable zero-JS floor at prerender, hydration lazy-loads the engine and swaps in the sanitized SVG with token-derived theming (auto light/dark follow, explicit pins), zoom and pan over a reserved viewport, and a standing error floor that never disappears on failure."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <!-- page head -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="mermaid — the diagram surface, source floor first"
        summary={heroSummary}
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">based on Mermaid</span>
          <span class="pill">floor → lazy svg swap</span>
          <span class="pill">token-derived palette · auto follow</span>
          <span class="pill">zoom + pan · copy source</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton: Install then Usage sit ABOVE the
         demos — Intro → Install → Usage → Examples → API → See Also -->
    <div data-reveal="">
      <DocsInstall name="mermaid" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Source is always a runtime prop — the code-card rule. The floor (the escaped source, readable, zero JS) paints at prerender; hydration lazy-loads the ~1MB engine and swaps in the rendered, sanitized SVG."
      >
        <CodeBlock code={usageCode} lang="svelte" meta="Mermaid usage" />
      </SectionCard>
    </div>

    <!-- workbench: the live flowchart, theme swapped from the playground -->
    <div id="mermaid-workbench" data-region="mermaid-workbench" data-reveal="">
      <ComponentCanvas
        title="mermaid"
        description="The complete card: filename tab (the name prop), the two-axis pan viewport, the copy control and the zoom trio. The playground swaps the theme mode — auto follows the LIVE scope (the site toggle, or this card's stage when the canvas pins one — scoped containers resolve their own tokens), explicit pins read the target sheet through a local probe wrapper."
        sourceUrl={registrySourceUrl('mermaid')}
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[{ label: 'theme', value: theme }]}
        resolveFileContent={resolveUsage}
      >
        <Mermaid name="deploy-flow.mmd" {theme} source={flowchartSource} class={cx(rt.wFull, rt.mmW34)} />
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="theme">
              <PlaySelect bind:value={theme} options={themeOptions} />
            </PlayRow>
            <PlayHelp>
              <code>auto</code> observes the figure's entire effective scope — flip the site
              theme and the diagram re-derives from the live tokens (hidden probes resolve the
              var() chains; a degraded token falls to its committed safe hex, never a raw
              string). <code>light</code>/<code>dark</code> pin the sheet without touching
              the global root.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- diagram kinds -->
    <div id="mermaid-kinds" data-region="mermaid-kinds" data-reveal="">
      <SectionCard
        family="mermaid-kinds"
        headerRegion="mermaid-kinds"
        eyebrow="diagram kinds"
        title="Sequence, state, pie — every grammar the engine speaks"
        summary="The surface is grammar-agnostic: whatever mermaid parses renders. Each card here is a separate instance — distinct render ids, one shared lazy engine, renders serialized through the engine's promise chain."
      >
        <ComponentCanvas title="mermaid · kinds" stage="fill" files={mermaidKindsFiles}>
          <div class={cx(rt.col20)}>
            <div class={cx(rt.panel)}>
              <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>
                sequenceDiagram — the surface's own lifecycle
              </p>
              <Mermaid source={sequenceSource} class={cx(rt.wFull, rt.maxW40)} />
            </div>
            <div class={cx(rt.grid760a)}>
              <div class={cx(rt.panel)}>
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>
                  stateDiagram-v2 — the data-state machine
                </p>
                <Mermaid source={stateSource} class={cx(rt.wFull)} />
              </div>
              <div class={cx(rt.panel)}>
                <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>
                  pie showData — the cScale rides the chart tokens
                </p>
                <Mermaid source={pieSource} class={cx(rt.wFull)} />
              </div>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <!-- theme follow & pins -->
    <div id="mermaid-theme" data-region="mermaid-theme" data-reveal="">
      <SectionCard
        family="mermaid-theme"
        headerRegion="mermaid-theme"
        eyebrow="theming"
        title="Theme follow is automatic — pins read the target sheet"
        summary="Every themed fill below is derived from the live design tokens: probes inside each figure resolve the var() chains, color-utils converts to mermaid-safe hex, and the one-source-per-field table maps them onto theme 'base'. Auto follows any ancestor flip; an explicit pin stays put."
      >
        <div class={cx(rt.col20)}>
          <ComponentCanvas title="mermaid · theme pins" stage="fill" files={mermaidThemeFiles}>
            <div class={cx(rt.grid760a)}>
              <div class={cx(rt.col8)}>
                <p class={cx(rt.eyebrow, rt.inkMuted)}>
                  theme="light" (pinned)
                </p>
                <Mermaid theme="light" source={stateSource} zoomable={false} copyable={false} class={cx(rt.wFull)} />
              </div>
              <div class={cx(rt.col8)}>
                <p class={cx(rt.eyebrow, rt.inkMuted)}>
                  theme="dark" (pinned)
                </p>
                <Mermaid theme="dark" source={stateSource} zoomable={false} copyable={false} class={cx(rt.wFull)} />
              </div>
            </div>
          </ComponentCanvas>
          <p class={cx(rt.para)}>
            Flip the site's theme toggle and every <code class={cx(rt.inkAccent)}>auto</code> card on
            this page re-renders — the surface passes its own figure as the engine's
            <code class={cx(rt.inkAccent)}>themeRoot</code>, so scoped containers (a
            <code class={cx(rt.inkAccent)}>.jx-light</code> canvas stage, a dark panel) resolve
            THEIR tokens, never the page's. The pinned pair above does not move: explicit
            modes read the target sheet through a temporary local wrapper — the values come
            out right even under the opposite live root, and the global root is never mutated.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- the dark backdrop (Owner 2026-09-15, W2) -->
    <div id="mermaid-backdrop" data-region="mermaid-backdrop" data-reveal="">
      <SectionCard
        family="mermaid-backdrop"
        headerRegion="mermaid-backdrop"
        eyebrow="backdrop"
        title="The dark backdrop is subtractive ink — never a tint"
        summary="When the EFFECTIVE theme is dark, the viewport paints a designed veil built on backdrop-filter: a blur + contrast/brightness chain SUBTRACTS the page behind toward the dark ground. The veil layer itself paints zero background (the subtraction ink law), in a rounded, padded, 1px-bordered box — replacing the opaque hard-edge fill this surface used to paint."
      >
        <div class={cx(rt.col20)}>
          <ComponentCanvas title="mermaid · backdrop" stage="fill" files={mermaidBackdropFiles}>
            <div class={cx(rt.grid760a)}>
              <div class={cx(rt.col8)}>
                <p class={cx(rt.eyebrow, rt.inkMuted)}>
                  theme="dark" + backdrop (default on)
                </p>
                <Mermaid
                  theme="dark"
                  source={backdropSource}
                  zoomable={false}
                  copyable={false}
                  class={cx(rt.wFull)}
                  data-testid="backdrop-on"
                />
              </div>
              <div class={cx(rt.col8)}>
                <p class={cx(rt.eyebrow, rt.inkMuted)}>
                  theme="dark" + backdrop={'{false}'}
                </p>
                <Mermaid
                  theme="dark"
                  backdrop={false}
                  source={backdropSource}
                  zoomable={false}
                  copyable={false}
                  class={cx(rt.wFull)}
                  data-testid="backdrop-off"
                />
              </div>
            </div>
          </ComponentCanvas>
          <p class={cx(rt.para)}>
            The veil rides the <code class={cx(rt.inkAccent)}>EFFECTIVE</code> theme — the same token
            resolution the palette uses: a dark pin on this light stage veils (the left card),
            <code class={cx(rt.inkAccent)}>theme="auto"</code> inside a dark scope veils, and light
            themes never paint a backdrop. <code class={cx(rt.inkAccent)}>backdrop={'{false}'}</code>
            (the right card) opts out to full transparency. Where
            <code class={cx(rt.inkAccent)}>backdrop-filter</code> is unsupported, the component's own
            opaque theme-ground fill returns — the diagram never loses its ground. The dark
            palette's node fills are lifted toward white through their own tokens so fills,
            borders, labels, and connectors clear the WCAG thresholds on the subtractive ground
            (labels ≥ 4.5:1, graphics ≥ 3:1 — probe-sampled receipts in this change's
            research/w2/).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- zoom & pan -->
    <div id="mermaid-zoom" data-region="mermaid-zoom" data-reveal="">
      <SectionCard
        family="mermaid-zoom"
        headerRegion="mermaid-zoom"
        eyebrow="controls"
        title="Zoom & pan — a pure transform"
        summary="The zoom trio steps ±0.25 (clamped 0.5–3) and resets to 1; the scale rides a transform on the inner wrapper while the viewport becomes the pan surface. No re-render, no engine call — zooming never queues a render."
      >
        <div class={cx(rt.col20)}>
          <ComponentCanvas title="mermaid · zoom & pan" stage="fill" files={mermaidZoomFiles}>
            <div class={cx(rt.panel)}>
              <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>
                zoom the sequence above 100% and pan
              </p>
              <Mermaid source={sequenceSource} class={cx(rt.wFull, rt.maxWXl)} />
            </div>
          </ComponentCanvas>
          <p class={cx(rt.para)}>
            The viewport is the recorded two-axis exemption from the shared scroll-run system:
            a pan surface for scaled content is not a linear overflow strip, so it rides the
            theme's thin currentColor scrollbars on BOTH axes and mounts no nudge chips or
            edge veils — math-block's horizontal strip is the surface that rides the full
            shared contract instead.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- error floor -->
    <div id="mermaid-error" data-region="mermaid-error" data-reveal="">
      <SectionCard
        family="mermaid-error"
        headerRegion="mermaid-error"
        eyebrow="errors"
        title="A parse failure keeps the floor standing"
        summary="data-state=error paints the error summary strip (the diagnostic's first line) ABOVE the source floor — the floor never disappears on failure, the same fallback law as code-card."
      >
        <div class={cx(rt.col20)}>
          <ComponentCanvas title="mermaid · error floor" stage="fill" files={mermaidErrorFiles}>
            <div class={cx(rt.panel)}>
              <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>
                a source the parser rejects
              </p>
              <Mermaid source={invalidSource} class={cx(rt.wFull, rt.maxWXl)} />
            </div>
          </ComponentCanvas>
          <p class={cx(rt.para)}>
            Fix the source and the next render succeeds — the engine's serial queue is
            rejection-recovering, so a failed render never poisons the next one. The summary
            strip's vocabulary is localizable through <code class={cx(rt.inkAccent)}>labels.renderError</code>.
          </p>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The viewport is a role=img with a NON-EMPTY accessible name at all times — the trimmed ladder name → labels.diagram → 'Diagram'; the floor is a readable pre; every control is a real button."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Reaches the copy control, then zoom out / reset / in (real buttons, press physics)' },
          { key: 'Enter / Space', action: 'Activates the focused control' },
          { key: 'scroll', action: 'Pans the scaled diagram inside the viewport (both axes)' },
        ]}
        aria={[
          { name: 'role="img"', value: 'on the viewport', description: 'The diagram region, named at all times — an empty-string name falls through the ladder rather than mounting a nameless img.' },
          { name: 'aria-label', value: 'name | labels.diagram | Diagram', description: 'The trimmed ladder: consumer name first, the localized diagram label second, the shipped English last.' },
          { name: 'aria-label', value: 'copy / zoom in / zoom out / reset', description: 'On the controls; the copy label flips for the 1.6s feedback window.' },
          { name: 'role="status"', value: 'on the error strip', description: 'The render-error summary announces itself; the source floor below keeps standing.' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Tokens"
      summary="The shell borrows the readonly-code formulas (self-sufficient with only the jixoai-theme sheet installed); the diagram palette itself derives from the live tokens through the probe pipeline."
    >
      <TokenTable
        tokens={[
          { name: '--readonly-code-bg / -border', default: 'muted/background mixes', source: 'color', description: 'The card shell — the code-card visual language, mirrored with .dark and .jx-light re-flips.' },
          { name: '--readonly-code-meta-bg / -fg', default: 'accent mixes', source: 'color', description: 'The filename tab strip and the error summary tint.' },
          { name: '--jx-mermaid-floor-min', default: '6rem', source: 'structural', description: 'The CLS reserve while the floor stands or a render is in flight — consumer-tunable; a diagram\u2019s true height is unknowable pre-render.' },
          { name: '--scrollbar-thumb*', default: 'currentColor thin', source: 'color', description: 'The pan viewport\u2019s two-axis scrollbar law (the theme sheet\u2019s global rule).' },
          { name: 'themeVariables', default: 'derived from live tokens', source: 'color', description: 'mainBkg/textColor/lineColor/cScale… from the one-source-per-field table; user config overlays field-wise above.' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. SEVEN lanes — the engine-token theme literal owns the theme name (the code-card precedent, §13 rules no rename); the axis surface rides the figure root, the diagram engine itself stays outside the supply set."
    >
      <ComponentCanvas title="Mermaid · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Mermaid source={'flowchart LR\n  axes[size] --> engine{render}'} name="axes.mmd" size={18} density="small" /></div>
<div class={cx(rt.panel)}><Mermaid source={'flowchart LR\n  named[steps resolve via the alias ladder]'} name="steps.mmd" size="medium" radius="large" /></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Ten props plus the HTML rest; source is the only required one — everything else is composition."
    >
      <PropsTable universal
        props={[
          { name: 'source', type: 'string', default: '—', description: 'Diagram source (runtime prop — the code-card rule: never markup-inlined text).', required: true },
          { name: 'name', type: 'string', default: '—', description: 'Head tab label + the render-id base (sanitized to [a-z0-9-]; illegal input falls to the jx-mermaid default).' },
          { name: 'theme', type: "'auto' | 'light' | 'dark'", default: "'auto'", description: "'auto' follows the live theme across the figure's effective scope (any ancestor flip re-renders); explicit pins read the target sheet." },
          { name: 'backdrop', type: 'boolean', default: 'true', description: 'The dark veil switch: when the EFFECTIVE theme is dark, the viewport paints a subtractive backdrop-filter veil (blur + contrast/brightness chain, zero background ink — the subtraction ink law) in a rounded, padded, 1px-bordered box; false = no veil and no ground (transparent, exactly as a light surface). Degrades to the component\u2019s own opaque theme-ground fill where backdrop-filter is unsupported.' },
          { name: 'copyable', type: 'boolean', default: 'true', description: 'Copy control on the footer bar (payload = the raw source, press physics, clipboard fallback).' },
          { name: 'zoomable', type: 'boolean', default: 'true', description: 'Zoom trio — ±0.25 steps clamped 0.5–3, reset; a pure transform, no engine call.' },
          { name: 'labels', type: 'MermaidLabels', default: '—', description: 'Localization payload: { copy, copied, zoomIn, zoomOut, zoomReset, renderError, diagram }; absent = English verbatim.' },
          { name: 'config', type: 'MermaidConfig', default: '—', description: "mermaid's own config — the engine's precedence ladder applies (startOnLoad/securityLevel/theme are protected; user themeVariables overlay field-wise over the derived palette)." },
          { name: 'class', type: 'string', default: "''", description: 'Merged onto the figure through cn().' },
          { name: '…rest', type: 'HTMLAttributes<HTMLElement>', default: '—', description: 'Spread onto the figure BEFORE the component\u2019s own data-kind/data-jx-mermaid stamps — consumer attributes land, component semantics stay un-overridable.' },
        ]}
      />
    </SectionCard>
  </div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div data-reveal="">
    <DocsSeeAlso name="mermaid" />
  </div>
</div>
