<!--
  jixoai tabs list (registry/files/ui/tabs/tabs-list.svelte).
  The tablist half of the tabs family: role=tablist strip carrying the
  APG keyboard contract — Arrow keys walk the triggers of the list's
  orientation axis (horizontal: ←/→, vertical: ↑/↓, RTL-aware), Home/End
  jump the ends, the walk WRAPS, and disabled triggers are skipped.
  Focus is NOT trapped: Tab leaves the tablist entirely (roving
  tabindex — only the selected trigger is tabbable).

  Activation follows the root's `activation` prop: 'automatic' selects
  on every focus move (terminal immediacy); 'manual' moves focus only —
  Enter/Space commit through the trigger's native click.
  Triggers are whatever the consumer nests (tabs-trigger.svelte pairs
  here, but any [role=tab] joins the walk) — keyboard handling is DOM
  delegation over :scope [role=tab]:not([disabled]), no registration.

  tw4 (2026-08-24): PURE utility migration, zero css residue — the
  orientation axis is a prop, so the horizontal/vertical border rides
  conditional utility strings; jx-tabs-vertical stays as the semantic
  hook consumers/variants may key on.

  Indicator engine (2026-09-01, tabs variant system): the list owns a
  shared sliding indicator span (LAST child) measured against its OWN
  selected trigger — offsetLeft/offsetTop layout coords (scroll-proof,
  RTL-safe). `indicator` picks a built-in material ('none' renders
  nothing) OR passes a Snippet: the snippet replaces the paint while
  this engine still owns the geometry (a snippet rides the pill-family
  hug box; data-material reports 'custom'). Only the `line` material
  keeps the structural border; `layout` adds grow/scroll/wrap strip
  shapes. Every horizontal strip is a ONE-CELL GRID HOST whose scroll
  run (role=presentation, the real scroller) degrades to a
  hidden-scrollbar overflow run with on-demand ::scroll-button()
  chevrons stacked over the same cell — grid layering, never
  position:absolute (Owner, 2026-09-01; the css contract lives in
  tabs-trigger.css).
-->
<script lang="ts" module>
  /** indicator paint materials — 'none' renders no indicator at all */
  export type TabsIndicatorMaterial = 'line' | 'pill' | 'outline' | 'glass' | 'liquid' | 'none';

  /** measured geometry the engine hands a custom indicator snippet */
  export type TabsIndicatorGeo = {
    x: number;
    y: number;
    w: number;
    h: number;
    orientation: 'horizontal' | 'vertical';
  };

  /** strip shape: inline (natural) · grow (triggers stretch) · scroll
   *  (declared overflow run) · wrap (multi-row flow) — every horizontal
   *  strip additionally degrades to a scroll run when content outgrows
   *  the container (css-owned, tabs-trigger.css) */
  export type TabsLayout = 'inline' | 'grow' | 'scroll' | 'wrap';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TABS_KEY, type TabsApi } from './tabs.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** axis of travel: horizontal ←/→ · vertical ↑/↓ (layout is yours) */
    orientation?: 'horizontal' | 'vertical';
    /** selection indicator: a built-in material, or a Snippet that owns
     *  the paint while the engine keeps owning the measured geometry */
    indicator?: TabsIndicatorMaterial | Snippet<[TabsIndicatorGeo]>;
    /** inline: natural sizes · grow: triggers share the strip · scroll: a
     *  declared overflow run · wrap: rows flow instead of scrolling */
    layout?: TabsLayout;
    children: Snippet;
  }

  let {
    orientation = 'horizontal',
    indicator = 'line',
    layout = 'inline',
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  /** name-collision law: a function IS the override snippet (Svelte's
   *  own runtime check for snippets); a string selects a built-in */
  function isIndicatorSnippet(value: Props['indicator']): value is Snippet<[TabsIndicatorGeo]> {
    return typeof value === 'function';
  }

  const indicatorSnippet = $derived(isIndicatorSnippet(indicator) ? indicator : undefined);
  /** the material actually reported/painted — a custom snippet has no
   *  built-in paint, so it never keeps the structural border either */
  const material = $derived(isIndicatorSnippet(indicator) ? 'custom' : indicator);

  const tabs = getContext<TabsApi>(TABS_KEY);

  let listEl = $state<HTMLDivElement>();
  /** the horizontal scroll run (null on vertical lists — flat law) */
  let runEl = $state<HTMLDivElement | null>(null);
  let indEl = $state<HTMLSpanElement>();
  /** measured geometry of the selected trigger; null = nothing selected */
  let geo = $state<TabsIndicatorGeo | null>(null);
  /** the FIRST placement after mount must not animate (no 0,0 slide-in);
   *  selection moves afterwards slide */
  let quietNext = true;

  /** this list's OWN triggers — nested tablists (a panel hosting its own
   *  Tabs) keep their own walker, so closest() must resolve HERE */
  function ownTabs(): HTMLElement[] {
    return [...(listEl?.querySelectorAll<HTMLElement>('[role=tab]') ?? [])].filter(
      (tab) => tab.closest('[role=tablist]') === listEl,
    );
  }

  /** geometry law (px numbers, layout coords): pill-family hugs the
   *  trigger inset by half the inline inset token; line is a 2px bar
   *  riding the strip's content edge on the orientation axis. All
   *  offsets resolve against the trigger's offsetParent — the RUN on
   *  horizontal lists (position: relative, so the indicator scrolls
   *  WITH the content instead of stranding at the viewport edge) and
   *  the list itself on flat vertical ones (jsdom's null offsetParent
   *  falls back to the list) */
  function geometryFor(t: HTMLElement, list: HTMLElement): TabsIndicatorGeo {
    const box = (t.offsetParent as HTMLElement | null) ?? list;
    if (material !== 'line') {
      // the pill family breathes by the label's OWN inset rhythm — the
      // trigger's resolved padding-inline (the used value, so density
      // tiers and calc() tokens arrive as real px; jsdom's zero layout
      // resolves to 0, where geometry numbers are unasserted anyway).
      // Derived, never a guessed constant.
      const inset = parseFloat(getComputedStyle(t).paddingInlineStart || '0') / 2 || 0;
      return {
        x: t.offsetLeft + inset,
        y: t.offsetTop + inset,
        w: t.offsetWidth - inset * 2,
        h: t.offsetHeight - inset * 2,
        orientation,
      };
    }
    // line material: the 2px bar rides the STRIP edge — but a wrapped
    // strip has no single travel edge, so the bar rides the trigger's
    // own edge on the far side (the Material fixed-tabs wrap reads this
    // way: each row underlines its own active tab)
    if (orientation === 'horizontal') {
      return {
        x: t.offsetLeft,
        y: layout === 'wrap' ? t.offsetTop + t.offsetHeight - 2 : box.clientHeight - 2,
        w: t.offsetWidth,
        h: 2,
        orientation,
      };
    }
    return {
      x: layout === 'wrap' ? t.offsetLeft + t.offsetWidth - 2 : box.clientWidth - 2,
      y: t.offsetTop,
      w: 2,
      h: t.offsetHeight,
      orientation,
    };
  }

  /** measure the list's OWN selected trigger and place the indicator;
   *  quiet placements set data-quiet BEFORE the style write and clear
   *  it a frame later, so the css transition never picks them up.
   *  A selection-driven measure ALWAYS strips a leftover quiet flag —
   *  a throttled/stalled clear frame (backgrounded tab) must never
   *  leave the bar transition-less for good */
  function measure(quiet: boolean) {
    const list = listEl;
    if (!list) return;
    const active = [...list.querySelectorAll<HTMLElement>('[role=tab][aria-selected="true"]')].find(
      (tab) => tab.closest('[role=tablist]') === list,
    );
    if (!active) {
      geo = null;
      return;
    }
    if (quiet && indEl) {
      indEl.setAttribute('data-quiet', '');
      const el = indEl;
      requestAnimationFrame(() => el.removeAttribute('data-quiet'));
      setTimeout(() => el.removeAttribute('data-quiet'), 64);
    } else {
      indEl?.removeAttribute('data-quiet');
    }
    geo = geometryFor(active, list);
  }

  // selection-driven placement: re-measure when the selection moves and
  // when the geometry law itself flips (material family / axis / layout)
  $effect(() => {
    if (material === 'none') {
      geo = null;
      return;
    }
    void tabs.selected;
    void material;
    void orientation;
    void layout;
    measure(quietNext);
    quietNext = false;
  });

  // size-driven remeasure (density/font/layout shifts resize the strip)
  // — always QUIET: a resize is not a selection move, the bar must not
  // slide. jsdom has no ResizeObserver; the guard keeps tests honest
  $effect(() => {
    const list = listEl;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure(true));
    ro.observe(list);
    return () => ro.disconnect();
  });

  /** the run's scrollability verdict (Owner, 2026-09-01): the engine's
   *  own button generation differs across engines — this JS stamp is
   *  the single truth the css keys the chevrons on (a strip that
   *  cannot scroll shows nothing at all; a closed direction never
   *  paints). Updated on scroll, resize and mount */
  $effect(() => {
    const run = runEl;
    if (!run) return;
    const update = () => {
      const max = run.scrollWidth - run.clientWidth;
      if (max <= 1) run.setAttribute('data-jx-scroll-state', 'none');
      else if (run.scrollLeft <= 1) run.setAttribute('data-jx-scroll-state', 'start-closed');
      else if (run.scrollLeft >= max - 1) run.setAttribute('data-jx-scroll-state', 'end-closed');
      else run.setAttribute('data-jx-scroll-state', 'open');
    };
    update();
    run.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    ro?.observe(run);
    return () => {
      run.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  });

  /** liquid needs its displacement filter referenced from the list (the
   *  indicator span inherits the custom property); a consumer style
   *  APPENDS (merge law, alert-dialog dialect — never clobber) */
  const listStyle = $derived(
    [
      material === 'liquid'
        ? `--jx-tabs-liquid-bf: url('#${tabs.uid}-liquid') blur(2px) saturate(1.6)`
        : '',
      consumerStyle ?? '',
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );

  // the empty state (no focus, no selection) renders every trigger
  // tabbable for SSR/JS-off entry; trim to the FIRST enabled tab only —
  // exactly one tab stop, per the APG roving law (disabled triggers
  // explicitly -1: browsers skip them, the DOM should say so too)
  // TODO(batch-3): re-trim when a trigger's disabled state flips
  // dynamically — the effect only runs on tabStop transitions today
  $effect(() => {
    if (tabs.tabStop !== '' || !listEl) return;
    const triggers = ownTabs();
    const firstEnabled = triggers.find((tab) => !tab.hasAttribute('disabled'));
    for (const tab of triggers) {
      tab.setAttribute('tabindex', tab === firstEnabled ? '0' : '-1');
    }
  });

  /** APG keyboard walk — arrows along the axis (flipped under an
   *  inherited RTL direction — nearest [dir] ancestor, html included),
   *  Home/End to the ends; wraps; skips disabled triggers */
  function handleKeydown(event: KeyboardEvent) {
    const rtl =
      orientation === 'horizontal' && ((listEl?.closest('[dir]') as HTMLElement | null)?.dir ?? 'ltr') === 'rtl';
    const forward = orientation === 'horizontal' ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const back = orientation === 'horizontal' ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    if (event.key !== forward && event.key !== back && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    const triggers = ownTabs().filter((tab) => !tab.hasAttribute('disabled'));
    if (triggers.length === 0) return;
    const current = triggers.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? triggers[0]
        : event.key === 'End'
          ? triggers.at(-1)
          : current === -1
            ? triggers[0]
            : triggers[(current + (event.key === forward ? 1 : -1) + triggers.length) % triggers.length];
    // focus rides the roving tabindex: the trigger's onfocus moves the
    // tab stop; automatic activation ALSO selects on the focus move,
    // manual waits for Enter/Space — the trigger's native click path
    if (!next) return;
    next.focus();
    if (tabs.activation === 'automatic') next.click();
  }
</script>

{#snippet runTail()}
  {#if material === 'liquid'}
    <!-- zero-size SVG carrying the displacement filter the liquid
         backdrop references by fragment id -->
    <svg aria-hidden="true" class="absolute h-0 w-0">
      <filter id="{tabs.uid}-liquid" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.012" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  {/if}
  {#if material !== 'none'}
    <!-- the engine-owned wrapper: geometry lands here, a custom
         snippet paints inside it -->
    <span
      bind:this={indEl}
      data-jx-tabs-ind=""
      data-material={material}
      aria-hidden="true"
      hidden={geo === null}
      style={geo === null
        ? undefined
        : `transform: translate(${geo.x}px, ${geo.y}px); width: ${geo.w}px; height: ${geo.h}px`}
    >
      {#if indicatorSnippet && geo}{@render indicatorSnippet(geo)}{/if}
    </span>
  {/if}
{/snippet}

<div
  bind:this={listEl}
  data-jx-tabs-list=""
  data-indicator={material}
  data-layout={layout}
  class={cn(
    'relative box-border',
    // the horizontal list is a ONE-CELL GRID HOST (Owner, 2026-09-01 —
    // grid stacking law, never position:absolute): the scroll run and
    // the engine-generated ::scroll-button() boxes (the run's siblings
    // by construction) stack in the same cell; the vertical list keeps
    // the flat flex column
    orientation === 'horizontal'
      ? 'jx-tabs-horizontal grid [grid-template-columns:minmax(0,1fr)]'
      : 'jx-tabs-vertical flex flex-col items-stretch [gap:var(--jx-gap)]',
    material === 'line' && (orientation === 'vertical' ? 'border-r border-border' : 'border-b border-border'),
    orientation === 'vertical' && layout === 'wrap' && 'flex-wrap',
    className,
  )}
  style={listStyle}
  onkeydown={handleKeydown}
  {...rest}
  role="tablist"
  aria-orientation={orientation}
>
  {#if orientation === 'horizontal'}
    <!-- the run: the strip's REAL scroller. role=presentation flattens
         it out of the accessibility tree (the tablist keeps owning its
         tabs); it stays UNPOSITIONED so trigger offset geometry keeps
         resolving against the list; the engine's ::scroll-button()
         boxes generate as the run's siblings and stack over the same
         grid cell (the css contract lives in tabs-trigger.css) -->
    <div
      bind:this={runEl}
      role="presentation"
      data-jx-tabs-run=""
      data-layout={layout}
      class={cn('jx-tabs-run flex items-stretch [gap:var(--jx-gap)]', layout === 'wrap' && 'flex-wrap')}
    >
      {@render children()}
      {@render runTail()}
    </div>
  {:else}
    {@render children()}
    {@render runTail()}
  {/if}
</div>
