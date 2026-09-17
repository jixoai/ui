<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
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
        summary="The presentation-site scaffold: header band, main column, footer, skip link, the chrome plane over the scroll plane, and systematized view transitions."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">one grid, two subgrid layers</span>
          <span class="pill">container-query forms</span>
          <span class="pill">skip link</span>
          <span class="pill">view transitions</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="website-scaffold"
        description="The grid shell: .jx-shell-host is the named container (the ONE responsive truth source); both layers span the same grid and subgrid its named columns — header, children, optional footer, skip link, and the per-zone immersive law."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/website-scaffold.svelte"
        {files}
        stage="fill"
      >
        {#snippet children()}
          <!-- A scaffold cannot nest inside itself: the shell owns the
               viewport's single scroll plane, and a second 100svh overlay
               would trap the page. This site IS the running instance —
               the card below documents the layers instead. -->
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
                  <span><strong class={cx(rt.semibold)}>one measurement</strong> — a single ResizeObserver publishes <code class={cx(rt.inkAccent)}>--jx-header-h</code>; the body's chrome reservation, the toc compaction offset and the shared <code class={cx(rt.inkAccent)}>--jx-toc-line</code> all derive from it in CSS. Disclosure rows re-reserve automatically</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>per-zone immersive law</strong> — scroll DOWN past 8px: the header leaves upward and the tree bottom bar slides down; the toc and the catalog rail NEVER leave — they compact by exactly the header height (Owner ruling, 2026-08-24); the slightest scroll UP returns everything; reduced motion swaps to instant</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>view transitions</strong> — the header band keeps view-transition-name <code class={cx(rt.inkAccent)}>site-header</code> and persists across navigations; main#main animates as <code class={cx(rt.inkAccent)}>page-main</code></span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>skip link</strong> — a keyboard-reachable <code class={cx(rt.inkAccent)}>Skip to content</code> target on #main, hidden until focused</span></li>
                <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
                  <span><strong class={cx(rt.semibold)}>top-layer context</strong> — the scaffold publishes the
                    <code class={cx(rt.inkAccent)}>jx-top-layer</code> context: <code class={cx(rt.inkAccent)}>adopt(node, {'{'} area {'}'})</code> with
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
                nodes land in named areas through their [data-area] role</span></li>
            <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>declarative placement, one measurement: every position is a named area on
                the grid; the only measured value left is --jx-header-h (the live header height)
                feeding the reservation, the compaction offset and the anchor line</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One shell, four snippet seams, three container-query forms — the same grid re-grids per width.">
    <div class={cx(rt.grid760c)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>snippet seams</span><p class={cx(rt.mt8, rt.bodyMuted)}>header (required) + chrome (static rails) + children (main#main) + footer.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>container forms</span><p class={cx(rt.mt8, rt.bodyMuted)}>Cols [rail][content][toc] re-grid by container query on .jx-shell-host — embedded scaffolds show the right form at any width.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>float adoption</span><p class={cx(rt.mt8, rt.bodyMuted)}>The jx-top-layer context adopts dynamic floats into .jx-float-slot by [data-area] — static chrome never mixes in.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The layout root: one named container, header/chrome/children/footer snippets in their final cells."><CodeBlock code={usage} lang="svelte" meta="WebsiteScaffold usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Skip link to main#main, one landmark per zone, and chrome reservations that keep reflow honest."><A11yTable keys={[{ key: 'Tab', action: 'The hidden Skip to content link is the first stop; then header nav, then main' }, { key: 'Enter', action: 'Follows the skip link — focus lands on #main content' }]} aria={[{ name: 'skip link', value: '"Skip to content"', description: 'Keyboard-reachable target on #main, hidden until focused' }, { name: 'landmarks', value: 'header / main#main / footer', description: 'The shell renders one landmark per zone; adopted nodes keep their authored semantics' }, { name: 'view-transition-names', value: 'site-header / page-main', description: 'Persist across navigations so chrome never flashes' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No density tokens — the shell publishes structural measurements; everything else derives from them in CSS."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.frame, rt.bgMuted40, rt.px12, rt.py8, rt.fontMono, rt.text11)}>shell stand-in — a scaffold cannot nest</div></DensityDemo><TokenTable tokens={[{ name: '--jx-header-h', default: 'measured live', source: 'structural', description: 'The one measured value: body reservation, toc compaction, and the line all derive from it' }, { name: '--jx-rail-w', default: 'grid rail width', source: 'structural' }, { name: '--jx-toc-w', default: 'toc column width', source: 'structural' }, { name: '--jx-toc-line', default: '76px', source: 'structural', description: 'Shared with the toc family — the pick-line offset' }, { name: '--jx-chrome-bar', default: '44px', source: 'structural' }, { name: '--jx-chrome-top / --jx-chrome-bottom', default: 'zone insets', source: 'structural' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the WebsiteScaffold Props interface — four snippet seams, no data."><PropsTable props={[{ name: 'header', type: 'Snippet', default: '—', description: 'The nav band chrome (usually terminal-header with composed nav).', required: true }, { name: 'chrome', type: 'Snippet', default: '—', description: 'Static chrome, SSR-stable: the toc rail and catalog tree render here, never moved by hydration.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The default snippet → main#main in the content column.', required: true }, { name: 'footer', type: 'Snippet', default: '—', description: 'Optional footer in the content flow.' }]} /></SectionCard></div>
</div>

<style>
  .jx-arch-diagram {
    background: color-mix(in oklab, var(--muted) 40%, var(--background));
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 11.5px;
    line-height: 1.7;
    margin: 0;
    overflow-x: auto;
    padding: 0.9rem 1rem;
    white-space: pre;
  }
</style>
