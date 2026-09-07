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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLBlockquoteAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import {
    BlockquoteDefaults,
    type BlockquoteRule,
    type BlockquoteRuleSize,
    type BlockquoteVariant,
  } from './blockquote-defaults.svelte';

  interface Props extends HTMLBlockquoteAttributes {
    /** ladder prominence: outline (plain quote) | tonal (tinted
     *  admonition); omitted → the ambient paint zone, else the frozen
     *  own 'outline' */
    variant?: BlockquoteVariant;
    /** the rule's ink channel: shadow paints over geometry (own) |
     *  border consumes it — a LITERAL axis, never zone-ambient */
    rule?: BlockquoteRule;
    /** the rule's literal px ladder (1/4/8, own 1 — the Owner's
     *  explicit enumeration, not a derived scale) */
    ruleSize?: BlockquoteRuleSize;
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
    label,
    icon,
    cite,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): variant rides the paint axis slot (zone ambient,
  // frozen own 'outline'); rule/ruleSize are LITERAL slots the zone
  // never moves; density is the no-opinion slot — nothing stamps, the
  // ambient css scope channel keeps flowing
  const d = $derived(BlockquoteDefaults.resolve({ variant, rule, ruleSize }));

  // variant grounds (design §1.1 recipes, verbatim), restructured for
  // the rule channel: the rung's own border-color declaration stays
  // the SINGLE color source. Tonal keeps its full alert box border as
  // ground; outline's ground carries NO border at all — its rule (and
  // its border-color declaration) lives on the rule channel below, so
  // in shadow mode no dead border-color declaration ships. ps stays
  // fixed across rungs' rule channels and sizes (border consumes
  // geometry, shadow doesn't).
  const ground = {
    outline: 'ps-[0.875rem]',
    tonal: 'border bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] rounded px-3.5 py-3 forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
  } as const;
  // the rule channel — probed utilities (TW 4.2.1): the shadow
  // payload rides the rung's SAME color source (outline → --jx-outline;
  // tonal → the 45% color-mix — one hue source). ONE shadow utility per
  // root; outline in shadow mode emits NO border (never border+shadow
  // on one edge); tonal keeps its box border PLUS the shadow rule (the
  // documented shadow-1 near-no-op). Forced colors: shadow modes
  // re-materialize as Npx CanvasText (tonal's box already carries the
  // CanvasText color); border modes keep the rung degradation.
  const ruleSurface = {
    shadow: {
      1: {
        outline:
          'shadow-[inset_1px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:shadow-none forced-colors:border-s forced-colors:border-[CanvasText]',
        tonal:
          'shadow-[inset_1px_0_0_color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] forced-colors:shadow-none forced-colors:border-s',
      },
      4: {
        outline:
          'shadow-[inset_4px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:shadow-none forced-colors:border-s-[4px] forced-colors:border-[CanvasText]',
        tonal:
          'shadow-[inset_4px_0_0_color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] forced-colors:shadow-none forced-colors:border-s-[4px]',
      },
      8: {
        outline:
          'shadow-[inset_8px_0_0_color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:shadow-none forced-colors:border-s-[8px] forced-colors:border-[CanvasText]',
        tonal:
          'shadow-[inset_8px_0_0_color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] forced-colors:shadow-none forced-colors:border-s-[8px]',
      },
    },
    border: {
      1: {
        outline:
          'border-s [border-color:color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:border-[CanvasText]',
        tonal: 'border-s',
      },
      4: {
        outline:
          'border-s-4 [border-color:color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:border-[CanvasText]',
        tonal: 'border-s-4',
      },
      8: {
        outline:
          'border-s-8 [border-color:color-mix(in_oklab,var(--jx-outline)_55%,transparent)] forced-colors:border-[CanvasText]',
        tonal: 'border-s-8',
      },
    },
  } as const;
  // the label consumes the variant ink; the BODY consumes the rung's
  // own ramp — outline keeps the face's muted quote body (the
  // manuscript posture), tonal tints both like the alert rows
  const titleColor = {
    outline: 'text-foreground forced-colors:text-[CanvasText]',
    tonal: '[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const bodyColor = {
    outline: 'text-muted-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
</script>

<blockquote
  class={cn(
    'box-border flex flex-col justify-center text-[0.875em]',
    ground[d.variant],
    ruleSurface[d.rule][d.ruleSize][d.variant],
    bodyColor[d.variant],
    className,
  )}
  data-jx-blockquote={d.variant}
  data-jx-blockquote-rule={`${d.rule}-${d.ruleSize}`}
  {...rest}
>
  {#if label}
    <p
      data-jx-blockquote-label=""
      class={cn('flex items-center gap-2 font-nav text-[0.8125rem] tracking-[0.08em] uppercase', titleColor[d.variant])}
    >{#if icon}<span class="inline-flex">{@render icon()}</span>{/if}{label}</p>
  {/if}
  {@render children?.()}
  {#if cite}
    <footer data-jx-blockquote-cite="" class="text-[0.8125rem] text-muted-foreground">
      <cite class="italic">{cite}</cite>
    </footer>
  {/if}
</blockquote>
