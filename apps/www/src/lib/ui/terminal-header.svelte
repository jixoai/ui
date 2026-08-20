<!--
  jixoai terminal header (registry/files/ui/terminal-header.svelte).
  Always-dark CRT bezel: brand eyebrow in brand hue, domain + subtitle,
  nav pills (active = terminal-hover bg), external links with ↗. The
  switcher snippet slot (theme toggle) renders at the far right.
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
    domain: string;
    subtitle?: string;
    items: TerminalNavItem[];
    switcher?: Snippet;
  }

  let { brand, domain, subtitle, items, switcher }: Props = $props();
</script>

<header class="border-border bg-terminal text-terminal-foreground border-b">
  <div
    class="mx-auto flex max-w-[90rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
  >
    <a href="/" class="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-3">
      <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">{brand}</p>
      <span class="font-nav truncate text-sm tracking-tight sm:text-base">{domain}</span>
      {#if subtitle}
        <span class="truncate text-xs text-terminal-foreground/70">{subtitle}</span>
      {/if}
    </a>

    <nav class="flex flex-wrap items-center gap-2 text-xs" aria-label="Primary">
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
      {#if switcher}
        {@render switcher()}
      {/if}
    </nav>
  </div>
</header>
