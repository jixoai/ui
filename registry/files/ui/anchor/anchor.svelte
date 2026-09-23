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
  import {
    densityRungOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { createScrollSpy } from '$lib/scroll-spy';
  import { AnchorDefaults } from './anchor-defaults.svelte';
  import { anchorStyles } from './anchor.stylex';

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    'data-density'?: string;
    /** nav landmark label */
    label?: string;
    /** offset of the pick line from the viewport top (sticky headers) */
    offset?: number;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the rail's links scale with
     *  the root) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    children: Snippet;
  }

  let {
    density,
    'data-density': _callerDensity,
    label = 'on this page',
    offset = 96,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2, widened W3-D5): density resolves explicit ?? ambient
  // scope; the seven sibling axes join the same record — the rail
  // root stamps the §10 carriers (JOINing the consumer style attr,
  // the merge law), supplies downward to the anchor items (they ride
  // the supply chain) and anchors query() after the anchor state
  // declaration (the W3-C TDZ law); no opinion stamps nothing, the
  // ambient css scope channel keeps flowing
  const d = $derived(
    AnchorDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let navEl = $state<HTMLElement | undefined>();
  provideQueryAnchor(() => navEl ?? null);
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
  data-density={densityRungOf(d.density)}
  class={cx(anchorStyles.rail, className)}
  class:dark={d.theme === 'dark'}
  style={[carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined}
  aria-label={label}
  onclick={handleClick}
  {...rest}
>
  {@render children()}
</nav>
