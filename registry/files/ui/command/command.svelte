<!--
  jixoai command palette — the ROOT (registry/files/ui/command/command.svelte).
  Composition-first rebuild (composition-first-apis, Batch E, 2026-08-25):
  a cmdk-style composed family with SELF-MATCHING items —

    <Command bind:open>                ← the dialog shell; query state +
                                          the match predicate ride context
      <CommandInput placeholder="…" />  ← role=combobox; IME-safe keys
      <CommandList>                     ← role=listbox
        <CommandEmpty>nothing</CommandEmpty>
        <CommandGroup heading="git">    ← self-hides via CSS :has
          <CommandItem label="git status" keywords="gs"
                       onselect={…} disabled={false}>
            git status                  ← children = rendered content;
                                          label = REQUIRED match text +
                                          accessible name (aria-label)
            {#snippet hint()}<Kbd>⌘S</Kbd>{/snippet}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>

  Surface: native <dialog> + showModal() — a palette is a MODAL task:
  focus trap, background inertness, Escape and the top layer are the
  platform's. Cancel closes; open focuses the search input; close
  restores focus to whatever had it before. Width min(560px, 100vw -
  2rem), height capped with the list scrolling independently.

  Filter: each item computes its OWN visibility against the context
  predicate (family context contract, clause 4) — no central registry,
  no order dependence, SSR renders every item visible. `match` is the
  frozen pure inclusion contract: (item, query) => boolean; it may only
  answer visible/hidden, NEVER reorder. Default = the disjunction of
  text relations (label equals · label startsWith · any label token
  startsWith · label includes · keywords includes), case-insensitive,
  whitespace-collapsed query. The old rank-and-reorder died with the
  closed items[] API — filtering HIDES, the authored tree order IS the
  walk order (byte-stable under any predicate).

  Keyboard/ARIA: combobox + listbox with aria-activedescendant — the
  input HOLDS focus (screen readers announce the active item); ↑/↓ walk
  wrapped and cross-group over the DOM selector
  [role=option]:not([hidden]):not([aria-disabled='true']), Home/End
  jump, Enter activates. Disabled items render but never walk, never
  become activedescendant, never fire onselect (the three locks). The
  no-matches line is role=status (polite) — a state, not an option —
  revealed by the list's CSS :has() inverse when nothing is visible.

  API: bind:open + onopenchange on the shell; per-item onselect (cmdk
  law) fires once, then the palette closes (closeOnSelect={false} keeps
  it open for batch actions). ⌘K/Ctrl+K is bound on window when
  hotkey={true} (opt-in: multiple instances would otherwise all
  respond).

  tw4 (2026-08-24): paint as token utilities in the markup (active/
  disabled option states are JS-known → conditional strings); ONLY the
  ::backdrop scrim (a pseudo-element) and the :has laws live in
  command.css.
-->
<script lang="ts" module>
  /** the match payload: label is REQUIRED — match text + accessible name */
  export interface CommandMatchItem {
    label: string;
    /** extra match text (descriptions, aliases); never displayed */
    keywords?: string;
  }

  /** the frozen match contract (composition-first-apis): a pure
   *  inclusion predicate — it may only answer visible/hidden, never
   *  reorder. Authored tree order is the walk order. */
  export type CommandMatch = (item: CommandMatchItem, query: string) => boolean;

  /** default match — the old ranking's boolean projection: the
   *  disjunction of text relations over the case-insensitive,
   *  whitespace-collapsed query (see header). Pure, swappable. */
  export function defaultCommandMatch(item: CommandMatchItem, query: string): boolean {
    const q = query.trim().toLowerCase().split(/\s+/).join(' ');
    if (q === '') return true;
    const label = item.label.toLowerCase();
    const keywords = (item.keywords ?? '').toLowerCase();
    return (
      label === q ||
      label.startsWith(q) ||
      label.split(/\s+/).some((token) => token.startsWith(q)) ||
      label.includes(q) ||
      keywords.includes(q)
    );
  }

  /** the walk/anchor selector (design law, frozen): only walkable
   *  options ever match — hidden and disabled are excluded from the
   *  activation path entirely (the three locks). */
  export const COMMAND_WALK_SELECTOR = "[role=option]:not([hidden]):not([aria-disabled='true'])";

  /** context surface the family shares — STATE + BEHAVIOR, never
   *  membership order (the family context contract) */
  export interface CommandApi {
    readonly label: string;
    readonly placeholder: string;
    /** the listbox id — the input's aria-controls target */
    readonly listId: string;
    /** the live query (input writes, items read) */
    readonly query: string;
    /** the active option's id ('' = none); the input's
     *  aria-activedescendant mirror */
    readonly activeId: string;
    readonly closeOnSelect: boolean;
    /** self-match: the predicate bound to the current query */
    matches(item: CommandMatchItem): boolean;
    setQuery(next: string): void;
    setActive(id: string): void;
    /** the combobox registers its element for the open-path focus */
    setInput(el: HTMLInputElement | null): void;
    /** the keyboard law: ↑/↓ wrap, Home/End jump, Enter activates */
    navigate(event: KeyboardEvent): void;
    /** the selection close path (closeOnSelect) */
    close(): void;
  }

  /** context key — registered on the global symbol registry so the
   *  family files stay independent registry items */
  export const COMMAND_KEY = Symbol.for('jx-command');
</script>

<script lang="ts">
  import { onDestroy, setContext, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './command.css';

  interface Props {
    /** bindable open state — same lifecycle contract as dialog */
    open?: boolean;
    onopenchange?: (open: boolean) => void;
    /** bind ⌘K/Ctrl+K on window (OPT-IN: multiple instances would
     *  otherwise all respond; the app usually owns exactly one) */
    hotkey?: boolean;
    /** placeholder for the search input (CommandInput renders it) */
    placeholder?: string;
    /** dialog label — required a11y name */
    label?: string;
    /** replace the default inclusion predicate (pure function; the
     *  answer is visibility only — reordering is impossible by
     *  contract, authored order always stands) */
    match?: CommandMatch;
    /** keep the palette open after a select (batch actions) */
    closeOnSelect?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const uid = $props.id();

  let {
    open = $bindable(false),
    onopenchange,
    hotkey = false,
    placeholder = 'type a command…',
    label = 'command palette',
    match,
    closeOnSelect = true,
    variant = 'auto',
    class: className = '',
    children,
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let query = $state('');
  let activeId = $state('');

  // the shared declarative motion kernel (r29) — same law as popover
  const motion = createSurfaceMotion(() => dialog);

  onDestroy(() => motion.destroy());

  const matcher = $derived(match ?? defaultCommandMatch);

  /** the walkable options — DOM-DELEGATED (family context contract,
   *  clause 3): the frozen selector over THIS dialog's listbox-scoped
   *  options. Hidden and disabled items never enter the walk; nested
   *  foreign listboxes are excluded by the closest() scope. */
  function ownOptions(): HTMLElement[] {
    if (!dialog) return [];
    return [...dialog.querySelectorAll<HTMLElement>(COMMAND_WALK_SELECTOR)].filter(
      (option) => {
        const box = option.closest('[role="listbox"]');
        return box !== null && dialog!.contains(box);
      },
    );
  }

  /** keep the active option walkable: keep it if it survived the last
   *  filter change, else anchor to the first (Enter always has a live
   *  target whenever one exists) */
  function syncActive(): void {
    const options = ownOptions();
    if (!options.some((option) => option.id === activeId)) {
      activeId = options[0]?.id ?? '';
    }
  }

  function moveActive(delta: number): void {
    const options = ownOptions();
    if (!options.length) return;
    const current = options.findIndex((option) => option.id === activeId);
    // from nothing: down enters at the top, up at the bottom
    const next =
      current === -1
        ? delta > 0
          ? options[0]!
          : options.at(-1)!
        : options[(current + delta + options.length) % options.length]!;
    activeId = next.id;
  }

  function activateActive(): void {
    const active = ownOptions().find((option) => option.id === activeId);
    // DOM delegation: Enter IS the option's own click path — the item
    // owns onselect + the close law. Disabled/hidden options never hold
    // activeId, so they never activate (the three locks).
    active?.click();
  }

  function navigate(event: KeyboardEvent): void {
    const key = event.key;
    if (
      key !== 'ArrowDown' &&
      key !== 'ArrowUp' &&
      key !== 'Home' &&
      key !== 'End' &&
      key !== 'Enter'
    ) {
      return;
    }
    event.preventDefault();
    if (key === 'ArrowDown') moveActive(1);
    else if (key === 'ArrowUp') moveActive(-1);
    else if (key === 'Home') activeId = ownOptions()[0]?.id ?? '';
    else if (key === 'End') activeId = ownOptions().at(-1)?.id ?? '';
    else activateActive();
  }

  setContext<CommandApi>(COMMAND_KEY, {
    get label() {
      return label;
    },
    get placeholder() {
      return placeholder;
    },
    get listId() {
      return `${uid}-list`;
    },
    get query() {
      return query;
    },
    get activeId() {
      return activeId;
    },
    get closeOnSelect() {
      return closeOnSelect;
    },
    matches(item) {
      return matcher(item, query);
    },
    setQuery(next) {
      query = next;
    },
    setActive(id) {
      activeId = id;
    },
    setInput(el) {
      inputEl = el;
    },
    navigate,
    close() {
      setOpen(false);
    },
  });

  function setOpen(next: boolean): void {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  $effect(() => {
    if (open) {
      if (dialog && !dialog.open) dialog.showModal();
      query = '';
      activeId = '';
      motion.play(1);
      motion.startTracking();
      requestAnimationFrame(() => {
        if (!dialog?.open) return;
        inputEl?.focus();
        syncActive();
      });
    } else {
      untrack(() => shut());
    }
  });

  // filter changes re-anchor the active option (query is the only
  // dependency; the DOM read + write ride untrack to stay acyclic)
  $effect(() => {
    void query;
    if (!untrack(() => dialog?.open)) return;
    untrack(() => syncActive());
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

  const handleClose = (): void => {
    open = false;
  };

  const handleCancel = (event: Event): void => {
    event.preventDefault();
    shut();
  };

  const shut = (): void => {
    if (!dialog || !dialog.open) return;
    motion.stopTracking();
    dialog.classList.remove('jx-rest');
    motion.play(0);
    dialog.close();
  };
</script>

<dialog
  bind:this={dialog}
  class={cn(
    'jx-command jx-surface box-border mt-[12vh] mx-auto mb-auto w-[min(560px,calc(100vw-2rem))] max-h-[min(60vh,30rem)] rounded p-0 text-popover-foreground',
    motion.supported && 'jx-waapi',
    className,
  )}
  data-variant={variant}
  aria-label={label}
  oncancel={handleCancel}
  onclose={handleClose}
>
  <div data-jx-command-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <div data-jx-command-frame="" class="jx-surface-body flex flex-col [max-height:inherit]">
    {@render children()}
  </div>
</dialog>
