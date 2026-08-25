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
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
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
