<!--
  jixoai pattern-pricing (registry/files/ui/pattern-pricing/
  pattern-pricing.svelte, 2026-08-30, openspec 2026-08-30-terminal-patterns).
  The `$ plan --compare` pricing section — a composition product: the
  matrix rides the Table family (consumer authors thead/tbody in the
  children snippet — same contract as the bare Table), each tier's
  install command rides a CodeCard, the plan labels ride Badge, and
  the copy action rides PressButton. The recommended tier is a paint
  LAW, not a prop fork: consumer cells opt the column in with
  data-jx-recommended on the th AND its td's (pattern css paints the
  brand rules + tinted head inside @layer components — hover law
  intact), and the recommended CARD takes the border-primary rung in
  markup.

  Composition-only laws (terminal-patterns delta): no atom prop is
  patched, no atom paint re-implemented; commands/labels are
  value-domain payload (code strings), the matrix rows stay authored
  content.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '$lib/ui/icon';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Table from '$lib/ui/table/table.svelte';
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
  import { PatternPricingDefaults } from './pattern-pricing-defaults.svelte';
  import { patternPricingStyles } from './pattern-pricing.stylex';
  import './pattern-pricing.css';

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

  /** one tier's install strip — commands are payload, cards are paint */
  export interface PricingTier {
    /** the plan label (badge + aria name of the copy control) */
    plan: string;
    /** the copyable install command (the card's code payload) */
    command: string;
    /** brand-hue paint on the tier card; pair with the table column opt-in */
    recommended?: boolean;
    /** muted qualifier under the plan label (e.g. 'per seat / month') */
    note?: string;
  }

  interface Props {
    /** the section's mono eyebrow line */
    eyebrow?: string;
    /** the Table caption (the matrix's visible title) */
    caption?: string;
    /** per-tier install cards; commands are copy payload */
    tiers: readonly PricingTier[];
    /** the comparison matrix: author thead/tbody here (Table contract);
     *  recommended cells opt in with data-jx-recommended */
    children: Snippet;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the composed Table/Badge/
     *  CodeCard surfaces ride the ambient chain — the composition
     *  law) */
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
  }

  let {
    eyebrow = '$ plan --compare',
    caption = 'plans — feature matrix',
    tiers,
    children,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // ── the eight-axis surface (W3-D2 — FIRST-TIME contract, all
  // no-own: a composition product; the size axis scales the section
  // root, the Table/Badge/CodeCard axis surfaces ride the ambient
  // chain — the whole point of 吃也供)
  const d = $derived(
    PatternPricingDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

  /** the plan whose command was just copied ('' = none) */
  let copiedPlan = $state('');
  let copyTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyTierCommand(tier: PricingTier): Promise<void> {
    try {
      await navigator.clipboard.writeText(tier.command);
    } catch {
      // preview servers / embedded contexts without a clipboard grant
      const area = document.createElement('textarea');
      area.value = tier.command;
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    copiedPlan = tier.plan;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copiedPlan = ''), 1400);
  }
</script>

<section
  data-jx-pattern-pricing=""
  bind:this={uniRoot}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  class={cx('jx-pattern-pricing', patternPricingStyles.root, className)}
>
  <p class={cx(patternPricingStyles.eyebrow)}>{eyebrow}</p>

  <div class={cx(patternPricingStyles.tableBand)}>
    <Table {caption}>
      {@render children()}
    </Table>
  </div>

  <div class={cx(patternPricingStyles.tiers)}>
    {#each tiers as tier (tier.plan)}
      <div
        data-jx-pattern-pricing-tier={tier.recommended ? 'recommended' : 'standard'}
        class={cx(
          patternPricingStyles.tier,
          tier.recommended ? patternPricingStyles.tierRecommended : patternPricingStyles.tierStandard,
        )}
      >
        <div class={cx(patternPricingStyles.tierHead)}>
          <Badge variant={tier.recommended ? 'fill' : 'outline'}>{tier.plan}</Badge>
          {#if tier.note}
            <span class={cx(patternPricingStyles.tierNote)}>{tier.note}</span>
          {/if}
        </div>
        <CodeCard lang="bash" code={tier.command} copyable={false} class={cx(patternPricingStyles.minZero)}>
          {#snippet footer()}
            <PressButton
              variant={tier.recommended ? 'fill' : 'ghost'}
              onclick={() => copyTierCommand(tier)}
              ariaLabel={`${copiedPlan === tier.plan ? 'copied' : 'copy'} ${tier.command}`}
            >
              {#if copiedPlan === tier.plan}
                <span class={cx(patternPricingStyles.inlineIcon)}><Icon name="check" size={14} strokeWidth={2.5} /></span>
                <span>copied</span>
              {:else}
                <span class={cx(patternPricingStyles.inlineIcon)}><Icon name="copy" size={14} /></span>
                <span>copy add command</span>
              {/if}
            </PressButton>
          {/snippet}
        </CodeCard>
      </div>
    {/each}
  </div>
</section>
