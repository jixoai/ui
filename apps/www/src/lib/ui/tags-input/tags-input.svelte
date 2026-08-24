<!--
  jixoai tags-input (registry/files/ui/tags-input.svelte).
  Original request (2026-08-20): “开发 Combobox 和 TagsInput 两个高级 Form
  组件” — input × multiselect: the input.svelte shell becomes a flex-wrap
  host for tag chips plus one borderless input. Orthogonal intents:

  1. tag set — Tag[] is the $bindable contract; chips render bg-muted +
     1px border + 12px text + a press-physics × (removable defaults true);
     the container carries role="listbox" aria-orientation="horizontal"
     with each chip role="option" aria-selected="true".
  2. commit rules — Enter / comma / Tab (via blur) turn the typed text
     into a tag; a typed comma ALSO splits (paste "a,b,c" works); typed
     text resolving to a suggestion (label or value) commits the
     suggestion's value; Backspace on an empty input deletes the last
     removable tag; maxTags hides the input at the cap ("N/N tags").
  3. duplicates — allowDuplicates=false (default) flashes the EXISTING
     chip instead of adding: 200ms primary border + a 150ms shake,
     reduced-motion keeps the border flash only.
  4. suggestion popover — combobox.svelte law on a smaller scale: typing
     filters `suggestions` (label-or-value contains, case-insensitive,
     already-present ones hidden when duplicates are off) into a
     popover="auto" terminal-bezel listbox; focus stays in the input,
     ↑/↓ ride aria-activedescendant + aria-owns, Enter commits the
     highlighted suggestion, mousedown inside the panel is prevented so
     click-to-choose never blurs the input into a premature blur-commit.

  Family law throughout: label[for] + error wiring (aria-invalid +
  aria-describedby + dashed shell), inset 1px focus outline on the shell,
  hover lift, logical properties only (RTL flips itself), reduced-motion
  kills transitions and the shake.

  Disabled law (2026-08-20): the prop is intercepted and lands on the
  typing input AND every chip × — a disabled field must not stay edible
  through its chips — with addTag/removeAt entry guards behind them.
  The chips stay readable under the shell's 0.5 opacity.

  Chip end-padding fix (2026-08-23, “when there is NO suffix-icon,
  rendered tags lose their padding-inline-end”): the × button doubles as
  the chip's end inset — a removable:false chip rendered none, slamming
  the label onto the end border. The end padding is now authored on the
  chip itself for the no-× case (a conditional utility); chips with the ×
  keep their exact previous metrics.

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): the typing input IS a native <input type="text">, but it
  must never submit — its name is intercepted away. Chips reach FormData
  through the FACELESS jx-form-field bridge
  (registry/files/lib/form-field.ts): pass name= and the tag VALUES ride
  ElementInternals as ONE JSON array string (["a","b"] — lossless when a
  tag itself contains a comma; an empty set contributes nothing). form
  reset bubbles back as jx-reset, form/fieldset disable as jx-disabled.
  The bridge owns no box, no content, no paint.
  Height law: shell padding-block 0.375rem + 1.625rem
  chip/input min-heights + 1px borders = the 40px (2.5rem) row every
  text-like family control renders at — the chips must shrink with the
  row, not push it past the family height.

  tw4 (2026-08-24): shell/chips/input/rows static paint is token utilities
  in the markup (markup-known states — invalid dash, the duplicate flash,
  the no-× chip end padding, active/added suggestion rows — ride
  conditional utilities); the .jx-field scaffold is consumed from
  jx-pure Part A. Only the shake keyframes, the × glyph svg sizing, the
  shell's :has() hover/focus/disabled machines, the hover states and the
  reduced-motion kills remain in tags-input.css (D1-exempt residue under
  the layer law).
-->
<script module lang="ts">
  /** One chip of the tags input; suggestions reuse the same shape. */
  export interface Tag {
    /** the committed tag identity — duplicates compare on this */
    value: string;
    /** display text (defaults to the value) */
    label?: string;
    /** hide the × button; default true */
    removable?: boolean;
  }
</script>

<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import { tick } from 'svelte';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import './tags-input.css';

  interface Props extends Omit<HTMLInputAttributes, 'value' | 'type'> {
    /** the committed tag set; bind:tags */
    tags?: Tag[];
    /** optional suggestion list filtered into the popover while typing */
    suggestions?: Tag[];
    /** form field name — the bridge submits the tag VALUES as one JSON
        array string; the typing input itself carries no name */
    name?: string;
    /** input placeholder while empty */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** cap on the tag count; at the cap the input hides ("N/N tags") */
    maxTags?: number;
    /** allow the same value twice; default false flashes the existing chip */
    allowDuplicates?: boolean;
    /** disable the input AND every chip ×; entry guards back the buttons */
    disabled?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    tags = $bindable([]),
    suggestions = [],
    name,
    placeholder = 'Add tag...',
    label,
    error,
    id = autoId,
    maxTags,
    allowDuplicates = false,
    disabled = false,
    variant = 'auto',
    class: className = '',
    ...rest
  }: Props = $props();

  // form lifecycle: what jx-reset restores, and the form-disable mirror
  const initialTags = tags;
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  /** the form contribution: ONE JSON array of tag values (lossless when a
      value contains a comma); an empty set contributes nothing */
  const formValue = $derived(
    tags.length > 0 ? JSON.stringify(tags.map((tag) => tag.value)) : ''
  );

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const panelId = $derived(`${id}-panel`);
  const listboxId = $derived(`${id}-listbox`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-tags-* name.
  const anchorName = $derived(`--jx-tags-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const suggestionId = (index: number): string => `${id}-sug-${index}`;

  /** the live input text — typing state, committed only through addTag */
  let query = $state('');
  let open = $state(false);
  /** roving highlight index into `filtered` (-1 = none) */
  let active = $state(-1);
  let flashValue = $state<string | null>(null);
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  let inputEl = $state<HTMLInputElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  const full = $derived(maxTags != null && tags.length >= maxTags);

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return [];
    return suggestions.filter((suggestion) => {
      if (!allowDuplicates && tags.some((tag) => tag.value === suggestion.value)) return false;
      const haystack = (suggestion.label ?? suggestion.value).toLowerCase();
      return haystack.includes(q) || suggestion.value.toLowerCase().includes(q);
    });
  });

  const activeId = $derived(open && active >= 0 ? suggestionId(active) : undefined);

  // ---- popover plumbing ----------------------------------------------------
  // The native toggle event is the ONE open/close seam; it only syncs the
  // `open` flag — focus never enters the panel, so there is nothing to
  // restitute. Panel visibility follows the filter: matches → show, none →
  // hide (no empty state; the chips themselves are the current state).
  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
  }

  function syncPanel(): void {
    if (filtered.length > 0) {
      if (panelEl?.isConnected && !panelEl.matches(':popover-open')) {
        try {
          panelEl.showPopover();
        } catch {
          // no transient activation — the next keystroke opens
        }
      }
    } else if (panelEl?.matches(':popover-open')) {
      panelEl.hidePopover();
    }
  }
  function hidePanel(): void {
    if (panelEl?.matches(':popover-open')) panelEl.hidePopover();
  }

  /** step the highlight by delta, clamped at the ends (APG: no wrap) */
  function moveActive(delta: 1 | -1): void {
    const next = active + delta;
    if (next >= 0 && next < filtered.length) active = next;
  }

  // ---- commit paths ----------------------------------------------------------
  /** typed text resolving to a suggestion commits the suggestion's value */
  function resolveSuggestion(text: string): Tag | undefined {
    const lower = text.trim().toLowerCase();
    if (lower === '') return undefined;
    return suggestions.find(
      (suggestion) =>
        suggestion.value.toLowerCase() === lower || (suggestion.label ?? '').toLowerCase() === lower
    );
  }

  function addTag(tag: Tag): void {
    if (isDisabled) return; // a disabled field neither adds nor flashes
    if (maxTags != null && tags.length >= maxTags) return;
    if (!allowDuplicates && tags.some((existing) => existing.value === tag.value)) {
      flashExisting(tag.value);
    } else {
      tags = [...tags, tag];
    }
    resetInput();
  }

  function commitRaw(text: string): void {
    const trimmed = text.trim();
    if (trimmed === '') return;
    addTag(resolveSuggestion(trimmed) ?? { value: trimmed });
  }

  /** duplicates flash the EXISTING chip: 200ms primary border + shake */
  function flashExisting(value: string): void {
    flashValue = value;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => (flashValue = null), 200);
  }

  function resetInput(): void {
    query = '';
    active = -1;
    if (inputEl) inputEl.value = '';
    hidePanel();
  }

  async function removeAt(index: number): Promise<void> {
    if (isDisabled) return; // chips are read-only in a disabled field
    tags = tags.filter((_, i) => i !== index);
    // keep the flow in the input after a × click (the input may just have
    // remounted when the removal dropped the field below maxTags)
    await tick();
    inputEl?.focus();
  }

  // ---- input events ----------------------------------------------------------
  function onInput(event: Event): void {
    const el = event.currentTarget as HTMLInputElement;
    // a comma (typed OR pasted) splits into one commit per part
    if (el.value.includes(',')) {
      for (const part of el.value.split(',')) {
        const trimmed = part.trim();
        if (trimmed !== '') commitRaw(trimmed);
      }
      query = '';
      el.value = '';
      active = -1;
    } else {
      query = el.value;
      active = filtered.length > 0 ? 0 : -1; // filtering auto-highlights the first match
    }
    syncPanel();
    // forward a caller-supplied input handler from the rest props
    (rest as { oninput?: (event: Event) => void }).oninput?.(event);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!open) return; // arrows in a closed field keep their caret duties
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault(); // never submit the surrounding form
      if (open && active >= 0 && filtered[active]) addTag(filtered[active]);
      else commitRaw(query);
    } else if (event.key === 'Backspace' && query === '') {
      // empty input → Backspace deletes the last removable tag
      const last = tags[tags.length - 1];
      if (last && last.removable !== false) {
        event.preventDefault();
        tags = tags.slice(0, -1);
      }
    } else if (event.key === 'Escape') {
      // no preventDefault: the popover's native close request runs
      active = -1;
    }
    // Tab needs no handler: focus moves, focusout commits + closes
  }

  function onFocusOut(): void {
    hidePanel();
    commitRaw(query); // Tab/click-away commits the pending text as a tag
  }

  // release the flash timer on teardown
  $effect(() => {
    return () => {
      if (flashTimer) clearTimeout(flashTimer);
    };
  });

  // keep the highlight suggestion visible when it moves off-panel
  $effect(() => {
    if (open && active >= 0) {
      document.getElementById(suggestionId(active))?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div class="jx-field">
  <!-- faceless form bridge (form-field.ts law): the tag VALUES ride
       ElementInternals into FormData as one JSON array string; the
       typing input carries NO name. jx-reset / jx-disabled bubble the
       form lifecycle back into this component. Owns no box, no content —
       the `contents` utility keeps the prerendered HTML from flashing an
       extra flex gap pre-upgrade.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    class="contents"
    aria-hidden="true"
    {name}
    value={formValue}
    disabled={isDisabled || undefined}
    onjx-reset={() => (tags = [...initialTags])}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span data-jx-tags-wrap class="relative block w-full max-w-full" style="anchor-name: {anchorName}">
    <div
      data-jx-tags-invalid={invalid ? '' : undefined}
      class={cn(
        'jx-tags-shell flex flex-wrap items-center gap-1 w-full max-w-full min-h-10 px-3 py-1.5 border border-border rounded-none bg-background scheme-light dark:scheme-dark transition-[box-shadow] duration-150 ease-out',
        invalid && 'border-dashed',
        className,
      )}
      role="listbox"
      aria-orientation="horizontal"
      aria-label={label ?? 'tags'}
    >
      {#each tags as tag, index (`${tag.value}#${index}`)}
        <span
          role="option"
          aria-selected="true"
          class={cn(
            'jx-tags-tag inline-flex items-center gap-1 min-h-[1.625rem] ps-2 border border-border bg-muted text-foreground text-xs leading-[1.2] transition-[border-color] duration-100 ease-out',
            tag.removable === false && 'pe-2',
            tag.value === flashValue && 'jx-tags-flash border-primary animate-[jx-tags-shake_150ms_ease-in-out]',
          )}
        >
          <span data-jx-tags-tag-label class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{tag.label ?? tag.value}</span>
          {#if tag.removable !== false}
            <button
              type="button"
              class="jx-tags-remove inline-flex items-center justify-center self-stretch w-[1.375rem] p-0 border-0 bg-transparent text-muted-foreground text-base leading-none cursor-pointer transition-[color,transform] duration-100 ease-out disabled:cursor-not-allowed"
              aria-label={`remove ${tag.label ?? tag.value}`}
              disabled={isDisabled}
              onclick={() => removeAt(index)}
            >
              <!-- the shared inline icon set — 10px inside the chip row -->
              {@html icons.x}
            </button>
          {/if}
        </span>
      {/each}
      {#if full}
        <span data-jx-tags-full class="text-muted-foreground text-xs leading-[1.625rem]">{tags.length}/{maxTags} tags</span>
      {:else}
        <input
          bind:this={inputEl}
          {...rest}
          {id}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-owns={listboxId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-invalid={invalidAttr}
          aria-describedby={describedBy}
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          data-jx-tags-input
          class="flex-[1_1_0%] min-w-[120px] min-h-[1.625rem] p-0 border-0 outline-none bg-transparent text-foreground text-sm leading-[1.45] placeholder:text-muted-foreground placeholder:opacity-100"
          {placeholder}
          disabled={isDisabled}
          oninput={onInput}
          onkeydown={onKeydown}
          onfocusout={onFocusOut}
        />
      {/if}
    </div>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-tags-panel jx-surface"
    data-variant={variant}
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- surface body (bezel paint + ::after shadow) + scroll ring
         (floating-surface law arch r3) -->
    <div data-jx-tags-panel-body class="jx-surface-body">
    <div data-jx-tags-scroll class="max-h-[60vh] overflow-auto overscroll-contain [scrollbar-gutter:stable_both-edges] py-1 px-[max(4px_-_var(--jx-scrollbar-thin,0px),0px)]">
    {#if filtered.length > 0}
      <!-- mousedown is prevented so click-to-choose never blurs the input
           into a premature blur-commit -->
      <ul
        id={listboxId}
        data-jx-tags-list
        class="m-0 p-0 list-none"
        role="listbox"
        aria-label={label ? `${label} suggestions` : 'suggestions'}
        onmousedown={(event) => event.preventDefault()}
      >
        {#each filtered as suggestion, index (suggestion.value)}
          <!-- suggestion rows are click-only BY PATTERN (combobox law): the
               keyboard path rides the input + aria-activedescendant roving
               highlight, never the row itself -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            id={suggestionId(index)}
            role="option"
            aria-selected={tags.some((tag) => tag.value === suggestion.value) ? 'true' : 'false'}
            data-jx-tags-suggestion-active={index === active ? '' : undefined}
            class={cn(
              'jx-tags-suggestion px-[10px] py-[6px] text-[13px] leading-[1.45] text-[color-mix(in_oklab,var(--terminal-foreground)_72%,transparent)] cursor-pointer border-s-2 [border-inline-start-color:transparent] transition-[background-color,color] duration-100 ease-out',
              index === active && 'bg-terminal-hover text-terminal-foreground',
              tags.some((tag) => tag.value === suggestion.value) && 'bg-terminal-hover text-terminal-foreground [border-inline-start-color:var(--primary)]',
            )}
            onclick={() => addTag(suggestion)}
          >
            {suggestion.label ?? suggestion.value}
          </li>
        {/each}
      </ul>
    {/if}
    </div>
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
