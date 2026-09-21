<!--
  jixoai kbd (registry/files/ui/kbd/kbd.svelte).
  The keyboard-input glyph: a native <kbd> — the element whose entire
  meaning is "this is keyboard input" — with the grammar's variant
  ladder (variant-grammar frozen r1) over the ENGRAVED geometry: 1px
  border, 2px corner radius (Owner 2026-09-05) + the --shadow-engrave
  inset (the elevation grammar's engrave tier, 2026-09-01 — a glyph
  incised into the plane, not lifted off it), mono. TONAL is the default rung (12%/45% primary
  tint — --jx-tonal aliases primary at :root); fill and outline sit
  beside it. Semantic hue injects from the outside (class="jx-hue-error"),
  never as a variant name. restProps flow through, so title/data-* land
  verbatim; composition with <samp>, text, or an <a> (documented
  shortcut) is the consumer's call.

  Purposefully not: key-parsing, platform detection (⌘/Ctrl), or a
  <kbd> per key auto-split. Those are string-parsing opinions that
  belong to the caller; the element composes fine by hand:

    <kbd>⌘</kbd> + <kbd>K</kbd>

  tw4 (2026-08-24): utility-authored — the paint composes from token
  utilities (layer law: consumer utilities always win); `jx-kbd` stays
  as a semantic hook only, no css defines it. Variant rungs are
  byte-aligned with chip/press-button's variant map (the TW4 collision
  law: a rung is the SOLE border-color source — the frame never
  carries a named border paint).
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (kbd.stylex.ts) joined through cx() below
  — the ladder walks the static VARIANT_CLASS table; `jx-kbd` stays a
  semantic hook only, no css defines it.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
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
  import { KbdDefaults, type KbdVariant } from './kbd-defaults.svelte';
  import { kbdStyles } from './kbd.stylex';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
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
     *  broadcast (the engraved glyph's own 2px corner stays unless an
     *  explicit lane or a supplying ancestor speaks) */
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
    /** the glyph's paint ladder — prominence, never semantic hue
     *  (inject with jx-hue-* utilities); tonal rides primary by default */
    variant?: KbdVariant;
  }

  let {
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    variant,
    style: callerStyle,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 2.3): explicit ?? ambient/own per slot, one line, no
  // legacy helper channels — W3-B: the eight universal axes ride the
  // same record
  const d = $derived(KbdDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // the #4 composition: carriers first, the caller's own style LAST
  const rootStyle = $derived([carriers, callerStyle].filter(Boolean).join('; ') || undefined);

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // the ladder walks static table members — runtime is a pure lookup
  const VARIANT_CLASS: Record<KbdVariant, string> = {
    fill: cx(kbdStyles.base, kbdStyles.fill),
    tonal: cx(kbdStyles.base, kbdStyles.tonal),
    outline: cx(kbdStyles.base, kbdStyles.outline),
  };
</script>

<kbd
  bind:this={uniRoot}
  data-jx-kbd={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  class={cx(VARIANT_CLASS[d.variant], className)}
  style={rootStyle}
  {...rest}
>
  {@render children?.()}
</kbd>
