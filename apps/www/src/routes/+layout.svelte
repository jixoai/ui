<script lang="ts">
  import '../app.css';
  import { onNavigate } from '$app/navigation';
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

  onNavigate((navigation) => {
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

  // "Components" carries the second level (2026-08-20): desktop opens a
  // native-popover dropdown under the pill (click + hover), mobile nests
  // a disclosure group inside the hamburger panel. Same-day follow-up:
  // the children are TerminalNavGroups — the panel flips into mega mode,
  // laying the groups out as grid areas with hairline rules between
  // them; the column count follows the panel width (auto-fill,
  // minmax(14rem, 1fr)) so the same data reads 2×2 on desktop and
  // stacks to one column on narrow viewports.
  const items = $derived([
    { href: '/', label: 'Overview', active: normalized === '/' },
    {
      href: '/components/overview.html',
      label: 'Components',
      active: normalized.startsWith('/components'),
      children: [
        {
          label: 'Layout',
          items: [
            {
              href: '/components/section-card.html',
              label: 'section-card',
              description: 'the content atom',
            },
            {
              href: '/components/card-grid.html',
              label: 'card-grid',
              description: 'subgrid equalizer',
            },
            {
              href: '/components/hero-section.html',
              label: 'hero-section',
              description: 'the broadside hero',
            },
            {
              href: '/components/website-scaffold.html',
              label: 'app-shell',
              description: 'sticky scaffold',
            },
          ],
        },
        {
          label: 'Overlay',
          items: [
            {
              href: '/components/popover.html',
              label: 'popover',
              description: 'native popover base',
              active: normalized === '/components/popover.html',
            },
            {
              href: '/components/dialog.html',
              label: 'dialog',
              description: 'native dialog base',
              active: normalized === '/components/dialog.html',
            },
            {
              href: '/components/toc.html',
              label: 'toc',
              description: 'rule tracker rail',
            },
            {
              href: '/components/anchor.html',
              label: 'anchor',
              description: 'fragment link rail',
            },
            {
              href: '/components/tour.html',
              label: 'tour',
              description: 'guided walkthrough',
            },
            {
              href: '/components/alert-dialog.html',
              label: 'alert-dialog',
              description: 'destructive decisions',
            },
            {
              href: '/components/sheet.html',
              label: 'sheet',
              description: 'the side drawer',
            },
            {
              href: '/components/hover-card.html',
              label: 'hover-card',
              description: 'rich hover panel',
            },
          ],
        },
        {
          label: 'Form',
          items: [
            {
              href: '/components/form.html#example-form',
              label: 'form',
              description: 'the live example',
              active: normalized === '/components/form.html',
            },
            {
              href: '/components/form.html#all-types',
              label: 'input',
              description: 'every native type',
            },
            {
              href: '/components/form.html#select-textarea',
              label: 'select + textarea',
              description: 'options + error wiring',
            },
          ],
        },
        {
          label: 'Display',
          items: [
            {
              href: '/components/terminal-card.html',
              label: 'terminal-card',
              description: 'the typing terminal',
            },
            {
              href: '/components/code-card.html',
              label: 'code-card',
              description: 'readonly code surface',
            },
            {
              href: '/components/table.html',
              label: 'table',
              description: 'native semantics',
            },
            {
              href: '/components/tree-view.html',
              label: 'tree-view',
              description: 'ARIA file tree',
            },
            {
              href: '/components/theme-toggle.html',
              label: 'theme-toggle',
              description: 'light / dark / system',
            },
            {
              href: '/components/badge.html',
              label: 'badge',
              description: 'inline status chip',
            },
            {
              href: '/components/avatar.html',
              label: 'avatar',
              description: 'img + initials fallback',
            },
            {
              href: '/components/alert.html',
              label: 'alert',
              description: 'inline notice block',
            },
            {
              href: '/components/separator.html',
              label: 'separator',
              description: 'native hr / ARIA div',
            },
            {
              href: '/components/skeleton.html',
              label: 'skeleton',
              description: 'loading placeholder',
            },
            {
              href: '/components/progress.html',
              label: 'progress',
              description: 'native progress bar',
            },
            {
              href: '/components/pagination.html',
              label: 'pagination',
              description: 'nav of real links',
            },
            {
              href: '/components/breadcrumb.html',
              label: 'breadcrumb',
              description: 'trail of real links',
            },
            {
              href: '/components/toast.html',
              label: 'toast',
              description: 'store + viewport',
            },
            {
              href: '/components/kbd.html',
              label: 'kbd',
              description: 'keyboard glyph',
            },
            {
              href: '/components/input-otp.html',
              label: 'input-otp',
              description: 'OTP slot field',
            },
            {
              href: '/components/carousel.html',
              label: 'carousel',
              description: 'scroll-snap track',
            },
            {
              href: '/components/recipes.html',
              label: 'recipes',
              description: 'where wrapping stops',
            },
          ],
        },
        {
          label: 'Interactive',
          items: [
            {
              href: '/components/accordion.html',
              label: 'accordion',
              description: 'native details/summary',
            },
            {
              href: '/components/tabs.html',
              label: 'tabs',
              description: 'APG tablist family',
            },
            {
              href: '/components/tooltip.html',
              label: 'tooltip',
              description: 'hover-intent hint',
            },
            {
              href: '/components/dropdown-menu.html',
              label: 'dropdown-menu',
              description: 'ARIA menu pattern',
            },
            {
              href: '/components/command.html',
              label: 'command',
              description: '⌘K palette',
            },
            {
              href: '/components/toggle-group.html',
              label: 'toggle-group',
              description: 'press-state field',
            },
            {
              href: '/components/navigation-menu.html',
              label: 'navigation-menu',
              description: 'site-nav bar',
            },
            {
              href: '/components/menubar.html',
              label: 'menubar',
              description: 'app menu bar',
            },
          ],
        },
      ],
    },
    { href: '/tokens.html', label: 'Tokens', active: normalized === '/tokens.html' },
    { href: GITHUB_URL, label: 'GitHub', external: true },
  ]);
</script>

<WebsiteScaffold>
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
