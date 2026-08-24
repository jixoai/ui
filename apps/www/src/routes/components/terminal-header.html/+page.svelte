<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import terminalHeaderSource from '$lib/ui/terminal-header/terminal-header.svelte?raw';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // ToC outline: the integration law (the canvas above holds the
  // architecture).

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import TerminalHeader from '@ui/terminal-header.svelte';
  import ThemeToggle from '@ui/theme-toggle.svelte';
${close}

<TerminalHeader
  brand="jixoai-ui"
  domain="ui.jixoai.com"
  subtitle="the jixoai design language"
  navColumns="auto"
  items={[
    { href: '/', label: 'Overview', active: true },
    {
      href: '/docs',
      label: 'Docs',
      // flat SubItem[] → one unnamed group, the narrow dropdown
      children: [
        { href: '/docs/tokens', label: 'tokens', description: 'the token sheet' },
      ],
    },
    {
      href: '/components',
      label: 'Components',
      // TerminalNavGroup[] → mega panel: multi-column grid areas
      children: [
        {
          label: 'Layout',
          items: [
            { href: '/components/card', label: 'card', description: 'the content atom' },
            { href: '/components/grid', label: 'grid', description: 'subgrid equalizer' },
          ],
        },
        {
          label: 'Overlay',
          items: [
            { href: '/components/dialog', label: 'dialog', description: 'native dialog base' },
          ],
        },
      ],
    },
    { href: 'https://github.com/jixoai/ui', label: 'GitHub', external: true },
  ]}
>
  {#snippet switcher()}
    <ThemeToggle />
  {/snippet}
</TerminalHeader>`;

  // the architecture, as an ASCII diagram (a header cannot nest a header)
  const architecture = `the two wings (desktop, >=lg) — they never mix
+---------------------------------------------------------------+
| []  jixoai-ui                                 [ Overview       |
|     ui.jixo.com                                 Components v   |
|     the design language                         Tokens GitHub ]|
|     <-- brand identity -->              <-- routes + switcher->|
+---------------------------------------------------------------+

second level — the shape of item.children decides the panel
  TerminalNavSubItem[]   one unnamed group -> narrow dropdown
  TerminalNavGroup[]     2+ groups -> mega panel: definite width,
                         auto-fill minmax(14rem, 1fr) grid areas,
                         cqw container rules, hairline dividers
  both ride popover="auto": top layer, light dismiss, Escape
  JS owns only the click toggle and placement

the three tiers
  >=lg     full brand stack + complete pill group + switcher
  sm-lg    domain stays, subtitle drops, compact pills
  <sm      hamburger -> grid-rows 0fr-to-1fr disclosure, children
           nest the same collapse, "all ->" keeps the parent href`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/terminal-header.svelte', content: terminalHeaderSource },
    { name: 'src/lib/ui/terminal-header-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Terminal header · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-header component: the site nav bar — a strict two-wing layout on an always-dark CRT bezel, nav pills with popover-based second-level panels (flat dropdowns or grouped mega panels), and a three-tier responsive collapse."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="terminal-header — the two-wing bezel"
        summary="The site nav bar: LEFT carries the brand (logo slot, wordmark, domain, subtitle — the page's identity), RIGHT carries the navigation as one bordered pill group plus the switcher slot — the page's routes. The wings never mix. The bar is a CRT bezel locked dark by default, so its contents read identically under any brand hue; theme=&quot;light&quot; or &quot;system&quot; unlocks the shell."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">two wings, never mixed</span>
          <span class="pill">popover second level</span>
          <span class="pill">mega panels · grid areas</span>
          <span class="pill">3 responsive tiers</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="terminal-header"
        description="A header cannot nest inside a header — this page already wears the component at its top edge. The stage holds the architecture instead; the full source and the integration usage live in the code drawer."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/terminal-header.svelte"
        {files}
      >
        <div class="flex w-full flex-col gap-5">
          <SectionCard
            eyebrow="live stage, replaced"
            title="You are already wearing the demo"
            summary="The bar above this page — brand left, pills right, hue switcher in the switcher slot — is the component, rendered exactly once by the site layout. Rendering a second instance here would nest one banner landmark inside the page and duplicate the primary navigation, so the stage shows the structure instead."
          >
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Open the code drawer below for the verbatim source (803 lines, the whole popover and
              mega-panel law), then click the <em>Components</em> pill in the real header
              above — the grouped panel that drops is the data shape from the usage file, running
              live. On a narrow viewport the same items collapse into the hamburger disclosure.
            </p>
          </SectionCard>
          <CodeBlock code={architecture} lang="txt" meta="architecture" />
        </div>
        {#snippet playground()}
          <div class="jx-play-fields">
            <p class="jx-play-help">
              the LIVE demo is the bar this page already wears: click the <em>Components</em> pill
              above for the mega panel (click-again, outside click, Escape and the top layer are
              the browser's), or narrow the viewport to watch the hamburger disclosure fold the
              same items. Tab order: brand, pills, switcher — the panel contents join only while
              open.
            </p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="integration" data-reveal="">
      <SectionCard
        family="integration"
        headerRegion="integration"
        eyebrow="composition"
        title="How it attaches"
        summary="The header renders once per site, inside the shell's header slot (app-shell, or a plain layout wrapper). Everything dynamic arrives as data: items is a literal array, so route tables stay static; the switcher slot takes any bezel-aware control."
      >
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>items carry <code class="text-accent">active</code> — the pill earns
              <code class="text-accent">aria-current="page"</code> and the sliding indicator</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>second level is data too: <code class="text-accent">SubItem[]</code> narrows,
              <code class="text-accent">TerminalNavGroup[]</code> goes mega —
              <code class="text-accent">navColumns</code> pins or derives the column count</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>panels are native <code class="text-accent">popover="auto"</code>: light dismiss,
              Escape and the top layer belong to the browser; the component adds only click
              toggling and placement</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the panel repeats the header's scope class, so its tokens survive the top-layer
              promotion untouched</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>
