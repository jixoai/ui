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
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts" module>
  // the match contract lives lib-side now (r10/A5): re-exported here —
  // ui→lib is the legal import direction, existing consumers unchanged.
  import type { CommandMatch, CommandMatchItem } from '$lib/command-match';
  export type { CommandMatch, CommandMatchItem };

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
    readonly density: import('$lib/density.svelte').Density | undefined;
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
    /** the OWN listbox element — registered by CommandList at mount;
     *  the walk accepts only options whose closest listbox IS this
     *  one (nested palettes never leak — Codex impl-r2 P1-1) */
    listEl: HTMLElement | null;
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
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    elevationSurfaceOf,
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
  import { CommandDefaults, type CommandSurfaceVariant } from './command-defaults.svelte';
  import { commandStyles } from './command.stylex';
  import './command.css';

  interface Props extends Omit<HTMLAttributes<HTMLDialogElement>, 'color'> {
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) — provided to the palette's subtree */
    density?: DensityLane | QueryResult<DensityLane>;
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
        the environment asks for reduced transparency). Omitted → the
        contract own 'auto' (CommandDefaults — a declared own, not
        ambient) */
    variant?: CommandSurfaceVariant;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast. NOTE: the shell's own corner paint lives in the
     *     stylex atom (the payload lane) — the axis SUPPLIES the
     *     carrier chain and stamps on the top-layered root; swapping
     *     the atom's borderRadius for the consumed form is a
     *     payload-rebuild change this batch defers (census-recorded) */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() — own level4 (the modal rung, the batch C dialog
     *  law); the consumption pair rides the theme's .jx-surface-body
     *  law (shadow recipe + the paired ladder rung) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
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
    density,
    match,
    closeOnSelect = true,
    variant,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
    style = '',
    children,
    ...rest
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // (the button-group r11 idiom) The CAPTURE is load-bearing and
  // eager: getDensityContext() rides the $derived.by ARGUMENT subtree,
  // which evaluates at this statement — BEFORE provideDensity writes
  // the key — so it captures the PARENT's context object. A lazily-
  // evaluated read would resolve the key to the palette's OWN write
  // and self-reference through the very getter it feeds
  // (derived_references_self, pinned in defaults-buttons.spec). The
  // W3-D1 universal lane narrows at the legacy edge (the input-group
  // law): the legacy channel keeps its five-rung spelling — 'auto',
  // the coefficient number and query() carriers never carry a legacy
  // rung. The CommandApi below keeps exposing this resolved value —
  // the family STATE context is untouched by the migration
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.2 + W3-D1)
  // — ON TOP of the provider lane (the button-group law): the
  // density slot's ambient read resolves the key to this palette's
  // OWN write, whose getter is the captured-parent resolution above,
  // so the chain TERMINATES (it never re-enters this derived) and
  // lands the same values on every lane; variant's own 'auto' and
  // the modal's own elevation level4 live in CommandDefaults,
  // auditable in one place
  const d = $derived(
    CommandDefaults.resolve({
      variant,
      density,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  // the universal density supply rides the bridged provideDensity
  // write above — it is reactive, while the object literal here
  // would SNAPSHOT the prop at init and freeze the explicit lane
  // over the bridge; this supply carries the other seven axes
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  // §7's consumption pair: the resolved level's shadow recipe + the
  // PAIRED ladder-rung surface, through the level-table indirection
  // (the .jx-surface-body law consumes both channels)
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));
  const rootStyle = $derived(
    [carriers, elevationConsumed, style].filter(Boolean).join('; ') || undefined,
  );

  let dialog = $state<HTMLDialogElement | null>(null);
  // the query() anchor sits AFTER the anchor state declaration (the
  // W3-C TDZ kernel note)
  provideQueryAnchor(() => dialog ?? null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let query = $state('');
  let activeId = $state('');

  // the shared declarative motion kernel (r29) — same law as
  // popover. RENAMED panelMotion (W3-D1): the local `motion` name
  // now belongs to the §8 axis lane — the local yields to the axis
  // (the dialog/popover panelMotion precedent)
  const panelMotion = createSurfaceMotion(() => dialog);

  onDestroy(() => panelMotion.destroy());

  const matcher = $derived(match ?? defaultCommandMatch);

  /** the walkable options — DOM-DELEGATED (family context contract,
   *  clause 3): the frozen selector over THIS palette's OWN listbox
   *  (CommandList registers its element on the context at mount).
   *  Hidden and disabled items never enter the walk; a NESTED
   *  palette's options — whose closest listbox is the inner one —
   *  never leak into this walk (Codex impl-r2 P1-1). */
  function ownOptions(): HTMLElement[] {
    if (!dialog || !ctx.listEl) return [];
    return [...dialog.querySelectorAll<HTMLElement>(COMMAND_WALK_SELECTOR)].filter(
      (option) => option.closest('[role="listbox"]') === ctx.listEl,
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

  const ctx: CommandApi = {
    get density() {
      return resolvedDensity;
    },
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
    listEl: null,
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
  };

  setContext(COMMAND_KEY, ctx);

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
      panelMotion.play(1);
      panelMotion.startTracking();
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

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
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

  const handleClose = (): void => {
    // native close (Escape/backdrop) rides the same public seam as
    // programmatic closes — onopenchange fires for every path
    setOpen(false);
  };

  const handleCancel = (event: Event): void => {
    event.preventDefault();
    shut();
  };

  const shut = (): void => {
    if (!dialog || !dialog.open) return;
    panelMotion.stopTracking();
    dialog.classList.remove('jx-rest');
    panelMotion.play(0);
    dialog.close();
  };
</script>

<dialog
  bind:this={dialog}
  class={cn(
    'jx-command jx-surface',
    cx(commandStyles.shell),
    panelMotion.supported && 'jx-waapi',
    className,
  )}
  data-variant={d.variant}
  {...rest}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  aria-label={label}
  oncancel={handleCancel}
  onclose={handleClose}
>
  <div data-jx-command-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <div data-jx-command-frame="" class={cn('jx-surface-body', cx(commandStyles.frame))}>
    {@render children()}
  </div>
</dialog>
