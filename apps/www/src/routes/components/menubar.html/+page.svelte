<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Menubar from '$lib/ui/menubar.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import menubarSource from '$lib/ui/menubar.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Menubar from '@ui/menubar.svelte';
${close}

<Menubar label="app" items={[
  { id: 'file', label: 'File' },
  { id: 'edit', label: 'Edit' },
]}>
  {#snippet panel(item)}
    <button type="button" role="menuitem"
      onclick={() => run(item)}>do the thing</button>
  {/snippet}
</Menubar>`;

  const canvasUsage = `<Menubar {items} label="app">
  {#snippet panel(item)}…menuitem buttons…{/snippet}
</Menubar>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/menubar.svelte', content: menubarSource },
    { name: 'src/lib/ui/menubar-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Menubar · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai menubar: the application menu bar with its own walker — arrows glide between top menus, panels carry your actions, Escape returns to the bar."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="menubar — File, Edit, View, ruled by the platform's gap"
      summary="The application menu bar's top-level contract differs from stacked dropdowns, so it gets its OWN walker: ←/→ move between triggers with panels gliding after an open bar; ↓/↑/Enter opens and focuses the first item; Home/End jump; Escape returns to the trigger. Panels are popover=auto role=menu; the items inside are YOURS (buttons act, links leave)."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=menubar</span>
        <span class="pill">glide walking</span>
        <span class="pill">popover=auto panels</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="menubar"
      description="Tab to File, ↓ to open and walk items, → with the panel open glides to Edit, Escape returns to the bar."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/menubar.svelte"
      files={canvasFiles}
    >
      <Menubar
        label="demo app"
        items={[
          { id: 'file', label: 'File' },
          { id: 'edit', label: 'Edit' },
          { id: 'view', label: 'View' },
        ]}
      >
        {#snippet panel(item)}
          <div class="flex min-w-40 flex-col">
            {#each ['action a', 'action b', 'action c'] as action (action)}
              <button type="button" role="menuitem" class="jx-demo-bar-item">
                {item.label}: {action}
              </button>
            {/each}
          </div>
        {/snippet}
      </Menubar>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the panel walk (↓/↑/Home/End, wrapping) is the menu contract shared with
          dropdown-menu — duplicated deliberately so registry items stay independent. Content is
          yours: bring role=menuitem buttons or links.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="menubar-base" eyebrow="ARIA 契约" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>

<style>
  .jx-demo-bar-item {
    display: block;
    width: 100%;
    padding: 0.4375rem 0.625rem;
    border: 0;
    background: transparent;
    color: inherit;
    font-size: 0.8125rem;
    text-align: left;
    cursor: pointer;
  }
  .jx-demo-bar-item:hover,
  .jx-demo-bar-item:focus-visible {
    background: var(--muted);
    outline: none;
  }
</style>
