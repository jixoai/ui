<!--
  jixoai menubar panel (registry/files/ui/menubar/menubar-panel.svelte).
  The popover=manual role=menu surface (WE own dismissal — see
  menubar.svelte). Derives its id from the Item (`${item.id}-panel`,
  the registry key the trigger's aria-controls points at) and REGISTERS
  its imperative handles {show, hide} under that PANEL id at INIT
  (sync, SSR-executed — onMount is never the only registration path),
  unregistering onDestroy: a conditionally removed panel leaves no
  ghost handle.

  Owns its slice of the menu contract: panel ↓/↑/Home/End walk + wrap
  over the entries whose closest('[role=menu]') is THIS panel (nested
  dropdown families never leak into the walk), and Escape → close +
  focus back to the trigger.

  Motion kernel (2026-08-25): the shared surface motion kernel
  (lib/surface-motion.ts) — ONE kernel PER PANEL (the composed shape
  makes this natural: each panel component instance owns its own; a
  single shared instance has one animation slot, and gliding between
  menus would cancel the outgoing exit and ghost it at rest through the
  allow-discrete window). The toggle seam drives play/startTracking/
  stopTracking, .jx-waapi (behind the exported engine probe — no
  instance exists at render time) opts into the jixoai.css formulas,
  and the real shadow rides a DOM child (data-jx-bar-shadow) the kernel
  animates in lockstep.

  Children = panel content: MenubarMenuItem parts, separators (plain
  <hr>), any markup.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { getContext } from 'svelte';
  import { createSurfaceMotion, surfaceMotionSupported } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { MENUBAR_KEY, type MenubarApi, type MenubarPanelHandles } from './menubar.svelte';
  import { MENUBAR_ITEM_KEY, type MenubarItemApi } from './menubar-item.svelte';
  import './menubar.css';

  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children }: Props = $props();

  const bar = getContext<MenubarApi>(MENUBAR_KEY);
  const item = getContext<MenubarItemApi>(MENUBAR_ITEM_KEY);
  if (!bar || !item) {
    throw new Error('jxoai menubar: MenubarPanel must live inside a MenubarItem inside a Menubar');
  }

  const panelId = `${item.id}-panel`;

  let panelEl = $state<HTMLElement | null>(null);

  // registered at INIT under the PANEL id — the glide and the trigger
  // toggle call these; the popover-API guards mirror the pre-composed
  // openPanel/closePanel bodies verbatim
  const handles: MenubarPanelHandles = {
    show() {
      const el = panelEl;
      if (el && typeof el.showPopover === 'function' && !el.matches(':popover-open')) {
        el.showPopover();
      }
    },
    hide() {
      const el = panelEl;
      if (el && typeof el.hidePopover === 'function' && el.matches(':popover-open')) {
        el.hidePopover();
      }
    },
  };
  bar.register(panelId, item.anchorName, handles);
  onDestroy(() => {
    kernel.destroy();
    bar.unregister(panelId, handles);
  });

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. ONE kernel PER PANEL, anchored to the Item's
  // slot span (the live axis source)
  const kernel = createSurfaceMotion(() => panelEl, { anchor: () => item.slotEl });

  function handleToggle(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    if (el.matches(':popover-open')) {
      bar.markOpen(panelId);
      kernel.play(1);
      kernel.startTracking();
    } else {
      el.classList.remove('jx-rest');
      kernel.play(0);
      kernel.stopTracking();
      bar.markClosed(panelId);
    }
  }

  /** the shared menu contract, SCOPED to this panel: only entries whose
   *  closest [role=menu] is THIS panel (nested menus never leak) */
  function scopedEntries(): HTMLElement[] {
    return [
      ...(panelEl?.querySelectorAll<HTMLElement>('[role=menuitem]:not([disabled])') ?? []),
    ].filter((el) => el.closest('[role="menu"]') === panelEl);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      bar.closePanel(panelId);
      document.getElementById(`${item.id}-trigger`)?.focus();
      return;
    }
    const entries = scopedEntries();
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
</script>

<div
  id={panelId}
  popover="manual"
  role="menu"
  tabindex="-1"
  class={cn('jx-menubar-panel jx-surface', surfaceMotionSupported && 'jx-waapi', className)}
  data-variant={bar.variant}
  bind:this={panelEl}
  style="position-anchor: {item.anchorName}; inset-area: bottom span-left; position-area: bottom span-left;"
  onkeydown={handleKeydown}
  ontoggle={handleToggle}
>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div data-jx-bar-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-bar-surface="" class="jx-surface-body p-1">
    {@render children()}
  </div>
</div>
