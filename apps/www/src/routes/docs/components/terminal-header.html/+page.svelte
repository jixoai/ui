<!--
  Docs page for the decomposed terminal-header (composition-first-apis,
  Batch F, 2026-08-25).
  Intents:
  1. Hero summary: the header is CHROME ONLY — bar shell, brand block,
     pill box + sliding indicator, mobile drawer shell — a thin
     composition surface over the navigation-menu family.
  2. One ComponentCanvas: the architecture (a header cannot nest inside
     a header — this page already wears the real bar; the LIVE demo is
     the site layout itself).
  3. Usage CodeBlock: the copyable composition sample (composed
     NavigationMenu parts + authored mega grid + drawer snippet).
  Constraint: docs only — the header itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import terminalHeaderSource from '$lib/ui/terminal-header/terminal-header.svelte?raw';
  import terminalHeaderCss from '$lib/ui/terminal-header/terminal-header.css?raw';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // ToC outline: the integration law (the canvas above holds the
  // architecture).

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import TerminalHeader from '@ui/terminal-header.svelte';
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuPanel,
    NavigationMenuLink,
  } from '@ui/navigation-menu/index';
${close}

<!-- switcherFrame={false}: this example's ThemeToggle (compact default) carries its own bezel frame -->
<TerminalHeader brand="jixoai-ui" domain="ui.jixoai.com" subtitle="the jixoai design language" switcherFrame={false}>
  <!-- the nav slot: composed family parts — panels carry YOUR markup -->
  <NavigationMenu label="primary">
    <NavigationMenuLink href="/" current>Overview</NavigationMenuLink>
    <NavigationMenuItem>
      <NavigationMenuTrigger current>Components</NavigationMenuTrigger>
      <NavigationMenuPanel class="jx-subpanel jx-subpanel-mega">
        <!-- the mega grid is authored INSIDE the panel -->
        <div class="grid grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))]">
          <div class="jx-group …">
            <a class="jx-sub-link" href="/docs/components/card">card</a>
          </div>
        </div>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="https://github.com/jixoai/ui">GitHub</NavigationMenuLink>
  </NavigationMenu>

  {#snippet switcher()}<ThemeToggle />{/snippet}

  <!-- the mobile drawer's contents — the stacked tier's nav, yours -->
  {#snippet drawer()}
    <nav aria-label="primary">
      <a href="/">Overview</a>
      …disclosure rows authored in your tree…
    </nav>
  {/snippet}
</TerminalHeader>`;

  // the architecture, as an ASCII diagram (a header cannot nest a header)
  const architecture = `the two wings (desktop, >=sm) — they never mix
+---------------------------------------------------------------+
| []  jixoai-ui                                 [ Overview       |
|     ui.jixoai.com                              Components v   |
|     the design language                         Tokens GitHub ]|
|     <-- brand identity (chrome) -->   <- composed nav + slot ->|
+---------------------------------------------------------------+

composition (composition-first-apis, 2026-08-25) — the header owns
CHROME ONLY; the nav is the navigation-menu family, composed in
  <TerminalHeader>                      the bar shell, theme lock
    <NavigationMenu>                    the pill box hosts the bar
      <NavigationMenuLink>              links-only entries, bare
      <NavigationMenuItem>              the pairing unit (one id)
        <NavigationMenuTrigger>         button; popovertarget wire
        <NavigationMenuPanel>           popover=auto; YOUR mega grid
      </NavigationMenuPanel></NavigationMenuItem>
    </NavigationMenu>
    {#snippet drawer()}…{/snippet}    the mobile tier's nav, yours
  </TerminalHeader>
the chrome keeps: pill box + sliding indicator (vt-nav-active), the
hamburger fold + drawer collapse + Escape, closeAll() navigation
cleanup. TerminalNavItem / panelAction / navColumns are GONE.

two tiers
  >=sm     full brand stack + pill group + switcher
  <sm      hamburger -> grid-rows 0fr-to-1fr disclosure holding the
           drawer snippet, bounded by the in-bar scroller`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/terminal-header/terminal-header.svelte', content: terminalHeaderSource },
    { name: 'registry/files/ui/terminal-header/terminal-header.css', content: terminalHeaderCss },
    { name: 'src/lib/ui/terminal-header-usage.svelte', content: usage },
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<TerminalHeader brand="jixoai" domain="ui" density="small" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/terminal-header-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Terminal header · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-header component, decomposed (composition-first-apis): the site nav bar keeps its chrome — the two-wing CRT bezel, the brand block, the bordered pill group with the sliding active indicator, and the mobile drawer shell — while the navigation itself composes from the navigation-menu family: Item/Trigger/Panel parts with consumer-authored mega grids inside the panels and bare links in-bar."
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
        title="terminal-header — the two-wing bezel, chrome only"
        summary="The site nav bar: LEFT carries the brand (logo slot, wordmark, domain, subtitle — the page's identity), RIGHT carries the navigation pill group plus the switcher slot — the wings never mix, and the bar is a CRT bezel locked dark by default (theme=&quot;light&quot; or &quot;system&quot; unlocks). The header owns CHROME ONLY: the nav slot hosts composed navigation-menu parts — triggers with panels whose mega grids you author inside, links-only entries as bare links — and the mobile drawer holds your drawer snippet behind the hamburger fold. The three-level item config tree is gone: what renders is your tree."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">two wings, never mixed</span>
          <span class="pill">composed nav · family parts</span>
          <span class="pill">authored mega grids</span>
          <span class="pill">drawer snippet · 2 tiers</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="terminal-header"
        stage="fill"
        description="A header cannot nest inside a header — this page already wears the component at its top edge. The stage holds the architecture instead; the full source and the composed usage live in the code drawer."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-header/terminal-header.svelte"
        {files}
      >
        <div class={cx(rt.flex, rt.wFull, rt.col, rt.gap20)}>
          <!-- styled non-heading card (site-polish F10): concept-copy must
               not emit a real heading into the page outline -->
          <div class={cx(rt.frame, rt.bgCard, rt.shadowXs)}>
            <div class={cx(rt.thdCardHead)}>
              <div class={cx(rt.flex, rt.col, rt.gap10)}>
                <p class={cx(rt.eyebrowPrimary)}>live stage, replaced</p>
                <p class={cx(rt.fontNav, rt.thdTitle, rt.trackTight)}>You are already wearing the demo</p>
                <p class={cx(rt.thdPara)}>The bar above this page — brand left, pills right, hue switcher in the switcher slot — is the component, rendered exactly once by the site layout with the nav composed from the navigation-menu family. Rendering a second instance here would nest one banner landmark inside the page and duplicate the primary navigation, so the stage shows the structure instead.</p>
              </div>
            </div>
            <div class={cx(rt.thdPad)}>
              <p class={cx(rt.bodyMuted, rt.pretty)}>
                Open the code drawer below for the verbatim source (the chrome + the three css
                bands), then click the <em>Docs</em> pill in the real header above — the
                mega panel that drops is the docs tree mapped onto NavigationMenuItem/Trigger/Panel
                in the layout, running live. On a narrow viewport the same routes fold into the
                hamburger drawer.
              </p>
            </div>
          </div>
          <CodeBlock code={architecture} lang="txt" meta="architecture" />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the LIVE demo is the bar this page already wears: click the <em>Docs</em> pill
              above — the panel opens on the browser's popover laws (light dismiss, Escape, top
              layer) and its grid is authored in the site layout; narrow the viewport to watch the
              hamburger fold the drawer snippet open. Tab order: brand, the family's roving pill
              walk, switcher.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="integration" data-reveal="">
      <SectionCard
        family="integration"
        headerRegion="integration"
        eyebrow="composition"
        title="How it attaches"
        summary="The header renders once per site, inside the shell's header slot. It takes no nav data: the navigation is composed from the navigation-menu family into the default slot (the pill box), and the mobile drawer's contents arrive as the drawer snippet — structure lives in your tree, the bezel comes from the header."
      >
        <div class={cx(rt.flex, rt.col, rt.gap20)}>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the pill box + the sliding indicator (<code class={cx(rt.inkAccent)}>vt-nav-active</code>)
              are chrome — the header repaints the indicator from the DOM
              (<code class={cx(rt.inkAccent)}>aria-current</code> flips), because it never sees your nav
              data</span></li>
            <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>opt panels into the bezel surface with <code class={cx(rt.inkAccent)}>jx-subpanel</code>
              (<code class={cx(rt.inkAccent)}>jx-subpanel-mega</code> for the wide multi-column ceiling);
              the column count is your grid — <code class={cx(rt.inkAccent)}>navColumns</code> died with
              the config tree</span></li>
            <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>panels stay the browser's — <code class={cx(rt.inkAccent)}>popover="auto"</code> light
              dismiss, Escape, one-at-a-time, CSS anchoring; the header adds only
              <code class={cx(rt.inkAccent)}>closeAll()</code> navigation cleanup</span></li>
            <li class={cx(rt.flex, rt.gap8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the drawer is a shell: hamburger fold, bounded scroller, Escape; your snippet
              holds the rows, and <code class={cx(rt.inkAccent)}>bind:open</code> is your reset signal
              for disclosure state</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One bar shell, two tiers, three bezel locks — the nav itself is always composed family parts.">
    <div class={cx(rt.grid760c)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>desktop tier (≥sm)</span><p class={cx(rt.mt8, rt.bodyMuted)}>Full brand stack + pill group with the sliding indicator + switcher slot.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>mobile tier (&lt;sm)</span><p class={cx(rt.mt8, rt.bodyMuted)}>Hamburger folds the drawer snippet into a grid-rows 0fr→1fr disclosure, bounded by the in-bar scroller.</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>bezel lock</span><p class={cx(rt.mt8, rt.bodyMuted)}>theme dark (default) | light | system — the CRT shell swap, same as terminal-card.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Render once per site in the shell's header slot; compose the nav from the navigation-menu family."><CodeBlock code={usage} lang="svelte" meta="TerminalHeader usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A banner landmark whose panels stay the browser's popovers; the drawer is a disclosure with Escape."><A11yTable keys={[{ key: 'Tab', action: 'Brand, the family roving pill walk, switcher — in wing order' }, { key: 'Escape', action: 'Closes the drawer and any open panel (popover=auto native behavior)' }]} aria={[{ name: 'aria-current', value: 'page', description: 'The indicator repaints from the DOM — the header never sees your nav data' }, { name: 'banner', value: 'landmark', description: 'The bar renders once per site; a second instance would duplicate the primary navigation' }, { name: 'popover', value: 'auto', description: 'Panels get light dismiss + top layer from the platform; the header adds only closeAll() cleanup' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Fixed chrome, no density scaling: the bezel speaks the surface tokens; the pill pads and panel pads are the css-band variables."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.flex, rt.itemsCenter, rt.justifyBetween, rt.frame, rt.bgMuted40, rt.px12, rt.py8)}><span class={cx(rt.fontNav, rt.text11, rt.upper, rt.thdTrack20)}>brand wing</span><span class={cx(rt.fontMono, rt.text11)}>pill wing</span></div></DensityDemo><TokenTable tokens={[{ name: '--jx-pop-pad', default: 'panel block pad', source: 'component' }, { name: '--jx-pop-pad-inline', default: 'panel inline pad', source: 'component' }, { name: '--jx-panel-pad', default: 'subpanel pad', source: 'component' }, { name: '--jx-surface-solid-fill', default: 'solid bezel fill', source: 'color' }, { name: '--jx-surface-acrylic-fill', default: 'acrylic bezel fill', source: 'color' }, { name: '--jx-surface-border-color', default: 'bezel border', source: 'color' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The bezel bar carries SEVEN lanes: its `theme` prop is the SHELL lock (own-before-ambient), not the theme axis — §13 rules no rename, the axis forwards ambient (the ghostty-term precedent). The bar itself is flat chrome: elevation carries no own."
    >
      <ComponentCanvas title="TerminalHeader · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><p class={cx(rt.text13)}>The header resolves the record once; the composed nav and switcher read the §11 supply through the component tree.</p></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the TerminalHeader Props interface — brand strings, bezel lock, four snippet seams, and the switcher frame law."><PropsTable universal props={[{ name: 'brand', type: 'string', default: '—', description: 'The wordmark line of the brand block.', required: true }, { name: 'domain', type: 'string', default: '—', description: 'Second brand line (the domain).' }, { name: 'subtitle', type: 'string', default: '—', description: 'Third brand line — desktop tier only.' }, { name: 'homeHref', type: 'string', default: '—', description: "The brand block's link target." }, { name: 'theme', type: "'dark' | 'light' | 'system'", default: "'dark'", description: 'Bezel theme lock.' }, { name: 'logo', type: 'Snippet', default: '—', description: 'The brand mark (logo slot).' }, { name: 'switcher', type: 'Snippet', default: '—', description: 'Right-wing control slot (theme toggle, hue switcher…).' }, { name: 'switcherFrame', type: 'boolean', default: 'true', description: 'Wrap the switcher slot in the bezel frame (border + p-0.5, the 38px outer band shared with the pill box); opt out for controls carrying their own frame.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The desktop nav slot — compose NavigationMenu parts here.' }, { name: 'drawer', type: 'Snippet', default: '—', description: "The mobile drawer's contents (the stacked tier's nav)." }, { name: 'open', type: 'boolean', default: '—', description: "The drawer's open state; bind:open is your reset signal.", bindable: true }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the bar root.' }]} /></SectionCard></div>
</div>
