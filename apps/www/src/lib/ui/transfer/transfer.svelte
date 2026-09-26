<!--
  jixoai transfer (registry/files/ui/transfer/transfer.svelte).
  The two-panel selector (antd's Transfer): options live SOURCE or
  TARGET; checkboxes pick, the middle buttons move. W3C-first — each
  panel is a real fieldset of real checkboxes (native multi-select
  semantics, native keyboard), and the mover is a plain button; the
  state machine is the only component-owned part:

    selection is per-panel and transient (cleared after a move)
    moves are batch (every checked row crosses together)
    search filters by label substring (case-insensitive), per panel
    titles are footers of truth: "source · n" / "target · n"

  value is $bindable (the TARGET value list); options stay static —
  moving never mutates them. disabled rows render but never move.

  tw4 (2026-08-24): panels/rows/movers static paint is token utilities
  in the markup (the disabled dim of rows and mover buttons rides
  conditional/disabled: utilities). Only the phones @container stacking
  law (container math utilities cannot express, and it overrides the
  root's own flex utilities — unlayered carve-out), the row/mover hover
  poses and the focus laws remain in transfer.css (D1-exempt residue
  under the layer law).
-->
<script lang="ts">
  import '$lib/form-field';
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
  import { TransferDefaults } from './transfer-defaults.svelte';
  import { transferStyles } from './transfer.stylex';
  import './transfer.css';

  export interface TransferOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: TransferOption[];
    /** values living on the TARGET side; bindable */
    value?: string[];
    /** form field name — the TARGET values submit as multi-entry
     *  FormData through the jx-form-field bridge (checkbox-set law) */
    name?: string;
    sourceTitle?: string;
    targetTitle?: string;
    /** search placeholder */
    searchPlaceholder?: string;
    onchange?: (value: string[]) => void;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (one number moves both
     *  panes) */
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
    options,
    value = $bindable<string[]>([]),
    name,
    sourceTitle = 'source',
    targetTitle = 'target',
    searchPlaceholder = 'filter…',
    onchange,
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

  // ── the eight-axis surface (W3-D3 — FIRST-TIME contract, all
  // no-own): the dual-list composite is a no-own container surface —
  // the two fieldsets, the search inputs and the mover chips are the
  // family's own parts riding the root's ambient chain (吃也供)
  const d = $derived(
    TransferDefaults.resolve({ density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(carriers || undefined);

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  let sourceSearch = $state('');
  let targetSearch = $state('');
  /** transient checkbox selections, per side */
  let pickedSource = $state<Set<string>>(new Set());
  let pickedTarget = $state<Set<string>>(new Set());

  const targetValues = $derived(new Set(value));
  const sourceTotal = $derived(options.length - value.length);
  const targetTotal = $derived(value.length);
  const sourceOptions = $derived(
    options.filter(
      (o) =>
        !targetValues.has(o.value) &&
        (sourceSearch === '' || o.label.toLowerCase().includes(sourceSearch.toLowerCase())),
    ),
  );
  const targetOptions = $derived(
    options.filter(
      (o) =>
        targetValues.has(o.value) &&
        (targetSearch === '' || o.label.toLowerCase().includes(targetSearch.toLowerCase())),
    ),
  );

  const movableSource = $derived([...pickedSource].filter((v) => !options.find((o) => o.value === v)?.disabled));
  const movableTarget = $derived([...pickedTarget].filter((v) => !options.find((o) => o.value === v)?.disabled));

  function toggle(set: Set<string>, v: string): void {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return void (set === pickedSource ? (pickedSource = next) : (pickedTarget = next));
  }

  function move(direction: 'to-target' | 'to-source'): void {
    const moving = direction === 'to-target' ? movableSource : movableTarget;
    if (moving.length === 0) return;
    const next =
      direction === 'to-target'
        ? [...value, ...moving]
        : value.filter((v) => !moving.includes(v));
    value = next;
    pickedSource = new Set();
    pickedTarget = new Set();
    onchange?.(next);
  }
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={value.join('\n')}
  multivalue={name ? true : undefined}
  onjx-reset={() => (value = [])}
></jx-form-field>

<div
  bind:this={uniRoot}
  class={cn('jx-transfer', cx(transferStyles.root), className)}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
>
  <!-- svelte-ignore a11y_autocomplete_valid -- search inputs over a
       checkbox fieldset, not a combobox -->
  <fieldset data-jx-tr-panel class={cx(transferStyles.panel)} aria-label="{sourceTitle} · {sourceTotal} total">
    <legend data-jx-tr-legend class={cx(transferStyles.legend)}
      >{sourceTitle} · {sourceOptions.length}/{sourceTotal} visible</legend
    >
    <input
      class="jx-tr-search {cx(transferStyles.search)}"
      type="search"
      aria-label="filter {sourceTitle}"
      placeholder={searchPlaceholder}
      bind:value={sourceSearch}
    />
    <ul data-jx-tr-list class={cx(transferStyles.list)} role="list">
      {#each sourceOptions as option (option.value)}
        <li>
          <label
            class={cn(
              'jx-tr-row',
              cx(transferStyles.row),
              option.disabled && cx('jx-tr-disabled', transferStyles.rowDisabled),
            )}
          >
            <input
              type="checkbox"
              checked={pickedSource.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedSource, option.value)}
            />
            <span data-jx-tr-label class={cx(transferStyles.rowLabel)}>{option.label}</span>
          </label>
        </li>
      {:else}
        <li data-jx-tr-empty class={cx(transferStyles.empty)}>no matches</li>
      {/each}
    </ul>
  </fieldset>

  <div class="jx-tr-movers {cx(transferStyles.movers)}">
    <button
      type="button"
      class="jx-tr-move {cx(transferStyles.move)}"
      aria-label="move selected to {targetTitle}"
      disabled={movableSource.length === 0}
      onclick={() => move('to-target')}
      >→</button
    >
    <button
      type="button"
      class="jx-tr-move {cx(transferStyles.move)}"
      aria-label="move selected to {sourceTitle}"
      disabled={movableTarget.length === 0}
      onclick={() => move('to-source')}
      >←</button
    >
  </div>

  <fieldset data-jx-tr-panel class={cx(transferStyles.panel)} aria-label="{targetTitle} · {targetTotal} total">
    <legend data-jx-tr-legend class={cx(transferStyles.legend)}
      >{targetTitle} · {targetOptions.length}/{targetTotal} visible</legend
    >
    <input
      class="jx-tr-search {cx(transferStyles.search)}"
      type="search"
      aria-label="filter {targetTitle}"
      placeholder={searchPlaceholder}
      bind:value={targetSearch}
    />
    <ul data-jx-tr-list class={cx(transferStyles.list)} role="list">
      {#each targetOptions as option (option.value)}
        <li>
          <label
            class={cn(
              'jx-tr-row',
              cx(transferStyles.row),
              option.disabled && cx('jx-tr-disabled', transferStyles.rowDisabled),
            )}
          >
            <input
              type="checkbox"
              checked={pickedTarget.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedTarget, option.value)}
            />
            <span data-jx-tr-label class={cx(transferStyles.rowLabel)}>{option.label}</span>
          </label>
        </li>
      {:else}
        <li data-jx-tr-empty class={cx(transferStyles.empty)}>nothing here yet</li>
      {/each}
    </ul>
  </fieldset>
</div>
