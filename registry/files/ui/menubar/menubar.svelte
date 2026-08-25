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

  tw4 (2026-08-24): bar/trigger paint as token utilities (open state
  and the last-trigger border are JS-known → conditional strings);
  ONLY the anchored panel law (position-try geometry, the @supports
  viewport-center fallback, ::backdrop) remains in menubar.css —
  D1-exempt residue.

  Motion kernel (2026-08-25): the panels adopt the shared surface
  motion kernel (lib/surface-motion.ts) — ONE kernel PER PANEL,
  lazily created (a single shared instance has one animation slot:
  gliding between slots would cancel the outgoing exit and ghost it
  at rest through the allow-discrete window). The slot-wrapper map
  feeds each kernel's live anchor axis, .jx-waapi (behind the
  exported engine probe — no instance exists at render time) opts
  into the jixoai.css formulas, and the real shadow rides a DOM
  child (data-jx-bar-shadow) each kernel animates in lockstep.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion, surfaceMotionSupported, type SurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './menubar.css';

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

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. ONE kernel PER PANEL, lazily created: a
  // single shared instance holds ONE animation slot, so gliding
  // between slots (close A, open B in the same breath) would cancel
  // A's exit mid-run — A's inline --jx-p pin then holds it at the
  // rest pose through the whole allow-discrete window (a ~460ms
  // ghost panel beside B). Per-panel slots keep every run isolated,
  // the same mental model as N independent popover instances: A
  // exits while B enters. bind:this writes the slot-wrapper entry
  // as a property and nulls it on unmount — the ?? null keeps the
  // kernel's anchor contract either way
  const slotEls: Record<string, HTMLElement | null> = {};
  const kernels = new Map<string, SurfaceMotion>();
  const kernelOf = (id: string): SurfaceMotion => {
    let kernel = kernels.get(id);
    if (!kernel) {
      kernel = createSurfaceMotion(() => document.getElementById(`jx-bar-panel-${id}`), {
        anchor: () => slotEls[id] ?? null,
      });
      kernels.set(id, kernel);
    }
    return kernel;
  };

  onDestroy(() => {
    for (const kernel of kernels.values()) kernel.destroy();
  });

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
  data-jx-menubar=""
  class={cn('flex w-fit flex-wrap items-stretch border border-border bg-card shadow-2xs', className)}
  role="menubar"
  aria-label={label}
  onkeydown={handleBarKeydown}
>
  {#each items as item, index (item.id)}
    <span
      data-jx-menubar-slot=""
      class="inline-flex"
      style="anchor-name: {anchorOf(item.id)}"
      bind:this={slotEls[item.id]}
    >
      <button
        type="button"
        id="jx-bar-trigger-{item.id}"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={openId === item.id}
        tabindex={activeBarIndex === index ? 0 : -1}
        class={cn(
          'px-[0.875rem] py-[0.4375rem] font-nav text-xs uppercase tracking-[0.1em] cursor-pointer transition-[color,background-color] duration-150 ease-out focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1',
          index === items.length - 1 ? 'border-r-0' : 'border-r border-border',
          openId === item.id
            ? 'bg-muted text-foreground'
            : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
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
    class={cn('jx-menubar-panel jx-surface', surfaceMotionSupported && 'jx-waapi')}
    data-variant={variant}
    style="position-anchor: {anchorOf(item.id)}; inset-area: bottom span-left; position-area: bottom span-left;"
    onkeydown={(e) => handlePanelKeydown(e, item.id)}
    ontoggle={(e: Event) => {
      const el = e.currentTarget as HTMLElement;
      if (el.matches(':popover-open')) {
        openId = item.id;
        const kernel = kernelOf(item.id);
        kernel.play(1);
        kernel.startTracking();
      } else {
        el.classList.remove('jx-rest');
        kernelOf(item.id).play(0);
        kernelOf(item.id).stopTracking();
        if (openId === item.id) openId = '';
      }
    }}
  >
    <!-- surface body (fill + ::after shadow); the popover element paints
         nothing (floating-surface law arch r3) -->
    <div data-jx-bar-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep -->
    <div data-jx-bar-surface="" class="jx-surface-body p-1">
      {@render panel(item)}
    </div>
  </div>
{/each}
