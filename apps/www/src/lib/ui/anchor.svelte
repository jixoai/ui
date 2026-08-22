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
  TODO(batch-4+): if toc.svelte ever needs the same plain pick, extract
  the shared minimal spy interface — two active algorithms must not
  drift (Codex batch-3 note).
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

  // scroll clearance lease: each target gets scroll-margin-top = offset
  // so sticky headers never cover the landed heading (antd Anchor's
  // offset scrolling equivalent) — set on mount, restored on destroy
  let leased: HTMLElement[] = [];
  $effect(() => {
    leased = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    for (const el of leased) {
      el.dataset.jxAnchorPriorMargin = el.style.scrollMarginTop;
      el.style.scrollMarginTop = `${offset}px`;
    }
    return () => {
      for (const el of leased) {
        el.style.scrollMarginTop = el.dataset.jxAnchorPriorMargin ?? '';
        delete el.dataset.jxAnchorPriorMargin;
      }
    };
  });

  $effect(() => {
    sync();
    // CAPTURE phase: element scroll events do NOT bubble — a page that
    // scrolls an inner shell container (this site's .jx-shell-body)
    // never reaches a bubble-phase window listener (walkthrough-4 P1).
    // Capture sees BOTH the document scroller and every inner one.
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(raf);
    };
  });

  /** click = navigate + OWN the focus: land on the target heading
   *  (tabindex=-1 for the ride, restored on blur — the same reversible
   *  lease the tour contract rules for anchor-name) */
  function handleAnchorClick(href: string): void {
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    const hadTabindex = el.getAttribute('tabindex');
    el.setAttribute('tabindex', '-1');
    // let the native fragment scroll land first, then move the focus
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.addEventListener(
        'blur',
        () => {
          if (hadTabindex === null) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', hadTabindex);
        },
        { once: true },
      );
    });
  }
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
          onclick={() => handleAnchorClick(item.href)}
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
