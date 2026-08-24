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

  tw4 (2026-08-24): trail/link paint as token utilities in the markup;
  ONLY the CSS-drawn chevron (a pseudo-element build on the li+li
  sibling) remains in breadcrumb.css — D1-exempt residue.
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import './breadcrumb.css';

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

<nav data-jx-breadcrumb="" class={className} aria-label={label}>
  <ol
    class="jx-breadcrumb-list m-0 flex list-none flex-wrap items-center gap-1.5 font-nav text-xs uppercase tracking-[0.08em]"
    role="list"
  >
    {#each items as crumb, index (index)}
      <li data-jx-crumb-gap={crumb.gap ? '' : undefined}>
        {#if isCurrent(crumb) && !crumb.gap}
          <a
            data-jx-breadcrumb-current=""
            class="text-foreground no-underline"
            href={crumb.href}
            aria-current="page"
          >
            {crumb.label}
          </a>
        {:else}
          <a
            data-jx-breadcrumb-link=""
            class={cn(
              'text-muted-foreground no-underline transition-colors duration-150 ease-out hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-2',
              crumb.gap && 'tracking-normal',
            )}
            href={crumb.href}
          >
            {crumb.label}
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
