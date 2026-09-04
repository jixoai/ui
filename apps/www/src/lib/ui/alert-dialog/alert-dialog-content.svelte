<!--
  jixoai AlertDialogContent
  (registry/files/ui/alert-dialog/alert-dialog-content.svelte;
  popover-engine rebuild, 2026-09-01 — Owner ruling: the alert rises
  BESIDE its trigger, Popover technology as the base).
  The surface half: a popover="manual" panel anchored to the Trigger
  through the CSS Anchor Positioning API (anchor-name on the trigger,
  position-anchor + position-area + position-try on the panel) — the
  alert rises at the button that asked the question, flipping via the
  native try-fallbacks when the viewport edge is near. The old native
  <dialog>+showModal() centering is retired WITH its bug class (the
  missing m-auto that sent the dialog to the top-left corner).

  Manual popover = alert gravity: NO light dismiss (an outside click
  must not silently answer a destructive question); Escape is OURS —
  re-routed into the animated cancel. SCOPING (D-12, 2026-09-02): the
  keydown lives on the panel itself, so Escape cancels while focus is
  INSIDE the panel; the alert is non-modal by design (no trap) — a
  user who tabs back to the page has left the question, and Escape
  there is the page's own. The top layer + ::backdrop scrim
  still come from the platform. role=alertdialog + aria-labelledby/
  aria-describedby wire the deterministic derived ids (a Content
  without a Title part is caller error — the alertdialog contract).

  On open, focus lands on the CANCEL action (APG safe-landing law),
  looked up DOM-delegated. Engines without the popover API (jsdom
  included) degrade to the state alone — the guard keeps everything
  truthful everywhere.
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';
  import { AlertDialogDefaults, type AlertDialogSurfaceVariant } from './alert-dialog-defaults.svelte';
  import './alert-dialog.css';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency). Omitted → the
        contract own 'auto' (AlertDialogDefaults — a declared own, not
        ambient) */
    variant?: AlertDialogSurfaceVariant;
    children?: Snippet;
    class?: string;
  }

  // style is destructured OUT of rest so the consumer's declarations
  // ride AFTER the anchoring style (the Trigger's merge law, :36) —
  // {...rest} before the fix let a consumer style attribute silently
  // drop the anchor geometry (D-4, 2026-09-02)
  let {
    variant,
    children,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.2): one line —
  // the family contract resolves the panel's style props (variant's
  // own 'auto' lives in AlertDialogDefaults, auditable in one place;
  // density is the no-opinion axis slot — nothing stamps, the ambient
  // css scope channel keeps flowing)
  const d = $derived(AlertDialogDefaults.resolve({ variant }));

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);

  let panel = $state<HTMLDivElement | null>(null);

  // the shared declarative motion kernel — same law as popover.svelte:
  // --jx-p drives every formula; hidePopover() fires IMMEDIATELY on the
  // falling edge, the exit rides the kernel's discrete window
  const motion = createSurfaceMotion(() => panel);

  onDestroy(() => motion.destroy());

  $effect(() => {
    if (api.open) {
      // guarded: jsdom (and any popover-less engine) degrades to the
      // state alone — aria-expanded and the wiring stay truthful
      panel?.showPopover?.();
      motion.play(1);
      motion.startTracking();
      // APG: the SAFE action takes focus — the destructive path must be
      // a deliberate move, never the landing spot. DOM-delegated lookup
      // scoped to THIS panel; the rAF re-checks the open state (the
      // popconfirm law — a fast close must not refocus the dead panel)
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          if (panel?.matches(':popover-open')) {
            panel?.querySelector<HTMLButtonElement>('[data-jx-adlg-cancel]')?.focus();
          }
        });
      }
    } else {
      untrack(() => shut());
    }
  });

  // Escape is OURS on a manual popover: the alert cancels through the
  // STATE — the declarative shut below is the family's single closing
  // path (every surface closes the same way: state flips, effect reacts)
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      api.setOpen(false);
    }
  }

  const shut = (): void => {
    if (!panel) return;
    // the anchored alert RETURNS focus to its invoker — only when the
    // focus was ours (a user who tabbed away is not pulled back)
    const hadFocus = panel.contains(panel.ownerDocument.activeElement);
    motion.stopTracking();
    panel.classList.remove('jx-rest');
    motion.play(0);
    panel?.hidePopover?.();
    if (hadFocus) api.restoreInvoker();
  };
</script>

<!-- the panel: margin is SYMMETRIC (all sides, D-13 2026-09-02 — the
     .jx-menu family precedent): a flip-block fallback must find the
     same gap on the flipped side, never stick to the trigger -->
<div
  bind:this={panel}
  popover="manual"
  class={cn(
    'jx-adlg jx-surface p-0 w-[min(24rem,calc(100vw-2rem))] text-popover-foreground rounded',
    motion.supported && 'jx-waapi',
    className,
  )}
  data-variant={d.variant}
  data-jx-adlg=""
  style="position-anchor: --{api.uid}; position-area: block-end; inset-area: block-end; position-try: flip-block, flip-inline, flip-block flip-inline; position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline; margin: var(--jx-gap, 0.5rem); {style}"
  {...rest}
  role="alertdialog"
  aria-labelledby="{api.uid}-title"
  aria-describedby="{api.uid}-desc"
  onkeydown={handleKeydown}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from the motion timeline -->
  <div data-jx-adlg-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow) wraps ALL content; the
       popover element paints nothing (floating-surface law arch r3) -->
  <div data-jx-adlg-surface="" class="jx-surface-body">
    <div data-jx-adlg-body="" class="flex flex-col gap-2.5 px-5 py-[1.125rem]">
      {@render children?.()}
    </div>
  </div>
</div>
