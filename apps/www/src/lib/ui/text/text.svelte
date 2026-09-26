<!--
  jixoai text (registry/files/ui/text/text.svelte).
  <Text> renders <p> by default — the Chakra <Text>-is-a-paragraph
  precedent (2026-09-07, markdown-coverage change §1.5): the reading-
  content family the Owner designed. `mark` switches the element AND
  the paint; ONE vocabulary — the prop value, the sugar name, and the
  HTML element are the same word (mark="strong" ≡ <Strong> ≡
  <strong>).

  FACE-COMPOSING (design §2): no member escapes no-jx-pure. An inline
  escape descopes its whole subtree's face rules (the
  :not(.no-jx-pure *) arm), and emphasis legitimately nests — code
  chips inside strong, marks inside marks, links inside em. These
  components are semantic hooks + extension points over the face's
  own channels, not face replacements.

  Two members DELIBERATELY override face channels (design §1.5 —
  RECORDED settles, not accidents):
    strong  font-semibold (600) overrides the face B1 strong → 700 —
            the GitHub/Tailwind Typography emphasis weight
    mark    owns its highlight ground (a low-alpha primary tint, not
            the face's secondary-over-background mix) AND its
            0.05em/0.25em padding box — mirroring the face's mark box
            so standalone and in-face renderings agree
  All other members are additive on channels the face does not
  declare for their elements; sub/sup take NOTHING (the UA baseline
  shift is the law).

  NO font-size utilities anywhere (the ambient scale law): the family
  flows by inheritance — the typography trio's line-height
  un-short-circuit law keeps working because P never escapes the
  face. AMENDED (2026-09-08, the modifier kernel): absent = the
  inheritance flows untouched; an EXPLICIT modifier prop emits its
  utility — explicit beats ambient — and an explicit member lineHeight
  (a utilities-layer leading-[…] class) beats the prose scope's
  leading residue (the layer law's own posture, written down for the
  family). The six modifier props ride the SHARED kernel
  (lib/text-style.svelte.ts — Text and inline-code share the kernel,
  independent components, the Owner's ruling).

  The eight Raw sugars (p/strong/em/del/mark/ins/sub/sup) are
  re-exported from this file's module script — `import Text,
  { Strong } from './text.svelte'` works — and ride the barrel through
  `export *` (the learning-cost ruling: one vocabulary, two ergonomic
  forms, zero behavioral difference).
-->
<script module lang="ts">
  export { default as P } from './p.svelte';
  export { default as Strong } from './strong.svelte';
  export { default as Em } from './em.svelte';
  export { default as Del } from './del.svelte';
  export { default as Mark } from './mark.svelte';
  export { default as Ins } from './ins.svelte';
  export { default as Sub } from './sub.svelte';
  export { default as Sup } from './sup.svelte';
</script>
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { resolveTextStyle, type TextStyleProps } from '$lib/text-style.svelte';
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
  import { TextDefaults, type TextMark } from './text-defaults.svelte';
  import { textStyles } from './text.stylex';

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

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'color'>, TextStyleProps {
    /** the element vocabulary — prop value = sugar name = HTML
     *  element; omitted → the literal slot's frozen own 'p' */
    mark?: TextMark;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the modifier kernel's
     *  fontSize prop is a different, non-colliding name) */
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

  let {
    mark,
    style: callerStyle,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    lineHeight,
    weight,
    italic,
    tracking,
    family,
    fontSize,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (the kbd resolution
  // path): explicit ?? frozen own 'p' — a literal slot never reads
  // context, an element choice is never zone-ambient — W3-B: the
  // eight universal axes ride the same record
  const d = $derived(TextDefaults.resolve({ mark, density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // the #4 composition: carriers first, the caller's own style LAST
  const rootStyle = $derived([carriers, callerStyle].filter(Boolean).join('; ') || undefined);

  // the form map (design §1.5, verbatim) — element + own ATOM group
  // per mark (tailwindless W1b: the utility strings became the
  // family's stylex atoms, text.stylex.ts); undefined means the
  // member owns nothing on any channel (the semantic element alone IS
  // the form) — cn() flattens the undefined away
  const forms = {
    p: { element: 'p', atoms: undefined },
    strong: { element: 'strong', atoms: textStyles.strong },
    em: { element: 'em', atoms: textStyles.em },
    del: { element: 'del', atoms: textStyles.del },
    mark: { element: 'mark', atoms: textStyles.mark },
    ins: { element: 'ins', atoms: textStyles.ins },
    sub: { element: 'sub', atoms: undefined },
    sup: { element: 'sup', atoms: undefined },
  } as const;
</script>

<!-- the merge order: the form's own atoms, then the modifier
  kernel's utility classes, then the consumer class LAST — a modifier
  lands AFTER its form and rides the utilities LAYER (font-bold beats
  strong's own 600 by layer order), the consumer beats both (a
  not-italic utility still wins); absent modifiers contribute NOTHING
  (the absent-ambient law) -->
<svelte:element
  this={forms[d.mark].element}
  bind:this={uniRoot}
  {...rest}
  data-jx-text={d.mark}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cn(
    cx(forms[d.mark].atoms),
    resolveTextStyle({ lineHeight, weight, italic, tracking, family, fontSize }),
    className,
  )}
>
  {@render children?.()}
</svelte:element>
