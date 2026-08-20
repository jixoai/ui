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
    <!-- rainbow swatch fan = the primary formula swept across six
         equidistant hues (each square IS a system primary: dark profile
         oklch(0.7044 0.1872 H) with the law's -4deg drift, hues
         356/56/116/176/236/296). Geometrically balanced (2026-08-21):
         centers strictly equidistant (stride 7) — the eye tracks centers;
         180° rotational symmetry (C_i + C_{5-i} = 48) with the bell sizes
         11,14.5,18,18,14.5,11 — no heavy end, equal 1px margins all round;
         exposure bands widen toward the tail, compensating the shrinking
         squares so every hue reads with similar visual weight -->
    <svg viewBox="0 0 48 48" class="h-7 w-7" aria-hidden="true">
      {#each [
          { hue: 356, size: 11, center: 6.5 },
          { hue: 56, size: 14.5, center: 13.5 },
          { hue: 116, size: 18, center: 20.5 },
          { hue: 176, size: 18, center: 27.5 },
          { hue: 236, size: 14.5, center: 34.5 },
          { hue: 296, size: 11, center: 41.5 },
        ] as swatch (swatch.hue)}
        {@const pos = swatch.center - swatch.size / 2}
        <rect
          x={pos}
          y={pos}
          width={swatch.size}
          height={swatch.size}
          fill="oklch(0.7044 0.1872 {swatch.hue})"
          stroke="oklch(1 0 0 / 0.85)"
          stroke-width="2"
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
