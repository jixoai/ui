<!--
  jixoai navigation menu (registry/files/ui/navigation-menu.svelte).
  The site-nav pattern: a horizontal bar of top-level triggers, each
  with an OPTIONAL panel of links — the part raw popovers don't give
  you is the NAVIGATION contract, so this is an independent thin
  coordinator (batch-4 ruling), not "just popovers":

    top-level focus walking is the bar's: ←/→ move between triggers
    (roving tabindex over triggers, like tabs — a nav bar is walked,
    not hunted); Enter/Space/click opens the panel; Escape closes and
    focus returns to the trigger. Hover OPENS with 150ms intent (the
    terminal voice: pointer users glide) and moving between adjacent
    triggers swaps panels without a close bounce.

  Panels are popover=auto (native light dismiss + one-at-a-time) with
  CSS anchor positioning, and they carry REAL LINKS — navigation-menu
  moves you through a site; actions belong to dropdown-menu.
  The current section marks its trigger aria-current (the page's own
  truth, passed in — the menu never guesses).

  Data-driven: items carry label + href + a panel slot id; panels are
  composed through the `panel` snippet keyed by item id.

  tw4 (2026-08-24): bar/trigger/link paint as token utilities (the
  current + open states are JS-known → conditional strings, preserving
  the original hover-beats-aria-current specificity order); ONLY the
  anchored panel law (position-try geometry, the @supports
  viewport-center fallback, ::backdrop) remains in navigation-menu.css
  — D1-exempt residue.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './navigation-menu.css';

  export interface NavMenuItem {
    id: string;
    label: string;
    /** the section root — the trigger links there when no panel */
    href?: string;
    /** set on the section's own top-level trigger */
    current?: boolean;
    /** has a panel (renders via the panel snippet) */
    hasPanel?: boolean;
  }

  interface Props {
    items: NavMenuItem[];
    /** nav landmark label */
    label?: string;
    /** panel content per item id (rendered inside the popover) */
    panel?: Snippet<[NavMenuItem]>;
    /** hover-intent open delay (ms); 0 = instant */
    openDelay?: number;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
  }

  let {
    items,
    label = 'site',
    panel,
    openDelay = 150,
    variant = 'auto',
    class: className = '',
  }: Props = $props();

  let openId = $state('');
  /** the roving tab stop follows arrow focus (initial: current ?? first) */
  let activeId = $state('');
  let hoverTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => () => clearTimeout(hoverTimer));

  const anchorOf = (id: string): string =>
    `--jx-navmenu-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  function open(id: string): void {
    clearTimeout(hoverTimer);
    openId = id;
    const el = document.getElementById(`jx-navmenu-panel-${id}`);
    if (el && typeof el.showPopover === 'function' && !el.matches(':popover-open')) {
      el.showPopover();
    }
  }
  function close(id: string): void {
    clearTimeout(hoverTimer);
    if (openId === id) openId = '';
    const el = document.getElementById(`jx-navmenu-panel-${id}`);
    if (el && typeof el.hidePopover === 'function' && el.matches(':popover-open')) {
      el.hidePopover();
    }
  }
  function hoverIntent(id: string): void {
    clearTimeout(hoverTimer);
    if (openId === id) return;
    hoverTimer = setTimeout(() => open(id), openDelay);
  }
  function leaveBar(): void {
    if (openId === '') return;
    // grace: let the pointer cross into the open panel
    hoverTimer = setTimeout(() => close(openId), 250);
  }

  /** the bar's own keyboard walk — arrows move between triggers */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const triggers = [
      ...(barEl?.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="true"]') ?? []),
    ];
    if (triggers.length === 0) return;
    const current = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    event.preventDefault();
    const next =
      triggers[(current + (event.key === 'ArrowRight' ? 1 : -1) + triggers.length) % triggers.length];
    const target = items.find((i) => `jx-navmenu-trigger-${i.id}` === next.id);
    if (target) activeId = target.id;
    next.focus();
    // an open panel follows the walk (menubar glide behavior)
    if (openId !== '') {
      const item = items.find((i) => `jx-navmenu-trigger-${i.id}` === next.id);
      if (item) {
        close(openId);
        open(item.id);
      }
    }
  }

  let barEl = $state<HTMLElement | null>(null);

  // one tab stop on the bar: the LAST-FOCUSED trigger, falling back to
  // the current section's trigger, else the first
  const tabStopId = $derived(
    (activeId || items.find((item) => item.current && item.hasPanel)?.id) ??
      items.find((item) => item.hasPanel)?.id ??
      '',
  );

  // the shared trigger/link paint; the current/open color states are
  // conditional strings (mirroring the scoped era's specificity order:
  // open beats current, hover beats current-but-closed)
  const itemPaint =
    'inline-flex items-center px-[0.875rem] py-2 font-nav text-xs uppercase tracking-[0.12em] no-underline cursor-pointer transition-colors duration-150 ease-out focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_no_static_element_interactions -- the
     nav hosts the top-level arrow walk; its triggers are the
     interactive elements -->
<nav
  bind:this={barEl}
  class={cn('jx-navmenu flex flex-wrap items-stretch gap-1', className)}
  aria-label={label}
  onkeydown={handleKeydown}
  onpointerleave={leaveBar}
>
  {#each items as item (item.id)}
    {#if item.hasPanel}
      <span
        class="jx-navmenu-slot inline-flex"
        style="anchor-name: {anchorOf(item.id)}"
        onpointerenter={() => hoverIntent(item.id)}
      >
        <button
          type="button"
          id="jx-navmenu-trigger-{item.id}"
          aria-haspopup="true"
          aria-expanded={openId === item.id}
          aria-current={item.current ? 'true' : undefined}
          tabindex={tabStopId === item.id ? 0 : -1}
          class={cn(
            itemPaint,
            openId === item.id
              ? 'text-foreground'
              : item.current
                ? 'text-primary hover:text-foreground'
                : 'text-muted-foreground hover:text-foreground',
          )}
          popovertarget="jx-navmenu-panel-{item.id}"
          onfocus={() => (activeId = item.id)}
        >
          {item.label}
        </button>
      </span>
    {:else if item.href}
      <a
        class={cn('jx-navmenu-link', itemPaint, item.current ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
        href={item.href}
        aria-current={item.current ? 'page' : undefined}
      >
        {item.label}
      </a>
    {/if}
  {/each}
</nav>

{#each items.filter((item) => item.hasPanel) as item (item.id)}
<!-- svelte-ignore a11y_no_static_element_interactions -- the panel's
     pointer handlers only manage hover intent; its links act -->
  <div
    id="jx-navmenu-panel-{item.id}"
    popover="auto"
    class="jx-navmenu-panel jx-surface"
    data-variant={variant}
    style="position-anchor: {anchorOf(item.id)}; inset-area: bottom span-left; position-area: bottom span-left;"
    onpointerenter={() => clearTimeout(hoverTimer)}
    onpointerleave={() => hoverTimer && close(item.id)}
    onkeydown={(e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(item.id);
        document.getElementById(`jx-navmenu-trigger-${item.id}`)?.focus();
      }
    }}
    ontoggle={(e: Event) => {
      const panel = e.currentTarget as HTMLElement;
      const isOpen = panel.matches(':popover-open');
      if (isOpen) openId = item.id;
      else if (openId === item.id) openId = '';
    }}
  >
    <!-- surface body (fill + ::after shadow); the popover element paints
         nothing (floating-surface law arch r3) -->
    <div class="jx-navmenu-surface jx-surface-body px-[0.875rem] py-3">
      {#if panel}
        {@render panel(item)}
      {/if}
    </div>
  </div>
{/each}
