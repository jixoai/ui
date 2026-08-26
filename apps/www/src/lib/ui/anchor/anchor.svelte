<!--
  jixoai Anchor root (registry/files/ui/anchor/anchor.svelte,
  composition-first, 2026-08-25).
  The heading-anchor rail (antd's Anchor) — the LIGHT sibling of
  toc.svelte — as a DOM-DELEGATED family: the root is a nav landmark
  whose children are AnchorItem parts; the spy derives its targets
  from the root's OWN DOM (child a[href^="#"], scoped via closest() so
  nested families never leak into each other) — zero registration, so
  keyed reorders and conditional inserts/deletes cannot corrupt it.

  The active pick stays the ONE shared implementation, @lib/scroll-spy
  (batch-4 closure: no second line-pick algorithm), flowing to the
  items through family context (state, never membership order — the
  context contract).

  Two reversible leases on the targets (the tour contract's pattern):
    scroll-margin-top = offset  sticky headers never cover the landed
                               heading (antd Anchor's offset scrolling)
    tabindex=-1 on click        the focus rides onto the target
                               heading, restored on blur
  Both are set on demand and restored — consumer markup is never
  permanently mutated. A childList MutationObserver re-derives targets
  (and re-leases) when items enter or leave after mount.

  tw4 posture (unchanged): PURE utility paint, zero css residue.
-->
<script lang="ts" module>
  /** context surface the family shares (the active pick) */
  export interface AnchorApi {
    readonly activeId: string;
  }

  /** context key — global symbol registry so the family files stay
   *  independent registry items (tabs precedent) */
  export const ANCHOR_KEY = Symbol.for('jx-anchor');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { createScrollSpy } from '$lib/scroll-spy';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** DENSITY override: explicit ?? inherited ?? default */
    density?: Density;
    'data-density'?: string;
    /** nav landmark label */
    label?: string;
    /** offset of the pick line from the viewport top (sticky headers) */
    offset?: number;
    class?: string;
    children: Snippet;
  }

  let { density, 'data-density': _callerDensity, label = 'on this page', offset = 96, class: className = '', children, ...rest }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity: Density = $derived(resolveDensity(density, inheritedDensity));

  let navEl = $state<HTMLElement | undefined>();
  let activeId = $state('');

  setContext<AnchorApi>(ANCHOR_KEY, {
    get activeId() {
      return activeId;
    },
  });

  /** the spy's targets, derived from THIS root's own DOM on every
   *  read — live, so conditional items join/leave the spy for free */
  function ownFragmentIds(): { id: string }[] {
    return [...(navEl?.querySelectorAll<HTMLAnchorElement>('a[href^="#"]') ?? [])]
      .filter((a) => a.closest('nav') === navEl)
      .map((a) => ({ id: (a.getAttribute('href') ?? '').slice(1) }))
      .filter((target) => target.id !== '');
  }

  $effect(() => {
    const spy = createScrollSpy(ownFragmentIds, (id) => (activeId = id), { offset });
    return () => spy.destroy();
  });

  // scroll clearance lease (set on demand, restored on destroy)
  let leased: HTMLElement[] = [];
  function release(): void {
    for (const el of leased) {
      el.style.scrollMarginTop = el.dataset.jxAnchorPriorMargin ?? '';
      delete el.dataset.jxAnchorPriorMargin;
    }
    leased = [];
  }
  function lease(): void {
    release();
    leased = ownFragmentIds()
      .map((target) => document.getElementById(target.id))
      .filter((el): el is HTMLElement => el !== null);
    for (const el of leased) {
      el.dataset.jxAnchorPriorMargin = el.style.scrollMarginTop;
      el.style.scrollMarginTop = `${offset}px`;
    }
  }

  // re-derive when items enter/leave after mount (childList only —
  // attribute paint like aria-current never re-triggers this)
  $effect(() => {
    if (!navEl) return;
    lease();
    const observer = new MutationObserver(() => lease());
    observer.observe(navEl, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      release();
    };
  });

  /** click = navigate + OWN the focus (tabindex=-1 for the ride,
   *  restored on blur — the reversible-lease pattern), delegated to
   *  the root so items carry no handlers of their own */
  function handleClick(event: MouseEvent): void {
    const link = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    if (!link || !navEl?.contains(link)) return;
    const hash = link.getAttribute('href') ?? '';
    const el = document.getElementById(hash.slice(1));
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

<nav
  bind:this={navEl}
  data-jx-anchor=""
  data-density={resolvedDensity}
  class={cn('flex flex-col gap-[var(--jx-stack)] border-l border-border', className)}
  aria-label={label}
  onclick={handleClick}
  {...rest}
>
  {@render children()}
</nav>
