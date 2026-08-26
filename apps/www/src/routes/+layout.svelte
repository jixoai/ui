<script lang="ts">
    import { catalogByGroup, CATALOG } from '$lib/catalog';
  import DocsSectionsNav from '$lib/ui/docs-sections-nav.svelte';
  import DocsPager from '$lib/ui/docs-pager.svelte';
  import Toc, { type TocSection } from '$lib/ui/toc/toc.svelte';
  import TocList from '$lib/ui/toc/toc-list.svelte';
  import TocItem from '$lib/ui/toc/toc-item.svelte';
  import TocLink from '$lib/ui/toc/toc-link.svelte';
  import '../app.css';
  // site-only docs surfaces (tw4 P2.2): tables + pill serve several routes
  import '$lib/site/docs-tables.css';
  // scrollbar law (2026-08-22): side-effect probe publishes the measured
  // per-OS scrollbar widths (--jx-scrollbar-thin/auto) feeding the theme's
  // both-edges padding compensation
  import '$lib/scrollbar-measure';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import WebsiteScaffold from '$lib/ui/website-scaffold/website-scaffold.svelte';
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '$lib/ui/terminal-footer/terminal-footer-column.svelte';
  import TerminalHeader from '$lib/ui/terminal-header/terminal-header.svelte';
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '$lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '$lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '$lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import HuePopover from '$lib/components/hue-popover.svelte';
  import { startHueRuntime, stopHueRuntime } from '$lib/hue-runtime';
  import { onMount } from 'svelte';
  import { GITHUB_URL } from '$lib/site';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  // the docs tree's single route model feeds the composed header pills
  // (D8's single-active law lives in the current derivations below)
  import { docsComponentGroups, docsSections } from '$lib/docs-route-model';

  let { children }: { children: Snippet } = $props();

  // Brand hue runs free: time-of-day seed + 30s auto-cycle (Owner, 2026-08-21).
  onMount(() => {
    startHueRuntime();
    // hash-link takeover (capture beats the router's bubble-phase click
    // handler; a prevented default makes the router skip the link) +
    // hashchange for back/forward fragment restores
    document.addEventListener('click', onClickHashLink, true);
    // hash arrivals (link clicks, back/forward) land precisely; fragment
    // EXITS (Back from #anchor to the plain URL) restore position
    // ourselves — SvelteKit skips the navigation pipeline for hash-only
    // popstates, so afterNavigate never runs there
    const onHashChange = () => {
      if (location.hash) scrollToHashLine(location.hash);
      else restoreScroll(new URL(location.href));
    };
    addEventListener('hashchange', onHashChange);
    return () => {
      stopHueRuntime();
      document.removeEventListener('click', onClickHashLink, true);
      removeEventListener('hashchange', onHashChange);
    };
  });

  // Pages are flat files (/, /docs.html, /docs/components.html, /tokens.html); prerendered
  // paths lack the .html suffix the browser shows.
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  // SPA view transitions (Plan A, 2026-08-21): every internal navigation
  // runs through document.startViewTransition with the tab-carousel
  // direction law (page order index comparison, ported from openspecui).
  // Reduced motion / unsupported browsers navigate plainly.
  // D8 (docs-restructure): only top-level pages ride the carousel; detail
  // pages take the default transition (no 73-page pairwise semantics)
  const PAGE_ORDER = ['/', '/docs', '/docs/components', '/tokens'];
  const pageIndex = (pathname: string) => PAGE_ORDER.indexOf(pathname);
  // the side rails' presence heuristics (route → does the rail stand in
  // its side column?): the tree lives under /docs*, the toc on the
  // component pages + tokens — the +page.ts toc providers' shape
  const tocRoute = (p: string): boolean =>
    p === '/tokens' || p.startsWith('/docs/components');

  // nav lifecycle (2026-08-22): every client-side navigation closes any
  // open desktop subnav panel and resets the mobile disclosure — back/
  // forward and programmatic navigation included (Codex review fix)
  let headerRef: { closeAll(): void } | null = $state(null);

  // VT dataset GENERATION (Codex walkthrough-r2 P1): SvelteKit may start
  // the next navigation while the previous transition's ~450ms window
  // still runs — only the LATEST generation owns the html[data-vt-*]
  // attributes. Every navigation writes its full set (explicit inert
  // values clear any stale ones); a superseded transition's cleanup
  // must not delete its successor's values.
  let vtGeneration = 0;

  // Inner-scroller scroll memory (2026-08-22, user report: returning to
  // the overview page always landed at the top). The shell's
  // .jx-shell-body is the REAL scroller — the document never scrolls
  // (website-scaffold.svelte) — so SvelteKit/browser scroll restoration,
  // which only watches document.scrollingElement, never sees it. This
  // gives the inner scroller per-URL memory: capture on leave, restore
  // on arrive (hash navigations scroll to their anchor instead),
  // mirrored into sessionStorage so a reload restores like native
  // document scroll would.
  const scroller = (): HTMLElement | null => document.querySelector('.jx-shell-body');
  // the key INCLUDES the hash: a #anchor position and the plain-page
  // position are two different memories — leaving via a hash link must
  // never overwrite where the user actually was on the plain URL
  // (Codex r1, blocking #2)
  const scrollKey = (url: URL): string => `jx-scroll:${url.pathname}${url.search}${url.hash}`;
  const scrollMemory = new Map<string, number>();

  // storage can throw in private/restricted modes — reads need the
  // same guard as writes, or hydration itself crashes (Codex r1, #1)
  function readStored(key: string): number | null {
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? null : Number(raw);
    } catch {
      return null;
    }
  }

  function captureScroll(url: URL): void {
    const el = scroller();
    if (!el) return;
    scrollMemory.set(scrollKey(url), el.scrollTop);
    try {
      sessionStorage.setItem(scrollKey(url), String(el.scrollTop));
    } catch {
      // private mode — in-memory memory still holds
    }
  }

  // Hash links must scroll the INNER container (the browser can only
  // scroll the document — a no-op in this shell) and land exactly ON the
  // toc line. The engine's native "scroll to fragment" computes its own
  // offset (observed 10px past our scroll-padding, Chromium 2026-08);
  // the hashchange ladder in scrollToHashLine corrects it without
  // touching history — every entry stays fully native.
  function scrollToHashLine(hash: string): void {
    let id = '';
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return; // malformed hash (truncated %-sequence) — nothing to do
    }
    if (!id) return;
    // one frame: the target section must be in the DOM first
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      const sc = scroller();
      if (!target || !sc) return;
      // neutralize scroll-behavior:smooth so every jump is instant
      const jump = () => target.scrollIntoView({ behavior: 'instant', block: 'start' });
      const previousBehavior = sc.style.scrollBehavior;
      sc.style.scrollBehavior = 'auto';
      jump();
      requestAnimationFrame(() => jump());
      // late re-assert: scrollIntoView honors TRANSFORMS — a target still
      // carrying its pre-reveal rise (--reveal-rise, 10px) lands 10px low,
      // and the engine's own fragment scroll may follow our first jump.
      // Re-jump once entrances settle — but never fight a user who has
      // scrolled away in the meantime (drift beyond the reveal band).
      setTimeout(() => {
        const line = parseInt(getComputedStyle(sc).scrollPaddingTop, 10) || 96;
        const drift = Math.abs(target.getBoundingClientRect().top - sc.getBoundingClientRect().top - line);
        if (drift > 1 && drift <= 12) jump();
        sc.style.scrollBehavior = previousBehavior;
      }, 450);
    });
  }

  // Same-hash repeat clicks only (Codex r2, P1): hand-rolled pushState
  // for hash changes grows history.length and desyncs SvelteKit's
  // history index — Back returns the plain URL but the scroller stays at
  // the anchor. So we NEVER pushState: different-hash clicks go to the
  // router untouched (a fully native entry; the hashchange ladder lands
  // precisely), and we intercept ONLY the same-hash case — mirroring
  // SvelteKit's own no-history handling of it, minus its imprecise
  // scrollIntoView.
  const onClickHashLink = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.length < 2) return; // bare "#"
    if (location.hash !== href) {
      // different hash → the router's path. But hash-only navigations
      // never fire onNavigate (Codex r3), so the plain URL's position
      // would never be captured — Back could only restore 0. Capture it
      // NOW; the fragment-exit branch of onHashChange restores it.
      captureScroll(page.url);
      return;
    }
    let id = '';
    try {
      id = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    scrollToHashLine(href);
  };

  function restoreScroll(url: URL): void {
    const el = scroller();
    if (!el) return;
    if (url.hash) {
      scrollToHashLine(url.hash);
      return;
    }
    const stored = scrollMemory.get(scrollKey(url)) ?? readStored(scrollKey(url));
    const y = stored !== null && Number.isFinite(stored) ? stored : 0;
    // scrollTop assignment IS smoothed by scroll-behavior:smooth in
    // Chrome — neutralize it so restoration is instant+deterministic,
    // then re-apply one frame later to absorb late layout growth
    // (lazy images, delayed mounts) that can re-clamp the offset
    const previousBehavior = el.style.scrollBehavior;
    el.style.scrollBehavior = 'auto';
    el.scrollTop = y;
    requestAnimationFrame(() => {
      if (el.scrollTop !== y) el.scrollTop = y;
      el.style.scrollBehavior = previousBehavior;
    });
  }

  onNavigate((navigation) => {
    // fires before the DOM swap: the outgoing page is still rendered
    // and still holds its scroll offset
    captureScroll(page.url);
    headerRef?.closeAll();
    if (
      typeof document.startViewTransition !== 'function' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    // prerendered links carry the .html suffix the PAGE_ORDER does not
    // — the raw pathname made every lookup -1 and silently killed the
    // carousel on ALL top-level pairs (walkthrough report, 2026-08-26)
    const fromPath = norm(page.url.pathname);
    const toPath = norm(new URL(navigation.to.url, location.origin).pathname);
    // the side rails' presence law (Owner walkthrough request + polish
    // round): a rail owns its vt ONLY while it stands in its SIDE
    // column — the shell's container queries re-form the tree as a
    // bottom bar below 1200px and the toc as a top bar below 900px, and
    // in those forms the vt (name included) is disabled entirely
    const shellWidth = document.querySelector('.jx-shell')?.clientWidth ?? Infinity;
    const presence = (from: boolean, to: boolean, wide: boolean): string =>
      !wide ? 'none' : from === to ? (to ? 'swap' : 'none') : to ? 'in' : 'out';
    const vtRail = presence(fromPath.startsWith('/docs'), toPath.startsWith('/docs'), shellWidth >= 1200);
    const vtToc = presence(tocRoute(fromPath), tocRoute(toPath), shellWidth >= 900);

    // The narrow form's BOTTOM bar cannot ride the VT (Owner ruling,
    // 2026-08-26): view-transition snapshots render in the TOP layer
    // and cannot carry backdrop-filter — a VT'd bottom bar would sit
    // ABOVE the animating main content (the wrong layer for something
    // that must blur the content passing beneath it) AND lose its
    // progressive-blur band. So the bar stays out of the VT entirely
    // (the 'none' gate above) and RISES after the main transition
    // finishes, through the element's own animation: translateY only,
    // no opacity — an opacity tween would break the blur compositing
    // the same way a snapshot layer does.
    const railEntering = toPath.startsWith('/docs') && !fromPath.startsWith('/docs');
    const riseBottomBar = (): void => {
      // own presence test: the width gate above collapses vtRail to
      // 'none' in the narrow form, so the rise must NOT read it — it
      // checks presence itself and fires only in the bottom-bar form
      // (the side form rides the VT slide instead)
      if (!railEntering || shellWidth >= 1200) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelector('.jx-dsn')?.animate(
        [
          { transform: 'translateY(calc(100% + 1rem))' },
          { transform: 'translateY(0)' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    };
    const from = pageIndex(fromPath);
    const to = pageIndex(toPath);
    const generation = ++vtGeneration;
    if (from < 0 || to < 0) {
      // D8 honored as WRITTEN: outside the carousel set there is no
      // pairwise direction law, but the DEFAULT transition still runs
      // (root cross-fade + the shared-element morphs — the nav
      // indicator rides vt-nav-active); returning with nothing was an
      // implementation drift from the comment's contract
      // the gate lands BEFORE the call — the old snapshot's capture and
      // the pseudo-tree's animation resolution must already see it; the
      // inert values deterministically clear any stale carousel set a
      // still-running predecessor may have left
      const root = document.documentElement;
      root.dataset.vtRail = vtRail;
      root.dataset.vtToc = vtToc;
      delete root.dataset.vtKind;
      delete root.dataset.vtDirection;
      delete root.dataset.vtNav;
      return new Promise((resolve) => {
        const transition = document.startViewTransition(async () => {
          resolve();
          await navigation.complete;
        });
        transition.finished.finally(() => {
          if (generation === vtGeneration) {
            delete root.dataset.vtRail;
            delete root.dataset.vtToc;
          }
          riseBottomBar();
        });
      });
    }
    if (from === to) {
      // same-carousel-page navigation (query/hash-only): no VT — but it
      // STILL supersedes any running transition's dataset ownership (the
      // predecessor's gen-guarded cleanup would no-op against the bump
      // below), so this branch takes the attributes itself: full inert
      // set, nothing left mounted (Codex r4 residual)
      const root = document.documentElement;
      ++vtGeneration;
      root.dataset.vtRail = vtRail;
      root.dataset.vtToc = vtToc;
      delete root.dataset.vtKind;
      delete root.dataset.vtDirection;
      delete root.dataset.vtNav;
      return;
    }

    const root = document.documentElement;
    root.dataset.vtKind = 'page-carousel';
    root.dataset.vtDirection = to > from ? 'forward' : 'backward';
    root.dataset.vtRail = vtRail;
    root.dataset.vtToc = vtToc;
    root.dataset.vtNav = document.querySelector('.jx-nav')?.classList.contains('jx-light')
      ? 'light'
      : 'dark';

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      transition.finished.finally(() => {
        if (generation === vtGeneration) {
          delete root.dataset.vtKind;
          delete root.dataset.vtDirection;
          delete root.dataset.vtNav;
          delete root.dataset.vtRail;
          delete root.dataset.vtToc;
        }
        riseBottomBar();
      });
    });
  });

  // Restore AFTER the DOM swap. With view transitions this still runs
  // inside startViewTransition's update callback (afterNavigate precedes
  // navigation.complete), so the transition's new-state snapshot already
  // shows the restored offset — the carousel animates to the right
  // place. Also covers the initial load ('enter') and back/forward
  // ('popstate') via the sessionStorage mirror. NOTE: the destination
  // URL lives on `to.url` — the afterNavigate payload has NO top-level
  // `url` property (destructure it and every hydration crashes).
  afterNavigate(({ to }) => {
    if (to) restoreScroll(to.url);
  });

  // "Components" carries the second level (2026-08-22 regroup): the
  // menu derives from the ONE catalog (catalogByGroup) — the same
  // inventory the overview page renders and catalog.spec.ts locks, so
  // "components exist but the menu never showed them" cannot recur.
  // antd taxonomy groups; desktop mega panel auto-fills columns from
  // the same data, mobile nests disclosure groups.
  // Route-level toc policy (Codex firstpaint review): pages ship their
  // sections as PAGE DATA (+page.ts load) — the layout owns ONE toc in
  // the scaffold's chrome snippet, SSR-rendered in its final cell.
  // undefined = no toc on this route; an array = explicit sections
  // (exact parity with the retired per-page authoring); 'outline' =
  // self-derive from main#main headings (future per-page migration).
  const pageToc = $derived(page.data.toc as TocSection[] | 'outline' | undefined);

  // D8 single-active law: the Components pill owns /docs/components*;
  // every other docs route (sections/registry) lights the Docs pill
  const isComponentsTree = $derived(normalized.startsWith('/docs/components'));

  // composition-first-apis seam (Batch F): the header takes NO nav
  // data — the layout maps the docs tree's single route model onto the
  // composed NavigationMenu parts in its own tree (the same
  // data-to-parts mapping law the toc seam uses). docsSections feeds
  // the Docs mega panel, docsComponentGroups the Components panel.
  interface NavLink {
    href: string;
    label: string;
    description: string;
    active: boolean;
    external: boolean;
  }
  interface PanelGroup {
    label?: string;
    links: NavLink[];
  }
  const norm = (href: string): string => href.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  const docsCurrent = $derived(normalized.startsWith('/docs') && !isComponentsTree);
  const docsPanelGroups = $derived<PanelGroup[]>(
    docsSections.map((section) => ({
      label: section.label,
      links: section.pages.map((pg) => ({
        href: pg.href,
        label: pg.title,
        description: pg.subtitle ?? (pg.count !== undefined ? `${pg.count} modules` : ''),
        // the current-page marker (the 2px primary inset bar) rides on
        // aria-current like the Components panel — anchor links are
        // intra-page jumps and never claim the page
        active: !pg.href.includes('#') && normalized === norm(pg.href),
        external: pg.href === '/r/registry.json',
      })),
    })),
  );
  const compPanelGroups = $derived<PanelGroup[]>(
    docsComponentGroups.map(({ group, entries }) => ({
      label: group.label,
      links: entries.map((entry) => ({
        href: entry.href,
        label: entry.name,
        description: entry.type === 'registry:ui' ? '' : entry.type.replace('registry:', ''),
        active:
          normalized === (entry.href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/'),
        external: false,
      })),
    })),
  );

  // the pill paint: the bezel's language over the navigation-menu
  // family's base (padding + color utilities merge through cn(); the
  // typography resets live in terminal-header.css band 2)
  const pill = (current: boolean): string =>
    cn(
      'px-2.5 py-1 lg:px-3',
      current ? 'text-terminal-foreground' : 'text-terminal-foreground/70 hover:text-terminal-foreground',
    );
  const pillTrigger = (current: boolean): string => cn('gap-1', pill(current));
  const drawerLink = (active: boolean): string =>
    cn(
      'px-1 py-2 transition-colors',
      active ? 'bg-terminal-hover text-terminal-foreground' : 'text-terminal-foreground/70 hover:text-terminal-foreground',
    );

  // the mobile drawer's own disclosure state; closing the drawer
  // (hamburger, Escape, navigation, tier cross — all through the bound
  // open state) resets it (consistent reopen state, Codex ruling)
  let drawerOpen = $state(false);
  let drawerExpanded = $state<Record<string, boolean>>({});
  $effect(() => {
    if (!drawerOpen) drawerExpanded = {};
  });
</script>

<!-- layout-local content snippets: the composed header's shared glyphs
     and the two panel/drawer grids (authored structure — the header
     component owns only the chrome) -->
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
{#snippet ext()}
  <span
    data-jx-ext
    class="inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full"
    aria-hidden="true"
  >{@html icons.externalLink}</span>
{/snippet}
{#snippet megaGrid(groups: PanelGroup[])}
  <!-- the consumer-authored mega panel: the clip box keeps the hairline
       shave law (the -m-px grid bleeds into it); a second 14rem track
       never fits below 28rem and the container rule stacks the groups
       (terminal-header.css) -->
  <div class="overflow-hidden">
    <div class="grid -m-px grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))]">
      {#each groups as group (group.label)}
        <div
          class="jx-group min-w-0 py-2 px-3 pb-[0.625rem] border-t border-l border-[color:color-mix(in_oklab,var(--terminal-foreground)_15%,transparent)]"
        >
          {#if group.label}
            <div
              data-jx-group-label
              class="font-nav text-[10px] leading-[1.2] uppercase tracking-[0.18em] opacity-55 p-0 pe-[0.625rem] mb-2"
            >{group.label}</div>
          {/if}
          <div data-jx-group-list>
            {#each group.links as link (link.label)}
              <a
                href={link.href}
                aria-current={link.active ? 'page' : undefined}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                class="jx-sub-link grid grid-cols-1 items-start py-[0.4375rem] px-[0.625rem] transition-[background-color] duration-[120ms] ease-out"
                onclick={() => headerRef?.closeAll()}
              >
                <span data-jx-sub-text class="flex flex-col gap-0.5">
                  <span class="text-[13px] font-medium leading-snug">
                    {link.label}{#if link.external}{@render ext()}{/if}
                  </span>
                  {#if link.description}
                    <span class="text-[11px] leading-snug opacity-60 line-clamp-2">{link.description}</span>
                  {/if}
                </span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/snippet}
{#snippet drawerSection(key: string, label: string, href: string, current: boolean, groups: PanelGroup[])}
  <!-- parent row: full-width disclosure toggle; the parent href survives
       as the adjacent "all →" link -->
  <div class="flex items-stretch">
    <button
      type="button"
      class={cn(
        'flex flex-1 items-center gap-1 px-1 py-2 text-left transition-colors',
        current ? 'text-terminal-foreground' : 'text-terminal-foreground/70 hover:text-terminal-foreground',
      )}
      aria-expanded={drawerExpanded[key] ? 'true' : 'false'}
      onclick={() => (drawerExpanded[key] = !drawerExpanded[key])}
    >
      {label}
      {@render caret()}
    </button>
    <a
      href={href}
      onclick={() => (drawerOpen = false)}
      aria-label="all {label}"
      class="flex items-center px-2 text-terminal-foreground/60 transition-colors hover:text-terminal-foreground"
    >
      all <span
        data-jx-ext
        class="inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full"
        aria-hidden="true"
      >{@html icons.arrowRight}</span>
    </a>
  </div>
  <!-- nested group: the same height-only collapse as the drawer itself
       (grid-rows 0fr → 1fr) -->
  <div
    class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200"
    class:grid-rows-[1fr]={drawerExpanded[key]}
  >
    <div class="overflow-hidden">
      <div class="flex flex-col border-l border-terminal-foreground/15 pl-3">
        {#each groups as group (group.label)}
          {#if group.label}
            <div
              data-jx-m-group-label
              class="font-nav text-[10px] uppercase tracking-[0.18em] opacity-55 pt-[0.625rem] pb-1 ps-1"
            >{group.label}</div>
          {/if}
          {#each group.links as link (link.label)}
            <a
              href={link.href}
              onclick={() => (drawerOpen = false)}
              aria-current={link.active ? 'page' : undefined}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              class={cn(
                'flex flex-col gap-0.5 py-1.5 pl-2 transition-colors',
                link.active
                  ? 'bg-terminal-hover text-terminal-foreground'
                  : 'text-terminal-foreground/70 hover:text-terminal-foreground',
              )}
            >
              <span>{link.label}{#if link.external}{@render ext()}{/if}</span>
              {#if link.description}
                <span class="text-[10px] leading-tight opacity-60">{link.description}</span>
              {/if}
            </a>
          {/each}
        {/each}
      </div>
    </div>
  </div>
{/snippet}

<WebsiteScaffold>
  {#snippet chrome()}
    <!-- static chrome (SSR-stable): the catalog tree + the page toc —
         authored in their final grid cells from the first paint -->
    {#if normalized.startsWith('/docs')}
      <!-- the sections rail IS the docs navigation (D2: it took the
           chrome tree cell; ComponentTreeNav retired with the flat
           catalog tree) -->
      <DocsSectionsNav />
    {/if}
    {#if pageToc}
      <!-- composition-first-apis seam: the registry API takes NO data —
           the layout maps the route's serializable page data onto the
           composed parts in its own tree (structure lives here, data
           stays devalue-safe across the load() boundary) -->
      {#if Array.isArray(pageToc)}
        <Toc title="on this page" scrollRoot=".jx-shell-body">
          <TocList>
            {#each pageToc as section (section.id)}
              <TocItem>
                <TocLink href={'#' + section.id}>{section.label}</TocLink>
                {#if section.children?.length}
                  <TocList>
                    {#each section.children as child (child.id)}
                      <TocItem><TocLink href={'#' + child.id}>{child.label}</TocLink></TocItem>
                    {/each}
                  </TocList>
                {/if}
              </TocItem>
            {/each}
          </TocList>
        </Toc>
      {:else}
        <Toc outline={{ root: '#main' }} title="on this page" scrollRoot=".jx-shell-body" />
      {/if}
    {/if}
  {/snippet}
  {#snippet header()}
    <!-- composition-first-apis seam (Batch F): the header is chrome —
         the nav is composed HERE from the navigation-menu family (the
         docs tree data mapped onto Item/Trigger/Panel + authored mega
         grids, links as bare NavigationMenuLinks), the drawer contents
         authored in the layout tree. bind:open is the layout's reset
         signal for its own drawer state. -->
    <TerminalHeader
      bind:this={headerRef}
      bind:open={drawerOpen}
      brand="jixoai-ui"
      domain="ui.jixoai.com"
      subtitle="the jixoai design language"
    >
      <NavigationMenu label="Primary" class="flex-nowrap items-center gap-0">
        <NavigationMenuLink
          href="/"
          current={normalized === '/'}
          class={pill(normalized === '/')}
        >
          Overview
        </NavigationMenuLink>
        <NavigationMenuItem id="docs">
          <NavigationMenuTrigger current={docsCurrent} class={pillTrigger(docsCurrent)}>
            Docs
            {@render caret()}
          </NavigationMenuTrigger>
          <NavigationMenuPanel class="jx-subpanel jx-subpanel-mega">
            {@render megaGrid(docsPanelGroups)}
          </NavigationMenuPanel>
        </NavigationMenuItem>
        <NavigationMenuItem id="components">
          <NavigationMenuTrigger current={isComponentsTree} class={pillTrigger(isComponentsTree)}>
            Components
            {@render caret()}
          </NavigationMenuTrigger>
          <NavigationMenuPanel class="jx-subpanel jx-subpanel-mega">
            {@render megaGrid(compPanelGroups)}
          </NavigationMenuPanel>
        </NavigationMenuItem>
        <NavigationMenuLink
          href="/tokens.html"
          current={normalized === '/tokens'}
          class={pill(normalized === '/tokens')}
        >
          Tokens
        </NavigationMenuLink>
        <NavigationMenuLink href={GITHUB_URL} class={pill(false)}>
          GitHub
          {@render ext()}
        </NavigationMenuLink>
      </NavigationMenu>
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
            ] as swatch, i (swatch.hue)}
            {@const pos = swatch.center - swatch.size / 2}
            <rect
              class="jx-logo-breath"
              style="animation-delay: {i * -600}ms"
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
        <HuePopover />
      {/snippet}
      {#snippet drawer()}
        <nav class="flex flex-col border-t border-terminal-foreground/10 py-2 text-xs" aria-label="Primary">
          <a
            href="/"
            onclick={() => (drawerOpen = false)}
            aria-current={normalized === '/' ? 'page' : undefined}
            class={drawerLink(normalized === '/')}
          >Overview</a>
          {@render drawerSection('docs', 'Docs', '/docs.html', docsCurrent, docsPanelGroups)}
          {@render drawerSection('components', 'Components', '/docs/components.html', isComponentsTree, compPanelGroups)}
          <a
            href="/tokens.html"
            onclick={() => (drawerOpen = false)}
            aria-current={normalized === '/tokens' ? 'page' : undefined}
            class={drawerLink(normalized === '/tokens')}
          >Tokens</a>
          <a
            href={GITHUB_URL}
            onclick={() => (drawerOpen = false)}
            target="_blank"
            rel="noreferrer"
            class={drawerLink(false)}
          >GitHub {@render ext()}</a>
        </nav>
      {/snippet}
    </TerminalHeader>
  {/snippet}

  {@render children()}

  <!-- the page relations on every component page (layout-level: zero
       per-page wiring; non-inventory pages render nothing) -->
  {#if normalized.startsWith('/docs/components/')}
    <DocsPager />
  {/if}

  {#snippet footer()}
    <TerminalFooter ghost="JIXOAI-UI" copyright="© 2026 jixoai · MIT">
      <TerminalFooterColumn title="project">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        <a href="/r/registry.json">Registry JSON</a>
      </TerminalFooterColumn>
      <TerminalFooterColumn title="reference">
        <a href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">
          shadcn registry docs
        </a>
      </TerminalFooterColumn>
    </TerminalFooter>
  {/snippet}
</WebsiteScaffold>

<style>
  /* Logo breathing (Owner request, 2026-08-21): a traveling sine wave —
     adjacent squares sit 60° out of phase (one full wavelength across
     the fan), negative delays so the wave is mid-flight at first paint — an
     owner-sanctioned ambient exception to the no-looping-motion law.
     The favicon stays static; this animation is in-page only. */
  .jx-logo-breath {
    transform-box: fill-box;
    transform-origin: center;
    animation: jx-logo-breath 3.6s ease-in-out infinite;
  }
  @keyframes jx-logo-breath {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .jx-logo-breath {
      animation: none;
    }
  }
</style>
