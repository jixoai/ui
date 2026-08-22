<script lang="ts">
  import Badge from '$lib/ui/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import DropdownMenu from '$lib/ui/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu-item.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import dropdownMenuSource from '$lib/ui/dropdown-menu.svelte?raw';
  import dropdownMenuItemSource from '$lib/ui/dropdown-menu-item.svelte?raw';

  // ToC outline: the live demo band + the platform/component split closing.
  const tocSections = [
    { id: 'dropdown-menu-demo', label: 'live demo' },
    { id: 'dropdown-menu-base', label: 'platform / component split' },
  ];

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
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
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

  <div id="dropdown-menu-demo" data-region="dropdown-menu-demo" data-family="dropdown-menu-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="dropdown menu"
      description="Open it, then walk with arrows or type a letter ('d' jumps to Duplicate). Selecting runs the action, closes the menu, and hands focus back to the trigger."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/dropdown-menu.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'last action', value: lastAction || '—' }]}
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
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          keyboard: ↓/↑ walk and wrap, Home/End jump the ends, <code class="text-accent">d</code>
          typeahead-jumps to Duplicate, Enter selects, Escape closes and focus lands back on the
          trigger. Clicking elsewhere light-dismisses — and focus stays where you clicked.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="dropdown-menu-base" data-reveal="" use:reveal>
    <SectionCard
      family="dropdown-menu-base"
      headerRegion="dropdown-menu-base"
      eyebrow="NativeHTML 基座"
      title="Platform / component split"
      summary="The platform owns the surface behavior (light dismiss, Escape, top layer, anchoring); the component owns the menu contract (item focus, walk, typeahead, focus restore). Items are real buttons — any [role=menuitem] joins the walk through DOM delegation, no registration."
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center gap-3 text-[13px]">
          <span class="text-muted-foreground">composition:</span>
          <Badge>item button</Badge>
          <Badge tone="outline">separator = plain hr</Badge>
          <Badge tone="outline">label = plain markup</Badge>
          <Badge tone="destructive">destructive = paint, same semantics</Badge>
        </div>
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>
