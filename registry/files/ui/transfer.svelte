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
-->
<script lang="ts">
  import '$lib/form-field';

  export interface TransferOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: TransferOption[];
    /** values living on the TARGET side; bindable */
    value?: string[];
    /** form field name — the TARGET values submit (multi-entry) */
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
  disabled={false}
  onjx-reset={() => (value = [])}
></jx-form-field>

<div class="jx-transfer {className}">
  <!-- svelte-ignore a11y_autocomplete_valid -- search inputs over a
       checkbox fieldset, not a combobox -->
  <fieldset class="jx-tr-panel" aria-label="{sourceTitle} · {sourceOptions.length} available">
    <legend class="jx-tr-legend"
      >{sourceTitle} · {sourceOptions.length}/{sourceTotal} visible</legend
    >
    <input
      class="jx-tr-search"
      type="search"
      aria-label="filter {sourceTitle}"
      placeholder={searchPlaceholder}
      bind:value={sourceSearch}
    />
    <ul class="jx-tr-list" role="list">
      {#each sourceOptions as option (option.value)}
        <li>
          <label class="jx-tr-row" class:jx-tr-disabled={option.disabled}>
            <input
              type="checkbox"
              checked={pickedSource.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedSource, option.value)}
            />
            <span class="jx-tr-label">{option.label}</span>
          </label>
        </li>
      {:else}
        <li class="jx-tr-empty">no matches</li>
      {/each}
    </ul>
  </fieldset>

  <div class="jx-tr-movers">
    <button
      type="button"
      class="jx-tr-move"
      aria-label="move selected to {targetTitle}"
      disabled={movableSource.length === 0}
      onclick={() => move('to-target')}
      >→</button
    >
    <button
      type="button"
      class="jx-tr-move"
      aria-label="move selected to {sourceTitle}"
      disabled={movableTarget.length === 0}
      onclick={() => move('to-source')}
      >←</button
    >
  </div>

  <fieldset class="jx-tr-panel" aria-label="{targetTitle} · {targetOptions.length} selected">
    <legend class="jx-tr-legend"
      >{targetTitle} · {targetOptions.length}/{targetTotal} visible</legend
    >
    <input
      class="jx-tr-search"
      type="search"
      aria-label="filter {targetTitle}"
      placeholder={searchPlaceholder}
      bind:value={targetSearch}
    />
    <ul class="jx-tr-list" role="list">
      {#each targetOptions as option (option.value)}
        <li>
          <label class="jx-tr-row" class:jx-tr-disabled={option.disabled}>
            <input
              type="checkbox"
              checked={pickedTarget.has(option.value)}
              disabled={option.disabled}
              onchange={() => toggle(pickedTarget, option.value)}
            />
            <span class="jx-tr-label">{option.label}</span>
          </label>
        </li>
      {:else}
        <li class="jx-tr-empty">nothing here yet</li>
      {/each}
    </ul>
  </fieldset>
</div>

<style>
  .jx-transfer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .jx-tr-panel {
    flex: 1 1 0;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-2xs);
    border-radius: var(--radius);
  }
  .jx-tr-legend {
    padding: 0.4375rem 0.625rem;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-tr-search {
    box-sizing: border-box;
    width: 100%;
    padding: 0.4375rem 0.625rem;
    border: 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
  .jx-tr-search:focus {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-tr-list {
    margin: 0;
    padding: 0.25rem;
    list-style: none;
    max-height: 14rem;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .jx-tr-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3125rem 0.375rem;
    font-size: 0.8125rem;
    color: var(--foreground);
    cursor: pointer;
  }
  .jx-tr-row:hover:not(.jx-tr-disabled) {
    background: var(--muted);
  }
  .jx-tr-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .jx-tr-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-tr-empty {
    padding: 1rem 0.5rem;
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .jx-tr-movers {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .jx-tr-move {
    appearance: none;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: var(--shadow-2xs);
  }
  .jx-tr-move:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-tr-move:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .jx-tr-move:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
</style>
