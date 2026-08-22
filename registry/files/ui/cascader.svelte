<!--
  jixoai cascader (registry/files/ui/cascader.svelte).
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
-->
<script lang="ts">
  import '$lib/form-field';

  export interface CascaderOption {
    value: string;
    label: string;
    disabled?: boolean;
    children?: CascaderOption[];
  }

  interface Props {
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

  let {
    options,
    name,
    value = $bindable<string[]>([]),
    separator = '/',
    disabled = false,
    label,
    placeholder = 'select…',
    class: className = '',
  }: Props = $props();

  /** the chain of option lists: level 0 = options, level i = children of
   *  the level i-1 pick (stops at the first leaf-less pick) */
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
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={formValue}
  disabled={disabled || undefined}
  onjx-reset={() => (value = [])}
></jx-form-field>

<div class="jx-cascader {className}" role="group" aria-label={label ?? 'cascade'}>
  {#if label}
    <span class="jx-cascader-label" id="{autoId}-label">{label}</span>
  {/if}
  <div class="jx-cascader-chain" aria-labelledby={label ? `${autoId}-label` : undefined}>
    {#each levels as levelOptions, level (level)}
      <select
        class="jx-cascader-select"
        {disabled}
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

<style>
  .jx-cascader {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    width: fit-content;
  }
  .jx-cascader-label {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-cascader-chain {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  .jx-cascader-select {
    padding: 0.4375rem 0.625rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    border-radius: var(--radius);
  }
  .jx-cascader-select:focus {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-cascader-select:disabled {
    opacity: 0.5;
  }
</style>
