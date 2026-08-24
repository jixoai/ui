<!--
  jixoai menubar (registry/files/ui/menubar.svelte).
  The application menu bar — File Edit View… — with its OWN walker
  (batch-4 ruling): the top-level keyboard contract differs from a
  stack of dropdowns, so this is an independent coordinator over the
  popover laws (popover=manual panels — WE own dismissal: document
  pointerdown outside-check + panel Escape; auto light-dismiss raced
  the trigger click):

    ←/→          move between top-level triggers (panels follow an
                 open bar — glide behavior)
    ↓ / Enter    open the trigger's panel, focus its first item
    ↑            opens too (menubar convention both ways)
    Home/End     first/last trigger
    Escape       close the panel, focus back on its trigger
    panel items  ↓/↑/Home/End walk + wrap (the menu contract shared
                 with dropdown-menu — duplicated deliberately: registry
                 items stay independent, no hidden coupling)

  Items are data-driven: label + panel content per item (the `panel`
  snippet keyed by item id, rendered inside role=menu). Selection
  semantics belong to the content (links leave, buttons act) — the
  menubar only owns the walking and the open/close coordination.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface MenubarItem {
    id: string;
    label: string;
  }

  interface Props {
    items: MenubarItem[];
    label?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** panel content per item id */
    panel: Snippet<[MenubarItem]>;
    class?: string;
  }

  let {
    items,
    label = 'menu bar',
    variant = 'auto',
    panel,
    class: className = '',
  }: Props = $props();

  let barEl = $state<HTMLElement | null>(null);
  let openId = $state('');
  /** the roving tab stop FOLLOWS arrow focus (initial: the first trigger) */
  let activeBarIndex = $state(0);
  /** id marking "a panel was just opened by keyboard — focus its first item" */
  let focusIntoId = $state('');

  const anchorOf = (id: string): string =>
    `--jx-bar-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  function triggers(): HTMLButtonElement[] {
    return [
      ...(barEl?.querySelectorAll<HTMLButtonElement>('[role=menuitem]:not([disabled])') ?? []),
    ];
  }

  function openPanel(id: string, focusFirst: boolean): void {
    const el = document.getElementById(`jx-bar-panel-${id}`);
    if (el && typeof el.showPopover === 'function' && !el.matches(':popover-open')) {
      el.showPopover();
    }
    openId = id;
    if (focusFirst) focusIntoId = id;
  }

  /** panels are popover=manual: WE own dismissal (popover=auto's light
   *  dismiss raced the trigger click — outside-close then click-reopen
   *  read as "toggle broken"; Escape is handled in the panel keydown) */
  function handleDocPointerDown(event: PointerEvent): void {
    if (openId === '') return;
    const target = event.target as Node | null;
    const panel = document.getElementById(`jx-bar-panel-${openId}`);
    const trigger = document.getElementById(`jx-bar-trigger-${openId}`);
    if (panel && target && !panel.contains(target) && !(trigger && trigger.contains(target))) {
      closePanel(openId, false);
    }
  }

  function closePanel(id: string, restoreTrigger: boolean): void {
    const el = document.getElementById(`jx-bar-panel-${id}`);
    if (el && typeof el.hidePopover === 'function' && el.matches(':popover-open')) {
      el.hidePopover();
    }
    if (restoreTrigger) {
      document.getElementById(`jx-bar-trigger-${id}`)?.focus();
    }
    if (openId === id) openId = '';
  }

  function handleBarKeydown(event: KeyboardEvent): void {
    const bars = triggers();
    const current = bars.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const move = (delta: number): void => {
      event.preventDefault();
      const nextIndex = (current + delta + bars.length) % bars.length;
      const next = bars[nextIndex];
      activeBarIndex = nextIndex;
      next?.focus();
      if (openId !== '') {
        const target = items.find((item) => `jx-bar-trigger-${item.id}` === next?.id);
        if (target) {
          closePanel(openId, false);
          // gliding with a panel open keeps the FOCUS INSIDE the panels
          // (consistent with ↓-open, per the walkthrough note)
          openPanel(target.id, true);
        }
      }
    };
    if (event.key === 'ArrowRight') return move(1);
    if (event.key === 'ArrowLeft') return move(-1);
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : bars.length - 1;
      activeBarIndex = index;
      bars[index]?.focus();
      return;
    }
    const own = items[current];
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter') && own) {
      event.preventDefault();
      openPanel(own.id, true);
    }
  }

  /** the shared menu contract: walk the panel's own [role=menuitem]s */
  function handlePanelKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel(id, true);
      return;
    }
    const menu = document.getElementById(`jx-bar-panel-${id}`);
    const entries = [
      ...(menu?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? []),
    ];
    if (entries.length === 0) return;
    const current = entries.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;
    if (event.key === 'ArrowDown') {
      next = entries[(current + 1 + entries.length) % entries.length];
    } else if (event.key === 'ArrowUp') {
      next = entries[(current - 1 + entries.length) % entries.length];
    } else if (event.key === 'Home') {
      next = entries[0];
    } else if (event.key === 'End') {
      next = entries.at(-1);
    }
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }

  // focus the first item of a keyboard-opened panel once it is open
  $effect(() => {
    if (focusIntoId === '') return;
    requestAnimationFrame(() => {
      if (typeof requestAnimationFrame === 'function') {
        const menu = document.getElementById(`jx-bar-panel-${focusIntoId}`);
        const first = menu?.querySelector<HTMLElement>('[role=menuitem]:not([disabled])');
        first?.focus();
      }
      focusIntoId = '';
    });
  });
</script>

<svelte:document onpointerdown={handleDocPointerDown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_interactive_supports_focus -- the
     bar hosts the menubar walk; its BUTTONS hold the roving tabindex,
     the bar itself is never a tab stop -->
<div
  bind:this={barEl}
  class="jx-menubar {className}"
  role="menubar"
  aria-label={label}
  onkeydown={handleBarKeydown}
>
  {#each items as item, index (item.id)}
    <span class="jx-menubar-slot" style="anchor-name: {anchorOf(item.id)}">
      <button
        type="button"
        id="jx-bar-trigger-{item.id}"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={openId === item.id}
        tabindex={activeBarIndex === index ? 0 : -1}
        onfocus={() => (activeBarIndex = index)}
        onclick={() => (openId === item.id ? closePanel(item.id, false) : openPanel(item.id, false))}
      >
        {item.label}
      </button>
    </span>
  {/each}
</div>

{#each items as item (item.id)}
  <div
    id="jx-bar-panel-{item.id}"
    popover="manual"
    role="menu"
    tabindex="-1"
    class="jx-menubar-panel jx-surface"
    data-variant={variant}
    style="position-anchor: {anchorOf(item.id)}; inset-area: bottom span-left; position-area: bottom span-left;"
    onkeydown={(e) => handlePanelKeydown(e, item.id)}
    ontoggle={(e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.matches(':popover-open')) openId = item.id;
      else if (openId === item.id) openId = '';
    }}
  >
    <!-- surface body (fill + ::after shadow); the popover element paints
         nothing (floating-surface law arch r3) -->
    <div class="jx-bar-surface jx-surface-body">
      {@render panel(item)}
    </div>
  </div>
{/each}

<style>
  .jx-menubar {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-2xs);
    width: fit-content;
  }
  .jx-menubar-slot {
    display: inline-flex;
  }
  .jx-menubar button[role='menuitem'] {
    padding: 0.4375rem 0.875rem;
    border: 0;
    border-right: 1px solid var(--border);
    background: transparent;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 150ms ease-out, background-color 150ms ease-out;
  }
  .jx-menubar-slot:last-child button {
    border-right: 0;
  }
  .jx-menubar button:hover,
  .jx-menubar button[aria-expanded='true'] {
    color: var(--foreground);
    background: var(--muted);
  }
  .jx-menubar button:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  /* surface on the jx-surface law (arch r3): the panel is the
     PLATFORM element (no paint); the body ring carries the fill and
     the ::after shadow layer. */
  .jx-menubar-panel {
    position: fixed;
    margin: var(--jx-bar-gap, 8px);
    position-try-fallbacks: flip-block;
    position-try: flip-block;
    position-visibility: anchors-visible;
    width: fit-content;
    min-width: 10rem;
    color: var(--popover-foreground);
  }
  .jx-bar-surface {
    padding: 0.25rem;
  }
  @supports not (anchor-name: --jx-bar-fallback) {
    .jx-menubar-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
    }
  }
  .jx-menubar-panel::backdrop {
    background: transparent;
  }
</style>
