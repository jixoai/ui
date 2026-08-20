<!--
  jixoai terminal header (registry/files/ui/terminal-header.svelte).
  The site nav bar: a strict two-wing layout — LEFT carries the brand
  (logo slot + wordmark + domain/subtitle, the page's identity), RIGHT
  carries the navigation as one bordered pill group (the page's routes)
  plus the switcher slot. The wings never mix.

  Theme lock: the bar is a CRT bezel locked DARK by default; components
  inside render with dark tokens because the wrapper carries the scoped
  token class (dark). Declare theme="light" or "system" to unlock.

  Responsive — three deliberate tiers:
    desktop (≥lg)   one row: logo + full brand stack LEFT; complete nav
                    pill group + switcher RIGHT
    tablet (sm–lg)  one row: logo + brand + domain LEFT (no subtitle);
                    compact nav group + switcher RIGHT
    mobile (<sm)    row 1: logo + brand LEFT; switcher + hamburger RIGHT;
                    the nav opens as a stacked disclosure panel below
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
  let open = $state(false);

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

  const close = () => (open = false);
</script>

<header class="jx-nav {scope === 'dark' ? 'dark' : 'jx-light'}">
  <div class="mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between gap-4 py-3">
      <!-- LEFT WING · the brand -->
      <a href={homeHref} class="flex min-w-0 flex-1 items-center gap-3">
        {#if logo}
          <span class="flex h-8 w-8 flex-none items-center justify-center">
            {@render logo()}
          </span>
        {/if}
        <span class="flex min-w-0 flex-col gap-0.5">
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

      <!-- RIGHT WING · the navigation -->
      <div class="flex flex-none items-center gap-3">
        <nav
          class="hidden items-center border border-terminal-foreground/25 p-0.5 text-xs sm:flex"
          aria-label="Primary"
        >
          {#each items as item (item.href)}
            <a
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              class={[
                'px-2.5 py-1 transition-colors lg:px-3',
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
        <button
          type="button"
          class="flex h-8 w-8 flex-col items-center justify-center gap-[3px] border border-terminal-foreground/25 sm:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onclick={() => (open = !open)}
        >
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground"></span>
        </button>
      </div>
    </div>

    <!-- mobile disclosure: the same nav, stacked below the bar -->
    <div
      class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 sm:hidden"
      class:grid-rows-[1fr]={open}
    >
      <div class="overflow-hidden">
        <nav class="flex flex-col border-t border-terminal-foreground/10 py-2 text-xs" aria-label="Primary">
          {#each items as item (item.href)}
            <a
              href={item.href}
              onclick={close}
              aria-current={item.active ? 'page' : undefined}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              class={[
                'px-1 py-2 transition-colors',
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
    </div>
  </div>
</header>

<style>
  /* the hamburger bars fold into an ✕ while the panel is open */
  .jx-nav button[aria-expanded='true'] .jx-bar:first-child {
    transform: translateY(4.5px) rotate(45deg);
  }
  .jx-nav button[aria-expanded='true'] .jx-bar:last-child {
    transform: translateY(-4.5px) rotate(-45deg);
  }
  .jx-nav .jx-bar {
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .jx-nav .jx-bar,
    .jx-nav .grid {
      transition: none;
    }
  }
  /* interaction polish on the bezel: WebKit's default tap-highlight is a
     semi-transparent black flash that reads as a bug on the dark surface;
     idle pills gain a hover affordance; focus gets a contained ring
     instead of the site-wide 2px offset outline */
  .jx-nav a,
  .jx-nav button {
    -webkit-tap-highlight-color: transparent;
  }
  .jx-nav nav a:not([aria-current='page']):hover {
    background: var(--terminal-hover);
  }
  .jx-nav :where(a, button):focus-visible {
    outline: 1px solid color-mix(in oklab, var(--terminal-foreground) 80%, transparent);
    outline-offset: -1px;
  }
</style>
