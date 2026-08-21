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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';

  interface Props {
    /** REQUIRED for alertdialog: the aria-labelledby target */
    title: string;
    /** REQUIRED for alertdialog: the aria-describedby target */
    description: string;
    /** bindable open state — same contract as dialog.svelte */
    open?: boolean;
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
    confirmLabel,
    confirmTone = 'destructive',
    onconfirm,
    cancelLabel = 'Cancel',
    children,
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let cancelEl = $state<HTMLButtonElement | null>(null);
  let closing = $state(false);
  let closeGen = 0;

  const CLOSE_MS = 120;
  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $effect(() => {
    if (open) {
      closeGen += 1;
      closing = false;
      if (dialog && !dialog.open) dialog.showModal();
      // APG: the SAFE action takes focus — the destructive path must be
      // a deliberate move, never the landing spot
      requestAnimationFrame(() => cancelEl?.focus());
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
    const gen = ++closeGen;
    if (prefersReducedMotion()) {
      closing = false;
      open = false;
      dialog.close();
      return;
    }
    closing = true;
    window.setTimeout(() => {
      if (gen !== closeGen) return;
      closing = false;
      open = false;
      dialog?.close();
    }, CLOSE_MS);
  };

  const confirm = (): void => {
    onconfirm?.();
    shut();
  };
</script>

<dialog
  bind:this={dialog}
  class="jx-adlg"
  class:closing={closing}
  role="alertdialog"
  aria-labelledby="jx-adlg-title"
  aria-describedby="jx-adlg-desc"
  onclose={handleClose}
  oncancel={handleCancel}
>
  <div class="jx-adlg-body">
    <h2 id="jx-adlg-title" class="jx-adlg-title">{title}</h2>
    <p id="jx-adlg-desc" class="jx-adlg-desc">{description}</p>
    {#if children}
      <div class="jx-adlg-extra">
        {@render children()}
      </div>
    {/if}
  </div>
  <div class="jx-adlg-actions">
    <button type="button" class="jx-adlg-cancel" bind:this={cancelEl} onclick={shut}>
      {cancelLabel}
    </button>
    <button
      type="button"
      class="jx-adlg-confirm"
      class:jx-adlg-confirm-destructive={confirmTone === 'destructive'}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
  </div>
</dialog>

<style>
  .jx-adlg {
    box-sizing: border-box;
    width: min(28rem, calc(100vw - 2rem));
    padding: 0;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    border-radius: var(--radius);
  }
  .jx-adlg[open] {
    animation: jx-adlg-in 160ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-adlg.closing {
    animation: jx-adlg-out 120ms ease-in forwards;
  }
  @keyframes jx-adlg-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.99);
    }
  }
  @keyframes jx-adlg-out {
    to {
      opacity: 0;
      transform: translateY(4px);
    }
  }
  .jx-adlg::backdrop {
    background: color-mix(in oklab, var(--primary) 10%, transparent);
  }
  .jx-adlg.closing::backdrop {
    transition: opacity 120ms ease-in;
    opacity: 0.4;
  }

  .jx-adlg-body {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1.125rem 1.25rem;
  }
  .jx-adlg-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.9375rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-adlg-desc {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }
  .jx-adlg-extra {
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }

  .jx-adlg-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.625rem;
    padding: 0.875rem 1.25rem;
    border-top: 1px solid var(--border);
  }
  .jx-adlg-cancel,
  .jx-adlg-confirm {
    appearance: none;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: var(--shadow-2xs);
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-adlg-cancel:hover,
  .jx-adlg-confirm:hover {
    transform: translate(-1px, -1px);
    box-shadow: var(--shadow-xs);
  }
  .jx-adlg-cancel:focus-visible,
  .jx-adlg-confirm:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-adlg-confirm-destructive {
    border-color: var(--destructive);
    background: var(--destructive);
    color: var(--destructive-foreground);
  }
  .jx-adlg-confirm:not(.jx-adlg-confirm-destructive) {
    border-color: var(--primary);
    color: var(--primary);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-adlg[open],
    .jx-adlg.closing {
      animation: none;
    }
  }
</style>
