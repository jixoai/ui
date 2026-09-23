<!--
  jixoai cascader (registry/files/ui/cascader/cascader.svelte).
  The cascade selector, chain-of-selects route (the batch-2 ruling's
  default): N plain <select> elements, each listing the children of the
  previous pick. W3C-first — native option semantics, native keyboard,
  native mobile pickers, zero panels to position. The joined PATH is
  the value, submitted through the jx-form-field bridge (a path is not
  a single native control's value). The antd multi-column search panel
  is the documented upgrade route, not the default.

    options=[{value:'asia',label:'Asia',children:[…]}]  →
    [Asia ▾][Japan ▾]  value = 'asia/japan' (separator '/')

  A partial path submits '' (never a half lie — the same law as
  input-otp). disabled blocks the whole chain after it.

  tw4 (2026-08-24) → tailwindless W1b (2026-09-17): pure utility
  migration for the static paint (group, label, chain, select shells —
  the disabled dim rides the select atom's :disabled pose); only the
  :focus outline law remains in cascader.css (D1-exempt residue under
  the layer law).
-->
<script lang="ts">
  import '$lib/form-field';
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
  import { cn } from '$lib/utils';
  import { cascaderStyles } from './cascader.stylex';
  import { CascaderDefaults } from './cascader-defaults.svelte';
  import './cascader.css';

  export interface CascaderOption {
    value: string;
    label: string;
    disabled?: boolean;
    children?: CascaderOption[];
  }

  interface Props {
    /** density policy: explicit, inherited, then default — the
     *  universal §4 lane (named rungs + the documented small/medium/
     *  large aliases · auto · a coefficient number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query(). CONSUMED by the family (the
     *  native element NEVER receives a size attribute from it — the §1
     *  native collision rule; everything the family does not own still
     *  rides {...rest}) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system —
     *  semantic names · hue degrees · raw values · query(). CONSUMED by
     *  the family (the native attribute never receives it, §1) */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp · query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive · a
     *  coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    options: CascaderOption[];
    /** form field name — the joined path submits under it */
    name?: string;
    /** the selected path; bindable (bind:value) — ['asia','japan'] */
    value?: string[];
    /** path join for the submitted string (default '/') */
    separator?: string;
    disabled?: boolean;
    /** reads above the chain */
    label?: string;
    /** placeholder for the first select */
    placeholder?: string;
    class?: string;
  }

  const autoId = $props.id();
  /** form/fieldset disable propagation (the bridge's jx-disabled) */
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  let {
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    options,
    name,
    value = $bindable<string[]>([]),
    separator = '/',
    disabled = false,
    label,
    placeholder = 'select…',
    class: className = '',
  }: Props = $props();

  const d = $derived(
    CascaderDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp (inline style vars, static per render) + the
  // broadcast supply + the query() anchor (the root's ANCESTORS are
  // the candidate containers)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);

  /** the chain of option lists: level 0 = options, level i = children of
   * the level i-1 pick (stops at the first leaf-less pick) */
  const levels = $derived.by(() => {
    const lists: CascaderOption[][] = [options];
    for (const picked of value) {
      const current = lists.at(-1) ?? [];
      const match = current.find((o) => o.value === picked);
      if (!match?.children?.length) break;
      lists.push(match.children);
    }
    return lists;
  });

  /** a complete path = every level picked AND the last pick is a leaf */
  const complete = $derived.by(() => {
    if (value.length === 0 || value.length !== levels.length - 1 + 1) return false;
    const last = levels[value.length - 1]?.find((o) => o.value === value.at(-1));
    return !last?.children?.length;
  });

  const formValue = $derived(complete ? value.join(separator) : '');

  function pick(level: number, next: string): void {
    // picking at level N truncates anything deeper, then appends
    value = [...value.slice(0, level), next];
  }

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={formValue}
  disabled={isDisabled || undefined}
  onjx-disabled={(e: CustomEvent<boolean>) => (formDisabled = e.detail)}
  onjx-reset={() => (value = [])}
></jx-form-field>

<div
  bind:this={uniRoot}
  data-jx-cascader
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={carriers || undefined}
  class={cn(cx(cascaderStyles.group), className)}
  role="group"
  aria-label={label ?? 'cascade'}>
  {#if label}
    <span data-jx-cascader-label class={cx(cascaderStyles.label)} id="{autoId}-label">{label}</span>
  {/if}
  <div data-jx-cascader-chain class={cx(cascaderStyles.chain)} aria-labelledby={label ? `${autoId}-label` : undefined}>
    {#each levels as levelOptions, level (level)}
      <select
        class={cn('jx-cascader-select', cx(cascaderStyles.select))}
        disabled={isDisabled}
        aria-label="level {level + 1}"
        value={value[level] ?? ''}
        onchange={(e) => pick(level, (e.currentTarget as HTMLSelectElement).value)}
      >
        {#if value[level] === undefined}
          <option value="" disabled>{placeholder}</option>
        {/if}
        {#each levelOptions as option (option.value)}
          <option value={option.value} disabled={option.disabled}>{option.label}</option>
        {/each}
      </select>
    {/each}
  </div>
</div>
