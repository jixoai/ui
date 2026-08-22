/**
 * Force-show popovers (apps/www/src/lib/blueprints/force-show.ts).
 *
 * Blueprint scenes must render interactive components in their OPEN
 * state — a tooltip/popover/dropdown that renders closed serializes as
 * nothing but its trigger. This Svelte action walks the subtree on
 * mount and calls showPopover() on every [popover] panel, which works
 * for both popover="manual" (tooltip, hover-card) and popover="auto"
 * (select, dropdown) panels: light dismiss only fires on real user
 * interaction, and the headless blueprint pass never interacts.
 *
 * Usage: <div class="h-full w-full" use:forceShowPopovers>…</div>
 */
export function forceShowPopovers(node: HTMLElement): { destroy(): void } {
  const show = (): void => {
    node.querySelectorAll('[popover]').forEach((panel) => {
      try {
        (panel as HTMLElement & { showPopover?(): void }).showPopover?.();
      } catch {
        // already showing / not yet connected — nothing to do
      }
    });
  };
  // two passes: one tick after mount (child components must mount
  // their panels first), plus a later catch for panels that mount
  // delayed (transitions, lazy chunks). MutationObserver would be
  // overkill for a render farm page (Codex r1 suggestion, lightweight)
  const timers = [setTimeout(show, 60), setTimeout(show, 320)];
  return {
    destroy(): void {
      timers.forEach(clearTimeout);
    },
  };
}
