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
                    the nav opens as a stacked disclosure panel below,
                    items with children expanding as nested grid-rows
                    0fr→1fr groups (the parent row toggles; an "all →"
                    link keeps the parent href reachable)

  Second-level nav (2026-08-20, request: click + hover submenus on the
  native Popover API; nested disclosures on mobile): items may carry
  `children`. Desktop pills with children orchestrate a popover="auto"
  panel through JS only (showPopover/hidePopover — never a declarative
  popovertarget, because the pill stays a link and hover needs grace
  timers); light dismiss, Escape, top layer and focus restore remain
  browser-native. The panel repeats the header's scope class so its
  tokens resolve from itself, not from DOM ancestry surviving the
  top-layer promotion. This is the file's 5th orthogonal intent — at
  the cap; do not add more here.
-->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  export interface TerminalNavSubItem {
    label: string;
    href: string;
    external?: boolean;
    /** Optional one-line muted description under the label. */
    description?: string;
    /** Marks the current page inside the dropdown / disclosure list. */
    active?: boolean;
  }

  export interface TerminalNavItem {
    label: string;
    href: string;
    active?: boolean;
    external?: boolean;
    /** Second level: desktop popover dropdown, mobile disclosure group. */
    children?: TerminalNavSubItem[];
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

  /* -----------------------------------------------------------------
   * Second-level nav orchestration. openKey mirrors the panels' toggle
   * events — the native close paths (light dismiss, Escape) run without
   * our handlers, so the events are the single source of truth and
   * aria-expanded never lies.
   * --------------------------------------------------------------- */
  const HOVER_GRACE_MS = 120;
  const PANEL_GAP = 6;

  let openKey = $state<string | null>(null);
  // 'hover' panels survive their first click (the click confirms the
  // hover intent); only a second click on a click-opened panel closes.
  let openedBy: 'hover' | 'click' | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerEls: Record<string, HTMLAnchorElement | null> = {};
  const panelEls: Record<string, HTMLElement | null> = {};
  let panelPos = $state<Record<string, { top: string; left: string }>>({});

  const cancelClose = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };
  const hidePanel = (key: string) => {
    const panel = panelEls[key];
    if (panel?.matches(':popover-open')) {
      try {
        panel.hidePopover();
      } catch {
        /* engine quirk: already hidden */
      }
    }
  };
  const showPanel = (key: string, by: 'hover' | 'click') => {
    const panel = panelEls[key];
    if (!panel || typeof panel.showPopover !== 'function') return;
    // pre-position from the trigger rect so the first painted frame is
    // already anchored; rAF refines the clamp once the panel measures
    const rect = triggerEls[key]?.getBoundingClientRect();
    if (rect) panelPos[key] = { top: `${rect.bottom + PANEL_GAP}px`, left: `${rect.left}px` };
    openedBy = by;
    if (!panel.matches(':popover-open')) {
      try {
        panel.showPopover();
      } catch {
        /* engine quirk: already showing */
      }
    }
  };
  const scheduleClose = (key: string) => {
    cancelClose();
    closeTimer = setTimeout(() => hidePanel(key), HOVER_GRACE_MS);
  };
  const positionPanel = (key: string) => {
    const trigger = triggerEls[key];
    const panel = panelEls[key];
    if (!trigger || !panel) return;
    const rect = trigger.getBoundingClientRect();
    const left = Math.min(Math.max(PANEL_GAP, rect.left), innerWidth - panel.offsetWidth - PANEL_GAP);
    panelPos[key] = { top: `${rect.bottom + PANEL_GAP}px`, left: `${left}px` };
  };
  const onPanelToggle = (key: string, event: Event) => {
    if ((event as ToggleEvent).newValue) {
      openKey = key;
      requestAnimationFrame(() => positionPanel(key));
    } else {
      if (openKey === key) openKey = null;
      openedBy = null;
      cancelClose();
    }
  };
  onDestroy(cancelClose);

  // mobile: expanded disclosure groups, keyed by the parent href as well
  let expanded = $state<Record<string, boolean>>({});

  // Sliding indicator (Owner, 2026-08-21): a dedicated element acts as the
  // active background and slides between nav items (measured translateX +
  // width). It carries the vt-nav-active name, so cross-page navigations
  // morph it via the view transition; same-page/no-VT swaps fall back to
  // its own CSS transition.
  let navEl = $state<HTMLElement | null>(null);
  let indicatorEl = $state<HTMLElement | null>(null);

  const positionIndicator = (instant = false) => {
    if (!navEl || !indicatorEl) return;
    // direct pill anchors only — dropdown child links carry their own
    // aria-current and must never steal the indicator
    const active = navEl.querySelector(':scope > a[aria-current="page"]');
    if (!(active instanceof HTMLElement)) {
      indicatorEl.style.opacity = '0';
      return;
    }
    if (instant) indicatorEl.classList.add('jx-indicator-instant');
    indicatorEl.style.opacity = '1';
    indicatorEl.style.width = `${active.offsetWidth}px`;
    indicatorEl.style.transform = `translateX(${active.offsetLeft}px)`;
    if (instant) {
      requestAnimationFrame(() => indicatorEl?.classList.remove('jx-indicator-instant'));
    }
  };

  let measured = false;
  $effect(() => {
    // runs on mount and whenever items/active change: the first measure is
    // instant (no slide from 0); every later move animates via the CSS
    // transition — the VT morph covers the visual when a transition runs
    void items;
    positionIndicator(!measured);
    measured = true;
  });

  onMount(() => {
    const reposition = () => positionIndicator(false);
    const ro = new ResizeObserver(reposition);
    if (navEl) ro.observe(navEl);
    document.fonts?.ready.then(reposition).catch(() => {});
    return () => ro.disconnect();
  });
</script>

{#snippet caret()}
  <svg
    class="jx-caret"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
{/snippet}

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
          class="relative hidden items-center border border-terminal-foreground/25 p-0.5 text-xs sm:flex"
          aria-label="Primary"
          bind:this={navEl}
        >
          <span class="jx-indicator" bind:this={indicatorEl} aria-hidden="true"></span>
          {#each items as item, i (item.href)}
            {#if item.children?.length}
              <a
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                aria-haspopup="true"
                aria-expanded={openKey === item.href ? 'true' : 'false'}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                class={[
                  'inline-flex items-center gap-1 px-2.5 py-1 transition-colors lg:px-3',
                  item.active
                    ? 'text-terminal-foreground'
                    : 'text-terminal-foreground/70 hover:text-terminal-foreground',
                ].join(' ')}
                bind:this={triggerEls[item.href]}
                onclick={(event) => {
                  const panel = panelEls[item.href];
                  if (!panel || typeof panel.showPopover !== 'function') return; // no popover engine: navigate
                  event.preventDefault();
                  cancelClose();
                  if (panel.matches(':popover-open')) {
                    if (openedBy === 'click') hidePanel(item.href);
                    else openedBy = 'click';
                  } else {
                    showPanel(item.href, 'click');
                  }
                }}
                onmouseenter={() => {
                  cancelClose();
                  showPanel(item.href, 'hover');
                }}
                onmouseleave={() => scheduleClose(item.href)}
              >
                {item.label}{item.external ? ' ↗' : ''}
                {@render caret()}
              </a>
              <!-- the second-level panel: native top layer + light dismiss;
                   JS only owns hover grace, click toggling and placement -->
              <div
                id="jx-nav-sub-{i}"
                popover="auto"
                role="group"
                aria-label={item.label}
                class="jx-subpanel {scope === 'dark' ? 'dark' : 'jx-light'}"
                style="top: {panelPos[item.href]?.top ?? '0px'}; left: {panelPos[item.href]?.left ?? '0px'};"
                ontoggle={(event) => onPanelToggle(item.href, event)}
                onmouseenter={() => cancelClose()}
                onmouseleave={() => scheduleClose(item.href)}
                bind:this={panelEls[item.href]}
              >
                <div class="flex flex-col p-1">
                  {#each item.children as child (child.href)}
                    <a
                      href={child.href}
                      aria-current={child.active ? 'page' : undefined}
                      target={child.external ? '_blank' : undefined}
                      rel={child.external ? 'noreferrer' : undefined}
                      class="jx-sub-link"
                      onclick={() => hidePanel(item.href)}
                    >
                      <span class="flex flex-col gap-0.5 px-2.5 py-1.5">
                        <span>{child.label}{child.external ? ' ↗' : ''}</span>
                        {#if child.description}
                          <span class="text-[10px] leading-tight opacity-60">{child.description}</span>
                        {/if}
                      </span>
                    </a>
                  {/each}
                </div>
              </div>
            {:else}
              <a
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                class={[
                  'px-2.5 py-1 transition-colors lg:px-3',
                  item.active
                    ? 'text-terminal-foreground'
                    : 'text-terminal-foreground/70 hover:text-terminal-foreground',
                ].join(' ')}
              >
                {item.label}{item.external ? ' ↗' : ''}
              </a>
            {/if}
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
            {#if item.children?.length}
              <!-- parent row: full-width disclosure toggle; the parent
                   href survives as the adjacent "all →" link -->
              <div class="flex items-stretch">
                <button
                  type="button"
                  class={[
                    'flex flex-1 items-center gap-1 px-1 py-2 text-left transition-colors',
                    item.active
                      ? 'text-terminal-foreground'
                      : 'text-terminal-foreground/70 hover:text-terminal-foreground',
                  ].join(' ')}
                  aria-expanded={expanded[item.href] ? 'true' : 'false'}
                  onclick={() => (expanded[item.href] = !expanded[item.href])}
                >
                  {item.label}
                  {@render caret()}
                </button>
                <a
                  href={item.href}
                  onclick={close}
                  aria-label="all {item.label}"
                  class="flex items-center px-2 text-terminal-foreground/60 transition-colors hover:text-terminal-foreground"
                >
                  all →
                </a>
              </div>
              <!-- nested group: the same height-only collapse as the
                   panel itself (grid-rows 0fr → 1fr) -->
              <div
                class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200"
                class:grid-rows-[1fr]={expanded[item.href]}
              >
                <div class="overflow-hidden">
                  <div class="flex flex-col border-l border-terminal-foreground/15 pl-3">
                    {#each item.children as child (child.href)}
                      <a
                        href={child.href}
                        onclick={close}
                        aria-current={child.active ? 'page' : undefined}
                        target={child.external ? '_blank' : undefined}
                        rel={child.external ? 'noreferrer' : undefined}
                        class={[
                          'flex flex-col gap-0.5 py-1.5 pl-2 transition-colors',
                          child.active
                            ? 'bg-terminal-hover text-terminal-foreground'
                            : 'text-terminal-foreground/70 hover:text-terminal-foreground',
                        ].join(' ')}
                      >
                        <span>{child.label}{child.external ? ' ↗' : ''}</span>
                        {#if child.description}
                          <span class="text-[10px] leading-tight opacity-60">{child.description}</span>
                        {/if}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
            {:else}
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
            {/if}
          {/each}
        </nav>
      </div>
    </div>
  </div>
</header>

<style>
  /* the bezel surface: without this the bar is transparent and the
     dark-scoped white text sits on the page background — invisible */
  .jx-nav {
    background: var(--terminal);
    color: var(--terminal-foreground);
    border-bottom: 1px solid var(--border);
  }
  .jx-nav.dark {
    color-scheme: dark;
  }
  .jx-nav.jx-light {
    color-scheme: light;
  }

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
  /* the sliding active background: its own element, measured into place;
     morphs across pages via the vt-nav-active view-transition-name */
  .jx-nav .jx-indicator {
    position: absolute;
    top: 2px;
    bottom: 2px;
    left: 0;
    width: 0;
    z-index: 0;
    /* No background (Owner, 2026-08-21): a solid fill would cover the pill
       text when the VT group hoists this element above the header; a
       backdrop brightener stays visually identical on the always-dark
       bezel and is stacking-proof. */
    -webkit-backdrop-filter: brightness(2);
    backdrop-filter: brightness(2);
    opacity: 0;
    view-transition-name: vt-nav-active;
    transition:
      transform 450ms cubic-bezier(0.22, 1, 0.36, 1),
      width 450ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 150ms ease-out;
  }
  .jx-nav.jx-light .jx-indicator {
    /* light bezel: the same "subtle shift" reads as a slight darken */
    -webkit-backdrop-filter: brightness(0.85);
    backdrop-filter: brightness(0.85);
  }
  .jx-nav .jx-indicator.jx-indicator-instant {
    transition: none;
  }
  .jx-nav nav a {
    position: relative;
    z-index: 1;
  }

  /* the second-level caret marker; flips while its control is open */
  .jx-nav .jx-caret {
    width: 10px;
    height: 10px;
    flex: none;
    transition: transform 150ms ease-out;
  }
  .jx-nav a[aria-expanded='true'] .jx-caret,
  .jx-nav button[aria-expanded='true'] .jx-caret {
    transform: rotate(180deg);
  }

  /* the dropdown panel law: terminal bezel surface, 1px border, hard
     offset shadow; fixed coordinates come from JS (hover + light dismiss
     make declarative anchoring insufficient) — the hue-popover recipe.
     The panel carries the header's scope class itself so the tokens
     never depend on the top-layer promotion. */
  .jx-nav .jx-subpanel {
    position: fixed;
    margin: 0;
    inset: auto;
    min-width: 12rem;
    color: var(--terminal-foreground);
    background: var(--terminal);
    border: 1px solid color-mix(in oklab, var(--terminal-foreground) 25%, transparent);
    box-shadow: var(--shadow);
    transition:
      opacity 140ms ease-out,
      translate 140ms ease-out,
      display 140ms allow-discrete,
      overlay 140ms allow-discrete;
    opacity: 0;
    translate: 0 -4px;
  }
  .jx-nav .jx-subpanel:popover-open {
    opacity: 1;
    translate: 0 0;
  }
  @starting-style {
    .jx-nav .jx-subpanel:popover-open {
      opacity: 0;
      translate: 0 -4px;
    }
  }
  /* popovers get a ::backdrop; light dismiss must never dim the page */
  .jx-nav .jx-subpanel::backdrop {
    background: transparent;
  }
  .jx-nav .jx-sub-link {
    display: block;
    transition: background-color 120ms ease-out;
  }
  .jx-nav .jx-sub-link:hover,
  .jx-nav .jx-sub-link[aria-current='page'] {
    background: var(--terminal-hover);
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
  @media (prefers-reduced-motion: reduce) {
    .jx-nav .jx-caret,
    .jx-nav .jx-sub-link,
    .jx-nav .jx-subpanel {
      transition: none;
    }
    .jx-nav .jx-subpanel {
      opacity: 1;
      translate: none;
    }
  }
</style>
