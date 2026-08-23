<!--
  jixoai component tree nav (apps/www/src/lib/ui/component-tree-nav.svelte).
  The catalog tree as chrome (Owner redo ruling, 2026-08-23 — supersedes
  the 2026-08-22 floating-button popover):

    >=1200px (shell container form "wide")    left rail, always expanded
    <1200px                                   full-width bottom bar
                                              (iOS-Safari-style chrome);
                                              tap expands the grouped
                                              tree upward — height-only,
                                              zero reflow outside itself

  Mounts through the website-scaffold's `jx-top-layer` context with the
  area role 'tree' — the shell grid places it per container form and the
  immersive law hides it on scroll DOWN (bar slides down / rail leaves
  with the header) and reveals on scroll UP. The catalog data comes from
  the ONE catalog (catalogByGroup), so the tree can never drift from the
  site inventory. Mobile is no longer delegated to the header mega menu
  alone: the bottom bar is the quick catalog surface at every narrow
  width (Owner, 2026-08-23).
-->
<script lang="ts">
  import { getContext, untrack } from 'svelte';
  import { page } from '$app/state';
  import { catalogByGroup } from '$lib/catalog';

  /** The website-scaffold top-layer adoption contract — STRUCTURAL on
   *  purpose (this component is app-local; the shape mirrors
   *  website-scaffold's exported TopLayerApi). */
  interface TopLayerApi {
    adopt: (node: HTMLElement, opts?: { area?: 'toc' | 'tree' | 'float' }) => () => void;
  }

  const groups = catalogByGroup();
  const topLayerApi = getContext<TopLayerApi>('jx-top-layer');

  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  /** does this entry's href point at the current page? */
  function isCurrent(href: string): boolean {
    const target = href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
    return target === normalized;
  }

  /** the current page's catalog name (bar label); off-catalog pages say
   *  "components" — the bar always names a real destination */
  const currentName = $derived(
    groups.flatMap(({ entries }) => entries).find((entry) => isCurrent(entry.href))?.name ??
      'components',
  );

  /** which group holds the current page? (open that one when expanding) */
  const activeGroupId = $derived(
    groups.find(({ entries }) => entries.some((entry) => isCurrent(entry.href)))?.group.id ?? '',
  );

  let rootEl = $state<HTMLElement | null>(null);
  let open = $state(false);

  const close = () => (open = false);

  // self-adoption into the scaffold's chrome plane with the area role
  // 'tree' (same live-node move + untrack laws as the toc)
  $effect(() => {
    if (!rootEl || !topLayerApi) return;
    const el = rootEl;
    return untrack(() => {
      const home = el.parentElement;
      el.dataset.toplayer = '';
      const release = topLayerApi.adopt(el, { area: 'tree' });
      return () => {
        release();
        delete el.dataset.toplayer;
        home?.appendChild(el);
      };
    });
  });
</script>

<nav class="jx-ctree" bind:this={rootEl} aria-label="component catalog">
  <!-- rail surface (wide form): grouped tree, always expanded -->
  <div class="jx-ctree-rail">
    <p class="jx-ctree-title">component catalog</p>
    <div class="jx-ctree-groups">
      {#each groups as { group, entries } (group.id)}
        <details class="jx-ctree-group" open={group.id === activeGroupId}>
          <summary class="jx-ctree-group-label">
            {group.label}
            <span class="jx-ctree-group-zh">{group.zh}</span>
            <span class="jx-ctree-count">{entries.length}</span>
          </summary>
          <ul class="jx-ctree-list" role="list">
            {#each entries as entry (entry.name)}
              <li>
                <a
                  class="jx-ctree-link"
                  class:jx-ctree-current={isCurrent(entry.href)}
                  href={entry.href}
                  aria-current={isCurrent(entry.href) ? 'page' : undefined}
                  >{entry.name}</a
                >
              </li>
            {/each}
          </ul>
        </details>
      {/each}
    </div>
  </div>

  <!-- bar surface (narrow/medium forms): 44px glass row + height-only
       upward expansion; the collapsed list is inert (no phantom targets) -->
  <div class="jx-ctree-bar jx-glass" data-open={open || undefined}>
    <div class="jx-ctree-bar-row">
      <span class="jx-ctree-bar-label">
        catalog · <strong>{currentName}</strong>
      </span>
      <button
        type="button"
        class="jx-ctree-toggle"
        aria-expanded={open}
        aria-label="Expand the component catalog"
        onclick={() => (open ? close() : (open = true))}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
    <div class="jx-ctree-expand">
      {#each groups as { group, entries } (group.id)}
        <details class="jx-ctree-group" open={group.id === activeGroupId}>
          <summary class="jx-ctree-group-label">
            {group.label}
            <span class="jx-ctree-group-zh">{group.zh}</span>
            <span class="jx-ctree-count">{entries.length}</span>
          </summary>
          <ul class="jx-ctree-list" role="list">
            {#each entries as entry (entry.name)}
              <li>
                <a
                  class="jx-ctree-link"
                  class:jx-ctree-current={isCurrent(entry.href)}
                  href={entry.href}
                  aria-current={isCurrent(entry.href) ? 'page' : undefined}
                  onclick={close}
                  >{entry.name}</a
                >
              </li>
            {/each}
          </ul>
        </details>
      {/each}
    </div>
  </div>
</nav>

<style>
  /* the component itself is placement-neutral: the shell grid owns the
     cell ([data-area='tree']); only the surface pair switches here.
     Authored inside main — invisible until adopted so SSR/hydration
     never flashes it at the top of the content column (this component
     is app-local and always scaffold-hosted; the header mega menu
     remains the no-JS fallback). */
  .jx-ctree {
    min-width: 0;
  }
  .jx-ctree:not([data-toplayer]) {
    display: none;
  }

  /* surface switching follows the SHELL's container form (grid era,
     2026-08-23) — bar everywhere by default, rail from 1200px up */
  .jx-ctree-rail {
    display: none;
  }
  @container jx-shell (min-width: 1200px) {
    .jx-ctree-rail {
      display: block;
    }
    .jx-ctree-bar {
      display: none;
    }
    .jx-ctree {
      margin: 1.25rem 0 0 1.25rem;
      max-height: calc(100% - 1.25rem);
      overflow: hidden auto;
      /* scrollbar law: both-edges gutters; padding hands the gutter back
         so the visual inset stays 0.5rem */
      scrollbar-width: thin;
      scrollbar-gutter: stable both-edges;
      padding-inline: max(0.5rem - var(--jx-scrollbar-thin, 0px), 0px);
    }
  }

  .jx-ctree-title {
    margin: 0 0 0.75rem;
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }

  /* group (collapsible via native details/summary) */
  .jx-ctree-group {
    border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
    padding: 0.25rem 0;
  }
  .jx-ctree-group:last-child {
    border-bottom: none;
  }
  .jx-ctree-group-label {
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
  .jx-ctree-group-label::-webkit-details-marker {
    display: none;
  }
  .jx-ctree-group-label::marker {
    content: '';
  }
  .jx-ctree-group-label::after {
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
  .jx-ctree-group[open] > .jx-ctree-group-label::after {
    transform: rotate(225deg);
  }
  .jx-ctree-group-label:hover {
    color: var(--foreground);
  }

  .jx-ctree-group-zh {
    font-size: 0.625rem;
    opacity: 0.7;
  }
  .jx-ctree-count {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    opacity: 0.5;
  }

  /* link list */
  .jx-ctree-list {
    margin: 0;
    padding: 0 0 0.25rem 0.75rem;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .jx-ctree-link {
    display: block;
    padding: 0.1875rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 1px solid transparent;
    transition: color 100ms ease-out, border-color 100ms ease-out;
  }
  .jx-ctree-link:hover {
    color: var(--foreground);
  }
  .jx-ctree-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-ctree-current {
    color: var(--primary);
    border-left-color: var(--primary);
    font-weight: 500;
  }

  /* ── the bottom bar (narrow/medium): the toc mobile bar's mirror ── */
  .jx-ctree-bar {
    position: relative;
    outline: 1px solid color-mix(in oklab, var(--border) 25%, transparent);
    outline-offset: -1px;
  }
  .jx-ctree-bar-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    height: var(--jx-chrome-bar, 44px);
    padding-inline: 1rem 0.5rem;
    white-space: nowrap;
    overflow: hidden;
  }
  .jx-ctree-bar-label {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .jx-ctree-bar-label strong {
    color: var(--primary);
    font-weight: 600;
  }
  /* height-only expansion: the panel grows upward from the bar (the
     element is end-anchored in its stage cell) — nothing outside
     reflows; collapsed content is inert. Collapsed height is EXACTLY 0:
     padding lives on the open state only (Codex r2 P1 — a leaked 8px
     pad made the collapsed bar 52px, desyncing the body's bottom
     reservation and covering the footer). */
  .jx-ctree-expand {
    height: 0;
    overflow: hidden auto;
    visibility: hidden;
    transition: height 240ms cubic-bezier(0.22, 1, 0.36, 1);
    scrollbar-width: thin;
    scrollbar-gutter: stable both-edges;
  }
  .jx-ctree-bar[data-open] .jx-ctree-expand {
    height: min(56vh, 28rem);
    visibility: visible;
    padding-block: 0 0.5rem;
  }
  .jx-ctree-bar .jx-ctree-group-label {
    padding-inline: 1rem 0.5rem;
  }
  .jx-ctree-bar .jx-ctree-list {
    padding-inline-start: 1.75rem;
  }

  .jx-ctree-toggle {
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
  .jx-ctree-toggle svg {
    width: 1rem;
    height: 1rem;
  }
  .jx-ctree-bar[data-open] .jx-ctree-toggle {
    transform: rotate(180deg);
  }
  .jx-ctree-toggle:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-ctree-expand,
    .jx-ctree-toggle,
    .jx-ctree-group-label::after {
      transition: none;
    }
  }
</style>
