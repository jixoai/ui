<!--
  website-scaffold — canonical page (the docs shell documenting itself;
  rebuilt to the eight-axes archetype, docs-eight-axes-mdn task 70).

  THE SELF-REFERENCE AT MAXIMUM, named per surface: this page LIVES in
  the shell it documents — the layout's scaffold is the running
  instance (main#main, .jx-top-layer, the skip link and the immersive
  law are all live above and beside this text). Every shell claim
  below names its surface: "the LIVE shell" reads this page's own
  chrome; a bounded demo instance was measured separately (probe,
  task 70 — a 480px host runs the narrow form inside the wide window)
  but is intentionally not rendered here: a second full-viewport
  overlay scroll plane would trap the page (the no-nest ruling).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayHelp } from '$lib/playground';

  // ToC outline: the closing law (the canvas above holds the architecture).

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import scaffoldSource from '$lib/ui/website-scaffold/website-scaffold.svelte?raw';
  import scaffoldCss from '$lib/ui/website-scaffold/website-scaffold.css?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import WebsiteScaffold from '@ui/website-scaffold.svelte';
  import '@ui/website-scaffold/website-scaffold.css';
  import TerminalFooter from '@ui/terminal-footer.svelte';
  import TerminalHeader from '@ui/terminal-header.svelte';
  import { NavigationMenu, NavigationMenuLink } from '@ui/navigation-menu/index';
${close}

<!-- the layout root: one named container, two subgrid layers -->
<WebsiteScaffold>
  {#snippet header()}
    <!-- chrome-only header: the nav is composed from the family -->
    <TerminalHeader brand="my-app">
      <NavigationMenu label="primary">
        <NavigationMenuLink href="/">home</NavigationMenuLink>
        <NavigationMenuLink href="/docs" current>docs</NavigationMenuLink>
      </NavigationMenu>
      {#snippet drawer()}
        <!-- the mobile tier's nav, authored in your tree -->
      {/snippet}
    </TerminalHeader>
  {/snippet}

  <!-- STATIC chrome (SSR-stable): toc rails / nav trees authored in
       their final grid cells — never moved by hydration -->
  {#snippet chrome()}
    <MyPageToc data-area="toc" />
    <MyCatalogTree data-area="tree" />
  {/snippet}

  <!-- default snippet → main#main in the content column -->
  <RouterOutlet />

  {#snippet footer()}
    <TerminalFooter ghost="MY-APP" />
  {/snippet}
</WebsiteScaffold>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/website-scaffold.svelte', content: scaffoldSource },
    { name: 'registry/files/ui/website-scaffold/website-scaffold.css', content: scaffoldCss },
    { name: 'src/lib/ui/website-scaffold-usage.svelte', content: usage },
  ];

  // The playground drives the REAL top layer this page already lives in:
  // scrolling the body demonstrates the immersive hide/reveal live.
  function scrollBodyBy(px: number): void {
    const body = document.querySelector('.jx-shell-body');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    body?.scrollBy({ top: px, behavior: reduce ? 'auto' : 'smooth' });
  }

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter((style): style is { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        Object.entries(style ?? {}).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  const universalUsage = `<WebsiteScaffold size={18} density="small">…</WebsiteScaffold>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/website-scaffold-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 70) — every cell measured on the
  // LIVE shell (this page's own chrome, surface named) or
  // negative-grepped over ui/website-scaffold/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        'NO-OPINION CONTAINER, MEASURED ABSENT — the zones carry no density paint, and at auto the rung attr stamps NOTHING on the host (measured: data-density absent on the live shell — the no-opinion law is visible, not just declared). Zero --jx-density-effective readers (grep receipt). Number unit: coefficient.',
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'THE TYPE-SCALE SEAM AT THE TOP — the §1 stamp scales the HOST root and every zone supplies downward: the header, the toc rail and the page content are the consumers (吃也供 — the site-level type-scale seam: one number scales the whole scaffold). Zero --jx-size-effective readers (grep receipt). Number unit: px.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape or factor consumer in ui/website-scaffold/); the shell is structural chrome. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero radius-effective readers (grep receipt); the shell owns no decorative corners (the zones are full-bleed structural bands). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the zones paint the theme profile directly (var(--border)/var(--background)/the --jx-* inks); zero --jx-color-effective readers (grep receipt). Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'DECLARATIVE STAMP — THE HOST OF HOSTS. theme="dark" stamps the .dark class on the shell-host, and the shell IS the page ground: measured, the body ground flips oklch(1 0 0) → oklch(0 0 0) under the page bridge. The theme story\u2019s strata terminate here — the canvas stage\u2019s data-theme="light" + .jx-light island (the host layer that pins demo subtrees, measured on the sibling lanes) is stamped by the COMPONENT CANVAS, not by this scaffold: the scaffold hosts the strata rather than joining them all. system/auto = tree inheritance. No number lane.',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the immersive leaves are TRANSFORMS (translateY, measured matrix(…, −74.74)), never shadow tiers. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero --jx-motion-effective readers (grep receipt); the immersive law is SCROLL-POSITION-driven (an 8px threshold, rAF-throttled, one data-hidden state) — a behavioral channel with no autonomous animation, so it is reduced-motion-safe by nature (reduced motion swaps the playground\u2019s smooth scroll to instant). Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import WebsiteScaffold from '@ui/website-scaffold.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case (18px)
     wins — the type-scale seam scales every zone at once -->
<WebsiteScaffold size={query({ md: 18 }, 13)}>…</WebsiteScaffold>`;

  const queryFiles: TreeFile[] = [
    { name: 'website-scaffold-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Website scaffold · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai website-scaffold component: a grid shell — a named container host whose ONE grid both layers subgrid (columns shared, placement by named areas), forms driven by container queries, per-zone immersive motion, and systematized view transitions."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="website-scaffold — the grid shell"
        summary="The layout root of every page on this site — including this one. A named container host whose ONE grid both layers subgrid (columns shared, placement by named areas), forms driven by container queries on the host's own width, per-zone immersive motion, the boot splash seat, and systematized view transitions. The strictest prop contract in the fleet: four snippet seams, eight axes, no rest."
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install website-scaffold">
          <TerminalCard
            barTitle="install — website-scaffold"
            command="npx jixoai-ui add website-scaffold"
            outputs={['https://ui.jixoai.com/r/website-scaffold.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">named container</span>
          <span class="pill">subgrid layers</span>
          <span class="pill">container-query forms</span>
          <span class="pill">immersive chrome</span>
          <span class="pill">boot splash seat</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (the archetype's install anchor; chrome — out of the toc) -->

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview — the shell documenting itself"
        summary="The self-reference at maximum: this page LIVES in the shell it documents. Every claim names its surface — the LIVE shell (this page's own chrome) or a measured demo instance — and the theme strata terminate here, because the scaffold hosts them."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The architecture is four names. <code class={cx(rt.inkPrimary)}>.jx-shell-host</code> is
            the named container (container-type: inline-size, container-name: jx-shell) — the ONE
            responsive truth source: forms switch on ITS width, so the scaffold is embeddable (a
            narrow host shows the narrow form inside a wide window — measured: a 480px instance ran
            the single-column form while this page ran the three-column one).
            <code class={cx(rt.inkPrimary)}>.jx-shell</code> is one grid; both layers overlap by
            spanning all columns of row 1 (line placement — never grid-template-areas on the
            shell). <code class={cx(rt.inkPrimary)}>.jx-top-layer</code> is the click-through
            chrome plane: pointer-transparent, children opt back in, per-zone immersive transforms
            — the plane itself never moves. <code class={cx(rt.inkPrimary)}>.jx-shell-body</code>
            spans the whole shell as THE scroll container, reserving chrome via padding driven by
            the single measured var <code class={cx(rt.inkPrimary)}>--jx-header-h</code>.
          </p>
          <p class={cx(rt.para)}>
            Three forms, container-queried on the host: at 1200px+ the grid is
            [rail 16rem][content 1fr][toc 15rem] (tree nav rail); at 900–1199 the tree folds to a
            bottom bar; below 900 the tocbar row slides under the header. The named areas move
            with them — measured: <code class={cx(rt.inkPrimary)}>header header header / tree
            stage toc</code> wide, <code class={cx(rt.inkPrimary)}>header header / stage toc</code>
            mid, <code class={cx(rt.inkPrimary)}>header tocbar stage</code> narrow — the named-area
            budget every adopted node places into. The immersive law is per-zone and
            scroll-position-driven (an 8px threshold, rAF-throttled): scroll DOWN and the header
            leaves upward (measured translateY −74.74px — the header-h itself); scroll UP and
            everything returns; the reading rails NEVER leave — they compact by the header height.
          </p>
          <p class={cx(rt.para)}>
            The prop contract is the fleet's strictest: FOUR snippet seams (header, chrome,
            children, footer) plus an optional splash seat and the eight axes — and NOTHING else.
            No rest spread exists: consumers author their chrome in the seams, static chrome nodes
            carry <code class={cx(rt.inkPrimary)}>data-area</code> roles (toc | tree), and dynamic
            adoption rides the <code class={cx(rt.inkPrimary)}>jx-top-layer</code> context
            (<code class={cx(rt.inkPrimary)}>adopt(node, area)</code> — ordered, release fn
            returned, teardown the consumer's job). Theme is a declarative stamp over the page
            ground (measured flip); density/size/shape/radius/color/elevation/motion are the
            no-own container's supply lanes. Kinship:
            <code class={cx(rt.inkPrimary)}>terminal-header</code>,
            <code class={cx(rt.inkPrimary)}>toc</code> and
            <code class={cx(rt.inkPrimary)}>terminal-footer</code> compose INTO this shell — the
            docs pages for each live inside it.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="website-scaffold"
        description="This page is already the running instance — the canvas below holds the architecture diagram, and the playground drives the REAL top layer you are reading through."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/website-scaffold/website-scaffold.svelte"
        files={files}
        stage="fill"
      >
        {#snippet children()}
          <!-- A scaffold cannot nest inside itself: the shell owns the
               viewport's single scroll plane, and a second 100svh overlay
               would trap the page. This site IS the running instance —
               the card below documents the layers instead. A BOUNDED
               instance (fixed height) does embed — measured in the
               task-70 probe: a 480px host ran the narrow form inside
               this wide window — but the no-nest ruling keeps full
               viewport overlays out of the content flow. -->
          <!-- styled non-heading card (site-polish F10): concept-copy
               must not emit a real heading into the page outline -->
          <div class={cx(rt.frame, rt.bgCard, rt.shadowXs, rt.wFull, rt.maxW3xl)}>
            <div class={cx(rt.wsCardHead)}>
              <div class={cx(rt.flex, rt.col, rt.gap10)}>
                <p class={cx(rt.eyebrowPrimary)}>architecture · no nested LIVE instance</p>
                <p class={cx(rt.fontNav, rt.wsTitle, rt.trackTight)}>This page is already the demo</p>
                <p class={cx(rt.wsPara)}>You are reading main#main inside .jx-shell-body right now — the nav band above is .jx-top-layer. A second scaffold cannot nest here without trapping the page in two competing scroll planes, so the LIVE area holds the architecture; use the Playground buttons to drive the real top layer.</p>
              </div>
            </div>
            <div class={cx(rt.wsPad)}>
            <div class={cx(rt.flex, rt.col, rt.gap20)}>
              <pre class="jx-arch-diagram" aria-label="scaffold layer diagram"><code>.jx-shell-host              container: jx-shell (inline-size) · 100dvh
└── .jx-shell                ONE grid · cols [rail][content][toc] per form
    ├── .jx-top-layer        grid-row 1 · col-subgrid · rows [header][tocbar][stage]
    │   ├── .jx-scaffold-header     the nav band (visible above)
    │   └── .jx-float-slot          subgrid — adopted nodes land by [data-area]
    └── .jx-shell-body        grid-row 1 · col-subgrid · THE scroll container
        ├── main#main         [content] column · padding = --jx-header-h (+tocbar)
        └── footer            in the content flow</code></pre>
              <ul class={cx(rt.col8, rt.body13)}>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>one measurement</strong> — a single ResizeObserver publishes <code class={cx(rt.inkAccent)}>--jx-header-h</code>; the body's chrome reservation, the toc compaction offset and the shared <code class={cx(rt.inkAccent)}>--jx-toc-line</code> all derive from it in CSS. Disclosure rows re-reserve automatically. The correction lands on .jx-shell — the var's DECLARING scope (a host-level write is shadowed for every descendant; the toc-flush bug)</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>per-zone immersive law</strong> — scroll DOWN past 8px: the header leaves upward and the tree bottom bar slides down; the toc and the catalog rail NEVER leave — they compact by exactly the header height (Owner ruling, 2026-08-24); the slightest scroll UP returns everything; reduced motion swaps to instant. Measured: translateY(−74.74px) = the header-h itself</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>view transitions</strong> — the header band keeps view-transition-name <code class={cx(rt.inkAccent)}>site-header</code> and persists across navigations; main#main animates as <code class={cx(rt.inkAccent)}>page-main</code> (measured live)</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>skip link</strong> — a keyboard-reachable <code class={cx(rt.inkAccent)}>Skip to content</code> target on #main, hidden until focused</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>top-layer context</strong> — the scaffold publishes the
                    <code class={cx(rt.inkAccent)}>jx-top-layer</code> context: <code class={cx(rt.inkAccent)}>adopt(node, area)</code> with
                    semantic roles (<code class={cx(rt.inkAccent)}>toc | tree | float</code>); the shell grid resolves the
                    physical cell per container form — one adoption mechanism, many cells, zero
                    per-breakpoint JS (Owner request, 2026-08-23)</span></li>
              </ul>
            </div>
            </div>
          </div>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="scroll body">
              <div class={cx(rt.col8)}>
                <PressButton onclick={() => scrollBodyBy(360)}>scroll body ↓ 360px</PressButton>
                <PressButton onclick={() => scrollBodyBy(-360)}>scroll body ↑ 360px</PressButton>
              </div>
            </PlayRow>
            <PlayHelp>
              These buttons scroll <code>.jx-shell-body</code> — the real scroll
              plane of this page. Watch the zones split: chrome leaves, the toc rail compacts.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="scaffold-base" data-reveal="">
      <SectionCard
        family="scaffold-base"
        headerRegion="scaffold-base"
        eyebrow="W3C foundation"
        title="What the platform gives"
        summary="Container queries size the forms on the host's own width (embeddability without JS); subgrid shares the columns so chrome and content can never drift; :has() targets chrome from the content side; view transitions persist the chrome across navigations. The scaffold composes these four platform powers into one grid."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>

  <div id="shell-law" data-reveal="">
    <SectionCard
      family="shell-law"
      headerRegion="shell-law"
      eyebrow="law"
      title="The grid law"
      summary="Why one grid instead of absolute positioning: the two layers share the SAME named columns through subgrid, so chrome and content can never drift apart — and forms are container queries on the host, so an embedded scaffold shows the right form at any width. Placement is declarative; motion stays per-zone transforms."
    >
      <div class={cx(rt.flex, rt.col, rt.gap20)}>
        <ul class={cx(rt.col8, rt.body13)}>
          <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>ONE scroll plane: <code class={cx(rt.inkAccent)}>.jx-shell-body</code> owns every
              scroll on the site — window scrolling and fixed-position demos must target it, not
              the window</span></li>
          <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>ONE grid, two layers: both layers span the same shell grid and subgrid its
              columns — the toc rail and the content column align by construction, and adopted
              nodes land by [data-area] role</span></li>
          <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>THE OVERLAY POINTER LAW (adjudicated D-1 fix): overlay containers are
              pointer-TRANSPARENT; real content opts back in — and the grant STOPS at float
              wrappers, so an adopted float covering the stage can never shield the page beneath
              (measured: header pointer-events auto, the float slot none)</span></li>
          <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
            <span>STATIC chrome and DYNAMIC floats never mix: the toc rail and catalog tree render
              in the chrome snippet (SSR-stable, never moved by hydration); adopted float nodes
              land in .jx-float-slot through the context, in adoption order</span></li>
        </ul>
      </div>
    </SectionCard>
  </div>

  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One shell, four snippet seams, three container-query forms — the same grid re-grids per width.">
    <div class={cx(rt.grid760b)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>≥1200 · tree nav rail</span><p class={cx(rt.mt8, rt.bodyMuted)}>[rail 16rem][content 1fr][toc 15rem] — measured 256 / 1104 / 240 at a 1600 viewport; the catalog tree joins the top layer.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>900–1199 · toc bottom fold</span><p class={cx(rt.mt8, rt.bodyMuted)}>[content 1fr][toc 15rem] — the tree folds to a bottom bar; the toc rail keeps its column.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>&lt;900 · tocbar row</span><p class={cx(rt.mt8, rt.bodyMuted)}>[content 1fr] + the tocbar row under the header — the glass single-row rail's home (the toc family's mobile surface).</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The layout root: one named container, header/chrome/children/footer snippets in their final cells."><CodeBlock code={usage} lang="svelte" meta="WebsiteScaffold usage" /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density tokens — the shell publishes structural measurements; everything else derives from them in CSS. The theme stamp is declarative: the shell IS the page ground, and the canvas stage's light-island pin (the host layer) lives one family over."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.frame, rt.bgMuted40, rt.px12, rt.py8, rt.fontMono, rt.text11)}>shell stand-in — a scaffold cannot nest</div></DensityDemo><TokenTable tokens={[{ name: '--jx-header-h', default: '58px / 74px per form (RO-corrected)', source: 'structural', description: 'The one measured value: body reservation, toc compaction, and the line all derive from it — the correction lands on .jx-shell, the declaring scope' }, { name: '--jx-rail-w', default: 'grid rail width', source: 'structural' }, { name: '--jx-toc-w', default: 'toc column width', source: 'structural' }, { name: '--jx-toc-line', default: '76px :root standalone · 106px shell-derived', source: 'structural', description: "Shared with the toc family — the pick-line offset. The 76px default is the toc family's :root fallback for STANDALONE consumers; the shell derives its own (header-h + chrome-top + 32px → 106px at the wide form — the scroll-padding receipt below)" }, { name: '--jx-chrome-bar', default: '44px', source: 'structural' }, { name: '--jx-chrome-top / --jx-chrome-bottom', default: 'zone insets', source: 'structural' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The strictest contract in the fleet: FOUR snippet seams (header, chrome, children, footer) plus the splash seat and the eight axes — and NOTHING else. The scaffold is SNIPPET-COMPOSED AND REST-LESS: no rest spread exists, so nothing consumer-authored lands on the shell except through the seams. Placement for consumer chrome rides data-area roles (static) or the adopt() context (dynamic floats — ordered, release fn, consumer teardown). The eight axes are a FIRST-TIME all-no-own container contract (the universal fold serves the rows)."><PropsTable universal props={[{ name: 'header', type: 'Snippet', default: '—', description: 'The nav band chrome (usually terminal-header with composed nav).', required: true }, { name: 'splash', type: 'Snippet', default: '—', description: 'The BOOT SPLASH seat: rendered at the HOST ROOT, above every layer — the splash\u2019s own styles ride the HTML so it paints before any async stylesheet (the FOUC mask).' }, { name: 'chrome', type: 'Snippet', default: '—', description: 'Static chrome, SSR-stable: the toc rail and catalog tree render here, never moved by hydration.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The default snippet → main#main in the content column.', required: true }, { name: 'footer', type: 'Snippet', default: '—', description: 'Optional footer in the content flow.' }, { name: 'TopLayerApi (context)', type: 'adopt(node, { area }) → release', default: '—', description: 'Dynamic float adoption into the top layer — ordered, multi-node, semantic areas (toc | tree | float); consumers keep node ownership.' }]} /></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on website-scaffold"
      summary="The FIRST-TIME all-no-own CONTAINER contract, measured on the live shell: density stamps nothing at auto (the no-opinion law made visible); size is the type-scale seam at the top (every zone supplies downward); theme is the declarative stamp over the page ground — the strata's host, not a member; shape/radius/color/elevation/motion supply unread (the immersive leaves are transforms, the count readout discipline lives in the fields)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts (all on the LIVE shell — this page's own chrome — unless noted): the form grid
          (256 / 1104 / 240 at a 1600 viewport; re-grids measured at 700/1000), --jx-header-h
          74px with the ResizeObserver correction landing on .jx-shell (the declaring scope), the
          body reservation (scroll-padding 106px; 6164px scrollable at the task-70 read — a
          point-in-time digit, the page grows with the campaign), the immersive law
          (data-hidden + header translateY −74.74px on scroll-down, reveal on scroll-up), the
          overlay pointer law (header auto / float slot none), the named-area budget per form
          (header header header / tree stage toc → header header / stage toc → header tocbar /
          stage), the skip link (#main), the view-transition names (site-header / page-main), the
          boot splash (SSR-shipped, unmounted live — the seat is the layout's), the embeddable
          480px instance (the narrow form inside the wide window) and the canvas stage's
          data-theme="light" + .jx-light island pin were measured by the task-70 probe; the unread
          rows carry grep receipts over ui/website-scaffold/. The query() seat below rides the md
          viewport key (48rem) on the size lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="website-scaffold · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the type-scale seam scales the HOST root, so every
                zone (header, rail, content) grows together. The number lane goes bare. Resize
                across 48rem and watch the whole shell breathe.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="WebsiteScaffold · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.panel)}><p class={cx(rt.text13)}>The size stamp scales the host root — the site-level type-scale seam (one number, every zone). A scaffold cannot nest inside itself; this specimen rides the page's own shell.</p></div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Skip link to main#main, one landmark per zone, and chrome reservations that keep reflow honest."><A11yTable keys={[{ key: 'Tab', action: 'The hidden Skip to content link is the first stop; then header nav, then main' }, { key: 'Enter', action: 'Follows the skip link — the VIEW lands on #main at the toc line (scroll-padding); focus itself stays on body (main carries no tabindex −1 — the classic skip-link caveat)' }]} aria={[{ name: 'skip link', value: '"Skip to content"', description: 'Keyboard-reachable target on #main, hidden until focused' }, { name: 'landmarks', value: 'header / main#main / footer', description: 'The shell renders one landmark per zone; adopted nodes keep their authored semantics' }, { name: 'view-transition-names', value: 'site-header / page-main', description: 'Persist across navigations so chrome never flashes' }]} /></SectionCard></div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="website-scaffold" />
  </div>
</div>
