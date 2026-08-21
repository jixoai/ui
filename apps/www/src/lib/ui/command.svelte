<!--
  jixoai command palette (registry/files/ui/command.svelte).
  The ⌘K surface, per the batch-4 design ruling:

  Surface: native <dialog> + showModal() — a palette is a MODAL task:
  focus trap, background inertness, Escape and the top layer are the
  platform's. Cancel closes; open focuses the search input; close
  restores focus to whatever had it before. Width min(560px, 100vw -
  2rem), height capped with the list scrolling independently.

  Filter: deterministic ranking, no fuzzy —
    exact > label startsWith > token startsWith > label includes >
    keywords includes > original order
  Case-insensitive, whitespace-collapsed, IME-composition-safe (keys
  are ignored while composing). `filter` is a pure function prop —
  swap in your own ranking, never a cmdk compatibility layer.

  Keyboard/ARIA: combobox + listbox with aria-activedescendant — the
  input HOLDS focus (screen readers announce the active item); ↑/↓
  walk wrapped and cross-group, Home/End jump, Enter selects. The
  no-matches line is role=status (polite) — it is a state, not an
  option. Disabled items render but never activate.

  API: one execution path — open ($bindable) + onopenchange +
  onselect(item). onselect fires once, then the palette closes
  (closeOnSelect={false} keeps it open for batch actions). ⌘K/Ctrl+K
  is bound by the component on window; hotkey={false} opts out and
  the app owns the trigger.
-->
<script lang="ts" module>
export interface CommandItem {
  id: string;
  label: string;
  /** extra match text (descriptions, aliases); never displayed */
  keywords?: string;
  /** items group under a heading when set; input order preserved */
  group?: string;
  /** right-aligned hint — pass a kbd label like '⌘P' */
  hint?: string;
  disabled?: boolean;
}


/** deterministic ranking (see header); pure, swappable */
export function rankCommandItems(items: CommandItem[], query: string): CommandItem[] {
  const q = query.trim().toLowerCase().split(/\s+/).join(' ');
  if (q === '') return items;
  const scored: { item: CommandItem; score: number; order: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const label = item.label.toLowerCase();
    const keywords = (item.keywords ?? '').toLowerCase();
    let score: number | null = null;
    if (label === q) score = 0;
    else if (label.startsWith(q)) score = 1;
    else if (label.split(/\s+/).some((token) => token.startsWith(q))) score = 2;
    else if (label.includes(q)) score = 3;
    else if (keywords.includes(q)) score = 4;
    if (score !== null) scored.push({ item, score, order: i });
  }
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).map((s) => s.item);
}

</script>

<script lang="ts">
  import { untrack } from 'svelte';

  interface Props {
    items: CommandItem[];
    /** bindable open state — same lifecycle contract as dialog */
    open?: boolean;
    onopenchange?: (open: boolean) => void;
    /** fires ONCE per selection (disabled items never fire) */
    onselect?: (item: CommandItem) => void;
    /** keep the palette open after a select (batch actions) */
    closeOnSelect?: boolean;
    /** placeholder for the search input */
    placeholder?: string;
    /** dialog label — required a11y name */
    label?: string;
    /** bind ⌘K/Ctrl+K on window (OPT-IN: multiple instances would
     *  otherwise all respond; the app usually owns exactly one) */
    hotkey?: boolean;
    /** replace the ranking (pure function, default rankCommandItems) */
    filter?: (items: CommandItem[], query: string) => CommandItem[];
    class?: string;
  }

  let {
    items,
    open = $bindable(false),
    onopenchange,
    onselect,
    closeOnSelect = true,
    placeholder = 'type a command…',
    label = 'command palette',
    hotkey = false,
    filter = rankCommandItems,
    class: className = '',
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);

  // unique surface ids per instance (multiple palettes must not collide)
  const uid = $props.id();
  const listId = `${uid}-list`;
  const optionId = (id: string): string => `${uid}-opt-${id}`;
  let query = $state('');
  let activeIndex = $state(0);
  let composing = false;

  const results = $derived(filter(items, query));
  const groups = $derived.by(() => {
    // partition into (group heading, items) runs, input order preserved
    const runs: { group: string | null; items: CommandItem[] }[] = [];
    for (const item of results) {
      const last = runs.at(-1);
      if (last && last.group === (item.group ?? null)) last.items.push(item);
      else runs.push({ group: item.group ?? null, items: [item] });
    }
    return runs;
  });

  function setOpen(next: boolean): void {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  // state -> element, mirroring the dialog laws
  $effect(() => {
    if (open) {
      if (dialog && !dialog.open) dialog.showModal();
      query = '';
      activeIndex = 0;
      requestAnimationFrame(() => {
        if (typeof requestAnimationFrame === 'function' && dialog?.open) input?.focus();
      });
    } else {
      untrack(() => {
        if (dialog?.open) dialog.close();
      });
    }
  });

  // the hotkey: window-level, only while enabled
  $effect(() => {
    if (!hotkey) return;
    const handler = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function handleCancel(event: Event): void {
    event.preventDefault();
    setOpen(false);
  }

  function handleClose(): void {
    setOpen(false);
  }

  function activate(index: number): void {
    const item = results[index];
    if (!item || item.disabled) return;
    onselect?.(item);
    if (closeOnSelect) setOpen(false);
    // a fresh query starts the next open clean
    else {
      query = '';
      activeIndex = 0;
    }
  }

  function walk(direction: 1 | -1): number {
    // skip disabled items — they render but never activate
    let index = activeIndex;
    for (let step = 0; step < results.length; step++) {
      index = (index + direction + results.length) % results.length;
      if (!results[index]?.disabled) return index;
    }
    return activeIndex;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (composing || event.isComposing) return; // IME owns mid-composition
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = walk(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      activeIndex = results.findIndex((item) => !item.disabled);
      if (activeIndex === -1) activeIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      for (let i = results.length - 1; i >= 0; i--) {
        if (!results[i]?.disabled) {
          activeIndex = i;
          break;
        }
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      activate(activeIndex);
    }
  }

  // a new result set resets the walk to the first enabled item
  $effect(() => {
    void results;
    activeIndex = Math.max(
      0,
      results.findIndex((item) => !item.disabled),
    );
  });

  const activeId = $derived(results[activeIndex] ? optionId(results[activeIndex]!.id) : '');
</script>

<dialog
  bind:this={dialog}
  class="jx-command {className}"
  aria-label={label}
  oncancel={handleCancel}
  onclose={handleClose}
>
  <div class="jx-command-frame">
    <!-- svelte-ignore a11y_autofocus -- the palette's whole contract is
         type-to-search: focus must land in the input on open -->
    <input
      bind:this={input}
      class="jx-command-input"
      type="text"
      role="combobox"
      aria-expanded="true"
      aria-controls={listId}
      aria-activedescendant={activeId || undefined}
      aria-autocomplete="list"
      {placeholder}
      bind:value={query}
      onkeydown={handleKeydown}
      oncompositionstart={() => (composing = true)}
      oncompositionend={() => (composing = false)}
    />
    <div class="jx-command-list" id={listId} role="listbox" aria-label={label} tabindex="-1">
      {#each groups as run ((run.group ?? 'root') + run.items[0]!.id)}
        {#if run.group}
          <p class="jx-command-group" aria-hidden="true">{run.group}</p>
        {/if}
        {#each run.items as item (item.id)}
          {@const index = results.indexOf(item)}
<!-- svelte-ignore a11y_interaction_supports_focus, a11y_no_noninteractive_element_interactions -- the
     listbox option pattern here is activedescendant-driven: the INPUT
     holds focus and keys; the option's click is a pointer shortcut -->
          <div
            id={optionId(item.id)}
            role="option"
            aria-selected={index === activeIndex}
            aria-disabled={item.disabled || undefined}
            class="jx-command-item"
            class:jx-command-item-active={index === activeIndex}
            class:jx-command-item-disabled={item.disabled}
            onclick={() => activate(index)}
            onpointerenter={() => !item.disabled && (activeIndex = index)}
          >
            <span class="jx-command-label">{item.label}</span>
            {#if item.hint}
              <span class="jx-command-hint">{item.hint}</span>
            {/if}
          </div>
        {/each}
      {:else}
        <div class="jx-command-empty" role="status">no matches — {query.trim() || '…'}</div>
      {/each}
    </div>
  </div>
</dialog>

<style>
  .jx-command {
    box-sizing: border-box;
    width: min(560px, calc(100vw - 2rem));
    /* sit above center — palettes read as floating queries */
    margin: 12vh auto auto;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    max-height: min(60vh, 30rem);
  }
  .jx-command::backdrop {
    background: color-mix(in oklab, var(--primary) 10%, transparent);
  }

  .jx-command-frame {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }
  .jx-command-input {
    box-sizing: border-box;
    width: 100%;
    padding: 0.875rem 1rem;
    border: 0;
    border-bottom: 1px solid var(--border);
    background: transparent;
    color: var(--foreground);
    font-family: var(--font-mono);
    font-size: 0.9375rem;
  }
  .jx-command-input::placeholder {
    color: var(--muted-foreground);
  }
  .jx-command-input:focus {
    outline: none;
  }

  .jx-command-list {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0.375rem;
  }
  .jx-command-group {
    margin: 0.5rem 0 0.25rem;
    padding: 0 0.5rem;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-command-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.625rem;
    cursor: pointer;
    font-size: 0.8125rem;
    color: var(--foreground);
  }
  .jx-command-item-active {
    background: var(--muted);
    box-shadow: inset 2px 0 0 var(--primary);
  }
  .jx-command-item-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .jx-command-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jx-command-hint {
    flex: none;
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    color: var(--muted-foreground);
    border: 1px solid var(--border);
    padding: 0 0.375rem;
  }
  .jx-command-empty {
    padding: 1.25rem 0.625rem;
    text-align: center;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }
</style>
