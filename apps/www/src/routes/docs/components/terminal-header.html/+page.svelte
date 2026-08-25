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
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
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

<TerminalHeader brand="jixoai-ui" domain="ui.jixoai.com" subtitle="the jixoai design language">
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
</script>

<svelte:head>
  <title>Terminal header · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai terminal-header component, decomposed (composition-first-apis): the site nav bar keeps its chrome — the two-wing CRT bezel, the brand block, the bordered pill group with the sliding active indicator, and the mobile drawer shell — while the navigation itself composes from the navigation-menu family: Item/Trigger/Panel parts with consumer-authored mega grids inside the panels and bare links in-bar."
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
        title="terminal-header — the two-wing bezel, chrome only"
        summary="The site nav bar: LEFT carries the brand (logo slot, wordmark, domain, subtitle — the page's identity), RIGHT carries the navigation pill group plus the switcher slot — the wings never mix, and the bar is a CRT bezel locked dark by default (theme=&quot;light&quot; or &quot;system&quot; unlocks). The header owns CHROME ONLY: the nav slot hosts composed navigation-menu parts — triggers with panels whose mega grids you author inside, links-only entries as bare links — and the mobile drawer holds your drawer snippet behind the hamburger fold. The three-level item config tree is gone: what renders is your tree."
      >
        <div class="flex flex-wrap gap-3">
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
        <div class="flex w-full flex-col gap-5">
          <SectionCard
            eyebrow="live stage, replaced"
            title="You are already wearing the demo"
            summary="The bar above this page — brand left, pills right, hue switcher in the switcher slot — is the component, rendered exactly once by the site layout with the nav composed from the navigation-menu family. Rendering a second instance here would nest one banner landmark inside the page and duplicate the primary navigation, so the stage shows the structure instead."
          >
            <p class="text-muted-foreground text-pretty text-[13px] leading-6">
              Open the code drawer below for the verbatim source (the chrome + the three css
              bands), then click the <em>Components</em> pill in the real header above — the
              mega panel that drops is the docs tree mapped onto NavigationMenuItem/Trigger/Panel
              in the layout, running live. On a narrow viewport the same routes fold into the
              hamburger drawer.
            </p>
          </SectionCard>
          <CodeBlock code={architecture} lang="txt" meta="architecture" />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the LIVE demo is the bar this page already wears: click the <em>Components</em> pill
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
        <div class="flex flex-col gap-5">
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the pill box + the sliding indicator (<code class="text-accent">vt-nav-active</code>)
              are chrome — the header repaints the indicator from the DOM
              (<code class="text-accent">aria-current</code> flips), because it never sees your nav
              data</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>opt panels into the bezel surface with <code class="text-accent">jx-subpanel</code>
              (<code class="text-accent">jx-subpanel-mega</code> for the wide multi-column ceiling);
              the column count is your grid — <code class="text-accent">navColumns</code> died with
              the config tree</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>panels stay the browser's — <code class="text-accent">popover="auto"</code> light
              dismiss, Escape, one-at-a-time, CSS anchoring; the header adds only
              <code class="text-accent">closeAll()</code> navigation cleanup</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the drawer is a shell: hamburger fold, bounded scroller, Escape; your snippet
              holds the rows, and <code class="text-accent">bind:open</code> is your reset signal
              for disclosure state</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>
