<!--
  Docs page for the component-canvas family (MDN archetype,
  docs-eight-axes-mdn task 7, quill 2026-09-22; tier 2 over the W7-era
  page — the recursion demo, schema-driven lanes demo, motion seat and
  same-source law survive verbatim, the skeleton re-orders to the
  archetype and gains the generated props table + the per-axis table).
  Order: hero → install → overview → usage → the recursive workbench →
  props (GENERATED meta + docs curation, extra lane rescuing the two
  §13 seats) → the eight axes (per-axis table + the six-lane schema
  demo + one real query() case) → same-source → accessibility →
  see-also. Baseline skill: openspec/changes/docs-eight-axes-mdn/
  skills/mdn-doc-style.md §2. Original ask: document the canvas family
  AS IT SHIPS after W7 (the eight-axis playground bar) — measured from
  source, not memory. The family itself is untouchable from here.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import { registrySourceUrl } from '$lib/registry-source';
  import { query } from '$lib/universal-props-query.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import componentCanvasSource from '$lib/ui/component-canvas/component-canvas.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

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

  // Usage snippet for the usage section (static, drawer-free).
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the six-lane schema demo (explicit-props W3-D5; W4 4.2 wires
  // the per-axis CONTROLS; the W7 bar rides underneath) --------------------
  // The canvas's own generated meta (six axis lanes) lowers through
  // toJSONSchema — the axis props surface as axis-enum/axis-number/
  // query-editor rows in the dock. The page owns the lane state: the
  // bound `values` record carries values[<axis>] (the mode/named
  // lane), values['<axis>:number'] (the exact number) and
  // values['<axis>:query'] (the query() source); the deriveds below
  // resolve each record into ONE lane prop — named step verbatim,
  // number verbatim, query() through parseQuerySource + query() — and
  // 'auto' resolves to undefined (stamps nothing, the ambient flows).
  // Flipping a control re-stamps the stage live: the carriers are the
  // W3-D5 surface, these controls only drive them.
  import { annotations as canvasAnnotations, meta as canvasMeta } from '$lib/meta/component-canvas.meta';
  import { COMPONENT_CANVAS_DOCS as CANVAS_DOCS } from '$lib/ui/props-table/docs/component-canvas.docs';
  import { withAnnotations } from '$lib/schema/ir';
  import { toJSONSchema } from '$lib/schema/lower';
  import { axisLaneOf, axisStepsOf } from '$lib/schema/axis-controls.svelte';
  import { stampCarriersForLanes } from '$lib/defaults.svelte';
  import type {
    ColorLane,
    ElevationLane,
    MotionLane,
    RadiusLane,
    ShapeLane,
    SizeLane,
  } from '$lib/defaults.svelte';

  const axisSchemaFull = toJSONSchema(withAnnotations(canvasMeta, canvasAnnotations));
  // the panel scope: the demo's dock carries the SIX axis controls
  // only — the canvas's own chrome props (title/stage/scroll/…) are
  // page-owned here, not dock-driven (the press-button page shows the
  // full-props form of the same pipeline)
  const CANVAS_AXES = ['size', 'shape', 'radius', 'color', 'elevation', 'motion'] as const;
  const axisSchema = {
    ...axisSchemaFull,
    properties: Object.fromEntries(
      CANVAS_AXES.map((axis) => [axis, axisSchemaFull.properties[axis]]),
    ),
    required: [],
  };
  let axisValues: Record<string, unknown> | undefined = $state();

  const dSize = $derived(axisLaneOf<SizeLane>('size', axisStepsOf(canvasMeta, 'size'), axisValues));
  const dShape = $derived(axisLaneOf<ShapeLane>('shape', axisStepsOf(canvasMeta, 'shape'), axisValues));
  const dRadius = $derived(axisLaneOf<RadiusLane>('radius', axisStepsOf(canvasMeta, 'radius'), axisValues));
  const dColor = $derived(axisLaneOf<ColorLane>('color', axisStepsOf(canvasMeta, 'color'), axisValues));
  const dElevation = $derived(
    axisLaneOf<ElevationLane>('elevation', axisStepsOf(canvasMeta, 'elevation'), axisValues),
  );
  const dMotion = $derived(axisLaneOf<MotionLane>('motion', axisStepsOf(canvasMeta, 'motion'), axisValues));

  // the SPECIMEN-SCOPE re-stamp (W6-r3): the stage's island scope
  // (.jx-light/.dark) re-declares the theme-profile carrier
  // --jx-color-effective so substitution re-runs per profile (the
  // canvas-bug law) — which also means the canvas ROOT's §11 stamp
  // cannot cross the island: the stage subtree resolves the scope's
  // own declaration, never the root's. The specimen wrapper therefore
  // stamps the SAME resolved lanes element-level, BELOW the island —
  // the §11 law's own shape (a family root stamps its carriers), here
  // the demo's specimen scope. Recorded for the W-next protocol pass:
  // a supply/effective two-var split would let scopes compose from an
  // upstream stamp instead of shadowing it.
  const axisRestamp = $derived(
    stampCarriersForLanes({
      size: dSize,
      shape: dShape,
      radius: dRadius,
      color: dColor,
      elevation: dElevation,
      motion: dMotion,
    }),
  );

  // the schema demo's drawer file — the REAL mechanism, not a mock
  const axesUsage = `<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import PressButton from '@ui/press-button.svelte';
  import { meta, annotations } from '$lib/meta/component-canvas.meta';
  import { withAnnotations } from '$lib/schema/ir';
  import { toJSONSchema } from '$lib/schema/lower';
${close}

<!-- the family's own generated meta lowers to dock rows; the page
     owns the lane state and drives the six explicit lane props -->
<ComponentCanvas
  title="component-canvas · the six explicit lanes"
  files={files}
  schema={toJSONSchema(withAnnotations(meta, annotations))}
  bind:values
  {size} {shape} {radius} {color} {elevation} {motion}
>
  <!-- seats: an em-keyed caption (size), anchor panels (radius), a
       fill button (shape/color/elevation), a sweep bar (motion) -->
  <div style={axisRestamp || undefined}>
    <p style="font-size: 0.875em">size keys the root font-size — this caption rides em</p>
    <PressButton variant="fill" {size} {shape} {radius} {color} {elevation} {motion}>
      fill seat — color re-hues, elevation re-shadows
    </PressButton>
    <div data-cc-axis-motion-seat aria-hidden="true"><span data-cc-axis-motion-bar></span></div>
  </div>
</ComponentCanvas>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/canvas-axes-demo.svelte', content: axesUsage },
  ];

  // ---- the ONE query() case: responsive size on a dedicated canvas -------
  const queryUsage = `<script lang="ts">
  import ComponentCanvas from '@ui/component-canvas.svelte';
  import { query } from '$lib/universal-props-query.svelte';
${close}

<!-- the explicit size lane wraps query(): SSR paints the base (14px);
     at the md viewport rung (≥48rem) the root font-size steps to 18px
     and the em-keyed caption follows -->
<ComponentCanvas title="responsive size" files={files} size={query({ md: 18 }, 14)}>
  <p style="font-size: 0.875em">this caption rides em off the root font-size</p>
</ComponentCanvas>`;
  const queryFiles: TreeFile[] = [
    { name: 'src/lib/ui/canvas-query-demo.svelte', content: queryUsage },
  ];

  // ---- the per-axis table (skill §2.5): mechanism names are the REAL
  // carriers the family stamps (component-canvas.svelte barLanes →
  // stampCarriersForLanes on the workbench section); consumption per
  // the grep receipt: ZERO effective-carrier consumers in the family's
  // own paint (component-canvas.css + surface/component-canvas.stylex.ts)
  const axisRows = [
    {
      name: 'size',
      type: '--jx-size-effective → root font-size',
      default: 'auto',
      description:
        "Stamps the workbench section and re-bases its font-size. The chrome does not follow — the head title, description and labels read fixed kernel channels (--jx-text, --jx-text-small, --jx-text-label, --jx-text-micro) — but the STAGE inherits the root font-size, so em-keyed specimens move with it (the query() demo below). Seat pair: an explicit prop beats the bar for that axis (the bar is honestly inert there). Steps small · medium · large; a number is px; query() wraps any lane.",
    },
    {
      name: 'shape',
      type: '--jx-shape-effective · --jx-radius-factor-effective',
      default: 'auto',
      description:
        "Both carriers stamp on the section; no canvas css reads them — the corner consumers are the stage's own (a press-button specimen's corner-shape rides the supply). Steps round · scoop · bevel · notch · square · squircle; no number lane.",
    },
    {
      name: 'radius',
      type: '--jx-radius-effective',
      default: 'auto',
      description:
        'The carrier stamps; no canvas css reads it — the concentric consumers are elsewhere (card, press-button). The schema demo\'s anchor panels pin --jx-radius-effective + --jx-inset-effective so the auto seat\'s §3 expression computes live. Steps small · medium · large; a number is px.',
    },
    {
      name: 'density',
      type: "the stage's data-density rung · the bar's lane supply",
      default: 'auto',
      description:
        "TWO SEATS, one name (the §13 no-rename law). The PROP is the rung seat: a page-owned 'xs' | 'sm' | 'default' | 'lg' bindable stamped as data-density on the STAGE element — the demo subtree's scope boundary; the ambient zone never rides the stage, and the prop's own default ('default', through the legacy slot) keeps a --jx-density-coefficient: 1 stamp on the workbench root (grep any canvas root). The AXIS lane is the supply seat: the dock bar's density menu speaks the universal grammar (auto/small/medium/large) into the same root resolution as the other six lanes. Separate channels since the bar retired the rung select (the W7 directive, 2026-09-21).",
    },
    {
      name: 'color',
      type: '--jx-color-effective',
      default: 'auto',
      description:
        "The carrier stamps; no canvas css reads it. One caveat the schema demo makes visible: the stage's island scope (.dark/.jx-light + the token-scope stamp) re-declares this carrier per theme profile (the canvas-bug law), so a root color stamp cannot cross the island — the demo re-stamps the resolved lanes element-level below it. Steps primary · secondary · error · warn · success · info; a number is hue degrees; a raw string passes through verbatim.",
    },
    {
      name: 'theme',
      type: "the stage's data-theme + token-scope classes",
      default: 'auto',
      description:
        "The §13-owned preview seat, not the universal ThemeLane: a page-owned 'light' | 'dark' bindable projects data-theme plus the theme sheet's dark/jx-light token-scope classes onto the STAGE element only — the docs chrome and sibling canvases never re-theme, and the stage anchors its own text ink. The bar's theme button flips it (aria-pressed carries state). The universal theme lane itself forwards ambient-only through inheritance (the census D-fold, W6-dossier-flagged beside code-card/mermaid).",
    },
    {
      name: 'elevation',
      type: '--jx-elevation-effective',
      default: 'auto',
      description:
        'The carrier stamps; no canvas css reads it — the supply is ambient (the schema demo\'s fill seat re-shadows through press-button\'s §7 pair). Steps level-1 · level0 · level1 · level2 · level3 · level4 · level5; a number is exact dp.',
    },
    {
      name: 'motion',
      type: '--jx-motion-effective',
      default: 'auto',
      description:
        'The carrier stamps; no canvas css reads it. The page owns the one rest-state consumer: the sweep seat below divides its period by the coefficient (expressive 1.5 speeds it, subtle 0.5 slows it; reduced motion freezes it into a width gauge). Steps reduced · subtle · normal · expressive; a number is a coefficient.',
    },
  ];

  // the chrome's fixed voices: what the workbench paint actually reads
  // (none of it is an axis carrier — the receipts behind the supply-only
  // rows). surface/component-canvas.stylex.ts + component-canvas.css.
  const fixedTokens = [
    { name: '--jx-text', default: 'rung channel (13px at default)', source: 'structural' as const, description: 'The head title\'s voice — the ambient page rung\'s channel, not the canvas\'s size lane.' },
    { name: '--jx-text-small', default: '12.5px', source: 'structural' as const, description: 'The description line.' },
    { name: '--jx-text-label', default: '11px', source: 'structural' as const, description: 'The install badge, code toggle and dock labels.' },
    { name: '--jx-text-micro', default: '10px', source: 'structural' as const, description: 'The file count and micro chrome.' },
    { name: '--jx-hit', default: 'rung channel', source: 'structural' as const, description: 'The chrome band: header actions, install badge and source anchor ride calc(var(--jx-hit) + 2px).' },
    { name: '--jx-press-shadow', default: 'per-element tuning', source: 'structural' as const, description: 'The press-channel poses: none on install/copy, shadow-2xs/xs on the source anchor and code toggle (component-canvas.css).' },
  ];

</script>

<svelte:head>
  <title>Component canvas · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai component-canvas component: the documentation workbench — a full-width LIVE demo stage, the FLOATING playground dock (the EIGHT-AXIS bar on every canvas: the theme cycle plus one icon-button menu per axis over a scrollable ButtonGroup, a collapsible controls body, horizontally draggable — the axis lanes supplied to the stage as ambient, never forced), and a collapsible code drawer combining tree-view with code-card. This page renders it recursively: the LIVE stage holds a simplified second canvas, capped at depth two."
  />
  <!-- the motion SEAT (W6-r3): a pure-css sweep whose period divides by
       the §8 coefficient — the one specimen that visibly answers a
       motion flip at rest (duration = 2.4s ÷ --jx-motion-effective;
       expressive 1.5 → 1.6s, subtle 0.5 → 4.8s). The hook rides DATA
       ATTRIBUTES in this global head style — the jx data-hook pattern,
       invisible to the class-identity census (the tailwindless ratchet
       stays unmoved); the reduced-motion pose becomes a static
       coefficient GAUGE (width = 28% × the coefficient) so the axis
       keeps a rest-state seat under the capture default. -->
  <style>
    [data-cc-axis-motion-seat] {
      position: relative;
      block-size: 6px;
      inline-size: min(100%, 22rem);
      background: color-mix(in oklab, var(--foreground) 8%, transparent);
      overflow: hidden;
    }
    [data-cc-axis-motion-bar] {
      position: absolute;
      inset-block: 0;
      inline-size: 28%;
      background: var(--jx-color-effective, var(--primary));
      animation: cc-axis-sweep calc(2.4s / var(--jx-motion-effective, 1)) linear infinite;
    }
    @keyframes cc-axis-sweep {
      from {
        transform: translateX(-100%);
      }
      to {
        /* the bar's own width is 28% of the track — the end pose parks
           it fully past the right edge (100%/0.28 + 100% of own width) */
        transform: translateX(calc(100% / 0.28 + 100%));
      }
    }
    @media (prefers-reduced-motion: reduce) {
      /* the static pose is still a COEFFICIENT GAUGE (W6-r3): the bar's
         width reads the intensity (28% × the coefficient) so the motion
         axis keeps a rest-state seat under the capture default — reduced
         users and the harness see expressive widen the gauge, subtle
         narrow it */
      [data-cc-axis-motion-bar] {
        animation: none;
        transform: none;
        inline-size: calc(28% * var(--jx-motion-effective, 1));
      }
    }
  </style>
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->
  <div class={cx(rt.shellCol)}>

  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Docs Tooling"
      title="component-canvas — the documentation workbench"
      summary="One bordered surface per component: a LIVE demo stage, the floating playground dock — the eight-axis bar on every canvas — and a collapsible code drawer. Every component page on this site is one canvas; this one renders the component inside itself."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">LIVE stage · muted tint</span>
        <span class="pill">floating dock · the eight-axis bar</span>
        <span class="pill">supply-not-force · ambient lanes</span>
        <span class="pill">collapsible · draggable</span>
        <span class="pill">tree drawer · container queries</span>
        <span class="pill">recursion · depth 2</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="component-canvas" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="Three regions and a platform-first law: the header, the stage, the dock, the drawer — every structural behavior is a platform feature composed into the workbench contract."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          ComponentCanvas is the documentation workbench: a header (font-nav title, description,
          copy-command <code>install</code> badge, icon-only <code>sourceUrl</code> anchor), a LIVE
          demo stage on the muted tint so components prove themselves on a differently-toned
          ground, the floating playground dock over the stage's top-right corner, and a collapsible
          code drawer pairing a file tree with one code-card. The page owns every byte of state
          through the P1 protocol — <code>onreset</code>, <code>output</code>,
          <code>resolveFileContent</code> are callbacks, never state pushed into the canvas.
        </p>
        <p class={cx(rt.measurePara)}>
          Platform first: the stage and dock are Svelte 5 snippets (render seams, live by
          construction), the drawer tiers and the dock's width switch on CSS container queries (the
          host tier <code>@container/jx-canvas-host</code> at 48rem; the named demo container rides
          the scrollport itself, so demo queries see the width the scrollbar actually leaves), and
          the collapses are <code>grid-template-rows: 0fr→1fr</code> with <code>inert</code> keeping
          closed content out of the tab order. The workbench adds the layer law (muted stage under
          a surface-card dock), the outline law — the root carries <code>data-toc-skip</code> and
          the title is a styled paragraph, so no canvas chrome joins a ToC — and deterministic
          aria ids slug-derived from the title.
        </p>
        <p class={cx(rt.measurePara)}>
          The dock ships on EVERY canvas: its head is the eight-axis bar (below), and a canvas
          without a playground snippet, schema, or output stands as the bar alone — no chevron, no
          body. Stage posture (<code>fill</code>/<code>center</code>/<code>start</code>) and the
          scroll cap (<code>capped</code>/<code>grow</code>) are props; the id is also the
          same-source extraction key (its own section below). This page's demo nests one simplified
          canvas inside the stage — a canvas may showcase a canvas exactly one level down.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- usage -->
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Children are the LIVE stage; files feed the drawer; the playground snippet is optional."
    >
      <CodeBlock code={usageCode} lang="svelte" meta="ComponentCanvas usage" />
    </SectionCard>
  </div>

  <!-- workbench: the recursive demo -->
  <div id="canvas-workbench" data-region="canvas-workbench" data-reveal="">
    <ComponentCanvas
      title="component-canvas"
      description="The canvas rendering a canvas: the LIVE stage below embeds a simplified second instance. The Playground checkbox toggles the inner canvas's dock BODY — its chevron appears and disappears with it — and the usage file in this drawer tracks it. The dock bar (the eight axes) re-scopes THIS canvas's supply only; the inner canvas's dock keeps its own seats."
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
      <div class={cx(rt.wFull, rt.ccnMaxW)}>
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
          <PlayHelp>
            The dock bar above is the EIGHT-AXIS bar: theme (the sun/moon cycle, page-owned
            bindable) plus one menu per axis — size · shape · radius · density ·
            color · elevation · motion, each `auto` by default. The bar's values are SUPPLIED,
            never forced: this stage's deploy button and the inner canvas consume them as ambient
            lanes (flip size or color and watch them re-stamp), while the plain text around
            them ignores the lanes entirely — both are correct, the freedom is the specimen's.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- props: the GENERATED meta + docs curation -->
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="Props"
      summary="The table renders from the GENERATED meta; the six axis-lane rows split into the shared section beneath. theme and density are family seats sharing axis names (the §13 no-rename law) — the generated filter would drop them, so they render from the extra lane with their real unions (the chip precedent, self-documenting here)."
    >
      <PropsTable meta={canvasMeta} docs={CANVAS_DOCS} />
    </SectionCard>
  </div>

  <!-- the eight axes -->
  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on component-canvas"
      summary="SIX axes join the workbench section as page-owned props (the W3-D5 surface): size · shape · radius · color · elevation · motion — each resolved under the consumer's explicit lane, stamped as §11 carriers joined into the root style attr, and supplied downward through the broadcast protocol (吃也供, supply-and-consume). The W7 eight-axis bar is the second seat: dock-owned lane state (all-auto seed) joined explicit ?? bar — a page-owned prop always wins, the bar is honestly inert there — and `auto` translates to no opinion, the ambient keeps flowing. Supply, never force: any stage specimen may consume or ignore the lanes. None of the six repaints the canvas's own chrome (the fixed-voice table below); the seats are the stage's specimens. theme and density are the §13-owned stage-preview seats documented in their rows."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or seat it drives on
          THIS family, Default is the lane default — the named steps, number unit, and consumption
          on this family are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the six-lane adoption is the census fold row — component-canvas
          carries SIX lanes, theme LEFT OUT (the stage-preview bindable owns the name) and
          density's universal lane absent at the fold while the legacy local
          <code>densitySlot('default')</code> stayed (both under the §13 no-rename law,
          W6-dossier-flagged beside code-card/mermaid;
          openspec/changes/explicit-props/research/migration-census.md). The W7 bar — the Owner's
          eight-axis directive (2026-09-21) — later gave the density AXIS its supply seat beside
          the other six. No §13 renames; the two name-shadowing seats ride the generated table's
          extra lane.
        </p>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={fixedTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the six lanes, driven" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            title="component-canvas · the six explicit lanes"
            stage="fill"
            files={universalFiles}
            schema={axisSchema}
            bind:values={axisValues}
            size={dSize}
            shape={dShape}
            radius={dRadius}
            color={dColor}
            elevation={dElevation}
            motion={dMotion}
          >
            <!-- the W6-r3 specimen rework: every driven axis needs a seat
                 that visibly CONSUMES it (the r1 frames were byte-identical
                 for color/elevation/motion — honest evidence, poor
                 pedagogy). Seats, one per axis:
                 · size — the em-keyed captions (root font-size moves them)
                 · shape/radius — the §3 anchor supply on each panel (auto
                   children compute max(0px, 20−14) = 6px; squircle ×2 =
                   12px superellipse — a corner to curve)
                 · color — the fill button (its --jx-fill re-derives from
                   --jx-color-effective on the family root, W6-r3)
                 · elevation — the fill button's rest shadow (the §7 pair
                   re-points --jx-press-shadow, W6-r3)
                 · motion — the sweep bar below (duration ÷ the motion
                   coefficient; expressive visibly speeds it)
                 The wrapper carries the specimen-scope re-stamp (see the
                 script note): the six lanes reach the seats element-level,
                 past the island's carrier re-declaration. -->
            <div class={cx(rt.col20)} style={axisRestamp || undefined}>
            <div class={cx(rt.panel)} style="--jx-radius-effective: 20px; --jx-inset-effective: 0.875rem">
              <p class={cx(rt.pb8, rt.textVar2)} style="font-size: 0.875em">
                size keys the root font-size — this caption rides em, the parts follow
              </p>
              <div class={cx(rt.wrap12)}>
                <PressButton variant="outline" radius="auto">radius auto — concentric off the anchor seat</PressButton>
                <!-- the DRIVEN specimen (the pb-page pattern): the fill seat
                     takes the six resolved lanes directly — family-root
                     stamps cross no island, so color/elevation/radius/shape
                     all repaint this button live -->
                <PressButton
                  variant="fill"
                  size={dSize}
                  shape={dShape}
                  radius={dRadius}
                  color={dColor}
                  elevation={dElevation}
                  motion={dMotion}
                >fill seat — color re-hues, elevation re-shadows</PressButton>
              </div>
            </div>
            <div class={cx(rt.panel)} style="--jx-radius-effective: 20px; --jx-inset-effective: 0.875rem">
              <p class={cx(rt.pb8, rt.textVar2)} style="font-size: 0.875em">
                motion keys the sweep — expressive halves the period, reduced freezes it
              </p>
              <div data-cc-axis-motion-seat="" aria-hidden="true">
                <span data-cc-axis-motion-bar=""></span>
              </div>
            </div>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            title="component-canvas · responsive size"
            stage="fill"
            files={queryFiles}
            size={query({ md: 18 }, 14)}
          >
            <div class={cx(rt.col20)}>
              <p class={cx(rt.pb8, rt.textVar2)} style="font-size: 0.875em">
                this caption rides em off the root font-size
              </p>
              <p class={cx(rt.mt4, rt.note12, rt.inkMuted70)}>
                SSR paints the base (14px); at the md viewport rung (≥48rem) the root font-size
                steps to 18px and the caption follows — resize across 48rem. The head, dock and
                drawer chrome keep their fixed voices either way (the table's size row).
              </p>
            </div>
          </ComponentCanvas>
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
      <div class={cx(rt.col12, rt.body13)}>
        <p class={cx(rt.m0)}>
          The contract is opt-in per canvas: <strong>no id = no extraction</strong> (zero cost —
          the unextracted posture keeps hand-authored usage samples). An id must be a static
          string literal and unique on its page; the extractor named-errors duplicates and
          non-static ids. The self-containment guard rejects slices that reference page-level
          identifiers (a snippet defined outside the canvas, a page const): the emitted usage
          must be copy-paste-runnable — move the snippet into the canvas or drop the id.
        </p>
        <p class={cx(rt.m0)}>
          The same <code class={cx(rt.inkAccent)}>id</code> also feeds the aria slug
          (<code class={cx(rt.inkAccent)}>jx-canvas-&lt;id&gt;-title</code>), so id-carrying canvases
          are collision-free by construction — the explicit-id collision escape and the
          extraction key are ONE mechanism, not two.
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- accessibility -->
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The code drawer and the dock body are disclosures: aria-expanded/controls plus inert keeps collapsed content out of the tab order. The dock's drag is decorative and pointer-only — every function stays keyboard-reachable without it."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus through header, dock chrome and body controls, then the open drawer' },
          { key: 'Enter / Space', action: 'Toggles the code drawer and dock disclosures; triggers copy, theme, reset, and the axis menus' },
          { key: '↑ / ↓', action: 'Moves through an open axis menu\'s items (auto + the named steps), Enter commits' },
        ]}
        aria={[
          { name: 'aria-expanded', value: 'boolean', description: 'On the drawer toggle and the dock collapse chevron; tracks the 0fr/1fr grid collapse' },
          { name: 'aria-controls', value: '{id}-drawer / {id}-dock-body', description: 'Pairs each toggle with its collapsible region' },
          { name: 'inert', value: 'when collapsed', description: 'Removes collapsed drawer and dock-body content from tab and screen-reader order' },
          { name: 'aria-pressed', value: 'boolean', description: 'On the dock theme button — carries the light/dark state' },
          { name: 'aria-haspopup', value: 'menu', description: 'On the seven axis icon-buttons; each opens the family DropdownMenu with the current value check-marked (data-jx-canvas-axis-check)' },
          { name: 'aria-label', value: 'string', description: 'On the source link, the stage ("{title} demo", stageLabel-overridable), the dock ("Controls for {title}"), and copy buttons' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="component-canvas" />
  </div>
  </div>
</div>
