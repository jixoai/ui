<script lang="ts">
    import { catalogByGroup } from '$lib/catalog';
  import ComponentTreeNav from '$lib/ui/component-tree-nav.svelte';
  import '../app.css';
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import WebsiteScaffold from '$lib/ui/website-scaffold.svelte';
  import '$lib/website-scaffold.css';
  import TerminalFooter from '$lib/ui/terminal-footer.svelte';
  import TerminalHeader from '$lib/ui/terminal-header.svelte';
  import HuePopover from '$lib/components/hue-popover.svelte';
  import { startHueRuntime, stopHueRuntime } from '$lib/hue-runtime';
  import { onMount } from 'svelte';
  import { GITHUB_URL } from '$lib/site';

  let { children }: { children: Snippet } = $props();

  // Brand hue runs free: time-of-day seed + 30s auto-cycle (Owner, 2026-08-21).
  onMount(() => {
    startHueRuntime();
    return () => stopHueRuntime();
  });

  // Pages are flat files (/, /components.html, /tokens.html); prerendered
  // paths lack the .html suffix the browser shows.
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  // SPA view transitions (Plan A, 2026-08-21): every internal navigation
  // runs through document.startViewTransition with the tab-carousel
  // direction law (page order index comparison, ported from openspecui).
  // Reduced motion / unsupported browsers navigate plainly.
  const PAGE_ORDER = ['/', '/components/overview.html', '/components/dialog.html', '/components/popover.html', '/components/form.html', '/tokens.html'];
  const pageIndex = (pathname: string) => PAGE_ORDER.indexOf(pathname);

  // nav lifecycle (2026-08-22): every client-side navigation closes any
  // open desktop subnav panel and resets the mobile disclosure — back/
  // forward and programmatic navigation included (Codex review fix)
  let headerRef: { closeAll(): void } | null = $state(null);

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
  const scrollKey = (url: URL): string => `jx-scroll:${url.pathname}${url.search}`;
  const scrollMemory = new Map<string, number>();

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

  function restoreScroll(url: URL): void {
    const el = scroller();
    if (!el) return;
    if (url.hash) {
      // hash links must scroll the inner container themselves — the
      // browser can only scroll the document, a no-op in this shell.
      // One frame: the target section must be in the DOM first.
      const id = decodeURIComponent(url.hash.slice(1));
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      return;
    }
    const stored = scrollMemory.get(scrollKey(url)) ?? Number(sessionStorage.getItem(scrollKey(url)));
    // direct scrollTop assignment is never smoothed (scroll-behavior
    // only affects scrollTo/scrollIntoView/navigations)
    el.scrollTop = Number.isFinite(stored) ? stored : 0;
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
    const from = pageIndex(page.url.pathname);
    const to = pageIndex(new URL(navigation.to.url, location.origin).pathname);
    if (from < 0 || to < 0 || from === to) return;

    const root = document.documentElement;
    root.dataset.vtKind = 'page-carousel';
    root.dataset.vtDirection = to > from ? 'forward' : 'backward';
    root.dataset.vtNav = document.querySelector('.jx-nav')?.classList.contains('jx-light')
      ? 'light'
      : 'dark';

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      transition.finished.finally(() => {
        delete root.dataset.vtKind;
        delete root.dataset.vtDirection;
        delete root.dataset.vtNav;
      });
    });
  });

  // Restore AFTER the DOM swap. With view transitions this still runs
  // inside startViewTransition's update callback (afterNavigate precedes
  // navigation.complete), so the transition's new-state snapshot already
  // shows the restored offset — the carousel animates to the right
  // place. Also covers the initial load ('enter') and back/forward
  // ('popstate') via the sessionStorage mirror.
  afterNavigate(({ url }) => {
    restoreScroll(url);
  });

  // "Components" carries the second level (2026-08-22 regroup): the
  // menu derives from the ONE catalog (catalogByGroup) — the same
  // inventory the overview page renders and catalog.spec.ts locks, so
  // "components exist but the menu never showed them" cannot recur.
  // antd taxonomy groups; desktop mega panel auto-fills columns from
  // the same data, mobile nests disclosure groups.
  const items = $derived([
    { href: '/', label: 'Overview', active: normalized === '/' },
    {
      href: '/components/overview.html',
      label: 'Components',
      active: normalized.startsWith('/components'),
      children: [
        ...catalogByGroup().map(({ group, entries }) => ({
          label: group.label,
          items: entries.map((entry) => ({
            href: entry.href,
            label: entry.name,
            description: entry.type === 'registry:ui' ? '' : entry.type.replace('registry:', ''),
            active: normalized === entry.href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/',
          })),
        })),
        {
          // guide pages that are not registry items (recipes…)
          label: 'Guides',
          items: [
            {
              href: '/components/recipes.html',
              label: 'recipes',
              description: 'where wrapping stops',
            },
          ],
        },
      ],    },
    { href: '/tokens.html', label: 'Tokens', active: normalized === '/tokens.html' },
    { href: GITHUB_URL, label: 'GitHub', external: true },
  ]);
</script>

<WebsiteScaffold>
  <ComponentTreeNav />
  {#snippet header()}
    <TerminalHeader
      bind:this={headerRef}
      brand="jixoai-ui"
      domain="ui.jixoai.com"
      subtitle="the jixoai design language"
      {items}
    >
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
    </TerminalHeader>
  {/snippet}

  {@render children()}

  {#snippet footer()}
    <TerminalFooter
      ghost="JIXOAI-UI"
      links={[
        { label: 'GitHub', href: GITHUB_URL },
        { label: 'Registry JSON', href: '/r/registry.json' },
        { label: 'shadcn registry docs', href: 'https://ui.shadcn.com/docs/registry' },
      ]}
      copyright="© 2026 jixoai · MIT"
    />
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
