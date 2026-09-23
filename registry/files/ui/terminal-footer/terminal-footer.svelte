<!--
  jixoai TerminalFooter root (registry/files/ui/terminal-footer/terminal-footer.svelte,
  composition-first, 2026-08-25).
  The ghost wordmark closes the narrative: huge hollow brand word
  (text-stroke recipe, @supports fallback), meta row and © line. The
  old closed `links[]` data prop died — the meta row's content is
  composed as TerminalFooterColumn children (title prop + free links):

    <TerminalFooter ghost="JIXOAI/UI" copyright="© 2026 · MIT">
      <TerminalFooterColumn title="project">
        <a href="https://github.com/jixoai/ui">GitHub</a>
      </TerminalFooterColumn>
    </TerminalFooter>

  Links inside columns are consumer-authored; their muted→brand hover
  paint rides terminal-footer.css descendant rules (utilities cannot
  reach free children). The ext-icon injection of the closed form died
  with it — external-link affordances are caller content now.

  tw4 (2026-08-24, kept): ONLY the @supports fallback for engines
  without -webkit-text-stroke stays in terminal-footer.css — D1-exempt
  residue on the unlayered carve-out (it must override the
  text-transparent utility paint when it fires).
  (props-discipline sweep, 2026-08-25)

  tailwindless one-shot W1 (2026-09-17): the ghost/meta/column paint
  rides the family's stylex atoms (terminal-footer.stylex.ts); the
  shell's measure + rhythm (with its sm/lg padding seams) lives in
  terminal-footer.css — the tl-shell pattern (media rules cannot
  re-pin atoms under the F9 layer order).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
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
  import { TerminalFooterDefaults } from './terminal-footer-defaults.svelte';
  import { terminalFooterStyles } from './terminal-footer.stylex';
  import './terminal-footer.css';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
    /** the ghost wordmark (decorative, aria-hidden) */
    ghost: string;
    /** the © row text (defaults to the live year) */
    copyright?: string;
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
     *  inheritance (the .dark class bridge). UNLIKE the terminal
     * bezel (header/card), the footer carries NO shell-theme literal
     * — the name is free, the axis joins whole */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query(). NO own — the footer is flat page chrome */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
    children: Snippet;
  }

  let {
    ghost,
    copyright,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();
  const year = new Date().getFullYear();

  // ── the eight-axis surface (W3-C — FIRST-TIME contract, all
  // no-own: the footer is flat page chrome, the supply chain is the
  // point)
  const d = $derived(
    TerminalFooterDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived([carriers, style].filter(Boolean).join('; ') || undefined);

  // the payload's own join (separator's serialize law): objects in
  // dev, joined strings in payloads — never a raw interpolation
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

</script>

<!-- the shell's measure + rhythm (margin auto, the 90rem cap, the
     padding steps and their sm/lg seams) lives in terminal-footer.css —
     media rules cannot re-pin atoms (the F9 layer order) -->
<footer
  bind:this={uniRoot}
  data-jx-terminal-footer=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={className}
  {...rest}
>
  <p class="jx-footer-ghost {cx(terminalFooterStyles.ghost)}" aria-hidden="true">{ghost}</p>
  <div class={cx(terminalFooterStyles.metaRow)}>
    <div data-jx-terminal-footer-columns="" class={cx(terminalFooterStyles.columns)}>
      {@render children()}
    </div>
    <span>{copyright ?? `© ${year}`}</span>
  </div>
</footer>
