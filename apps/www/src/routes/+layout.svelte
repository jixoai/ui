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
