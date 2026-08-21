<!--
  jixoai popover (registry/files/ui/popover.svelte).

  NativeHTML base (2026-08-20): the Popover API — `popover="auto"` on the
  panel plus a trigger button wired declaratively through `popovertarget`.
  Light dismiss (outside click / focus loss), Escape, aria-expanded on the
  trigger, one-auto-popover-at-a-time, and top-layer rendering are all
  browser-native. The component ships ZERO script — markup and styling
  only.

  Anchored placement (2026-08-21, Owner ruling): the panel anchors to the
  trigger through the CSS Anchor Positioning API — `anchor-name` on the
  wrapper, `position-anchor` + `position-area` on the panel (both the
  current name and its `inset-area` legacy alias are set inline; Chrome
  127+ dropped the old name, older engines ignore the new one), plus native
  `position-try`/`position-try-fallbacks` flipping (block/inline — the
  MDN-recommended shorthand ships alongside the longhand) and
  `position-visibility: anchors-visible` so a panel whose anchor scrolled
  away hides instead of floating stale. Declarative CSS
  positioning replaces every line of JS geometry: no measure-and-replace,
  so the panel cannot jitter on open. Engines without anchor positioning
  fall back to authored viewport-center (inset + margin:auto) — the same
  visual as v1, never worse.

  Props:
    id            popover id; popovertarget association + anchor name
    triggerLabel  trigger button label (ignored when `trigger` snippet given)
    placement     anchored inset-area: 'bottom' | 'bottom-end' | 'top' |
                  'top-end' | 'top-start' | 'bottom-start' (default
                  'bottom-end' — under the trigger, right edges aligned)
    trigger?      custom trigger snippet: render your own <button
                  popovertarget={id}> inside; the wrapper still carries
                  anchor-name, so anchoring stays component-owned
  Side selection (2026-08-21): Chromium re-runs position-try fallbacks at
  open time but NOT on nested-scroller scroll (verified on Chrome 146 via
  ego-browser: identical setups flip at open, stick in overflow while
  scrolling; style invalidation does not force re-evaluation — an engine
  gap). While open, a rAF-throttled passive scroll listener therefore
  selects between the two AUTHORED position-areas (primary / flipped) by
  which side fits. CSS stays the positioning authority — JS only picks
  the predeclared state, never computes geometry.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    id: string;
    triggerLabel: string;
    placement?: 'bottom' | 'bottom-end' | 'top' | 'top-end' | 'top-start' | 'bottom-start';
    trigger?: Snippet;
    children: Snippet;
  }

  let {
    id,
    triggerLabel,
    placement = 'bottom-end',
    trigger,
    children,
  }: Props = $props();

  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-pop-* name.
  const anchorName = `--jx-pop-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const area = $derived(
    placement === 'bottom' ? 'bottom' :
    placement === 'bottom-end' ? 'bottom span-right' :
    placement === 'bottom-start' ? 'bottom span-left' :
    placement === 'top' ? 'top' :
    placement === 'top-end' ? 'top span-right' :
    'top span-left'
  );

  let panel = $state<HTMLElement | null>(null);
  let anchor = $state<HTMLElement | null>(null);
  let scheduled = false;

  const flippedArea = $derived(
    placement === 'bottom' ? 'top' :
    placement === 'bottom-end' ? 'top-end' :
    placement === 'bottom-start' ? 'top-start' :
    placement === 'top' ? 'bottom' :
    placement === 'top-end' ? 'bottom-end' :
    'bottom-start'
  );
  const areaOf = (value: string): string =>
    value === 'top' ? 'top' :
    value === 'top-end' ? 'top span-right' :
    value === 'top-start' ? 'top span-left' :
    value === 'bottom' ? 'bottom' :
    value === 'bottom-end' ? 'bottom span-right' :
    'bottom span-left';

  // choose the authored side that fits; keep the current one when neither
  // does (position-try fallbacks still handle the open-time decision and
  // engines whose scroll re-evaluation works).
  const selectSide = (): void => {
    scheduled = false;
    const el = panel;
    const an = anchor;
    if (!el?.matches(':popover-open') || !an) return;
    const vh = innerHeight;
    const ph = el.offsetHeight;
    const trigBottom = an.getBoundingClientRect().bottom;
    const trigTop = an.getBoundingClientRect().top;
    const gap = 8; // matches --jx-pop-gap: the panel floats this far off
    // the anchor (shadow clearance); footprint on a side is ph + gap.
    const fitsBelow = trigBottom + ph + gap <= vh;
    const fitsAbove = trigTop - ph - gap >= 0;
    let next: string | null = null;
    if (!fitsBelow && fitsAbove) next = flippedArea;
    else if (fitsBelow && el.style.getPropertyValue('--jx-pa') === areaOf(flippedArea)) next = area;
    if (next !== null && el.style.getPropertyValue('--jx-pa') !== areaOf(next)) {
      el.style.setProperty('--jx-pa', areaOf(next));
    }
  };

  const onScroll = (): void => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(selectSide);
  };


  onMount(() => {
    const el = panel;
    if (!el) return;
    const handler = () => {
      if (el.matches(':popover-open')) {
        addEventListener('scroll', onScroll, { passive: true, capture: true });
        addEventListener('resize', onScroll, { passive: true });
        // restore the authored primary side on reopen
        if (!el.matches(':popover-open')) el.style.setProperty('--jx-pa', areaOf(area));
      } else {
        removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
        removeEventListener('resize', onScroll);
      }
    };
    el.addEventListener('toggle', handler);
    return () => {
      el.removeEventListener('toggle', handler);
      removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      removeEventListener('resize', onScroll);
    };
  });
</script>

<span class="jx-pop-anchor" style="anchor-name: {anchorName}" bind:this={anchor}>
  {#if trigger}
    {@render trigger()}
  {:else}
    <button type="button" class="jx-pop-trigger" popovertarget={id}>
      {triggerLabel}
      <svg
        class="jx-pop-caret"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  {/if}
</span>

<div {id} popover="auto" class="jx-pop" bind:this={panel} style="position-anchor: {anchorName}; inset-area: {area}; --jx-pa: {area}; position-area: var(--jx-pa);">
  {@render children()}
</div>

<style>
  .jx-pop-anchor {
    display: inline-flex;
  }

  /* Trigger: the press-button outline recipe on a native button — it must
     stay a real <button> because popovertarget only works on buttons. */
  .jx-pop-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: var(--shadow-xs);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-pop-trigger:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    background: var(--muted);
  }
  .jx-pop-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  /* Caret: flips while open via :has + ::popover-open (progressive —
     engines without it simply keep the closed caret). */
  .jx-pop-caret {
    width: 13px;
    height: 13px;
    flex: none;
    transition: transform 150ms ease-out;
  }
  .jx-pop-trigger:has(+ :popover-open) .jx-pop-caret,
  .jx-pop-anchor:has(+ .jx-pop:popover-open) .jx-pop-caret {
    transform: rotate(180deg);
  }

  /* Panel law: 1px border, hard offset shadow, radius 0. Anchored via
     position-anchor + inset-area (inline styles carry the per-instance
     names); native try-fallbacks flip on overflow — zero JS geometry. */
  .jx-pop {
    position: fixed;
    /* gap law (Owner, 2026-08-21): the shadow extends bottom-right; a
       uniform margin keeps it off the anchor for EVERY placement — above
       (shadow's bottom edge), left (shadow's right edge), and below/right
       (adjacency itself). */
    margin: var(--jx-pop-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    /* scroll law (MDN tip): when the anchor scrolls out of view (nested
       scrollers move it), hide the panel instead of leaving it stale */
    position-visibility: anchors-visible;
    width: fit-content;
    height: fit-content;
    max-width: min(92vw, 22rem);
    max-height: 72vh;
    overflow: auto;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center —
     the v1 visual, never worse. */
  @supports not (anchor-name: --jx-pop-fallback) {
    .jx-pop {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-pop::backdrop {
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-pop-trigger,
    .jx-pop-caret {
      transition: none;
    }
  }
</style>
