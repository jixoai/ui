<!--
  jixoai terminal header (registry/files/ui/terminal-header.svelte).
  The site nav bar: a clear two-wing layout — LEFT carries the brand
  (logo slot + wordmark + domain/subtitle), RIGHT carries the navigation
  (pills + external links + switcher slot).

  Theme lock: the bar is a CRT bezel locked DARK by default; components
  inside render with dark tokens because the wrapper carries the scoped
  token class (dark). Declare theme="light" or "system" to unlock.

  Responsive:
    desktop (≥lg)  one row: full brand stack left, nav + switcher right
    tablet (sm–lg) one row: logo + brand + domain left, compact nav right
    mobile (<sm)   row 1: logo + brand left, switcher right;
                   row 2: nav pills, full-width horizontal scroll
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface TerminalNavItem {
    label: string;
    href: string;
    active?: boolean;
    external?: boolean;
  }

  interface Props {
    brand: string;
    items: TerminalNavItem[];
    logo?: Snippet;
    domain?: string;
    subtitle?: string;
    switcher?: Snippet;
    theme?: 'dark' | 'light' | 'system';
    homeHref?: string;
  }

  let {
    brand,
    items,
    logo,
    domain,
    subtitle,
    switcher,
    theme = 'dark',
    homeHref = '/',
  }: Props = $props();

  // scoped token class: 'dark' (default lock) or 'jx-light'
  let scope = $state<'dark' | 'light'>(theme === 'light' ? 'light' : 'dark');

  $effect(() => {
    if (theme !== 'system') {
      scope = theme === 'light' ? 'light' : 'dark';
      return;
    }
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => (scope = media.matches ? 'dark' : 'light');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  });
</script>

<header class="jx-nav {scope === 'dark' ? 'dark' : 'jx-light'}">
  <div class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between gap-4 py-3">
      <!-- LEFT WING: brand -->
      <a href={homeHref} class="flex min-w-0 items-center gap-3">
        {#if logo}
          <span class="flex h-8 w-8 flex-none items-center justify-center">
            {@render logo()}
          </span>
        {/if}
        <span class="flex min-w-0 flex-col">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em] leading-tight">
            {brand}
          </span>
          {#if domain}
            <span class="font-nav truncate text-sm leading-tight">{domain}</span>
          {/if}
          {#if subtitle}
            <span class="hidden truncate text-[11px] leading-tight opacity-60 lg:block">
              {subtitle}
            </span>
          {/if}
        </span>
      </a>

      <!-- RIGHT WING: nav (tablet/desktop) + switcher (all sizes) -->
      <div class="flex items-center gap-3">
        <nav class="hidden items-center gap-1 text-xs sm:flex" aria-label="Primary">
          {#each items as item (item.href)}
            <a
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              class={[
                'px-2.5 py-1 transition-colors',
                item.active
                  ? 'bg-terminal-hover text-terminal-foreground'
                  : 'text-terminal-foreground/70 hover:text-terminal-foreground',
              ].join(' ')}
            >
              {item.label}{item.external ? ' ↗' : ''}
            </a>
          {/each}
        </nav>
        {#if switcher}
          {@render switcher()}
        {/if}
      </div>
    </div>

    <!-- mobile nav row: full-width horizontal scroll under the brand row -->
    <nav
      class="no-scrollbar -mx-4 flex items-center gap-1 overflow-x-auto border-t border-terminal-foreground/10 pb-2 pt-2 text-xs sm:hidden sm:-mx-0 sm:border-0"
      aria-label="Primary"
    >
      {#each items as item (item.href)}
        <a
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noreferrer' : undefined}
          class={[
            'flex-none px-2.5 py-1 transition-colors',
            item.active
              ? 'bg-terminal-hover text-terminal-foreground'
              : 'text-terminal-foreground/70 hover:text-terminal-foreground',
          ].join(' ')}
        >
          {item.label}{item.external ? ' ↗' : ''}
        </a>
      {/each}
    </nav>
  </div>
</header>

<style>
  .jx-nav {
    background: var(--terminal);
    color: var(--terminal-foreground);
    border-bottom: 1px solid var(--border);
  }
  /* the bezel keeps native controls dark even in the light scope */
  .jx-nav.dark {
    color-scheme: dark;
  }
  .jx-nav.jx-light {
    color-scheme: light;
  }
  .no-scrollbar {
    scrollbar-width: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
