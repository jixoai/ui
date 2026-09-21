<!--
  jixoai steps — the ROOT half (registry/files/ui/steps/steps.svelte,
  composition-first-apis, 2026-08-25).
  The wizard progress as a composed family (shadcn-vue Stepper law):
  the root owns ONLY the shared state — `current`, 0-based, bindable —
  and hands it to the subtree through context (Symbol.for, so family
  files stay independent registry items):

    <Steps bind:current>
      <StepsItem step={0} onclick={() => go(0)}>   ← REQUIRED ordinal;
                                                       state = pure
                                                       comparison
        <StepsIndicator />                          ← number → ✓ when
                                                       done; THE button
                                                       when onclick+done
        <StepsTitle>connect</StepsTitle>
        <StepsDescription>link the repo</StepsDescription>
        <StepsSeparator />                          ← self-hides on the
                                                       last item (css)
      </StepsItem>
    </Steps>

  Ordinals are caller truth (the family context contract): state is a
  pure `step < / == / > current` comparison computed inside each Item,
  so duplicates paint every match current and gaps simply paint no
  current — nothing to corrupt, zero registration.
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface StepsApi {
    /** 0-based index of the current step — the one source of truth */
    readonly current: number;
  }

  /** context key — global symbol registry, independent registry items */
  export const STEPS_KEY = Symbol.for('jx-steps');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
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
  import { stepsStyles } from './steps.stylex';
  import './steps.css';
  import { StepsDefaults } from './steps-defaults.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLOListElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** 0-based ordinal of the current step; bindable (bind:current) */
    current?: number;
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
    class?: string;
    children: Snippet;
  }

  let {
    density,
    current = $bindable(0),
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style: consumerStyle,
    children,
    ...rest
  }: Props = $props();

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // THE DEFAULTS READ POINT (context-defaults-economy 3.3 + W3-D3):
  // one record — density resolves through the bridged axis slot
  // (explicit ?? ambient ?? 'auto'; no opinion stamps nothing, the
  // ambient css scope channel keeps flowing) and the seven sibling
  // axes ride the same record (the composite's parts ride the root's
  // supply chain; the size axis scales the ordered list's root)
  const d = $derived(
    StepsDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLOListElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );

  setContext<StepsApi>(STEPS_KEY, {
    get current() {
      return current;
    },
  });
</script>

<ol
  data-jx-steps=""
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  bind:this={uniRoot}
  class={cn(cx(stepsStyles.root), className)}
  {...rest}
  role="list"
>
  {@render children()}
</ol>
