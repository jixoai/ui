<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import TerminalFooter from '$lib/ui/terminal-footer.svelte';
  import TerminalHeader from '$lib/ui/terminal-header.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
  import { GITHUB_URL } from '$lib/site';

  let { children }: { children: Snippet } = $props();

  // Pages are flat files (/, /components.html, /tokens.html); prerendered
  // paths lack the .html suffix the browser shows.
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  const items = [
    { href: '/', label: 'Overview', active: normalized === '/' },
    { href: '/components.html', label: 'Components', active: normalized === '/components' },
    { href: '/tokens.html', label: 'Tokens', active: normalized === '/tokens' },
    { href: GITHUB_URL, label: 'GitHub', external: true },
  ];
</script>

<a href="#main" class="skip-link">Skip to content</a>
<div class="flex min-h-screen flex-col bg-background text-foreground">
  <TerminalHeader
    brand="jixoai/ui"
    domain="ui.jixoai.com"
    subtitle="the jixoai design language"
    {items}
  >
{#snippet logo()}
    <!-- rainbow swatch fan: six hues, bell-curve sizes (small→large→small),
         hard offset strokes — the freedom of the One-Hue Law -->
    <svg viewBox="0 0 36 36" class="h-7 w-7" aria-hidden="true">
      {#each [
          { hue: 0, size: 8 },
          { hue: 60, size: 11 },
          { hue: 120, size: 14 },
          { hue: 180, size: 14 },
          { hue: 240, size: 11 },
          { hue: 300, size: 8 },
        ] as swatch, i (swatch.hue)}
        {@const center = 7 + i * 4.4}
        {@const pos = center - swatch.size / 2}
        <rect
          x={pos}
          y={pos}
          width={swatch.size}
          height={swatch.size}
          fill="oklch(0.7044 0.1872 {swatch.hue})"
          stroke="oklch(1 0 0 / 0.85)"
          stroke-width="1.5"
        />
      {/each}
    </svg>
  {/snippet}
    {#snippet switcher()}
      <ThemeToggle />
    {/snippet}
  </TerminalHeader>
  <main id="main" class="flex-1">
    {@render children()}
  </main>
  <TerminalFooter
    ghost="JIXOAI/UI"
    links={[
      { label: 'GitHub', href: GITHUB_URL },
      { label: 'Registry JSON', href: '/r/registry.json' },
      { label: 'shadcn registry docs', href: 'https://ui.shadcn.com/docs/registry' },
    ]}
    copyright="© 2026 jixoai · MIT"
  />
</div>
