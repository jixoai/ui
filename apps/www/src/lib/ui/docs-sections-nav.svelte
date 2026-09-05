<!--
  jixoai docs sections nav (docs-restructure D2, 2026-08-25). The docs
  tree's left rail: the three-section spine (Sections / Components /
  Registry) from the ONE route model ($lib/docs-route-model). Replaces
  ComponentTreeNav in the website-scaffold's chrome tree cell — same
  surface pair, same placement contract:

    >=1200px (shell container form "wide")    left rail, always expanded
    <1200px                                   full-width bottom bar
                                              (iOS-Safari-style chrome);
                                              tap expands the sections
                                              upward — height-only

  Authored in the scaffold's `chrome` snippet with data-area="tree":
  SSR-rendered in its final grid cell, immersive hide laws inherited.

  Scroll-edge blur (2026-08-25 r2 → the layer grid, 2026-09-05): the
  wide rail is a ONE-CELL LAYER GRID — the groups scroller spans the
  cell in full, the title/filter head and the progressive-blur band
  are OVERLAYS (band z-[5] under the head's z-10, the list streaming
  UNDER both through the band; reveal riding the scroller so nothing
  blurs at rest — no sticky anywhere). The mobile expansion viewport
  keeps the original sticky-head law (its band is INSIDE its own
  scroller, where sticky is the honest pin).
-->
<script lang="ts">
  import './docs-sections-nav.css';
  import { page } from '$app/state';
  import { docsComponentGroups, docsSections } from '$lib/docs-route-model';
  import { icons } from '$lib/icons';
  import {
    navFilter,
    navHighlightSegments,
    type NavFilterHighlight,
    type NavHighlightSegment,
  } from '$lib/search/nav-filter';
  import ProgressiveBlur from '$lib/ui/progressive-blur/progressive-blur.svelte';
  import { onMount } from 'svelte';

  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  /**
   * Two rail modes (Owner ruling, 2026-08-25): the sections spine on
   * docs/registry pages; the COMPONENT CATALOG on the components tree
   * — inside /docs/components* the rail IS the inventory (grouped by
   * taxonomy, current module highlighted), not the section list.
   */
  const inComponentsTree = $derived(normalized.startsWith('/docs/components'));

  /** does this page's href point at the current page (path part)? */
  function isCurrent(href: string): boolean {
    const target = href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
    return target === normalized;
  }

  interface RailGroup {
    id: string;
    label: string;
    count?: number;
    pages: { title: string; subtitle?: string; href: string; count?: number }[];
  }

  const railTitle = $derived(inComponentsTree ? 'components' : 'docs');

  const railGroups = $derived<RailGroup[]>(
    inComponentsTree
      ? docsComponentGroups.map(({ group, entries }) => ({
          id: group.id,
          label: group.label,
          count: entries.length,
          pages: entries.map((entry) => ({ title: entry.name, href: entry.href })),
        }))
      : docsSections.map((section) => ({
          id: section.id,
          label: section.label,
          pages: section.pages,
        })),
  );

  const currentLabel = $derived(
    railGroups
      .flatMap((group) => group.pages)
      .find((pg) => isCurrent(pg.href))?.title ?? railTitle,
  );

  /** which group holds the current page (open it when expanding) */
  const activeSectionId = $derived(
    railGroups.find((group) => group.pages.some((pg) => isCurrent(pg.href)))?.id ?? railGroups[0]?.id ?? 'sections',
  );

  let open = $state(false);

  // ── the layer-grid clearance (2026-09-05, the scaffold's
  // --jx-header-h precedent): the rail is a ONE-CELL layer grid — the
  // head is an OVERLAY, the scroller spans the full cell behind it,
  // so the list's flow needs the head's height as top clearance.
  // Measured (RO), never hardcoded: fonts and theme shift the head's
  // content height. The var lands on the RAIL (the layer host) and
  // the groups' padding-block-start reads it; no-JS keeps the css
  // fallback (≈ the authored head height)
  let railEl = $state<HTMLElement | null>(null);
  let headEl = $state<HTMLElement | null>(null);

  onMount(() => {
    if (!railEl || !headEl) return;
    const rail = railEl;
    const head = headEl;
    let reserved = -1;
    const reserve = () => {
      const h = head.offsetHeight;
      if (h !== reserved) {
        reserved = h;
        rail.style.setProperty('--jx-dsn-head-h', `${h}px`);
      }
    };
    const ro = new ResizeObserver(reserve);
    ro.observe(head);
    reserve();
    return () => ro.disconnect();
  });
  const close = () => (open = false);

  // search filter (Owner request, 2026-08-25; fuzzy upgrade
  // nav-fuzzy-filter, 2026-09-02): typing filters pages by title OR
  // subtitle across every section through the nav-filter kernel
  // (fuzzysort) — a SUPERSET of the old substring match. The engine
  // only filters: group order and intra-group order ride the data
  // source; empty sections hide; matched characters carry <mark>.
  // The rail is the primary surface; the mobile bar carries the same
  // input at the top of its expansion.
  let filter = $state('');
  const needle = $derived(filter.trim());
  const visibleSections = $derived(navFilter(railGroups, filter));
  const onFilterKeydown = (event: KeyboardEvent) => {
    // Escape clears and yields focus — and must not leak upward (the
    // page binds Escape for popover/disclosure closing)
    if (event.key === 'Escape' && filter) {
      event.stopPropagation();
      filter = '';
    }
  };

  /** hit marks for one link line: the page's matched field splits
   *  into marked/unmarked segments; the other line renders plain */
  function lineSegments(
    text: string | undefined,
    highlight: NavFilterHighlight | undefined,
    field: 'title' | 'subtitle',
  ): NavHighlightSegment[] {
    if (text === undefined || text === '') return [];
    if (highlight === undefined || highlight.field !== field || highlight.indexes.length === 0) {
      return [{ text, hit: false }];
    }
    return navHighlightSegments(text, highlight.indexes);
  }
</script>

<nav class="jx-dsn" data-area="tree" aria-label="docs sections">
  <!-- rail surface (wide form): the spine, always expanded -->
  <!-- THE ONE-CELL LAYER GRID (2026-09-05 r3 — the sticky era
       retires): the rail grid is a single [stack] cell — the groups
       scroller spans it in full (its content streaming under the
       head, exactly as the sticky era rendered), the head and the
       blur band are OVERLAYS (band z-[5] under the head's z-10).
       Pinning is by construction — the overlays never enter the
       scroll flow. The list's top clearance is the head's measured
       height (the RO var --jx-dsn-head-h, the scaffold's
       --jx-header-h precedent). The band (grid dialect, block edge)
       hangs from the cell's top edge; its reveal timeline rides the
       SEAM — the scroller is the band's SIBLING, so scroll(nearest)
       cannot see it: the scroller's scroll-timeline is named and
       lifted with timeline-scope (see the style block). The band
       mounts INSIDE the rail surface (dying with it below 1200px) -->
  <div class="jx-dsn-rail" bind:this={railEl}>
    <ProgressiveBlur pin="grid" position="top" reveal="scroll" height="7.5rem" class="z-[5]" />
    <div class="jx-dsn-head" bind:this={headEl}>
      <p class="jx-dsn-title">{railTitle}</p>
      <div class="jx-dsn-search">
        <input
          class="jx-dsn-input"
          type="search"
          placeholder="filter…"
          aria-label="Filter the docs navigation"
          bind:value={filter}
          onkeydown={onFilterKeydown}
        />
        {#if filter}
          <button type="button" class="jx-dsn-clear" aria-label="Clear the filter" onclick={() => (filter = '')}>{@html icons.x}</button>
        {/if}
      </div>
    </div>
    <div data-jx-dsn-groups>
      {#if needle && visibleSections.length === 0}
        <p class="jx-dsn-empty">no matches for “{filter}”</p>
      {/if}
      {#each visibleSections as section (section.id)}
        <details class="jx-dsn-group" open>
          <summary class="jx-dsn-group-label">
            {section.label}
            {#if section.count !== undefined}
              <span data-jx-dsn-gcount>{section.count}</span>
            {/if}
          </summary>
          <ul class="jx-dsn-list" role="list">
            {#each section.pages as pg (pg.title)}
              <li>
                <a
                  class="jx-dsn-link"
                  class:jx-dsn-current={isCurrent(pg.href)}
                  href={pg.href}
                  aria-current={isCurrent(pg.href) ? 'page' : undefined}
                >
                  <span class="jx-dsn-link-row">
                    <span class="jx-dsn-link-title">
                      {#each lineSegments(pg.title, pg.highlight, 'title') as seg}{#if seg.hit}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
                    </span>
                    {#if pg.count !== undefined}
                      <span class="jx-dsn-count">{pg.count}</span>
                    {/if}
                  </span>
                  {#if pg.subtitle}
                    <span class="jx-dsn-sub">
                      {#each lineSegments(pg.subtitle, pg.highlight, 'subtitle') as seg}{#if seg.hit}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </details>
      {/each}
    </div>
  </div>

  <!-- bar surface (narrow/medium forms): 44px glass row + height-only
       upward expansion; the collapsed list is inert -->
  <div class="jx-dsn-bar jx-glass" data-open={open || undefined}>
    <div class="jx-dsn-bar-row">
      <span class="jx-dsn-bar-label">
        docs · <strong>{currentLabel}</strong>
      </span>
      <button
        type="button"
        class="jx-dsn-toggle"
        aria-expanded={open}
        aria-controls="jx-dsn-expand"
        aria-label="Expand the docs sections"
        onclick={() => (open ? close() : (open = true))}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
    <div id="jx-dsn-expand" class="jx-dsn-expand">
      <!-- the same sticky-head + scroll-edge law on the mobile
           expansion viewport: the filter pins, the groups scroll
           under it through the band -->
      <ProgressiveBlur position="top" reveal="scroll" height="4.5rem" class="z-[5]" />
      <div class="jx-dsn-search jx-dsn-bar-search jx-dsn-expand-head">
        <input
          class="jx-dsn-input"
          type="search"
          placeholder="filter…"
          aria-label="Filter the docs navigation"
          bind:value={filter}
          onkeydown={onFilterKeydown}
        />
        {#if filter}
          <button type="button" class="jx-dsn-clear" aria-label="Clear the filter" onclick={() => (filter = '')}>{@html icons.x}</button>
        {/if}
      </div>
      {#if needle && visibleSections.length === 0}
        <p class="jx-dsn-empty">no matches for “{filter}”</p>
      {/if}
      {#each visibleSections as section (section.id)}
        <details class="jx-dsn-group" open={section.id === activeSectionId || !!needle}>
          <summary class="jx-dsn-group-label">
            {section.label}
            {#if section.count !== undefined}
              <span data-jx-dsn-gcount>{section.count}</span>
            {/if}
          </summary>
          <ul class="jx-dsn-list" role="list">
            {#each section.pages as pg (pg.title)}
              <li>
                <a
                  class="jx-dsn-link"
                  class:jx-dsn-current={isCurrent(pg.href)}
                  href={pg.href}
                  aria-current={isCurrent(pg.href) ? 'page' : undefined}
                  onclick={close}
                >
                  <span class="jx-dsn-link-row">
                    <span class="jx-dsn-link-title">
                      {#each lineSegments(pg.title, pg.highlight, 'title') as seg}{#if seg.hit}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
                    </span>
                    {#if pg.count !== undefined}
                      <span class="jx-dsn-count">{pg.count}</span>
                    {/if}
                  </span>
                  {#if pg.subtitle}
                    <span class="jx-dsn-sub">
                      {#each lineSegments(pg.subtitle, pg.highlight, 'subtitle') as seg}{#if seg.hit}<mark>{seg.text}</mark>{:else}{seg.text}{/if}{/each}
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </details>
      {/each}
    </div>
  </div>
</nav>

<style>
  .jx-dsn {
    min-width: 0;
  }

  /* surface switching follows the SHELL's container form — bar
     everywhere by default, rail from 1200px up (the ctree contract) */
  .jx-dsn-rail {
    display: none;
  }
  @container jx-shell (min-width: 1200px) {
    /* THE ONE-CELL LAYER GRID (2026-09-05 r3 — the sticky era
       retires): the nav is a capped one-row grid passing a DEFINITE
       height down (max-height on a plain block parent cannot bound a
       percentage child); the rail is ONE cell — the scroller spans it
       in full, the head and the blur band are OVERLAYS stacked on top
       (band z-[5] under the head's z-10, the old z-ladder verbatim).
       Pinning is by construction: the overlays never enter the scroll
       flow. The list's content streams UNDER the head through the
       band, exactly as the sticky era rendered it */
    .jx-dsn {
      display: grid;
      grid-template-rows: minmax(0, 1fr);
      max-height: 100%;
    }
    /* the compaction growth law (shell immersive law, 2026-09-05):
       while the shell hides its header the rail slides up by
       --jx-header-h, so its cap must GROW by the same amount — the
       shell's shared transition animates max-height alongside the
       transform and a cap-bound rail's bottom edge stays pinned
       (height +h cancels translateY −h). Without it a full-height
       rail left a header-height hole at its foot. */
    :global(.jx-shell-host[data-hidden]) .jx-dsn {
      max-height: calc(100% + var(--jx-header-h, 64px));
    }
    .jx-dsn-rail {
      grid-row: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: [rail-start] minmax(0, 1fr) [rail-end];
      grid-template-rows: [stack] minmax(0, 1fr);
      /* the timeline bridge: the list (a SIBLING of the band) names
         its scroll timeline; the scope lifts the name to this grid so
         the band's reveal can reference it (--jx-pblur-scroll-tl) */
      timeline-scope: --jx-dsn;
    }
    .jx-dsn-bar {
      display: none;
    }
    /* the band: placement comes from the dialect (the block-edge law
       — spanning rows/columns, self-start) and targeting from the
       component's OWN [data-jx-pblur] anchor — no site className. The
       consumer owns exactly two things: the END-side step-aside (the
       scrollbar beneath the blur is noise to erase, not content to
       frost — the start-side gutter strip carries nothing paintable,
       so the blur there is free) and the timeline seam var */
    .jx-dsn-rail :global([data-jx-pblur]) {
      margin-inline-end: var(--jx-scrollbar-thin, 0px);
      --jx-pblur-scroll-tl: --jx-dsn;
    }
    /* THE HEAD OVERLAY: one cell with the scroller, aligned to the
       stack's start, z-10 above the band. No sticky, no top offset —
       the pin IS the placement. The inline inset compensates the
       rail-edge distance to align with the list's content edge
       (outside a scroller there is no gutter to subtract: the inset
       is max(inset, thin), which is exactly thin + (inset − thin) —
       the same line the in-scroller paddings land on) */
    .jx-dsn-head {
      grid-area: stack / rail;
      align-self: start;
      z-index: 10;
      padding-block-start: 1.25rem;
      padding-left: max(1.25rem, var(--jx-scrollbar-thin, 0px));
      padding-right: max(0.5rem, var(--jx-scrollbar-thin, 0px));
    }
    /* THE LIST IS THE SCROLLER: overflow, the thin scrollbar and the
       both-edges gutter moved inward with the scroll ownership;
       min-height:0 kills the grid item's auto floor so the stack row
       can actually bound it. The block-start clearance is the head
       overlay's measured height (the RO var; the css fallback ≈ the
       authored head height for no-JS). The timeline name is the
       reveal seam's other half (see the rail grid's timeline-scope) */
    [data-jx-dsn-groups] {
      grid-area: stack / rail;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-gutter: stable both-edges;
      scroll-timeline-name: --jx-dsn;
      scroll-timeline-axis: block;
      padding-block-start: var(--jx-dsn-head-h, 5.375rem);
      padding-left: max(1.25rem - var(--jx-scrollbar-thin, 0px), 0px);
      padding-right: max(0.5rem - var(--jx-scrollbar-thin, 0px), 0px);
    }
  }

  .jx-dsn-title {
    margin: 0 0 0.75rem;
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  .jx-dsn-search {
    position: relative;
    display: flex;
    align-items: center;
    margin: 0 0 0.625rem;
  }
  .jx-dsn-input {
    width: 100%;
    border: 1px solid color-mix(in oklab, var(--border) 90%, transparent);
    background: color-mix(in oklab, var(--background) 55%, transparent);
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    padding: 0.3125rem 1.5rem 0.3125rem 0.5rem;
  }
  .jx-dsn-input::placeholder {
    color: var(--muted-foreground);
    opacity: 0.7;
  }
  .jx-dsn-input:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  /* the platform search ornament is chrome we don't take */
  .jx-dsn-input::-webkit-search-cancel-button {
    display: none;
  }
  .jx-dsn-input[type='search']::-webkit-search-decoration {
    display: none;
  }
  .jx-dsn-clear {
    position: absolute;
    right: 0.25rem;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    border: 0;
    background: none;
    color: var(--muted-foreground);
    font-family: var(--font-mono);
    line-height: 1;
    cursor: pointer;
  }
  .jx-dsn-clear:hover {
    color: var(--foreground);
  }
  .jx-dsn-clear:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-dsn-empty {
    margin: 0;
    padding: 0.375rem 0.5rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--muted-foreground);
  }
  .jx-dsn-bar .jx-dsn-bar-search {
    padding-inline: 1rem 0.5rem;
    margin: 0 0 0.5rem;
  }
  /* the expansion viewport's sticky head (r2): the filter pins at the
     expand top; groups scroll under it through the band (which hangs
     from the same edge at z-[5]) */
  .jx-dsn-expand-head {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .jx-dsn-group {
    border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
    padding: 0.25rem 0;
  }
  .jx-dsn-group:last-child {
    border-bottom: none;
  }
  .jx-dsn-group-label {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .jx-dsn-group-label::-webkit-details-marker {
    display: none;
  }
  .jx-dsn-group-label::marker {
    content: '';
  }
  .jx-dsn-group-label::after {
    content: '';
    margin-left: 0.375rem;
    flex: none;
    width: 0.375rem;
    height: 0.375rem;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: rotate(45deg);
    transition: transform 150ms ease-out;
  }
  .jx-dsn-group[open] > .jx-dsn-group-label::after {
    transform: rotate(225deg);
  }
  .jx-dsn-group-label:hover {
    color: var(--foreground);
  }

  .jx-dsn-list {
    margin: 0;
    padding: 0 0 0.25rem 0.75rem;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .jx-dsn-link {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 0.1875rem 0.5rem;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 1px solid transparent;
    transition: color 100ms ease-out, border-color 100ms ease-out;
  }
  .jx-dsn-link-row {
    display: flex;
    align-items: baseline;
    gap: 0.4375rem;
    min-width: 0;
  }
  .jx-dsn-link-title {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-dsn-count {
    margin-left: auto;
    flex: none;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    opacity: 0.5;
  }
  .jx-dsn-sub {
    font-family: var(--font-nav);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
    color: var(--muted-foreground);
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-dsn-link:hover {
    color: var(--foreground);
  }
  .jx-dsn-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-dsn-current {
    color: var(--primary);
    border-left-color: var(--primary);
    font-weight: 500;
  }

  /* ── the bottom bar (narrow/medium) ── */
  .jx-dsn-bar {
    position: relative;
    outline: 1px solid color-mix(in oklab, var(--border) 25%, transparent);
    outline-offset: -1px;
  }
  .jx-dsn-bar-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    height: var(--jx-chrome-bar, 44px);
    padding-inline: 1rem 0.5rem;
    white-space: nowrap;
    overflow: hidden;
  }
  .jx-dsn-bar-label {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .jx-dsn-bar-label strong {
    color: var(--primary);
    font-weight: 600;
  }
  /* height-only expansion from the bar; collapsed height is EXACTLY 0
     (padding lives on the open state only — the ctree Codex r2 law) */
  .jx-dsn-expand {
    height: 0;
    overflow: hidden auto;
    visibility: hidden;
    transition: height 240ms cubic-bezier(0.22, 1, 0.36, 1);
    scrollbar-width: thin;
    scrollbar-gutter: stable both-edges;
  }
  .jx-dsn-bar[data-open] .jx-dsn-expand {
    height: min(56vh, 28rem);
    visibility: visible;
    padding-block: 0 0.5rem;
  }
  .jx-dsn-bar .jx-dsn-group-label {
    padding-inline: 1rem 0.5rem;
  }
  .jx-dsn-bar .jx-dsn-list {
    padding-inline-start: 1.75rem;
  }

  .jx-dsn-toggle {
    margin-left: auto;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--jx-chrome-bar, 44px);
    height: var(--jx-chrome-bar, 44px);
    border: 0;
    outline: 1px solid color-mix(in oklab, var(--border) 25%, transparent);
    outline-offset: -1px;
    background: color-mix(in oklab, var(--background) 68%, transparent);
    color: var(--muted-foreground);
    cursor: pointer;
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-dsn-toggle svg {
    width: 1rem;
    height: 1rem;
  }
  .jx-dsn-bar[data-open] .jx-dsn-toggle {
    transform: rotate(180deg);
  }
  .jx-dsn-toggle:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-dsn-expand,
    .jx-dsn-toggle,
    .jx-dsn-group-label::after {
      transition: none;
    }
  }
</style>
