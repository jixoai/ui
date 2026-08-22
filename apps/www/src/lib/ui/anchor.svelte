<!--
  jixoai anchor (registry/files/ui/anchor.svelte).
  The heading-anchor link list (antd's Anchor) — the LIGHT sibling of
  toc.svelte: where the ToC measures IoM weights and draws the rule
  tracker, anchor answers the simpler question "which section am I in"
  for a plain list of in-page links:

    nav > ol > a[href="#id"] — REAL anchors, native navigation, native
    smooth scrolling (the theme's scroll-behavior), JS only READS the
    scroll position (rAF-throttled) to mark the active link
    aria-current="location". No engine, no geometry writes, zero
    coupling to consumer markup beyond target ids existing.

  items are {href:'#section-id', label}[]; the active pick follows the
  LAST target scrolled to/past the viewport-top line (the same
  downward-resolution rule as the toc engine's line pick, simplified).
-->
<script lang="ts">
  export interface AnchorItem {
    /** in-page fragment, '#section-id' */
    href: string;
    label: string;
  }

  interface Props {
    items: AnchorItem[];
    /** nav landmark label */
    label?: string;
    /** offset of the pick line from the viewport top (sticky headers) */
    offset?: number;
    class?: string;
  }

  let { items, label = 'on this page', offset = 96, class: className = '' }: Props = $props();

  let activeId = $state('');
  let raf = 0;

  /** the pick: the last target whose top is at/past the line; before
   *  the first target, nothing is current */
  function sync(): void {
    let picked = '';
    for (const item of items) {
      const el = document.getElementById(item.href.slice(1));
      if (!el) continue;
      if (el.getBoundingClientRect().top <= offset) picked = item.href;
    }
    activeId = picked;
  }

  function handleScroll(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(sync);
  }

  $effect(() => {
    sync();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(raf);
    };
  });
</script>

<nav class="jx-anchor {className}" aria-label={label}>
  <ol role="list">
    {#each items as item (item.href)}
      <li>
        <a
          class="jx-anchor-link"
          class:jx-anchor-active={activeId === item.href}
          href={item.href}
          aria-current={activeId === item.href ? 'location' : undefined}
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<style>
  .jx-anchor ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    border-left: 1px solid var(--border);
  }
  .jx-anchor-link {
    display: block;
    padding: 0.3125rem 0.75rem;
    border-left: 2px solid transparent;
    margin-left: -1px;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    text-decoration: none;
    transition: color 150ms ease-out, border-color 150ms ease-out;
  }
  .jx-anchor-link:hover {
    color: var(--foreground);
  }
  .jx-anchor-link:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-anchor-active {
    border-left-color: var(--primary);
    color: var(--foreground);
  }
</style>
