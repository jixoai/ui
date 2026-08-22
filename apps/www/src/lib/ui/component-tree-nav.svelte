<!--
  jixoai component tree nav (apps/www/src/lib/ui/component-tree-nav.svelte).
  The floating catalog tree: a scaffold-float mounted button at the
  viewport bottom-right (desktop/tablet only — mobile uses the header
  secondary nav) that opens a grouped tree of every registry item with
  the CURRENT ROUTE highlighted. The catalog data comes from the ONE
  catalog (catalogByGroup), so the tree can never drift from the site
  inventory.

  Product shape (user ruling 2026-08-22):
    desktop/tablet  fixed bottom-right button; click → tree panel opens
                    above it (popover=auto: light dismiss, Escape native)
    mobile          the entire component is display:none — the header
                    mega menu is the navigation surface there
    highlight       the current pathname matches tree links
                    (normalized, anchor-stripped) with aria-current=page

  The tree panel uses the popover API + CSS anchor positioning to dock
  above the button — same laws as every jixoai overlay. Groups are
  collapsible (details/summary — native, zero JS) with the current
  group open by default on mount.
-->
<script lang="ts">
  import { page } from '$app/state';
  import { catalogByGroup } from '$lib/catalog';

  const groups = catalogByGroup();
  const normalized = $derived(
    page.url.pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/',
  );

  /** does this entry's href point at the current page? */
  function isCurrent(href: string): boolean {
    const target = href.replace(/\.html$/, '').split('#')[0].replace(/\/+$/, '') || '/';
    return target === normalized;
  }

  /** which group holds the current page? (open that one on mount) */
  const activeGroupId = $derived(
    groups.find(({ entries }) => entries.some((entry) => isCurrent(entry.href)))?.group.id ?? '',
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper is
     a positioning shell; the button is the interactive element -->
<div class="jx-ctree" aria-label="component catalog">
  <div
    id="jx-ctree-panel"
    popover="auto"
    role="dialog"
    aria-label="component catalog tree"
    class="jx-ctree-panel"
  >
    <nav aria-label="all components">
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
    </nav>
  </div>

  <button
    type="button"
    class="jx-ctree-btn"
    popovertarget="jx-ctree-panel"
    aria-label="open the component catalog tree"
    aria-haspopup="dialog"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M3 5h6v6H3z" />
      <path d="M13 5h8v6h-8z" />
      <path d="M13 15h4v4h-4z" />
      <path d="M6 15h4v4H6z" />
    </svg>
  </button>
</div>

<style>
  /* the whole component: fixed bottom-right, desktop/tablet only */
  .jx-ctree {
    display: none;
  }
  @media (min-width: 768px) {
    .jx-ctree {
      display: block;
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      z-index: 80;
      anchor-name: --jx-ctree-anchor;
    }
  }

  /* the floating trigger button (press physics) */
  .jx-ctree-btn {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      border-color 150ms ease-out;
  }
  .jx-ctree-btn svg {
    width: 1.25rem;
    height: 1.25rem;
  }
  .jx-ctree-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-ctree-btn:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-ctree-btn:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* the tree panel: docks above the button via CSS anchoring */
  .jx-ctree-panel {
    position: fixed;
    position-anchor: --jx-ctree-anchor;
    inset-area: top span-left;
    margin: var(--jx-ctree-gap, 8px);
    position-try-fallbacks: flip-block;
    position-try: flip-block;
    width: 16rem;
    max-height: min(70vh, 32rem);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.5rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    scrollbar-width: thin;
  }
  @supports not (anchor-name: --jx-ctree-anchor) {
    .jx-ctree-panel {
      position: fixed;
      inset: auto 1.25rem 5rem auto;
    }
  }
  .jx-ctree-panel::backdrop {
    background: transparent;
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
    margin-left: auto;
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
  /* when the chevron pseudo is present, the count needs room */
  .jx-ctree-group-label::after {
    margin-left: 0.375rem;
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
</style>
