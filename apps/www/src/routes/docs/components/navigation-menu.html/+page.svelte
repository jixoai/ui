<!--
  Docs page for the navigation-menu family (composition-first-apis,
  2026-08-25).
  Intents:
  1. Hero summary (the thin-coordinator posture, click-open-only law).
  2. One ComponentCanvas: the composed family — Item wraps the Popover
     anchor law, Trigger rides the declarative popovertarget wire,
     Panel carries the consumer-authored mega content, bare links
     compose in-bar.
  3. Usage CodeBlock: the copyable composition sample.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '$lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '$lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '$lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import navigationMenuSource from '$lib/ui/navigation-menu/navigation-menu.svelte?raw';
  import navigationMenuPanelSource from '$lib/ui/navigation-menu/navigation-menu-panel.svelte?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuPanel,
    NavigationMenuLink,
  } from '@ui/navigation-menu/index';
${close}

<NavigationMenu label="site">
  <NavigationMenuItem>
    <NavigationMenuTrigger>Product</NavigationMenuTrigger>
    <NavigationMenuPanel>
      <!-- real links — navigation-menu MOVES you; actions live in dropdown-menu -->
      <NavigationMenuLink href="/x" current>Overview</NavigationMenuLink>
      …any markup — mega grids compose inside the panel…
    </NavigationMenuPanel>
  </NavigationMenuItem>
  <NavigationMenuLink href="/docs">docs</NavigationMenuLink>
</NavigationMenu>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/navigation-menu/navigation-menu.svelte', content: navigationMenuSource },
    { name: 'registry/files/ui/navigation-menu/navigation-menu-panel.svelte', content: navigationMenuPanelSource },
    {
      name: 'src/lib/ui/navigation-menu-usage.svelte',
      content: usage,
      kind: 'usage',
    },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Navigation menu · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai navigation-menu family: the site-nav bar as an independent thin coordinator — arrow walking, click-open panels on the Popover primitive's laws (declarative popovertarget wire, light dismiss, surface motion), mega content composed inside the panels, bare links in-bar."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="navigation menu — a bar you WALK, with panels that move"
      summary="The site-nav pattern as an independent thin coordinator: ←/→ walk the top-level triggers (one tab stop, on the current section), click opens a panel, Escape closes and hands focus back. Panels ride the Popover primitive's laws — native popover=auto light dismiss, CSS anchoring, and the WAAPI surface-motion entry/exit — through a DECLARATIVE popovertarget wire, and open state mirrors the native toggle seam only, so aria-expanded never lies. The family composes: the Item owns the one id (Trigger/Panel derive theirs), mega content is Panel children, and bare links sit in-bar with the current-state paint. Panels carry REAL LINKS — navigation moves you; actions belong to dropdown-menu. Click-open only (Owner ruling 2026-08-25): the hover path and its grace timers are retired."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">roving walk</span>
        <span class="pill">click open</span>
        <span class="pill">panels = links</span>
      </div>
    </SectionCard>
  </div>

  <div id="navmenu-demo" data-region="navmenu-demo" data-family="navmenu-demo" data-reveal="">
    <ComponentCanvas
      title="navigation menu"
      stage="fill"
      description="Tab to the bar (components is the tab stop — it's the current section), walk with arrows, click a trigger to open its panel, Escape closes."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/navigation-menu/navigation-menu.svelte"
      files={canvasFiles}
    >
      <NavigationMenu label="demo site">
        <NavigationMenuItem>
          <NavigationMenuTrigger>registry</NavigationMenuTrigger>
          <NavigationMenuPanel>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1">
              {#each ['overview', 'items', 'tokens', 'install'] as slug (slug)}
                <a class="jx-demo-nav-link" href="/docs/components.html">registry: {slug}</a>
              {/each}
            </div>
          </NavigationMenuPanel>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger current>components</NavigationMenuTrigger>
          <NavigationMenuPanel>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1">
              {#each ['menubar', 'navigation-menu', 'toggle-group', 'tabs'] as slug (slug)}
                <a class="jx-demo-nav-link" href="/docs/components.html">{slug}</a>
              {/each}
            </div>
          </NavigationMenuPanel>
        </NavigationMenuItem>
        <NavigationMenuLink href="/docs/components.html">docs</NavigationMenuLink>
      </NavigationMenu>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            plain links compose DIRECTLY in the bar with the current-state paint
            (<code class="text-accent">current</code> on either a trigger or a link); the panel's
            entry/exit runs on the popover primitive's motion kernel (the floating-surface
            timeline), and open state mirrors the native toggle seam only. No Viewport part —
            per-panel CSS anchoring on native popover replaces Radix's shared container.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  
  </div>
</div>

<style>
  .jx-demo-nav-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 150ms ease-out;
  }
  .jx-demo-nav-link:hover {
    color: var(--primary);
  }
  .jx-demo-nav-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
</style>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Navigation variants" summary="Use trigger panels for grouped links and bare links for direct navigation."><div class="grid gap-4 sm:grid-cols-2"><div class="border border-border p-4"><NavigationMenu label="grouped"><NavigationMenuItem><NavigationMenuTrigger>Product</NavigationMenuTrigger><NavigationMenuPanel><NavigationMenuLink href="/docs">Overview</NavigationMenuLink></NavigationMenuPanel></NavigationMenuItem></NavigationMenu></div><div class="border border-border p-4"><NavigationMenu label="direct"><NavigationMenuLink href="/docs" current>Docs</NavigationMenuLink></NavigationMenu></div></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Keep navigation links in panels; actions belong in dropdown-menu."><CodeBlock code={usage} lang="svelte" meta="NavigationMenu usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The bar exposes one roving tab stop and keeps every destination a real link."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move between top-level triggers and wrap.' }, { key: 'Enter / Space', action: 'Open the focused trigger panel.' }, { key: 'Escape', action: 'Close the panel and restore focus to its trigger.' }]} aria={[{ name: 'aria-current', value: 'page / true', description: 'Marks the current destination.' }, { name: 'aria-controls', value: 'panel id', description: 'Pairs a trigger with its panel.' }, { name: 'aria-expanded', value: 'boolean', description: 'Mirrors the native popover toggle state.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Navigation links and panels inherit shared density tokens; the panel adds popover padding tokens."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><NavigationMenu label="density"><NavigationMenuLink href="/docs">docs</NavigationMenuLink></NavigationMenu></DensityDemo><TokenTable tokens={[{ name: '--jx-pop-pad', default: '12px 14px', source: 'component' }, { name: '--jx-pop-pad-inline', default: '14px', source: 'component' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Root, item, trigger, panel, and link parts keep navigation composition explicit."><PropsTable title="NavigationMenu" props={[{ name: 'label', type: 'string', default: "'site'", description: 'Accessible navigation landmark label.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating panel surface treatment.' }]} /><div class="mt-5"><PropsTable title="NavigationMenuTrigger / Link" props={[{ name: 'current', type: 'boolean', default: 'false', description: 'Paints the current section and sets aria-current.' }, { name: 'href', type: 'string', description: 'Destination for a navigation link.' }, { name: 'id', type: 'string', description: 'Stable item id used to pair trigger and panel.' }]} /></div></SectionCard></div>
</div>
