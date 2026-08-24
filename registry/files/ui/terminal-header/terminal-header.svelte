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

  Second level nav (2026-08-20, request: click + hover submenus on the
  native Popover API; nested disclosures on mobile): items may carry
  `children`. Desktop pills with children consume the registry Popover
  primitive (2026-08-22, Owner dogfooding directive + Codex ruling): the
  component owns anchoring (CSS Anchor Positioning + try-fallbacks),
  lifecycle and placement natively; header JS owns only hover intent
  (grace timers), the link-vs-toggle click policy, and navigation
  cleanup — never geometry. Hover corridor into the panel is wired on
  the snippet content, which fills the panel box. Engines without the
  Popover API or anchor positioning degrade to a plain navigable link.

  Grouped multi-column panels (2026-08-20, same day follow-up): children
  may be TerminalNavGroup[] — each group renders as one grid area with a
  Share Tech Mono label, separated by hairline rules. Two or more groups
  switch the panel into "mega" mode: a definite width (never content
  sized) drives an auto-fill minmax(14rem, 1fr) grid, the panel itself
  becomes the container (container-type: inline-size; cqw units resolve),
  and a @container rule switches the divider law to stacked border-top
  when only one column fits. Group dividers are drawn on every group and
  clipped at the content edge (graph-paper law). A plain SubItem[] stays
  one unnamed group and keeps the narrow fit-content dropdown.
  navColumns="auto" (default) derives columns from the panel width; a
  number pins repeat(N, 1fr). This extends the file's 5th orthogonal
  intent — still at the cap; do not add more here.

  Mobile disclosure (2026-08-22): the in-flow stacked disclosure keeps
  the terminal language (it pushes content down, it is not an overlay)
  and gains a bounded scroll viewport — max-height in dvh minus the bar,
  overscroll contained — so every link stays reachable when all groups
  expand. Escape closes it while open.
-->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import Popover from '$lib/ui/popover/popover.svelte';
  import { icons } from '$lib/icons';

  interface PopoverHandle {
    show(): void;
    hide(): void;
    toggle(): void;
  }

  export interface TerminalNavSubItem {
    label: string;
    href: string;
    external?: boolean;
    /** Optional one-line muted description under the label (clamped to 2 lines). */
    description?: string;
    /** Marks the current page inside the dropdown / disclosure list. */
    active?: boolean;
    /** Optional 16px icon snippet rendered in a muted left column. */
    icon?: Snippet;
  }

  export interface TerminalNavGroup {
    /** Optional group heading; absent means the group renders unheaded. */
    label?: string;
    items: TerminalNavSubItem[];
  }

  export interface TerminalNavItem {
    label: string;
    href: string;
    active?: boolean;
    external?: boolean;
    /** Panel header action: rendered at the panel head's inline-end
        (e.g. 'all →' linking the section index, 2026-08-23). Mobile
        already renders the parent row's adjacent all-link itself. */
    panelAction?: { href: string; label: string; active?: boolean };
    /** Second level: SubItem[] renders one unnamed group (a narrow
        dropdown); TerminalNavGroup[] renders a grouped multi-column
        panel when there are two or more groups. */
    children?: TerminalNavSubItem[] | TerminalNavGroup[];
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
    /** Panel column mode for grouped second-level panels: 'auto' derives
        the column count from the panel width (auto-fill minmax(14rem,1fr));
        a number pins repeat(N, 1fr). Ignored by single-group panels. */
    navColumns?: number | 'auto';
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
    navColumns = 'auto',
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

  /* -----------------------------------------------------------------
   * Second-level nav data: children normalize to groups. A plain
   * SubItem[] (the 2026-08-20 morning shape) is one unnamed group so
   * every existing consumer keeps its narrow dropdown.
   * --------------------------------------------------------------- */
  const asGroups = (children?: TerminalNavItem['children']): TerminalNavGroup[] => {
    if (!children?.length) return [];
    const first = children[0];
    if (first && 'items' in first && Array.isArray(first.items)) {
      return children as TerminalNavGroup[];
    }
    return [{ items: children as TerminalNavSubItem[] }];
  };

  /* -----------------------------------------------------------------
   * Second-level nav orchestration. openKey mirrors the panels' native
   * toggle events — light dismiss, Escape and one-at-a-time run without
   * our handlers, so the events are the single source of truth and
   * aria-expanded never lies. Placement is NOT ours: the Popover
   * primitive anchors and flips through the engine (no coordinates,
   * no clamping, no resize listeners).
   * --------------------------------------------------------------- */
  const HOVER_GRACE_MS = 120;

  let openKey = $state<string | null>(null);
  // 'hover' panels survive their first click (the click confirms the
  // hover intent); only a second click on a click-opened panel closes.
  let openedBy: 'hover' | 'click' | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  const handles: Record<string, PopoverHandle | null> = {};

  const cancelClose = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };
  const hidePanel = (key: string) => handles[key]?.hide();
  const showPanel = (key: string, by: 'hover' | 'click', source?: EventTarget | null) => {
    openedBy = by;
    handles[key]?.show(source instanceof HTMLElement ? source : undefined);
  };
  const scheduleClose = (key: string) => {
    cancelClose();
    closeTimer = setTimeout(() => hidePanel(key), HOVER_GRACE_MS);
  };
  const onPanelToggle = (key: string, open: boolean) => {
    if (open) {
      openKey = key;
    } else if (openKey === key) {
      // only the tracked panel's close resets the mode — popover=auto
      // closes panel A while opening B, and A's late close event must
      // never clear B's click state
      openKey = null;
      openedBy = null;
      cancelClose();
    }
  };
  // navigation cleanup (Codex ruling): hides every panel and resets the
  // mobile disclosure; consumers call this from their router hook
  // (SvelteKit onNavigate) — the registry component stays app-agnostic.
  // openKey/openedBy clear synchronously here so a pill's aria-expanded
  // never lags the panel behind an async native toggle event
  export function closeAll(): void {
    cancelClose();
    openKey = null;
    openedBy = null;
    for (const key of Object.keys(handles)) handles[key]?.hide();
    open = false;
    expanded = {};
  }
  onDestroy(cancelClose);

  // crossing the sm breakpoint (rotate, resize) never carries nav state
  // across tiers — desktop panels hide, the disclosure resets (Codex r2)
  onMount(() => {
    const mobile = matchMedia('(max-width: 639.98px)');
    const onCross = () => closeAll();
    mobile.addEventListener('change', onCross);
    return () => mobile.removeEventListener('change', onCross);
  });

  // engine gate: hover/click interception only when the Popover API AND
  // the full anchoring pair exist — a partial engine must degrade to
  // plain navigable links (never a stranded preventDefault, never a
  // detached centered mega panel)
  let engineOk = $state(true);
  onMount(() => {
    const anchorOk =
      CSS.supports('anchor-name: --probe') &&
      (CSS.supports('position-area: bottom') || CSS.supports('inset-area: bottom'));
    engineOk = 'popover' in HTMLElement.prototype && anchorOk;
  });

  // mobile: expanded disclosure groups, keyed by the parent href as well
  let expanded = $state<Record<string, boolean>>({});
  let burgerEl = $state<HTMLElement | null>(null);

  // closing the disclosure clears the expanded groups (Codex ruling:
  // consistent reopen state) — Escape also returns focus to the hamburger
  const close = () => {
    open = false;
    expanded = {};
  };
  $effect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        burgerEl?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

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
    // aria-current and must never steal the indicator. Popover-wrapped
    // pills match the span branch; offsetLeft/offsetWidth still measure
    // against this nav (the nearest positioned ancestor)
    const active = navEl.querySelector(
      ':scope > a[aria-current="page"], :scope > span a[aria-current="page"]',
    );
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

<!-- one second-level row: icon column (reserved per group so labels
     align whether or not an item carries an icon) + label/description -->
{#snippet subLink(child: TerminalNavSubItem, reserveIcon: boolean, closeKey: string)}
  <a
    href={child.href}
    aria-current={child.active ? 'page' : undefined}
    target={child.external ? '_blank' : undefined}
    rel={child.external ? 'noreferrer' : undefined}
    class="jx-sub-link"
    class:jx-with-icon={reserveIcon}
    onclick={() => hidePanel(closeKey)}
  >
    {#if reserveIcon}
      <span class="jx-sub-icon" aria-hidden="true">
        {#if child.icon}{@render child.icon()}{/if}
      </span>
    {/if}
    <span class="jx-sub-text flex flex-col gap-0.5">
      <span class="text-[13px] font-medium leading-snug">{child.label}{#if child.external}<span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>{/if}</span>
      {#if child.description}
        <span class="text-[11px] leading-snug opacity-60 line-clamp-2">{child.description}</span>
      {/if}
    </span>
  </a>
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
            {#if item.children?.length && engineOk}
              {@const groups = asGroups(item.children)}
              {@const mega = groups.length > 1}
              <!-- the second-level panel: the registry Popover primitive —
                   native anchoring, try-fallbacks, light dismiss, one-at-a-
                   time; header JS owns only hover grace + link-vs-toggle -->
              <Popover
                id="jx-nav-sub-{i}"
                placement="bottom-end"
                panelClass={`jx-subpanel ${mega ? 'jx-subpanel-mega' : ''} ${typeof navColumns === 'number' ? `jx-nav-cols-${navColumns}` : ''} ${scope === 'dark' ? 'dark' : 'jx-light'}`.replace(/\s+/g, ' ').trim()}
                bind:this={handles[item.href]}
                onToggle={(open) => onPanelToggle(item.href, open)}
              >
                {#snippet trigger()}
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
                    onclick={(event) => {
                      const handle = handles[item.href];
                      if (!handle) return; // no popover engine: navigate
                      event.preventDefault();
                      cancelClose();
                      if (openKey === item.href) {
                        if (openedBy === 'click') hidePanel(item.href);
                        else openedBy = 'click';
                      } else {
                        showPanel(item.href, 'click', event.currentTarget);
                      }
                    }}
                    onmouseenter={() => {
                      cancelClose();
                      showPanel(item.href, 'hover');
                    }}
                    onmouseleave={() => scheduleClose(item.href)}
                  >
                    {item.label}{#if item.external}<span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>{/if}
                    {@render caret()}
                  </a>
                {/snippet}
                <!-- the corridor wrapper inverts into the panel's padding
                     ring so the hover grace cancels from the panel edge;
                     the clip box inside keeps the hairline shave law.
                     Pointer-only surface: keyboard users open via the
                     pill's native activation, so no key handlers here -->
                <!-- svelte-ignore a11y_mouse_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="jx-subcorridor"
                  onmouseenter={() => cancelClose()}
                  onmouseleave={() => scheduleClose(item.href)}
                >
                  {#if item.panelAction}
                    <!-- the panel head: item label inline-start, the
                         section-index action inline-end (2026-08-23) -->
                    <div class="jx-subpanel-head">
                      <span class="jx-subpanel-title">{item.label}</span>
                      <a
                        href={item.panelAction.href}
                        aria-current={item.panelAction.active ? 'page' : undefined}
                        class="jx-subpanel-action"
                      >
                        {item.panelAction.label}
                        <span class="jx-ext" aria-hidden="true">{@html icons.arrowRight}</span>
                      </a>
                    </div>
                  {/if}
                  <div class="jx-subclip">
                    <div
                      class="jx-subgroups"
                      class:jx-single={!mega}
                      style={mega && typeof navColumns === 'number'
                        ? `grid-template-columns: repeat(${navColumns}, 1fr)`
                        : ''}
                    >
                      {#each groups as group (group.label ?? group.items[0]?.href ?? '')}
                        {@const reserveIcon = group.items.some((child) => child.icon)}
                        <div class="jx-group">
                          {#if group.label}
                            <div class="jx-group-label">{group.label}</div>
                          {/if}
                          <div class="jx-group-list">
                            {#each group.items as child (child.label)}
                              {@render subLink(child, reserveIcon, item.href)}
                            {/each}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              </Popover>
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
                {item.label}{#if item.external}<span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>{/if}
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
          bind:this={burgerEl}
          onclick={() => (open ? close() : (open = true))}
        >
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground"></span>
        </button>
      </div>
    </div>

    <!-- mobile disclosure: the same nav, stacked below the bar; the inner
         scroller bounds it to the viewport so every group stays reachable
         when all of them expand -->
    <div
      class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 sm:hidden"
      class:grid-rows-[1fr]={open}
    >
      <div class="overflow-hidden">
        <div class="jx-mobile-scroll">
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
                  all <span class="jx-ext" aria-hidden="true">{@html icons.arrowRight}</span>
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
                    {#each asGroups(item.children) as group, gi (gi)}
                      {#if group.label}
                        <div class="jx-m-group-label">{group.label}</div>
                      {/if}
                      {#each group.items as child (child.label)}
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
                          <span>{child.label}{#if child.external}<span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>{/if}</span>
                          {#if child.description}
                            <span class="text-[10px] leading-tight opacity-60">{child.description}</span>
                          {/if}
                        </a>
                      {/each}
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
                {item.label}{#if item.external}<span class="jx-ext" aria-hidden="true">{@html icons.externalLink}</span>{/if}
              </a>
            {/if}
          {/each}
          </nav>
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  /* shared inline icon set ($lib/icons): 12px beside 13px nav text */
  .jx-ext {
    display: inline-flex;
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    margin-inline-start: 0.25rem;
    vertical-align: -0.125em;
  }
  .jx-ext svg {
    width: 100%;
    height: 100%;
  }
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

  /* the dropdown panel law: the registry Popover primitive's panel with
     the terminal bezel surface on top. The panel element belongs to the
     child component, so its rules go through :global — anchored with
     .jx-pop (double class) they outrank the primitive's base rules
     regardless of CSS order. The panel is a DOM descendant of .jx-nav
     (the top layer changes painting, not ancestry) and carries the
     header's scope class itself so tokens resolve from itself. */
  .jx-nav :global(.jx-pop.jx-subpanel) {
    margin: 2px 0 0; /* flush hugging (r22): the adaptive shadow falls outward — a hair only, so the panel border never merges with the bar's */
    --jx-panel-pad: 0.25rem;
    /* the primitive's scroll ring carries the padding — retune BOTH
       axes here (jx-surface law, 2026-08-22: the panel itself never
       pads/clips; --jx-pop-pad-inline stops the ring's inline gutter
       compensation from falling back to 14px) */
    --jx-pop-pad: var(--jx-panel-pad);
    --jx-pop-pad-inline: var(--jx-panel-pad);
    min-width: 12rem;
    /* mega panels override this with a wider ceiling (2026-08-23 user
       ruling: wide desktops should fill 3-4 columns); single-group
       panels keep the classic anti-banner cap */
    max-width: min(90vw, 42rem);
    font-size: 12px;
    color: var(--terminal-foreground);
    /* bezel identity through the jx-surface fill props (solid = the
       opaque CRT bezel; acrylic = smoked-glass terminal) — the variant
       rules repaint background at (0,3,0), so a bare background var
       here would lose acrylic (Codex r1) */
    --jx-surface-acrylic-fill: color-mix(in oklab, var(--terminal) 72%, transparent);
    --jx-surface-solid-fill: var(--terminal);
    --jx-surface-border-color: color-mix(in oklab, var(--terminal-foreground) 25%, transparent);
  }
  /* The MOTION is fully the floating-surface law's (Owner r7): the
     popover's enter kernel measures the slide direction against the
     anchor, the two-phase texture and the exit ride the law — no
     bespoke choreography here anymore */
  /* popovers get a ::backdrop; light dismiss must never dim the page */
  .jx-nav :global(.jx-pop.jx-subpanel::backdrop) {
    background: transparent;
  }

  /* mega mode (two or more groups): a DEFINITE width, never content
     sized — the panel is the container-query container. The width wants
     one 14rem track per group, up to FOUR on wide viewports (the 42rem
     anti-banner cap was lifted for the mega panel by user ruling
     2026-08-23 — 90vw still guards narrow screens); navColumns=N pins
     the track count through a class (the primitive owns the element,
     so no inline styles). */
  .jx-nav :global(.jx-pop.jx-subpanel.jx-subpanel-mega) {
    container-type: inline-size;
    --jx-panel-pad: 0.375rem;
    /* 2026-08-23 user ruling: sufficiently wide screens should use the
       horizontal space — the auto panel may grow to FOUR 14rem tracks
       (~58rem); narrower viewports clamp through 90vw and auto-fill
       simply renders fewer columns */
    width: min(90vw, calc(4 * 14rem + 2rem));
    max-width: min(90vw, calc(4 * 14rem + 2rem));
  }
  .jx-nav :global(.jx-pop.jx-subpanel.jx-nav-cols-2) {
    width: min(90vw, calc(2 * 14rem + 2rem));
  }
  .jx-nav :global(.jx-pop.jx-subpanel.jx-nav-cols-4) {
    width: min(90vw, calc(4 * 14rem + 2rem));
  }

  /* the panel head: hairline-ruled, label inline-start / action
     inline-end (2026-08-23) — nav link laws: color transitions only */
  .jx-nav .jx-subpanel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    /* no border-bottom: the groups grid's own hairline rules the seam —
       a head border would double it (the -1px shave overlaps by 1px) */
    padding: 0.5rem 0.875rem 0.375rem;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
  /* the -1px top shave predates the head — with one present it pokes
     the grid 1px up under the head's padding; drop the top shave only */
  .jx-nav .jx-subcorridor:has(> .jx-subpanel-head) .jx-subgroups {
    margin-top: 0;
  }
  .jx-nav .jx-subpanel-title {
    color: color-mix(in oklab, var(--terminal-foreground) 45%, transparent);
  }
  .jx-nav .jx-subpanel-action {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: color-mix(in oklab, var(--terminal-foreground) 70%, transparent);
    transition: color 150ms;
  }
  .jx-nav .jx-subpanel-action:hover,
  .jx-nav .jx-subpanel-action[aria-current='page'] {
    color: var(--terminal-foreground);
  }
  /* the hover corridor: an inverted wrapper (no overflow) stretches the
     snippet root across the panel's padding ring, so entering the panel
     at its very edge cancels the close timer. It must stay separate from
     the clip box — inverting the clipper would move its clip edge and
     break the -1px hairline shave (Codex note) */
  .jx-nav .jx-subcorridor {
    margin: calc(var(--jx-panel-pad, 0.25rem) * -1);
    padding: var(--jx-panel-pad, 0.25rem);
  }

  /* the clip box: overflow clips at its padding box, which hugs the
     panel's content box — the groups grid hangs 1px beyond it on every
     side, so its outermost rules are shaved off (graph-paper law) */
  .jx-nav .jx-subclip {
    overflow: hidden;
  }
  .jx-nav .jx-subgroups {
    display: grid;
    /* 13.5rem tracks: FOUR columns fit the 58rem mega panel (14rem
       tracks miss by the grid gap; 2026-08-23 wide-screen ruling) */
    grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
    margin: -1px;
  }
  .jx-nav .jx-group {
    min-width: 0;
    padding: 0.5rem 0.75rem 0.625rem;
    border-top: 1px solid color-mix(in oklab, var(--terminal-foreground) 15%, transparent);
    border-left: 1px solid color-mix(in oklab, var(--terminal-foreground) 15%, transparent);
  }
  /* single-column law: when the panel is too narrow for a second 14rem
     track the groups stack and only the horizontal rules remain (the
     clip already hides the column rules; this states the law). */
  @container (max-width: 28rem) {
    .jx-nav .jx-group {
      border-left: none;
    }
  }
  .jx-nav .jx-group-label {
    font-family: var(--font-nav);
    font-size: 10px;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    opacity: 0.55;
    padding: 0 0.625rem;
    margin-bottom: 0.5rem;
  }
  /* single unnamed group: the classic narrow dropdown — no rules, no
     grid tracks, fit-content width from the base panel */
  .jx-nav .jx-subgroups.jx-single {
    display: block;
    margin: 0;
  }
  .jx-nav .jx-subgroups.jx-single .jx-group {
    border: none;
    padding: 0;
  }

  .jx-nav .jx-sub-link {
    display: grid;
    grid-template-columns: 1fr;
    column-gap: 0.625rem;
    align-items: start;
    padding: 0.4375rem 0.625rem;
    transition: background-color 120ms ease-out;
  }
  .jx-nav .jx-sub-link.jx-with-icon {
    grid-template-columns: auto 1fr;
  }
  .jx-nav .jx-sub-link:hover,
  .jx-nav .jx-sub-link[aria-current='page'] {
    background: var(--terminal-hover);
  }
  .jx-nav .jx-sub-link[aria-current='page'] {
    box-shadow: inset 2px 0 0 0 var(--primary);
  }
  .jx-nav .jx-sub-icon {
    width: 16px;
    height: 16px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1px;
    opacity: 0.55;
  }
  /* the icon snippet is consumer markup: size it through the wrapper */
  .jx-nav .jx-sub-icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .jx-nav .jx-m-group-label {
    font-family: var(--font-nav);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    opacity: 0.55;
    padding: 0.625rem 0 0.25rem 0.25rem;
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
    .jx-nav .jx-sub-link {
      transition: none;
    }
  }

  /* mobile disclosure: a bounded scroll viewport inside the 0fr→1fr
     animation wrapper — every link stays reachable when all groups
     expand. dvh tracks the URL bar; contained overscroll keeps page
     scroll out of the menu's way */
  .jx-nav .jx-mobile-scroll {
    max-height: calc(100dvh - 4.75rem);
    overflow-y: auto;
    /* scrollbar law: both-edges gutters (full-bleed rows — no ring
       padding to hand back) */
    scrollbar-gutter: stable both-edges;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
</style>
