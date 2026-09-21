<!--
  jixoai card (registry/files/ui/card/card.svelte).

  THE STRUCTURAL SURFACE (Owner, 2026-09-03): the dialog's row ruler
  cloned as a static surface — the zones, the stamped presence, the
  scroll law, and the content faces (<CardHeader> / <CardFooter>).
  What stayed with the modal: the <dialog> platform, the backdrop,
  the WAAPI motion, focus/top-layer, and the × close contract. The
  top-right inline-end-action-slot is an OPEN SNIPPET (`actions`)
  instead — the seat Dialog's × is designed to occupy when Dialog is
  refactored onto Card; here it is the consumer's own affordance.

  HONEST HEAD (the one deliberate divergence from dialog's structural
  head): dialog's head zone is unconditional because the × lives in
  it; a card with neither `title` nor a `head` snippet renders NO
  head zone and NO head separator — presence is resolved in the
  component and STAMPED (data-sep-head / data-sep-foot; css paints
  stamps only, never infers from descendants). The foot zone exists
  iff the `foot` snippet is passed — the r14-9 single-transport law:
  using it means owning everything the foot shows; the standard face
  is <CardFooter> (start slot / auto button group / raw end slot).

  ZONES vs CONTENT (the r14-9 clone): Card keeps the zones and the
  snippet transports; the content faces are composition. The ghost
  variant scopes over head and foot are zone defaults (Context, no
  DOM) — an explicit button variant always wins.

  THE INLINE RULER (Owner, 2026-09-03 r2: "jx-card-foot-start 这里
  如果要放文字，是要有 padding 的…buttons 在内部使用了 padding…
  升级成 grid+subgrid。请从设计师的角度出发"): the root owns FIVE
  named column tracks (card.css); the head/foot zones RENT them via
  subgrid — the same tenancy law the card obeys inside card-grid,
  applied to its own inline axis. Passive content ENTERS at the
  content lines (the 14px card inset arrives BY TRACK — the head
  title face and the foot text seats carry no inline utilities);
  interactive clusters (the actions slot, the footer ButtonGroup)
  SPAN the inset track to ride the card edge flush — dialog's
  footer buttons carry the rhythm internally (measured: 40px tall,
  padding 0 12px). The body zone stays full-bleed: its scroll ring
  owns the gutter-compensating inline formula verbatim (a dynamic
  scrollbar width is invisible to tracks). Block laws (Owner r3+r4):
  the head face py-2.5 (the title row's own band, ≈40px); the foot
  band belongs to its residents — text RIDES centered and never
  sizes the row (no padding-block on seats), while the cluster is
  a CARVED CELL that fills the band vertically (its buttons'
  min-h-[--jx-hit] economy is a floor, never a cap — a floating
  40px button in a taller band reads as a hole dug out, not a cell
  cut out). The head's action slot stays a CORNER (align-self:
  start, dialog's × verbatim) — only the foot carves.

  GRID TENANT (card-grid): the zones place by INTEGER cell lines
  (card.css), so the card qualifies as a card-grid child unchanged —
  default two-row mode equalizes head/body; `<CardGrid foot>` adds
  the third shared row for footed cards (feet align at band bottoms).
  In-grid cards should carry a head (a headless card leaves the
  shared head row to its siblings).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
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
  import { CardDefaults } from './card-defaults.svelte';
  import CardBody from './card-body.svelte';
  import CardHeader from './card-header.svelte';
  import { cardStyles } from './card.stylex';
  import './card.css';

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
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

  interface Props {
    /** Heading of the default head face; omit (with no head snippet)
        for a chrome-less body card — the head zone never renders. */
    title?: string;
    /** Replaces the visible head face, flush edge-to-edge — the
        snippet owns the row's geometry (typically wraps content in
        <CardHeader>). The actions slot still rides the head grid. */
    head?: Snippet;
    /** The inline-end action slot's content — the top-right seat
        (dialog's × position). Absent, the slot never renders; no
        close button ships with the card. */
    actions?: Snippet;
    /** The RAW full override of the foot zone (the r14-9 transport):
        using it means owning everything the foot shows — the standard
        face is <CardFooter>. */
    foot?: Snippet;
    /** The body zone's scroll authority (the card itself never
        scrolls). DEFAULT on: the zone is the ring with a stable
        both-edges gutter. Declare false to assert the body fits —
        the authority and the gutter reservation retire together. */
    scroll?: boolean;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size — an explicit lane
     *  makes the card the CONCENTRIC ANCHOR (the carrier stamps
     *  --jx-radius-effective; card.css supplies the ruler's inset as
     *  --jx-inset-effective; descendants at auto compute
     *  max(0px, R − P)); auto = the concentric consumption against
     *  the card's OWN ancestors */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() (the surface ladder rides the theme tokens) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** Root utilities appended AFTER the law's own. */
    class?: string;
    /** Card body. */
    children: Snippet;
  }

  let {
    title,
    head,
    actions,
    foot,
    scroll = true,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    children,
  }: Props = $props();

  // the family Defaults is the single read point (explicit-props W3-B):
  // the eight universal axes resolve in one record, all no-own — the
  // card is the §3 concentric anchor (supply) AND consumer (auto)
  const d = $derived(CardDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }));
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers; the root ITSELF is already the named
  // jx-card container — the @ query fuel)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);

  // ---- the §3/§14 radius consumption (the concentric anchor) -------
  // An EXPLICIT lane supplies --jx-radius-effective (the carriers) and
  // composes its own corner as radius-effective × the §14 factor; the
  // INSET supply stays the stylesheet's (card.css: the ruler's inline
  // inset track) — an explicit-radius card's DESCENDANTS still compute
  // the honest concentric max(0px, R − P) against both. `auto` (the
  // default) consumes the concentric broadcast of the card's own
  // ancestors — the §3 calc × the factor, the var() fallbacks
  // load-bearing (IACVT), falling to the root sheet's 0px invariants.
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  const rootStyle = $derived([carriers, radiusConsumed].filter(Boolean).join('; ') || undefined);

  // Presence resolution (the stamped-attribute painting law)
  const hasHead = $derived(head !== undefined || title !== undefined);
  const hasFoot = $derived(foot !== undefined);
</script>

<section
  bind:this={uniRoot}
  data-jx-card
  data-sep-head={hasHead ? '' : undefined}
  data-sep-foot={hasFoot ? '' : undefined}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  class="{cx(cardStyles.root)} {className}"
  style={rootStyle}
>
  {#if hasHead}
    <!-- the head zone RENTS the root's inline ruler (subgrid columns,
         card.css): the content face enters at the content lines, the
         actions slot spans the end inset to hug the top-right corner
         flush. The ghost scope is the zone's button default -->
    <div data-jx-card-head>
      <ButtonVariantScope variant="ghost">
        {#if head}
          {@render head()}
        {:else}
          <CardHeader {title} />
        {/if}
        {#if actions}
          <div class="jx-card-end-action-slot">
            {@render actions()}
          </div>
        {/if}
      </ButtonVariantScope>
    </div>
    <!-- the dividing lines are Separator INSTANCES edge-riding their
         zone rows (card.css), spanning edge-to-edge; decorative
         chrome, hidden from AT -->
    <Separator data-jx-card-sep="head" aria-hidden="true" />
  {/if}
  <!-- the body band is the family part (card-body.svelte,
       card-surface-kernel): one scroll law, one gutter-compensation
       formula, shared with every ruler carrier -->
  <CardBody {scroll}>
    {@render children()}
  </CardBody>
  {#if hasFoot}
    <Separator data-jx-card-sep="foot" aria-hidden="true" />
    <!-- THE RAW FOOT ZONE: the foot snippet overrides everything —
         no grouping from Card. The standard face is <CardFooter>;
         the ghost scope stays the zone's default, and the foot rides
         the FLAT texture (Owner 2026-09-04): raised=false scopes the
         physics default — foot buttons press as engrave-tier insets,
         an explicit raised still wins. The zone RENTS the
         root's inline ruler (subgrid columns, card.css) — the seats
         inside place against the rented lines. The jx-card reversal
         container lives on the ROOT (card.css), never on the zone:
         a tenant never carries container-type (the measured law) -->
    <div data-jx-card-foot>
      <ButtonVariantScope variant="ghost" raised={false}>
        {@render foot()}
      </ButtonVariantScope>
    </div>
  {/if}
</section>
