<!--
  jixoai transfer (registry/files/ui/transfer.svelte).
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
    class: className = '',
  }: Props = $props();

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

<div class={cn('jx-transfer flex items-center gap-3', className)}>
  <!-- svelte-ignore a11y_autocomplete_valid -- search inputs over a
       checkbox fieldset, not a combobox -->
  <fieldset data-jx-tr-panel class="flex-[1_1_0%] min-w-0 m-0 p-0 border border-border bg-card shadow-2xs rounded-(--radius)" aria-label="{sourceTitle} · {sourceTotal} total">
    <legend data-jx-tr-legend class="px-[0.625rem] py-[0.4375rem] font-nav text-[0.6875rem] tracking-[0.12em] uppercase text-muted-foreground"
      >{sourceTitle} · {sourceOptions.length}/{sourceTotal} visible</legend
    >
    <input
      class="jx-tr-search box-border w-full px-[0.625rem] py-[0.4375rem] border-x-0 border-y border-border bg-background text-foreground font-mono text-xs"
      type="search"
      aria-label="filter {sourceTitle}"
      placeholder={searchPlaceholder}
      bind:value={sourceSearch}
    />
    <ul data-jx-tr-list class="m-0 py-1 px-[max(0.25rem_-_var(--jx-scrollbar-thin,0px),0px)] list-none max-h-56 overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges]" role="list">
      {#each sourceOptions as option (option.value)}
        <li>
          <label
            class={cn(
              'jx-tr-row flex items-center gap-2 px-[0.375rem] py-[0.3125rem] text-[0.8125rem] text-foreground cursor-pointer',
              option.disabled && 'jx-tr-disabled opacity-45 cursor-not-allowed',
            )}
          >
            <input
              type="checkbox"
              checked={pickedSource.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedSource, option.value)}
            />
            <span data-jx-tr-label class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{option.label}</span>
          </label>
        </li>
      {:else}
        <li data-jx-tr-empty class="px-2 py-4 text-center text-xs text-muted-foreground">no matches</li>
      {/each}
    </ul>
  </fieldset>

  <div class="jx-tr-movers flex flex-col gap-2">
    <button
      type="button"
      class="jx-tr-move appearance-none w-8 h-8 border border-border bg-card text-foreground text-base leading-none cursor-pointer shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed"
      aria-label="move selected to {targetTitle}"
      disabled={movableSource.length === 0}
      onclick={() => move('to-target')}
      >→</button
    >
    <button
      type="button"
      class="jx-tr-move appearance-none w-8 h-8 border border-border bg-card text-foreground text-base leading-none cursor-pointer shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed"
      aria-label="move selected to {sourceTitle}"
      disabled={movableTarget.length === 0}
      onclick={() => move('to-source')}
      >←</button
    >
  </div>

  <fieldset data-jx-tr-panel class="flex-[1_1_0%] min-w-0 m-0 p-0 border border-border bg-card shadow-2xs rounded-(--radius)" aria-label="{targetTitle} · {targetTotal} total">
    <legend data-jx-tr-legend class="px-[0.625rem] py-[0.4375rem] font-nav text-[0.6875rem] tracking-[0.12em] uppercase text-muted-foreground"
      >{targetTitle} · {targetOptions.length}/{targetTotal} visible</legend
    >
    <input
      class="jx-tr-search box-border w-full px-[0.625rem] py-[0.4375rem] border-x-0 border-y border-border bg-background text-foreground font-mono text-xs"
      type="search"
      aria-label="filter {targetTitle}"
      placeholder={searchPlaceholder}
      bind:value={targetSearch}
    />
    <ul data-jx-tr-list class="m-0 py-1 px-[max(0.25rem_-_var(--jx-scrollbar-thin,0px),0px)] list-none max-h-56 overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges]" role="list">
      {#each targetOptions as option (option.value)}
        <li>
          <label
            class={cn(
              'jx-tr-row flex items-center gap-2 px-[0.375rem] py-[0.3125rem] text-[0.8125rem] text-foreground cursor-pointer',
              option.disabled && 'jx-tr-disabled opacity-45 cursor-not-allowed',
            )}
          >
            <input
              type="checkbox"
              checked={pickedTarget.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedTarget, option.value)}
            />
            <span data-jx-tr-label class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{option.label}</span>
          </label>
        </li>
      {:else}
        <li data-jx-tr-empty class="px-2 py-4 text-center text-xs text-muted-foreground">nothing here yet</li>
      {/each}
    </ul>
  </fieldset>
</div>
