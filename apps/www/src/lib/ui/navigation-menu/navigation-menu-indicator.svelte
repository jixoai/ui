<!--
  jixoai NavigationMenuIndicator
  (registry/files/ui/navigation-menu/navigation-menu-indicator.svelte,
  2026-09-01).
  The OPTIONAL sliding-active part of the navigation-menu family — the
  indicator technology sunk OUT of the site chrome (TerminalHeader kept
  a private copy because the family offered no surface to hang it on).
  Render it as a child of <NavigationMenu>; it measures the bar's
  current entry — [data-jx-navmenu-link][aria-current="page"] or
  [data-jx-navmenu-trigger][aria-current="true"], NEVER an entry inside
  an open [popover] panel (mega links carry their own current truth) —
  and slides to it.

  TWO motion laws (Owner ruling, 2026-09-01 — the offering, not a
  default):

    motion="navigation" (default)  for PAGE-LEVEL nav under View
      Transitions: the indicator carries a view-transition-name, so a
      same-named element on the next document morphs across the
      navigation (the app owns the transition wiring — SvelteKit
      onNavigate startViewTransition, or cross-document VT). A stamped
      name is INERT when no transition ever runs. Same-document entry
      moves still animate (WAAPI below) — the two laws compose.

    motion="waapi"                  for apps with NO View Transitions:
      pure Web Animations API sliding, no view-transition-name — the
      nav never pays for a name it does not use.

  The WAAPI engine (both modes): one element, measured geometry
  (offsetLeft/offsetTop — layout coords, scroll/RTL-safe), animated
  between the previous and next box on entry changes; the FIRST
  placement, resize/font-driven remeasures and prefers-reduced-motion
  JUMP instead of animating. Repaint triggers are DOM-delegated (the
  part owns no nav data): an aria-current MutationObserver, a
  ResizeObserver on the bar, and fonts.ready. jsdom (no WAAPI, no RO)
  degrades to direct style writes — everything stays truthful.

  The part stamps position:relative on its bar (idempotent) so the
  entries' offsetParent and the indicator's containing block agree.
  Default paint: the restrained tonal fill (tabs-pill dialect,
  ink-inverting through tokens); the class seam carries site chrome
  (e.g. a backdrop-filter brightness pill over a dark bezel).
-->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** the motion law: 'navigation' stamps a view-transition-name for
        page-level morphs under View Transitions (inert without them);
        'waapi' is the pure Web Animations path — no name, no cost */
    motion?: 'navigation' | 'waapi';
    /** the view-transition-name under motion="navigation"
        (one page-level indicator per name) */
    name?: string;
    /** slide duration in ms (reduced-motion ignores it) */
    duration?: number;
    class?: string;
  }

  let {
    motion = 'navigation',
    name = 'jx-nav-indicator',
    duration = 240,
    class: className = '',
  }: Props = $props();

  let indEl = $state<HTMLSpanElement | null>(null);

  /** the bar this part renders in (the nearest nav) */
  const barEl = (): HTMLElement | null => indEl?.closest('nav') ?? null;

  /** the current DIRECT entry of THIS bar — mega-panel links (inside a
   *  [popover]) carry their own current truth and never steal the bar's
   *  indicator (the TerminalHeader law, verbatim) */
  function currentEntry(): HTMLElement | null {
    const bar = barEl();
    if (!bar) return null;
    return (
      [...bar.querySelectorAll<HTMLElement>(
        '[data-jx-navmenu-link][aria-current="page"], [data-jx-navmenu-trigger][aria-current="true"]',
      )].find((el) => el.closest('[popover]') === null) ?? null
    );
  }

  /** hug inset per edge — the tabs pill dialect */
  function hugInset(bar: HTMLElement): number {
    const raw = parseFloat(getComputedStyle(bar).getPropertyValue('--jx-inset'));
    return (Number.isFinite(raw) ? raw : 8) / 2;
  }

  type Geo = { x: number; y: number; w: number; h: number };
  let prev: Geo | null = null;
  let first = true;

  const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

  function measure(animate: boolean) {
    const bar = barEl();
    const ind = indEl;
    if (!bar || !ind) return;
    const entry = currentEntry();
    if (!entry) {
      ind.style.opacity = '0';
      prev = null;
      return;
    }
    const inset = hugInset(bar);
    // clamped at 0: a degenerate box (jsdom's zero layout) still writes
    // a legal style instead of a dropped negative one
    const next: Geo = {
      x: entry.offsetLeft + inset,
      y: entry.offsetTop + inset,
      w: Math.max(0, entry.offsetWidth - inset * 2),
      h: Math.max(0, entry.offsetHeight - inset * 2),
    };
    const reduce =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = prev;
    // the style lands immediately; a legal move paints an animation OVER
    // it — the element is never left mid-flight if WAAPI is missing
    ind.style.opacity = '1';
    ind.style.width = `${next.w}px`;
    ind.style.height = `${next.h}px`;
    ind.style.transform = `translate(${next.x}px, ${next.y}px)`;
    if (animate && !first && !reduce && from && typeof ind.animate === 'function') {
      ind.animate(
        [
          {
            transform: `translate(${from.x}px, ${from.y}px)`,
            width: `${from.w}px`,
            height: `${from.h}px`,
          },
          {
            transform: `translate(${next.x}px, ${next.y}px)`,
            width: `${next.w}px`,
            height: `${next.h}px`,
          },
        ],
        { duration, easing: EASE },
      );
    }
    prev = next;
    first = false;
  }

  // stamp the bar as the measuring box (idempotent — a bar already
  // positioned by its chrome keeps its own box)
  $effect(() => {
    const bar = barEl();
    if (bar && getComputedStyle(bar).position === 'static') {
      bar.style.position = 'relative';
    }
    measure(false);
  });

  // DOM-delegated repaint triggers: route swaps flip aria-current; box
  // resizes and late font loads shift geometry — all remeasure QUIETLY
  onMount(() => {
    const bar = barEl();
    if (!bar) return;
    const mo = new MutationObserver(() => measure(true));
    mo.observe(bar, { subtree: true, attributeFilter: ['aria-current'] });
    const ro =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => measure(false));
    ro?.observe(bar);
    document.fonts?.ready.then(() => measure(false)).catch(() => {});
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  });

  // late-mount entries (hydration order): one settling measure
  onDestroy(() => {
    prev = null;
  });
</script>

<span
  bind:this={indEl}
  data-jx-navmenu-ind=""
  data-motion={motion}
  aria-hidden="true"
  class={cn(
    'pointer-events-none absolute top-0 left-0 z-0 opacity-0 rounded-[calc(var(--radius)-2px)] bg-[color-mix(in_oklab,var(--jx-tonal)_14%,transparent)]',
    className,
  )}
  style={motion === 'navigation' ? `view-transition-name: ${name};` : undefined}
></span>
