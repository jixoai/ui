<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import dropdownMenuSource from '$lib/ui/dropdown-menu/dropdown-menu.svelte?raw';
  import dropdownMenuItemSource from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte?raw';

  // ToC outline: the live demo band + the platform/component split closing.

  // Playground protocol: the page owns the snapshot + reset; the echo footer
  // replaces the hand-written "last action" caption the old page carried.
  const canvasInitial = { lastAction: '' };
  let lastAction = $state(canvasInitial.lastAction);
  function resetCanvas(): void {
    lastAction = canvasInitial.lastAction;
  }
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>
<!-- last action: ${q(lastAction || '—')} -->`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import DropdownMenu from '@ui/dropdown-menu.svelte';
  import DropdownMenuItem from '@ui/dropdown-menu-item.svelte';
${close}

<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem onclick={duplicate}>Duplicate</DropdownMenuItem>
  <hr />  <!-- separator: the native element already means it -->
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>`;

  const canvasUsage = `<DropdownMenu id="actions" triggerLabel="Actions">
  <DropdownMenuItem onclick={rename}>Rename…</DropdownMenuItem>
  <DropdownMenuItem destructive onclick={del}>Delete</DropdownMenuItem>
</DropdownMenu>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/dropdown-menu.svelte', content: dropdownMenuSource },
    { name: 'registry/files/ui/dropdown-menu-item.svelte', content: dropdownMenuItemSource },
    { name: 'src/lib/ui/dropdown-menu-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Dropdown menu · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai dropdown menu: the ARIA menu pattern on the popover laws — native popover=auto light dismiss plus the keyboard contract the platform does not ship: item-1 focus on open, wrapping arrows, typeahead, selection restores focus to the trigger."
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
      title="dropdown menu — the menu the browser never shipped"
      summary="The popover laws carry the surface: popover=auto light dismiss, Escape, top layer, CSS Anchor Positioning. The component adds the menu keyboard contract the platform lacks — opening focuses item 1, arrows/Home/End walk with wrapping, 500ms typeahead jumps by label, and selection closes with focus restored to the trigger. Focus restore is an explicit decision, never a heuristic: a light-dismiss click never steals focus."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=menu · menuitem</span>
        <span class="pill">typeahead</span>
        <span class="pill">focus restore on Esc/select</span>
        <span class="pill">separators are plain &lt;hr&gt;</span>
      </div>
    </SectionCard>
  </div>

  <div id="dropdown-menu-demo" data-region="dropdown-menu-demo" data-family="dropdown-menu-demo" data-reveal="">
    <ComponentCanvas
      title="dropdown menu"
      description="Open it, then walk with arrows or type a letter ('d' jumps to Duplicate). Selecting runs the action, closes the menu, and hands focus back to the trigger."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/dropdown-menu.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[{ label: 'last action', value: lastAction || '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex flex-wrap items-center gap-4">
        <DropdownMenu id="canvas-actions" triggerLabel="Actions">
          <DropdownMenuItem onclick={() => (lastAction = 'rename')}>Rename…</DropdownMenuItem>
          <DropdownMenuItem onclick={() => (lastAction = 'duplicate')}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onclick={() => (lastAction = 'copy link')}>Copy link</DropdownMenuItem>
          <hr />
          <DropdownMenuItem destructive onclick={() => (lastAction = 'delete')}>Delete</DropdownMenuItem>
        </DropdownMenu>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            keyboard: ↓/↑ walk and wrap, Home/End jump the ends, <code>d</code>
            typeahead-jumps to Duplicate, Enter selects, Escape closes and focus lands back on the
            trigger. Clicking elsewhere light-dismisses — and focus stays where you clicked.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="dropdown-menu-base" data-reveal="">
    <SectionCard
      family="dropdown-menu-base"
      headerRegion="dropdown-menu-base"
      eyebrow="W3C foundation"
      title="Platform / component split"
      summary="The platform owns the surface behavior (light dismiss, Escape, top layer, anchoring); the component owns the menu contract (item focus, walk, typeahead, focus restore). Items are real buttons — any [role=menuitem] joins the walk through DOM delegation, no registration."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-3 text-[13px]">
          <span class="text-muted-foreground">composition:</span>
          <Badge>item button</Badge>
          <Badge variant="outline">separator = plain hr</Badge>
          <Badge variant="outline">label = plain markup</Badge>
          <Badge variant="tonal" class="jx-hue-error">destructive = paint, same semantics</Badge>
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Menu variants" summary="Choose the placement and surface treatment that fit the action cluster.">
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="border border-border p-4"><DropdownMenu id="types-default" triggerLabel="default"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu></div>
      <div class="border border-border p-4"><DropdownMenu id="types-start" triggerLabel="start" placement="bottom-start"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu></div>
      <div class="border border-border p-4"><DropdownMenu id="types-solid" triggerLabel="solid" variant="solid"><DropdownMenuItem>Open</DropdownMenuItem></DropdownMenu></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Compose a trigger with menu items; separators remain native hr elements."><CodeBlock code={usage} lang="svelte" meta="DropdownMenu usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The menu follows the ARIA menu keyboard contract while keeping light dismiss native."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move between menu items and wrap at the ends.' }, { key: 'Home / End', action: 'Jump to the first or last enabled item.' }, { key: 'Enter / Space', action: 'Activate the focused item and close the menu.' }, { key: 'Escape', action: 'Close and restore focus to the trigger.' }]} aria={[{ name: 'role', value: 'menu / menuitem', description: 'Exposes the menu and its actionable items.' }, { name: 'data-walk-active', value: '(paint-only)', description: 'The keyboard walk’s highlight — a visual state attribute on the walked item; it never rewrites aria-current (a static aria-current="page" on a raw item is the author’s semantics and stays).' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Density scopes keep menu hit targets and type rhythm aligned."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><DropdownMenu id="density-menu" triggerLabel="actions"><DropdownMenuItem>Rename</DropdownMenuItem></DropdownMenu></DensityDemo><TokenTable tokens={[{ name: '--jx-menu-gap', default: '8px', source: 'component' }, { name: '--jx-menu-pad', default: '4px', source: 'component' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-scrollbar-thin', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Root and item props define the menu surface and its selection behavior."><PropsTable title="DropdownMenu" props={[{ name: 'id', type: 'string', required: true, description: 'Stable id used to wire the trigger and popover panel.' }, { name: 'triggerLabel', type: 'string', default: "''", description: 'Label for the default trigger.' }, { name: 'placement', type: "'bottom' | 'bottom-end' | 'bottom-start' | 'top' | 'top-end' | 'top-start'", default: "'bottom-end'", description: 'Anchor placement for the panel.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'onToggle', type: '(open: boolean) => void', description: 'Receives native open-state changes.' }]} /><div class="mt-5"><PropsTable title="DropdownMenuItem" props={[{ name: 'destructive', type: 'boolean', default: 'false', description: 'Uses destructive paint while preserving menuitem semantics.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }]} /></div></SectionCard></div>
</div>
