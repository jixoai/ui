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

  tw4 (2026-08-24): pure utility migration for the static paint (group,
  label, chain, select shells — the disabled dim rides the disabled:
  variant); only the :focus outline law remains in cascader.css
  (D1-exempt residue under the layer law).
-->
<script lang="ts">
  import '$lib/form-field';
  import { cn } from '$lib/utils';
  import './cascader.css';

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
  /** form/fieldset disable propagation (the bridge's jx-disabled) */
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

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
</script>

<jx-form-field
  aria-hidden="true"
  {name}
  value={formValue}
  disabled={isDisabled || undefined}
  onjx-disabled={(e: CustomEvent<boolean>) => (formDisabled = e.detail)}
  onjx-reset={() => (value = [])}
></jx-form-field>

<div class={cn('jx-cascader flex flex-col gap-1.5 w-fit', className)} role="group" aria-label={label ?? 'cascade'}>
  {#if label}
    <span class="jx-cascader-label font-nav text-xs tracking-[0.1em] uppercase text-muted-foreground" id="{autoId}-label">{label}</span>
  {/if}
  <div class="jx-cascader-chain flex flex-wrap gap-1.5" aria-labelledby={label ? `${autoId}-label` : undefined}>
    {#each levels as levelOptions, level (level)}
      <select
        class="jx-cascader-select py-[0.4375rem] px-[0.625rem] border border-border bg-background text-foreground font-mono text-[0.8125rem] rounded-(--radius) disabled:opacity-50"
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
