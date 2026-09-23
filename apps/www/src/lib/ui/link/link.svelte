<!--
  jixoai link (registry/files/ui/link/link.svelte).
  The typographic text link — the non-nav prose lane of the site link
  law, promoted from the markdown docs' doc-link demo (2026-09-07,
  markdown-coverage change §1.4) into a registry part so markdown
  links map to a uniformly managed component.

  Paint: carries the face B2 non-nav lane (jx-pure.css: primary text,
  4px underline offset, underline on hover) as its OWN utilities so it
  stands alone outside any face scope. Inside a jx-pure scope the
  values coincide — same property, same token — a deterministic no-op
  (the layer law keeps utilities above the components-layer face, and
  the face never declared a different value anyway). It does NOT
  escape the face (design §2: an inline escape would virally descope
  every descendant a prose link legitimately contains — code chips,
  nested marks, images). The forced-colors ink is the fleet convention
  (press-button's link rung): LinkText, the system link color.

  External detection: ANY absolute http(s) href is external —
  /^https?:\/\//i — no origin comparison, because window.location has
  no place in an SSR-safe registry component. External links carry
  the fleet convention pair target="_blank" rel="noreferrer" (doc-link
  and PressButton both ship bare noreferrer; modern browsers imply
  noopener from it).

  The suffix-icon lane (2026-09-07, typography-context-and-parts §3):
  the tri-state `icon` prop is the input semantic-glyph law verbatim —
  the only shape expressing "no opinion" ≠ "off": undefined → the
  DEFAULT glyph shown IFF external (<Icon name="externalLink">, an
  inline-core name answering getIcon() synchronously — SSR paints it,
  hydration matches, no flash); null → the lane explicitly OFF (the
  属性开关); a snippet → custom content in the lane. Fleet precedents:
  +layout.svelte's ext() snippet, component-canvas (the doc-link ↗
  text glyph was a pre-pipeline demo shim). The lane is a
  data-jx-link-icon span INSIDE the anchor after the children,
  aria-hidden (decorative — the target/rel pair already carries the
  semantics), em-sized (0.8em rides any ambient scale, the
  no-font-size kinship). `data-jx-link` unchanged. registry: link
  gains the @jixoai/icon edge (the edge ownership rule: import the
  component, never the generated set).

  NO style props before W3-B (the heading/list precedent of
  components without a Defaults consumer) — explicit-props W3 batch
  B joins the eight-axis surface: LinkDefaults (link-defaults.
  svelte.ts) resolves the universal axes (all no-own), the anchor
  root stamps the §10 carriers, and the §11 broadcast supplies
  downward.

  Component-owned semantics land AFTER the spread (the separator
  law): href/title and the external-contract pair are the component's
  contract, not overridable through rest props.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import Icon from '../icon/icon.svelte';
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
  import { LinkDefaults } from './link-defaults.svelte';
  import { linkStyles } from './link.stylex';

  // the payload's own join (separator's serialize law): atoms are
  // objects in dev — composition goes through THIS joiner (all string
  // values except $$css, space-joined; plain strings pass through)
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

  interface Props extends Omit<HTMLAnchorAttributes, 'color'> {
    /** the link target; an absolute http(s) href makes the link external */
    href: string;
    /** advisory title, passthrough to the native attribute */
    title?: string;
    /** the external suffix-icon lane, tri-state: undefined → the
     *  default externalLink glyph shown IFF external; null → the lane
     *  OFF; a snippet → custom glyph content */
    icon?: Snippet | null;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the 0.8em glyph lane
     *  rescales with it) */
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
    /** the link label; omit for attribute-only anchors */
    children?: Snippet;
    class?: string;
  }

  let {
    href,
    title,
    icon,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    children,
    class: className = '',
    style: callerStyle,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (explicit-props W3-B):
  // the eight universal axes resolve in one record, all no-own
  const d = $derived(LinkDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLAnchorElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // the #4 composition: carriers first, the caller's own style LAST
  const rootStyle = $derived([carriers, callerStyle].filter(Boolean).join('; ') || undefined);

  // absolute http(s) opens externally; app routes keep same-tab default
  const external = $derived(/^https?:\/\//i.test(href));
</script>

<a
  bind:this={uniRoot}
  {...rest}
  href={href}
  title={title}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-jx-link={external ? 'external' : 'internal'}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  class={cn(cx(linkStyles.anchor), className)}
  style={rootStyle}
>
  <!-- the lane rides directly after the children with NO intervening
       text node (the label-row adjacency discipline): the lane's own
       atom gap owns the whole distance — a stray space would stack a
       font-dependent second gap on top of it -->
  {@render children?.()}{#if external && icon !== null}<span data-jx-link-icon aria-hidden="true" class={cx(linkStyles.iconLane)}>{#if icon}{@render icon()}{:else}<Icon name="externalLink" size="0.8em" />{/if}</span>{/if}
</a>
