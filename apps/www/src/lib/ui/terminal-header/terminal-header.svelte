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
  import './terminal-header.css';

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
    class="jx-caret w-2.5 h-2.5 flex-none transition-transform duration-150 ease-out"
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
    class="jx-sub-link grid items-start py-[0.4375rem] px-[0.625rem] transition-[background-color] duration-[120ms] ease-out {reserveIcon
      ? 'jx-with-icon grid-cols-[auto_1fr] column-gap-[0.625rem]'
      : 'grid-cols-1'}"
    onclick={() => hidePanel(closeKey)}
  >
    {#if reserveIcon}
      <span
        class="jx-sub-icon w-4 h-4 flex-none flex items-center justify-center mt-px opacity-55 [&_svg]:w-full [&_svg]:h-full"
        aria-hidden="true"
      >
        {#if child.icon}{@render child.icon()}{/if}
      </span>
    {/if}
    <span class="jx-sub-text flex flex-col gap-0.5">
      <span class="text-[13px] font-medium leading-snug">{child.label}{#if child.external}<span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.externalLink}</span>{/if}</span>
      {#if child.description}
        <span class="text-[11px] leading-snug opacity-60 line-clamp-2">{child.description}</span>
      {/if}
    </span>
  </a>
{/snippet}

<header
  class="jx-nav bg-terminal text-terminal-foreground border-b border-border {scope === 'dark' ? 'dark [color-scheme:dark]' : 'jx-light [color-scheme:light]'}"
>
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
                    {item.label}{#if item.external}<span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.externalLink}</span>{/if}
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
                    <div
                      class="jx-subpanel-head flex items-baseline justify-between gap-4 pt-2 pe-[0.875rem] pb-[0.375rem] font-nav text-[11px] tracking-[0.08em] lowercase"
                    >
                      <span class="jx-subpanel-title text-[color:color-mix(in_oklab,var(--terminal-foreground)_45%,transparent)]">{item.label}</span>
                      <a
                        href={item.panelAction.href}
                        aria-current={item.panelAction.active ? 'page' : undefined}
                        class="jx-subpanel-action inline-flex items-center gap-[0.375rem] text-[color:color-mix(in_oklab,var(--terminal-foreground)_70%,transparent)] transition-colors duration-150"
                      >
                        {item.panelAction.label}
                        <span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.arrowRight}</span>
                      </a>
                    </div>
                  {/if}
                  <div class="jx-subclip overflow-hidden">
                    <div
                      class="jx-subgroups {mega
                        ? 'grid -m-px'
                        : 'jx-single block m-0'}{mega && typeof navColumns !== 'number'
                        ? ' grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))]'
                        : ''}"
                      style={mega && typeof navColumns === 'number'
                        ? `grid-template-columns: repeat(${navColumns}, 1fr)`
                        : ''}
                    >
                      {#each groups as group (group.label ?? group.items[0]?.href ?? '')}
                        {@const reserveIcon = group.items.some((child) => child.icon)}
                        <div
                          class="jx-group {mega
                            ? 'min-w-0 py-2 px-3 pb-[0.625rem] border-t border-l border-[color-mix(in_oklab,var(--terminal-foreground)_15%,transparent)]'
                            : 'min-w-0'}"
                        >
                          {#if group.label}
                            <div class="jx-group-label font-nav text-[10px] leading-[1.2] uppercase tracking-[0.18em] opacity-55 p-0 pe-[0.625rem] mb-2">{group.label}</div>
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
                {item.label}{#if item.external}<span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.externalLink}</span>{/if}
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
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"></span>
          <span class="block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"></span>
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
        <div
          class="jx-mobile-scroll max-h-[calc(100dvh-4.75rem)] overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges] [-webkit-overflow-scrolling:touch]"
        >
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
                  all <span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.arrowRight}</span>
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
                        <div class="jx-m-group-label font-nav text-[10px] uppercase tracking-[0.18em] opacity-55 pt-[0.625rem] pb-1 ps-1">{group.label}</div>
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
                          <span>{child.label}{#if child.external}<span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.externalLink}</span>{/if}</span>
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
                {item.label}{#if item.external}<span class="jx-ext inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full" aria-hidden="true">{@html icons.externalLink}</span>{/if}
              </a>
            {/if}
          {/each}
          </nav>
        </div>
      </div>
    </div>
  </div>
</header>
