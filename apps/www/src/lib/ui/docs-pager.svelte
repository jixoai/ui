<!--
  jixoai docs pager (docs-restructure, 2026-08-25). The page relations on
  every component page: previous / next along the taxonomy reading order
  (first/last fall back to the listing / docs home) + same-group related
  links, NEAREST FIRST (design D7). Rendered BY THE LAYOUT on
  /docs/components/* routes — zero per-page wiring, uniform by
  construction. Non-inventory pages (the form family hub) render
  nothing.

  The EIGHT-AXIS SURFACE (explicit-props W3-D4, siteOnly): size ·
  shape · radius · density · color · theme · elevation · motion ride
  DocsPagerDefaults (first-time, all no-own) on the nav root — a
  no-own CONTAINER surface (the layout renders this with no lanes
  today; nothing stamps, the pager paints exactly as before; the axes
  are the supply seam for the day the layout speaks them).
-->
<script lang="ts">
  import { page } from '$app/state';
  import { componentContext } from '$lib/docs-route-model';
  import Icon from '$lib/ui/icon';
  import './docs-pager.css';
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
  import { DocsPagerDefaults } from './docs-pager-defaults.svelte';

  interface Props {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
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
  }

  let { density, size, shape, radius, color, theme, elevation, motion }: Props = $props();

  const name = $derived(page.url.pathname.split('/').pop()?.replace(/\.html$/, '') ?? '');
  const ctx = $derived(componentContext(name));

  // ── the eight-axis surface (W3-D4 — FIRST-TIME contract, all
  // no-own): one resolution record; the standard stamp + supply +
  // anchor wiring on the nav root
  const d = $derived(
    DocsPagerDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);
</script>

{#if ctx}
  <nav
    bind:this={uniRoot}
    class="jx-docs-pager-wrap"
    aria-label="pager"
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={rootStyle}
  >
    {#if ctx.related.length}
      <div class="jx-docs-pager-related">
        <p class="jx-docs-pager-title">
          related <span class="jx-dp-qual">· {ctx.groupLabel.toLowerCase()}</span>
        </p>
        <ul role="list">
          {#each ctx.related as rel (rel.entry.name)}
            <li><a class="jx-dp-chip" href={rel.entry.href}>{rel.entry.name}</a></li>
          {/each}
        </ul>
      </div>
    {/if}
    <div class="jx-docs-pager">
      {#if ctx.prev}
        <a href={ctx.prev.entry.href}>
          <span class="jx-docs-pager-direction"><span class="jx-dp-ico" aria-hidden="true"><Icon name="arrowLeft" /></span>previous</span>
          <span class="jx-docs-pager-label">{ctx.prev.entry.name}</span>
        </a>
      {:else}
        <a href="/docs/components.html">
          <span class="jx-docs-pager-direction"><span class="jx-dp-ico" aria-hidden="true"><Icon name="arrowLeft" /></span>back to</span>
          <span class="jx-docs-pager-label">all components</span>
        </a>
      {/if}
      {#if ctx.next}
        <a class="jx-docs-pager-next" href={ctx.next.entry.href}>
          <span class="jx-docs-pager-direction">next<span class="jx-dp-ico" aria-hidden="true"><Icon name="arrowRight" /></span></span>
          <span class="jx-docs-pager-label">{ctx.next.entry.name}</span>
        </a>
      {:else}
        <a class="jx-docs-pager-next" href="/docs.html">
          <span class="jx-docs-pager-direction">end of the chain<span class="jx-dp-ico" aria-hidden="true"><Icon name="arrowRight" /></span></span>
          <span class="jx-docs-pager-label">docs home</span>
        </a>
      {/if}
    </div>
  </nav>
{/if}
