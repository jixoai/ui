<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import NavigationMenu from '$lib/ui/navigation-menu.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import navigationMenuSource from '$lib/ui/navigation-menu.svelte?raw';

  const close = '</' + 'script>';

  // ToC outline: the live demo band + the usage closing section.

  const usage = `<script lang="ts">
  import NavigationMenu from '@ui/navigation-menu.svelte';
${close}

<NavigationMenu label="site" items={[
  { id: 'registry', label: 'registry', hasPanel: true },
  { id: 'components', label: 'components', hasPanel: true, current: true },
  { id: 'docs', label: 'docs', href: '/docs' },
]}>
  {#snippet panel(item)}
    <!-- real links — navigation-menu MOVES you; actions live in dropdown-menu -->
  {/snippet}
</NavigationMenu>`;

  const canvasUsage = `<NavigationMenu {items} label="site">
  {#snippet panel(item)}…links…{/snippet}
</NavigationMenu>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/navigation-menu.svelte', content: navigationMenuSource },
    { name: 'src/lib/ui/navigation-menu-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Navigation menu · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai navigation menu: the site-nav bar as an independent thin coordinator — arrow walking, hover intent with glide, popover=auto panels carrying real links."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="navigation menu — a bar you WALK, with panels that glide"
      summary="The site-nav pattern as an independent thin coordinator: ←/→ walk the top-level triggers (one tab stop, on the current section), hover opens with 150ms intent, and moving between adjacent triggers swaps panels without a close bounce. Panels are popover=auto with CSS anchoring and carry REAL LINKS — navigation moves you; actions belong to dropdown-menu."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">roving walk</span>
        <span class="pill">hover intent 150ms</span>
        <span class="pill">panels = links</span>
      </div>
    </SectionCard>
  </div>

  <div id="navmenu-demo" data-region="navmenu-demo" data-family="navmenu-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="navigation menu"
      description="Tab to the bar (components is the tab stop — it's the current section), walk with arrows, hover to glide between panels, Escape closes."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/navigation-menu.svelte"
      files={canvasFiles}
    >
      <NavigationMenu
        label="demo site"
        items={[
          { id: 'registry', label: 'registry', hasPanel: true },
          { id: 'components', label: 'components', hasPanel: true, current: true },
          { id: 'tokens', label: 'tokens', href: '/tokens.html' },
        ]}
      >
        {#snippet panel(item)}
          <div class="flex min-w-44 flex-col gap-1">
            {#each [1, 2, 3] as n (n)}
              <a class="jx-demo-nav-link" href="/components.html">{item.label} link {n}</a>
            {/each}
          </div>
        {/snippet}
      </NavigationMenu>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          plain items (href, no panel) render as ordinary links with aria-current — the bar mixes
          panel triggers and links freely; openDelay tunes the hover intent (0 = instant).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="navmenu-base" data-reveal="" use:reveal>
    <SectionCard
      family="navmenu-base"
      headerRegion="navmenu-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
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
