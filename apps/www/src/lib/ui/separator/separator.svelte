<!--
  jixoai separator (registry/files/ui/separator/separator.svelte).
  W3C-first: the horizontal separator IS <hr> — native semantics, native
  styling, zero ARIA. Only the vertical posture has no native element, so
  it takes the ARIA route: <div role="separator" aria-orientation>.

  The INK law (Owner ruling, 2026-09-01): a separator paints no COLOR —
  border-color is for borders, not for separators. The default variant
  is NAMED fused: the backdrop's own CONTRAST GHOST, a
  backdrop-filter: contrast(0.5) strip that reads as a tonal shift over
  ANY ground (near-black lifts toward mid, near-white dims —
  auto-adaptive, theme-agnostic, zero color tokens). Shaped variants —
  dashed (6/4), dense (3/3), dotted, wavy — are MASKS over the same
  contrast strip: one ink engine, many geometries. The fade variant
  rides the BLEND engine instead: an alpha-ramped white gradient under
  mix-blend-mode: difference inverts the backdrop toward mid —
  transparent → light → dark → light → transparent, visible on any
  ground (peak alpha capped at 0.6; an exact 50% backdrop is
  difference's blind spot — separator.css documents the math). The ONE
  additive exception: solid (Owner amendment, 2026-09-08) turns the
  ghost OFF and paints plain `var(--border)` — the escape for grounds
  where the ghost's exact-mid blind spot or a patterned backdrop
  defeats subtraction; every other variant paints zero ink of its own.
  Orientation swaps the mask axis
  (the vertical posture reads the same laws top-to-bottom).

  tailwindless-site P0 (2026-09-17): the paint rides the family's
  stylex ATOMS (separator.stylex.ts — the corpus re-authoring landed
  as the registry canonical; every ink rule moved there). The composed
  class strings below are the payload's own join form (see cx).

  Length stays the consumer's job (block horizontal / inline-block
  vertical — width/height via the class prop or the parent's layout).
-->
<script lang="ts">
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
  import { SeparatorDefaults, type SeparatorVariant } from './separator-defaults.svelte';
  import { separatorStyles } from './separator.stylex';
  import './separator.css';

  interface Props extends Omit<HTMLAttributes<HTMLHRElement>, 'color'> {
    orientation?: 'horizontal' | 'vertical';
    /** the ink geometry: fused (the ghost itself), masks over the
     *  contrast ghost (dashed/dense/dotted/wavy), the blend engine
     *  for fade (transparent → light → dark → light → transparent),
     *  or solid (the plain-fill --border escape, the subtraction-ink
     *  exception); omitted → the contract own 'fused'
     *  (SeparatorDefaults — a declared own, not ambient) */
    variant?: SeparatorVariant;
    /** inline style passthrough — composed AFTER the family's carrier
     *  stamp (the #4 seam law: never clobbered, never dropped) */
    style?: string | null;
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
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  // the payload's own join (scripts/lib/stylex-payload.mjs
  // serializeTable): every string declaration except the $$css
  // marker, space-joined — the exact string registry/payload/stylex/
  // separator/separator.styles.js ships as each atom's value (F11:
  // the component owes NO @stylexjs runtime for class composition —
  // the pinned engine inlines neither attrs() nor props(), so the
  // join is ours, and it matches the shipped payload byte for byte).
  // Size overrides (dotted/wavy lanes over the 1px base) resolve by
  // the engine's own emission order — base first, variant later
  // within the same priority tier — the same cascade the payload's
  // composed consumers ride.
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // the variant × orientation ladder — every cx() call walks static
  // table members, so each entry is a plain class string; runtime is
  // a pure lookup (the tokens.svelte blueprint precedent's shape,
  // minus the runtime dependency)
  const VARIANT_CLASS: Record<'horizontal' | 'vertical', Record<SeparatorVariant, string>> = {
    horizontal: {
      fused: cx(separatorStyles.horizontal),
      solid: cx(separatorStyles.horizontal, separatorStyles.solidHorizontal),
      dashed: cx(separatorStyles.horizontal, separatorStyles.dashedH),
      dense: cx(separatorStyles.horizontal, separatorStyles.denseH),
      dotted: cx(separatorStyles.horizontal, separatorStyles.dottedH),
      wavy: cx(separatorStyles.horizontal, separatorStyles.wavyH),
      fade: cx(separatorStyles.horizontal, separatorStyles.fadeH),
    },
    vertical: {
      fused: cx(separatorStyles.vertical),
      solid: cx(separatorStyles.vertical, separatorStyles.solidVertical),
      dashed: cx(separatorStyles.vertical, separatorStyles.dashedV),
      dense: cx(separatorStyles.vertical, separatorStyles.denseV),
      dotted: cx(separatorStyles.vertical, separatorStyles.dottedV),
      wavy: cx(separatorStyles.vertical, separatorStyles.wavyV),
      fade: cx(separatorStyles.vertical, separatorStyles.fadeV),
    },
  };

  let {
    orientation = 'horizontal',
    variant,
    style: callerStyle,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the ink geometry rides its literal slot (own
  // 'fused') — W3-B: the eight universal axes ride the same record
  const d = $derived(SeparatorDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // the #4 composition: carriers first, the caller's own style LAST
  const rootStyle = $derived([carriers, callerStyle].filter(Boolean).join('; ') || undefined);
</script>

{#if orientation === 'vertical'}
  <!-- component-owned semantics land AFTER the spread: role/aria here
       are not overridable — the separator contract is the component's -->
  <div
    bind:this={uniRoot}
    data-jx-separator={d.variant}
    data-orientation="vertical"
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    class={cn(VARIANT_CLASS.vertical[d.variant], className)}
    style={rootStyle}
    {...(rest as HTMLAttributes<HTMLDivElement>)}
    role="separator"
    aria-orientation="vertical"
  ></div>
{:else}
  <hr
    bind:this={uniRoot}
    data-jx-separator={d.variant}
    data-orientation="horizontal"
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    class={cn(VARIANT_CLASS.horizontal[d.variant], className)}
    style={rootStyle}
    {...rest}
  />
{/if}
