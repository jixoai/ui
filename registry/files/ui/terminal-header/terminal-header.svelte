<!--
  jixoai terminal header
  (registry/files/ui/terminal-header/terminal-header.svelte).
  The site nav bar: a strict two-wing layout — LEFT carries the brand
  (logo slot + wordmark + domain/subtitle, the page's identity), RIGHT
  carries the navigation pill group plus the switcher slot. The wings
  never mix.

  Theme lock: the bar is a CRT bezel locked DARK by default; components
  inside render with dark tokens because the wrapper carries the scoped
  token class (dark). Declare theme="light" or "system" to unlock.

  Composition-first (2026-08-25, composition-first-apis — BREAKING): the
  header owns CHROME ONLY and is a thin composition surface OVER the
  NavigationMenu family. The nav slot hosts consumer-composed parts —
  NavigationMenuItem/Trigger/Panel with the mega grids authored INSIDE
  the panels, links-only entries as NavigationMenuLink or bare anchors.
  The three-level TerminalNavItem config tree, panelAction and
  navColumns are DEAD: what renders is the consumer's tree; the header
  wraps it in the bezel. What survives here, verbatim in behavior:

    - the pill-group box + the sliding active indicator (vt-nav-active)
      over the composed entries — the header owns no nav data, so the
      repaint triggers are DOM-delegated (aria-current MutationObserver
      + ResizeObserver + late font loads; panel links never steal the
      indicator — entries inside a [popover] are excluded)
    - the mobile drawer SHELL: the hamburger fold, the grid-rows
      0fr→1fr collapse, the bounded scroll viewport, Escape→close with
      focus returned to the hamburger, and the tier-cross reset; the
      drawer CONTENTS are the `drawer` snippet, and bind:open is the
      consumer's reset signal for its own drawer state
    - closeAll(): navigation cleanup — hides every open [popover] panel
      under the header (composed NavigationMenu panels included, found
      by DOM query — the header never tracked them) and resets the
      drawer; consumers call it from their router hook (the registry
      component stays app-agnostic)

  Responsive — two deliberate tiers:
    ≥sm   one row: brand LEFT; pill group + switcher RIGHT
    <sm   row 1: logo + brand LEFT; switcher + hamburger RIGHT; the
          drawer opens as a stacked disclosure below the bar
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './terminal-header.css';

  interface Props {
    /** the wordmark line of the brand block */
    brand: string;
    /** second brand line (the domain) */
    domain?: string;
    /** third brand line — desktop tier only */
    subtitle?: string;
    /** the brand block's link target */
    homeHref?: string;
    /** bezel theme lock: dark (default) | light | system */
    theme?: 'dark' | 'light' | 'system';
    /** the brand mark (logo slot) */
    logo?: Snippet;
    /** the right-wing control slot (theme pair toggle, hue switcher…) */
    switcher?: Snippet;
    /** the desktop nav slot — compose NavigationMenu parts here */
    children?: Snippet;
    /** the mobile drawer contents (the stacked tier's nav) */
    drawer?: Snippet;
    /** the mobile drawer's open state (bind:open) — the consumer's
        reset signal: closing clears its own drawer state */
    open?: boolean;
    class?: string;
  }

  let {
    brand,
    domain,
    subtitle,
    homeHref = '/',
    theme = 'dark',
    logo,
    switcher,
    drawer,
    open = $bindable(false),
    class: className = '',
    children,
  }: Props = $props();

  // scoped token class: dark (default lock) or jx-light (css-defined)
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

  let headerEl = $state<HTMLElement | null>(null);

  /* -----------------------------------------------------------------
   * Navigation cleanup (consumers call this from their router hook —
   * SvelteKit onNavigate; the registry component stays app-agnostic).
   * Panels are no longer tracked by the header: whatever [popover]
   * surfaces the composed nav opened under this header get hidden by
   * DOM query, and the drawer resets. The bound open state flows to
   * the consumer synchronously, so its drawer-state reset effect runs
   * without lag.
   * --------------------------------------------------------------- */
  export function closeAll(): void {
    open = false;
    if (!headerEl) return;
    for (const panel of headerEl.querySelectorAll<HTMLElement>('[popover]')) {
      if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
        panel.hidePopover();
      }
    }
  }

  // crossing the sm breakpoint (rotate, resize) never carries nav state
  // across tiers — composed panels hide, the disclosure resets
  onMount(() => {
    const mobile = matchMedia('(max-width: 639.98px)');
    const onCross = () => closeAll();
    mobile.addEventListener('change', onCross);
    return () => mobile.removeEventListener('change', onCross);
  });

  // mobile drawer: Escape closes it while open and returns focus to the
  // hamburger (the fold itself rides the button's aria-expanded state)
  let burgerEl = $state<HTMLElement | null>(null);

  $effect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        open = false;
        burgerEl?.focus();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  /* -----------------------------------------------------------------
   * Sliding indicator (Owner, 2026-08-21): a dedicated element acts as
   * the active background and slides between nav entries (measured
   * translateX + width). It carries the vt-nav-active name, so
   * cross-page navigations morph it via the view transition; same-page
   * swaps fall back to its own CSS transition.
   * The header owns no nav data anymore, so the measure triggers are
   * DOM-delegated: the first paint measures instantly, then aria-
   * current flips (route swaps), box resizes and late font loads
   * re-measure. Direct pills only — entries inside a [popover] panel
   * (the composed mega links) carry their own aria-current and must
   * never steal the indicator; offsetLeft/offsetWidth measure against
   * the pill box (the nearest positioned ancestor).
   * --------------------------------------------------------------- */
  let navSlotEl = $state<HTMLElement | null>(null);
  let indicatorEl = $state<HTMLElement | null>(null);

  const pillEntries = (): HTMLElement[] =>
    [
      ...(navSlotEl?.querySelectorAll<HTMLElement>(
        '[data-jx-navmenu-link][aria-current="page"], [data-jx-navmenu-trigger][aria-current="true"]',
      ) ?? []),
    ].filter((el) => el.closest('[popover]') === null);

  const positionIndicator = (instant = false) => {
    if (!navSlotEl || !indicatorEl) return;
    const active = pillEntries()[0];
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
    // the first measure is instant (no slide from 0); every later move
    // animates via the CSS transition — the VT morph covers the visual
    // when a transition runs
    positionIndicator(!measured);
    measured = true;
  });

  onMount(() => {
    const reposition = () => positionIndicator(false);
    const slot = navSlotEl;
    if (!slot) return;
    const mo = new MutationObserver(reposition);
    mo.observe(slot, { subtree: true, attributeFilter: ['aria-current'] });
    const ro = new ResizeObserver(reposition);
    ro.observe(slot);
    document.fonts?.ready.then(reposition).catch(() => {});
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  });
</script>

<header
  bind:this={headerEl}
  class={cn(
    'jx-nav bg-terminal text-terminal-foreground border-b border-border',
    scope === 'dark' ? 'dark [color-scheme:dark]' : 'jx-light [color-scheme:light]',
    className,
  )}
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

      <!-- RIGHT WING · the nav pill slot + controls -->
      <div class="flex flex-none items-center gap-3">
        <!-- the pill box: chrome the composed nav lands in (the nav
             landmark itself is the consumer's NavigationMenu root) -->
        <div
          class="relative hidden items-center border border-terminal-foreground/25 p-0.5 text-xs sm:flex"
          bind:this={navSlotEl}
        >
          <span class="jx-indicator" bind:this={indicatorEl} aria-hidden="true"></span>
          {@render children?.()}
        </div>
        {#if switcher}
          {@render switcher()}
        {/if}
        <button
          type="button"
          class="flex h-8 w-8 flex-col items-center justify-center gap-[3px] border border-terminal-foreground/25 sm:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
          bind:this={burgerEl}
          onclick={() => (open = !open)}
        >
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"></span>
          <span class="block h-[1.5px] w-4 bg-terminal-foreground"></span>
          <span class="jx-bar block h-[1.5px] w-4 bg-terminal-foreground transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"></span>
        </button>
      </div>
    </div>

    <!-- mobile drawer: the consumer's drawer snippet stacked below the
         bar; the inner scroller bounds it to the viewport so every link
         stays reachable -->
    <div
      class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 sm:hidden"
      class:grid-rows-[1fr]={open}
    >
      <div class="overflow-hidden">
        <div
          data-jx-mobile-scroll
          class="max-h-[calc(100dvh-4.75rem)] overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges] [-webkit-overflow-scrolling:touch]"
        >
          {@render drawer?.()}
        </div>
      </div>
    </div>
  </div>
</header>
