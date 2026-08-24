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
-->
<script lang="ts">
  import { page } from '$app/state';
  import { docsSections } from '$lib/docs-route-model';

  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  /** does this page's href point at the current page (path part)? */
  function isCurrent(href: string): boolean {
    const target = href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
    return target === normalized;
  }

  const currentLabel = $derived(
    docsSections
      .flatMap((section) => section.pages)
      .find((pg) => isCurrent(pg.href))?.label ?? 'docs',
  );

  /** which section holds the current page (open it when expanding) */
  const activeSectionId = $derived(
    docsSections.find((section) => section.pages.some((pg) => isCurrent(pg.href)))?.id ?? 'sections',
  );

  let open = $state(false);
  const close = () => (open = false);
</script>

<nav class="jx-dsn" data-area="tree" aria-label="docs sections">
  <!-- rail surface (wide form): the spine, always expanded -->
  <div class="jx-dsn-rail">
    <p class="jx-dsn-title">docs</p>
    <div class="jx-dsn-groups">
      {#each docsSections as section (section.id)}
        <details class="jx-dsn-group" open>
          <summary class="jx-dsn-group-label">
            {section.label}
            <span class="jx-dsn-group-zh">{section.zh}</span>
          </summary>
          <ul class="jx-dsn-list" role="list">
            {#each section.pages as pg (pg.label)}
              <li>
                <a
                  class="jx-dsn-link"
                  class:jx-dsn-current={isCurrent(pg.href)}
                  href={pg.href}
                  aria-current={isCurrent(pg.href) ? 'page' : undefined}
                  >{pg.label}</a
                >
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
        aria-label="Expand the docs sections"
        onclick={() => (open ? close() : (open = true))}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
    <div class="jx-dsn-expand">
      {#each docsSections as section (section.id)}
        <details class="jx-dsn-group" open={section.id === activeSectionId}>
          <summary class="jx-dsn-group-label">
            {section.label}
            <span class="jx-dsn-group-zh">{section.zh}</span>
          </summary>
          <ul class="jx-dsn-list" role="list">
            {#each section.pages as pg (pg.label)}
              <li>
                <a
                  class="jx-dsn-link"
                  class:jx-dsn-current={isCurrent(pg.href)}
                  href={pg.href}
                  aria-current={isCurrent(pg.href) ? 'page' : undefined}
                  onclick={close}
                  >{pg.label}</a
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
  .jx-dsn {
    min-width: 0;
  }

  /* surface switching follows the SHELL's container form — bar
     everywhere by default, rail from 1200px up (the ctree contract) */
  .jx-dsn-rail {
    display: none;
  }
  @container jx-shell (min-width: 1200px) {
    .jx-dsn-rail {
      display: block;
    }
    .jx-dsn-bar {
      display: none;
    }
    .jx-dsn {
      padding-block-start: 1.25rem;
      max-height: calc(100% - 1.25rem);
      overflow: hidden auto;
      scrollbar-width: thin;
      scrollbar-gutter: stable both-edges;
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
  .jx-dsn-group-zh {
    font-size: 0.625rem;
    opacity: 0.7;
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
    display: block;
    padding: 0.1875rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted-foreground);
    text-decoration: none;
    border-left: 1px solid transparent;
    transition: color 100ms ease-out, border-color 100ms ease-out;
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
