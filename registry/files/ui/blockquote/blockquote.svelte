<!--
  jixoai blockquote (registry/files/ui/blockquote/blockquote.svelte,
  markdown-coverage-components §1.1). The quote/admonition surface: the
  semantic body IS the native <blockquote>; `cite` never swaps the root
  — it renders the MDN attribution posture (footer > cite) after the
  body. One surface, two postures, both on the alert-shaped two-rung
  ladder:
    outline (own)  transparent ground, 1px left rule, muted body — the
                   classic GitHub/Tailwind quote, visually continuous
                   with the jx-pure face's own blockquote rule it
                   replaces
    tonal          the alert tonal recipe VERBATIM (12% tinted ground,
                   45% border, rounded px-3.5 py-3, title/body in
                   --jx-tonal) — the callout/Notion posture; hue rides
                   injection through the jx-hue-* class utilities, and
                   the markdown map's GitHub-alert detection lands here
                   as tonal + label + hue.

  Availability is FROZEN at two rungs because a quote's readability
  excludes fill AND ghost: fill buries long-form copy under saturated
  ground; ghost is INTERACTIVE-CHROME vocabulary (rest-transparent,
  hover-tonal, border geometry preserved) which a static quote misuses
  — nothing about a quote responds to hover. The borderless manuscript
  indent is a FUTURE STRUCTURAL AXIS, never a paint rung (the ladder
  stays paint-pure; availability joins the frozen table via the
  frozen-availability amendment chain).

  Composition mirrors alert: `label` renders the alert title-row form
  (a fixed 0.8125rem chrome row — the one font-size the surface
  carries), `icon` lands inline-start of it (bring your own glyph —
  lucide, svg, text), children is the body. The root stamps NO
  font-size: the ambient scale flows by inheritance (the typography
  trio law) — a quote is body copy, not chrome, and the p
  un-short-circuit law keeps working because P never escapes the face.
  The cite footer is chrome ink (muted, the label's 0.8125rem) in both
  rungs — attribution metadata, not body flow. Children render as
  DIRECT children of the root (no wrapper div): the markdown sheet's
  container-inner sibling stack law operates on `blockquote > * + *`,
  and the element-based rhythm/flush selectors keep matching because
  the root IS the native element. The root carries NO margins and NO
  flex gap (the figure posture — the container rhythm owns spacing in
  the markdown scope; standalone consumers compose spacing through
  their own containers).

  Escape law (§2.1): the markdown map mounts this root with
  no-jx-pure — a box-owning block surface escapes so the face's
  element rules stop double-painting it; the sheet compensates for
  what the escape descopes.

  Per-rung forced-colors degradations follow alert exactly: the
  color-mix tints do not drop on their own under forced colors —
  Canvas ground + CanvasText ink, the rule surviving on outline.

  The RULE channel (2026-09-07, typography-context-and-parts §2; the
  Owner's R3 browser-review rulings 2026-09-08): `rule` (shadow|border,
  own shadow) × `ruleSize` (1|4|8, own 4 — the Owner ruled the 1px
  hairline "只适合 xs2 尺寸", the default is the 4px manuscript bar)
  — the quote's inked left rule, drawn at a LIGHTENED 55% mix of the
  outline token (the R3 "muted 太深" ruling; full-strength reads as a
  second ink weight). The inset standard is the Owner's cited
  precedent: command-item's shadow-[inset_2px_0_0_var(--primary)]
  (command-item.svelte:103), the elevation grammar's WELL tier
  (entity.svelte.ts — inset shadow for depth), kbd's --shadow-engrave
  lineage (jx-pure.css:938). The 1/4/8 literal px ladder is the
  Owner's explicit enumeration, recorded as the ruling over a derived
  scale. The rule color rides the RUNG's own border-color source —
  the single hue source (jx-hue-* retunes ground + box + rule
  together; a 100% accent bar is a second ink weight on one edge,
  rejected). Sole-source law: ONE shadow utility per root (@property
  --tw-shadow composition), and outline never mixes border + shadow
  on the same edge — in shadow mode outline emits NO border at all
  (the shadow carries the rule); tonal KEEPS its box border PLUS the
  shadow rule, so tonal+shadow-1 is a deliberate near-no-op (axis
  uniformity over special-casing — the F8 ruling, stated in spec +
  docs). ps honesty: the paddings stay FIXED across channels and
  sizes (border consumes geometry, shadow doesn't — paint never moves
  geometry, ruling B3 honest). Forced colors: shadow modes
  re-materialize as an Npx CanvasText border (forced-colors:
  shadow-none + width + color — the entity law's "edge is structure"
  generalized); border modes keep the rung's existing degradation.
  BLAST RADIUS: the default flip changes EVERY quote (standalone AND
  markdown) — the Owner's browser review on dev AND production
  builds is the change-exit criterion (B9).

  The BODY rides 0.875em of the ambient scale (the Owner's R3 "字体
  要变小" ruling — the ONE font-size exception to the no-font-size
  law this header used to carry; em-based so the typography trio and
  any prose scope still rescale the quote proportionally, and the
  label/cite chrome rows keep their fixed 0.8125rem).

  The root is a CENTERED flex column (the Owner's 2026-09-08 ruling:
  外部可能强行改变高度 — a stretched root centers its content
  vertically). At auto height flex-column ≡ block flow pixel-for-
  pixel; a flex container IS a BFC, so the markdown rhythm's margin-
  containment intent (its flow-root rule) survives unchanged, and
  the utilities-layer flex deterministically outranks that
  components-layer rule — the §2c container-inner sibling stack
  (margins between flex items, never collapsed) keeps the inner
  spacing law intact.

  tailwindless one-shot Wave 1 (2026-09-17): ground/ink/chrome ride
  blockquote.stylex.ts atoms (joined through the payload's own cx());
  the em-ratio body voice and the rule channel ride blockquote.css
  keyed on the data contract (data-jx-blockquote ×
  data-jx-blockquote-rule) — the class channel carries paint, the
  data channel carries the rule.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLBlockquoteAttributes } from 'svelte/elements';
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
  import {
    BlockquoteDefaults,
    type BlockquoteRule,
    type BlockquoteRuleSize,
    type BlockquoteVariant,
  } from './blockquote-defaults.svelte';
  import { blockquoteStyles } from './blockquote.stylex';
  import './blockquote.css';

  interface Props extends Omit<HTMLBlockquoteAttributes, 'color'> {
    /** ladder prominence: outline (plain quote) | tonal (tinted
     *  admonition); omitted → the ambient paint zone, else the frozen
     *  own 'outline' */
    variant?: BlockquoteVariant;
    /** the rule's ink channel: shadow paints over geometry (own) |
     *  border consumes it — a LITERAL axis, never zone-ambient */
    rule?: BlockquoteRule;
    /** the rule's literal px ladder (1/4/8, own 1 — the Owner's
     *  explicit enumeration, not a derived scale); KEPT per §13 */
    ruleSize?: BlockquoteRuleSize;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the 0.875em body voice
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
    /** one-line uppercase heading in the alert title-row form; omitted
     *  renders a bare body block */
    label?: string;
    /** icon snippet, rendered inline-start of the label */
    icon?: Snippet;
    /** attribution, rendered as <footer><cite> after the body (the
     *  MDN posture) — NOT the native cite attribute */
    cite?: string;
    /** body copy; the ambient font-size flows by inheritance */
    children?: Snippet;
    class?: string;
  }

  let {
    variant,
    rule,
    ruleSize,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    label,
    icon,
    cite,
    children,
    class: className = '',
    style: callerStyle,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): variant rides the paint axis slot (zone ambient,
  // frozen own 'outline'); rule/ruleSize are LITERAL slots the zone
  // never moves — W3-B: the eight universal axes ride the same record
  const d = $derived(BlockquoteDefaults.resolve({ variant, rule, ruleSize, density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLQuoteElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  // the #4 composition: carriers first, the caller's own style LAST
  const rootStyle = $derived([carriers, callerStyle].filter(Boolean).join('; ') || undefined);

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
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

  // variant grounds (design §1.1 recipes, verbatim), restructured for
  // the rule channel: the rung's own border-color declaration stays
  // the SINGLE color source. Tonal keeps its full alert box border as
  // ground; outline's ground carries NO border at all — its rule (and
  // its border-color declaration) lives on the RULE CHANNEL: the
  // border modes ride atoms here (the layer law — stylex nests under
  // components, so atom border widths keep their cascade slot against
  // the tonal ground's own border atom), the shadow modes ride
  // blockquote.css keyed on data-jx-blockquote-rule. ps stays fixed
  // across rungs' rule channels and sizes (border consumes geometry,
  // shadow doesn't).
  const GROUND = {
    outline: cx(blockquoteStyles.outlineGround),
    tonal: cx(blockquoteStyles.tonalGround),
  } as const;
  // the rule channel's border modes: the widened start edge + the
  // rung's own ink (outline tints 55%; tonal keeps its ground color)
  const RULE_SURFACE = {
    border: {
      1: {
        outline: cx(blockquoteStyles.ruleBorder1, blockquoteStyles.ruleBorderOutlineTint),
        tonal: cx(blockquoteStyles.ruleBorder1),
      },
      4: {
        outline: cx(blockquoteStyles.ruleBorder4, blockquoteStyles.ruleBorderOutlineTint),
        tonal: cx(blockquoteStyles.ruleBorder4),
      },
      8: {
        outline: cx(blockquoteStyles.ruleBorder8, blockquoteStyles.ruleBorderOutlineTint),
        tonal: cx(blockquoteStyles.ruleBorder8),
      },
    },
    // shadow modes paint nothing through the class channel — the css
    // sheet keys them on data-jx-blockquote-rule (empty strings are
    // dropped by cx's filter)
    shadow: {
      1: { outline: '', tonal: '' },
      4: { outline: '', tonal: '' },
      8: { outline: '', tonal: '' },
    },
  } as const;
  // the label consumes the variant ink; the BODY consumes the rung's
  // own ramp — outline keeps the face's muted quote body (the
  // manuscript posture), tonal tints both like the alert rows
  const TITLE_COLOR = {
    outline: cx(blockquoteStyles.titleOutline),
    tonal: cx(blockquoteStyles.titleTonal),
  } as const;
  const BODY_COLOR = {
    outline: cx(blockquoteStyles.bodyOutline),
    tonal: cx(blockquoteStyles.bodyTonal),
  } as const;
</script>

<blockquote
  bind:this={uniRoot}
  class={cn(
    cx(
      blockquoteStyles.root,
      GROUND[d.variant],
      RULE_SURFACE[d.rule][d.ruleSize][d.variant],
      BODY_COLOR[d.variant],
    ),
    className,
  )}
  data-jx-blockquote={d.variant}
  data-jx-blockquote-rule={`${d.rule}-${d.ruleSize}`}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  {...rest}
>
  {#if label}
    <p
      data-jx-blockquote-label=""
      class={cx(blockquoteStyles.labelRow, TITLE_COLOR[d.variant])}
    >{#if icon}<span class={cx(blockquoteStyles.iconSpan)}>{@render icon()}</span>{/if}{label}</p>
  {/if}
  {@render children?.()}
  {#if cite}
    <footer data-jx-blockquote-cite="" class={cx(blockquoteStyles.citeRow)}>
      <cite class={cx(blockquoteStyles.citeItalic)}>{cite}</cite>
    </footer>
  {/if}
</blockquote>
