<!--
  jixoai anchor (registry/files/ui/anchor.svelte).
  The heading-anchor link list (antd's Anchor) — the LIGHT sibling of
  toc.svelte: nav > ol of REAL fragment links (native navigation,
  native smooth scrolling via the theme's scroll-behavior), with the
  active pick delegated to the ONE shared implementation,
  @lib/scroll-spy (batch-4 closure: no second line-pick algorithm —
  toc-engine remains the weighted IoM variant, scroll-spy is the plain
  which-section answer).

  Two reversible leases on the targets (the tour contract's pattern):
    scroll-margin-top = offset  sticky headers never cover the landed
                               heading (antd Anchor's offset scrolling)
    tabindex=-1 on click        the focus rides onto the target
                               heading, restored on blur
  Both are set on demand and restored — consumer markup is never
  permanently mutated.
-->
<script lang="ts">
  import { createScrollSpy } from '$lib/scroll-spy';

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

  $effect(() => {
    const spy = createScrollSpy(
      () => items.map((item) => ({ id: item.href.slice(1) })),
      (id) => (activeId = id),
      { offset },
    );
    return () => spy.destroy();
  });

  // scroll clearance lease (restored on destroy)
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

  /** click = navigate + OWN the focus (tabindex=-1 for the ride,
   *  restored on blur — the reversible-lease pattern) */
  function handleAnchorClick(href: string): void {
    const el = document.getElementById(href.slice(1));
    if (!el) return;
    const hadTabindex = el.getAttribute('tabindex');
    el.setAttribute('tabindex', '-1');
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
          class:jx-anchor-active={activeId === item.href.slice(1)}
          href={item.href}
          aria-current={activeId === item.href.slice(1) ? 'location' : undefined}
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
