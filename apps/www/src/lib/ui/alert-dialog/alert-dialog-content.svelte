<!--
  jixoai AlertDialogContent
  (registry/files/ui/alert-dialog/alert-dialog-content.svelte, 2026-08-25).
  The surface half of the family: the native <dialog> with showModal()
  machinery ported VERBATIM from the closed component — platform focus
  trap, Escape through the native cancel path (prevented, re-routed
  into the animated shut), inert page behind, top-layer rendering,
  closed-by-default, and the 120ms close fade via the shared
  surface-motion kernel. role=alertdialog + aria-labelledby/
  aria-describedby wire the deterministic derived ids Title and
  Description render under (a Content without a Title part is caller
  error — the alertdialog contract).

  On open, focus lands on the CANCEL action (APG safe-landing law),
  looked up DOM-delegated ([data-jx-adlg-cancel] scoped to THIS
  dialog — no registration). Native close paths we did not initiate
  (form method="dialog", an external .close()) are adopted into the
  state so bind:open stays truthful.

  Children = the dialog body: Title, Description, free content, and
  the Actions row (Actions escapes the body padding through negative
  margins so its border spans the surface — visual parity with the
  closed component's two-region layout).

  tw4 (2026-08-24): utility-authored — the platform element keeps its
  geometry-only utilities (it still paints NOTHING; the theme's
  jx-surface-body owns fill + border + blur, the shadow layer the
  shadow). ONLY the ::backdrop scrim stays in alert-dialog.css
  (D1-exempt residue — the kernel animates its opacity via --jx-p).
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';
  import './alert-dialog.css';

  interface Props {
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    children?: Snippet;
    class?: string;
  }

  let { variant = 'auto', children, class: className = '' }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);

  let dialog = $state<HTMLDialogElement | null>(null);

  // the shared declarative motion kernel — same law as dialog.svelte:
  // --jx-p drives every formula; dialog.close() fires IMMEDIATELY on
  // the falling edge, the allow-discrete display window carries the exit
  const motion = createSurfaceMotion(() => dialog);

  onDestroy(() => motion.destroy());

  $effect(() => {
    if (api.open) {
      if (dialog && !dialog.open) dialog.showModal();
      motion.play(1);
      motion.startTracking();
      // APG: the SAFE action takes focus — the destructive path must be
      // a deliberate move, never the landing spot. DOM-delegated lookup
      // scoped to THIS dialog (nested dialogs keep their own landing)
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          if (dialog?.open) {
            dialog.querySelector<HTMLButtonElement>('[data-jx-adlg-cancel]')?.focus();
          }
        });
      }
    } else {
      untrack(() => shut());
    }
  });

  // Native close paths we did not initiate land here — adopt the state
  // so the root's bind:open stays truthful.
  const handleClose = (): void => {
    api.setOpen(false);
  };

  // Escape (the native cancel request) = CANCEL: prevented, re-routed
  // through the shared animated close
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
    'jx-adlg jx-surface p-0 w-[min(28rem,calc(100vw-2rem))] text-popover-foreground rounded',
    motion.supported && 'jx-waapi',
    className,
  )}
  data-variant={variant}
  data-jx-adlg=""
  role="alertdialog"
  aria-labelledby="{api.uid}-title"
  aria-describedby="{api.uid}-desc"
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from the motion timeline -->
  <div data-jx-adlg-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow) wraps ALL content; the
       <dialog> paints nothing (floating-surface law arch r3) -->
  <div data-jx-adlg-surface="" class="jx-surface-body">
    <div data-jx-adlg-body="" class="flex flex-col gap-2.5 px-5 py-[1.125rem]">
      {@render children?.()}
    </div>
  </div>
</dialog>
