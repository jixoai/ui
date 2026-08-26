<!--
  Docs page for the menubar family (composition-first-apis, 2026-08-25).
  Intents:
  1. Hero summary (registry:ui · ARIA posture) + the walker contract.
  2. One ComponentCanvas: the composed family — Item/Trigger/Panel/
     MenuItem parts, panel content as Item children (no keyed panel
     snippets), an onselect echo through the canvas output footer.
  3. Usage CodeBlock: the copyable composition sample (the canvas
     drawer shares the same string).
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
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import Menubar from '$lib/ui/menubar/menubar.svelte';
  import MenubarItem from '$lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '$lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '$lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '$lib/ui/menubar/menubar-menu-item.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import menubarSource from '$lib/ui/menubar/menubar.svelte?raw';
  import menubarCssSource from '$lib/ui/menubar/menubar.css?raw';

  const close = '</' + 'script>';

  // Playground protocol: the page owns the snapshots + reset; the echo
  // footer surfaces the last menu selection.
  const canvasInitial = { last: '—' };
  let last = $state<string>(canvasInitial.last);
  function resetCanvas(): void {
    last = canvasInitial.last;
  }

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Menubar,
    MenubarItem,
    MenubarTrigger,
    MenubarPanel,
    MenubarMenuItem,
  } from '@ui/menubar/index';
${close}

<Menubar label="app">
  <MenubarItem id="file">
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPanel>
      <MenubarMenuItem href="/open">Open…</MenubarMenuItem>
      <hr />
      <MenubarMenuItem onselect={() => close()}>Close</MenubarMenuItem>
    </MenubarPanel>
  </MenubarItem>
</Menubar>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/menubar/menubar.svelte', content: menubarSource },
    { name: 'registry/files/ui/menubar/menubar.css', content: menubarCssSource },
    { name: 'src/lib/ui/menubar-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Menubar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai menubar family: the application menu bar with its own walker — arrows glide between top menus with panels following, panels are popover=manual role=menu surfaces composed as MenubarPanel children, and every trigger pairs with its panel through the derived id protocol."
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
      title="menubar — File, Edit, View, ruled by the platform's gap"
      summary="The application menu bar's top-level contract differs from stacked dropdowns, so it gets its OWN walker: ←/→ move between triggers with panels gliding after an open bar; ↓/↑/Enter opens and focuses the first item; Home/End jump; Escape returns to the trigger. The family composes: MenubarItem owns the ONE id, MenubarTrigger and MenubarPanel derive theirs from it (aria-controls always resolves), the panel registers its imperative handles at init — first registration wins — and the walkers are scoped to the nearest menu so nested dropdown families never leak."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=menubar</span>
        <span class="pill">glide walking</span>
        <span class="pill">popover=manual panels</span>
      </div>
    </SectionCard>
  </div>

  <div id="menubar-demo" data-region="menubar-demo" data-family="menubar-demo" data-reveal="">
    <ComponentCanvas
      title="menubar"
      description="Tab to File, ↓ to open and walk items, → with the panel open glides to Edit, Escape returns to the bar. Menu selections echo in the footer."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/menubar/menubar.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[{ label: 'last selection', value: last }]}
    >
      <Menubar label="demo app">
        <MenubarItem id="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPanel>
            <MenubarMenuItem href="/docs/components.html">Open docs…</MenubarMenuItem>
            <hr />
            <MenubarMenuItem onselect={() => (last = 'File → close')}>Close</MenubarMenuItem>
          </MenubarPanel>
        </MenubarItem>
        <MenubarItem id="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPanel>
            <MenubarMenuItem onselect={() => (last = 'Edit → undo')}>Undo</MenubarMenuItem>
            <MenubarMenuItem onselect={() => (last = 'Edit → redo')}>Redo</MenubarMenuItem>
          </MenubarPanel>
        </MenubarItem>
        <MenubarItem id="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPanel>
            <MenubarMenuItem onselect={() => (last = 'View → commands')}>Commands</MenubarMenuItem>
            <MenubarMenuItem onselect={() => (last = 'View → problems')}>Problems</MenubarMenuItem>
          </MenubarPanel>
        </MenubarItem>
      </Menubar>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the panel walk (↓/↑/Home/End, wrapping) is the menu contract shared with
            dropdown-menu — duplicated deliberately so registry items stay independent. The
            Item owns the one id; Trigger and Panel derive theirs (<code class="text-accent">{'${id}-trigger'}</code> /
            <code class="text-accent">{'${id}-panel'}</code>), and the panel's imperative handles
            register at init under the panel id. Separators stay plain <code class="text-accent">&lt;hr&gt;</code>.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="menubar-base" data-reveal="">
    <SectionCard
      family="menubar-base"
      headerRegion="menubar-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Menubar variants" summary="Compose top-level menus with linked triggers and panels, choosing the surface variant at the root.">
    <div class="grid gap-4 sm:grid-cols-2"><div class="border border-border p-4"><Menubar label="automatic"><MenubarItem id="types-file"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div><div class="border border-border p-4"><Menubar label="solid" variant="solid"><MenubarItem id="types-edit"><MenubarTrigger>Edit</MenubarTrigger><MenubarPanel><MenubarMenuItem>Undo</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></div></div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="MenubarItem owns the stable id; Trigger and Panel derive their paired ids from it."><CodeBlock code={usage} lang="svelte" meta="Menubar usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The application menu follows menubar and menu keyboard patterns with a roving top-level tab stop."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move across top-level menus or within an open panel.' }, { key: 'Home / End', action: 'Jump to the first or last menu.' }, { key: 'Escape', action: 'Close the panel and return focus to its trigger.' }]} aria={[{ name: 'role', value: 'menubar / menuitem / menu', description: 'Exposes the application menu hierarchy.' }, { name: 'aria-controls', value: 'panel id', description: 'Pairs each trigger with its panel.' }, { name: 'aria-haspopup', value: 'menu', description: 'Identifies triggers that open a menu.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The bar and its menu items consume the shared density rhythm plus a bar gap."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><Menubar label="density"><MenubarItem id="density-file"><MenubarTrigger>File</MenubarTrigger><MenubarPanel><MenubarMenuItem>Open</MenubarMenuItem></MenubarPanel></MenubarItem></Menubar></DensityDemo><TokenTable tokens={[{ name: '--jx-bar-gap', default: '8px', source: 'component' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The family is intentionally split into root, item, trigger, panel, and leaf props."><PropsTable title="Menubar" props={[{ name: 'label', type: 'string', default: "'menu bar'", description: 'Accessible menubar landmark label.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating panel surface treatment.' }]} /><div class="mt-5"><PropsTable title="MenubarItem / MenubarMenuItem" props={[{ name: 'id', type: 'string', description: 'Stable id owned by MenubarItem.' }, { name: 'href', type: 'string', description: 'Renders a navigating menu item when provided.' }, { name: 'onselect', type: '(event: MouseEvent) => void', description: 'Runs an action before the panel closes.' }]} /></div></SectionCard></div>
</div>
