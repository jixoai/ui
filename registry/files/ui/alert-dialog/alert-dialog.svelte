<!--
  jixoai alert dialog (registry/files/ui/alert-dialog.svelte).
  The destructive-decision surface on the dialog.svelte laws: a native
  <dialog> with showModal() — focus trap, Escape, top layer, backdrop
  all the platform's; the same generation-token close path (one 120ms
  fade shared by ×/Escape/open=false); bind:open drives the lifecycle.

  What makes it an ALERT dialog (and not dialog.svelte):
    role=alertdialog + aria-labelledby/aria-describedby — title and
    description are REQUIRED here (an alert without words is not an
    alert), and the confirm action is an explicit prop, because the
    destructive decision is the whole point:

      confirmLabel (required)   what agreeing does
      confirmTone='destructive' the default paint — the loud path is
                                 opt-OUT, not opt-in
      onconfirm                  runs, then closes through the shared path

  Keyboard law (APG alertdialog): focus lands on the CANCEL action on
  open — the safe exit is one Tab-less keypress away; Escape cancels
  through the native cancel path. Tab is the modal's (the platform's
  focus trap).

  tw4 (2026-08-24): utility-authored — the platform element keeps its
  geometry-only utilities (it still paints NOTHING; the theme's
  jx-surface-body owns fill + border + blur, the shadow layer the
  shadow), and the body/actions/button paint lives in the markup
  (tone voices are conditional utilities; the press custom properties
  ride arbitrary-property utilities). ONLY the ::backdrop scrim stays
  in alert-dialog.css (D1-exempt residue — the kernel animates its
  opacity via --jx-p, its color is paint).
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './alert-dialog.css';

  interface Props {
    /** REQUIRED for alertdialog: the aria-labelledby target */
    title: string;
    /** REQUIRED for alertdialog: the aria-describedby target */
    description: string;
    /** bindable open state — same contract as dialog.svelte */
    open?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** the agreement action's label — the decision being confirmed */
    confirmLabel: string;
    /** confirm paint; destructive by default (the loud path is opt-out) */
    confirmTone?: 'destructive' | 'primary';
    /** runs on confirm, then the dialog closes through the shared path */
    onconfirm?: () => void;
    /** cancel button label */
    cancelLabel?: string;
    /** extra body below the description (details, warnings) */
    children?: Snippet;
  }

  let {
    title,
    description,
    open = $bindable(false),
    variant = 'auto',
    confirmLabel,
    confirmTone = 'destructive',
    onconfirm,
    cancelLabel = 'Cancel',
    children,
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);

  // the shared declarative motion kernel (r29) — same law as popover
  const motion = createSurfaceMotion(() => dialog);

  onDestroy(() => motion.destroy());

  let cancelEl = $state<HTMLButtonElement | null>(null);

  $effect(() => {
    if (open) {
      if (dialog && !dialog.open) dialog.showModal();
      motion.play(1);
      motion.startTracking();
      // APG: the SAFE action takes focus — the destructive path must be
      // a deliberate move, never the landing spot
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          if (dialog?.open) cancelEl?.focus();
        });
      }
    } else {
      untrack(() => shut());
    }
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

  const confirm = (): void => {
    onconfirm?.();
    shut();
  };

</script>

<dialog
  bind:this={dialog}
  class="jx-adlg jx-surface p-0 w-[min(28rem,calc(100vw-2rem))] text-popover-foreground rounded {motion.supported ? 'jx-waapi' : ''}"
  data-variant={variant}
  role="alertdialog"
  aria-labelledby="jx-adlg-title"
  aria-describedby="jx-adlg-desc"
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- surface body (fill + ::after shadow) wraps ALL content; the
       <dialog> paints nothing (floating-surface law arch r3) -->
  <div class="jx-adlg-shadow jx-surface-shadow" aria-hidden="true"></div>
  <div class="jx-adlg-surface jx-surface-body">
  <div class="jx-adlg-body flex flex-col gap-2.5 px-5 py-[1.125rem]">
    <h2 id="jx-adlg-title" class="jx-adlg-title font-nav text-[0.9375rem] tracking-[0.08em] uppercase text-foreground">{title}</h2>
    <p id="jx-adlg-desc" class="jx-adlg-desc text-[0.8125rem] leading-[1.6] text-muted-foreground">{description}</p>
    {#if children}
      <div class="jx-adlg-extra text-[0.8125rem] leading-[1.6] text-muted-foreground">
        {@render children()}
      </div>
    {/if}
  </div>
  <div class="jx-adlg-actions flex justify-end gap-2.5 px-5 py-3.5 border-t border-border">
    <button
      type="button"
      class="jx-press jx-adlg-cancel appearance-none px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      bind:this={cancelEl}
      onclick={shut}
    >
      {cancelLabel}
    </button>
    <button
      type="button"
      class={cn(
        'jx-press jx-adlg-confirm appearance-none px-4 py-2 border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
        confirmTone === 'destructive'
          ? 'jx-adlg-confirm-destructive border-destructive bg-destructive text-destructive-foreground'
          : 'border-primary text-primary',
      )}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
  </div>
  </div>
</dialog>
