<!--
  jixoai breadcrumb (registry/files/ui/breadcrumb.svelte).
  W3C-first: a breadcrumb trail is a nav landmark wrapping an ordered
  list of ordinary links — the entire ARIA story is nav[aria-label] +
  ol + a[aria-current="page"]. No microdata obligations, no roles to
  maintain; the ol's order IS the hierarchy.

  The trail is data-driven: crumbs carry href + label, the LAST crumb
  is the current page (rendered as aria-current text, still an anchor
  so deep links and reloads stay honest). A separator glyph is drawn
  between items via CSS (::before on li+li) — decoration, aria-hidden
  by construction.

  Overflow on long trails collapses the MIDDLE into a single "…" link
  when `collapse` is set (the omitted pages are one click away through
  it — it links to the first hidden crumb, never a dead ellipsis).
-->
<script lang="ts">
  interface Crumb {
    label: string;
    href: string;
  }

  interface Props {
    /** the trail, root first; the last crumb is the current page */
    crumbs: Crumb[];
    /** nav landmark label (announced before the trail) */
    label?: string;
    /** max visible crumbs before the middle collapses (0 = never) */
    collapse?: number;
    class?: string;
  }

  let { crumbs, label = 'Breadcrumb', collapse = 0, class: className = '' }: Props = $props();

  /** the visible trail: [first, …link, lastFew] when collapsing */
  const items = $derived.by(() => {
    if (collapse <= 0 || crumbs.length <= collapse) return crumbs.map((c) => ({ ...c, gap: false }));
    const keepEnd = Math.max(1, Math.ceil((collapse - 1) / 2));
    const keepStart = Math.max(1, collapse - 1 - keepEnd);
    const hidden = crumbs.slice(keepStart, crumbs.length - keepEnd);
    return [
      ...crumbs.slice(0, keepStart).map((c) => ({ ...c, gap: false })),
      ...(hidden.length > 0
        ? [{ label: '…', href: hidden[0].href, gap: true as const }]
        : []),
      ...crumbs
        .slice(crumbs.length - keepEnd)
        .map((c, i, arr) => ({ ...c, gap: false, last: i === arr.length - 1 })),
    ];
  });

  const isCurrent = $derived((c: (typeof items)[number]) => c === items.at(-1));
</script>

<nav class="jx-breadcrumb {className}" aria-label={label}>
  <ol class="jx-breadcrumb-list" role="list">
    {#each items as crumb, index (index)}
      <li class:jx-crumb-gap={crumb.gap}>
        {#if isCurrent(crumb) && !crumb.gap}
          <a class="jx-breadcrumb-current" href={crumb.href} aria-current="page">{crumb.label}</a>
        {:else}
          <a class="jx-breadcrumb-link" href={crumb.href}>{crumb.label}</a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .jx-breadcrumb-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  /* the separator: CSS-drawn chevron, decoration only */
  .jx-breadcrumb-list li + li::before {
    content: '';
    display: inline-block;
    margin-right: 0.375rem;
    width: 0.375rem;
    height: 0.375rem;
    border-right: 1px solid var(--muted-foreground);
    border-bottom: 1px solid var(--muted-foreground);
    transform: rotate(-45deg);
    opacity: 0.7;
  }

  .jx-breadcrumb-link {
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 150ms ease-out;
  }
  .jx-breadcrumb-link:hover {
    color: var(--primary);
  }
  .jx-breadcrumb-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: 2px;
  }

  .jx-breadcrumb-current {
    color: var(--foreground);
    text-decoration: none;
  }
  .jx-crumb-gap .jx-breadcrumb-link {
    letter-spacing: 0;
  }
</style>
