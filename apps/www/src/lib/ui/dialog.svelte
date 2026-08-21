<!--
  jixoai dialog (registry/files/ui/dialog.svelte).

  NativeHTML base (2026-08-20): the native <dialog> element driven by
  showModal()/close(). The platform supplies the focus trap, the Escape
  key (cancel event), an inert page behind, top-layer rendering, and
  closed-by-default (no-JS page loads never paint dialog content inline).
  The component adds exactly two things: bindable open state, and a 120ms
  opacity close fade (skipped under prefers-reduced-motion).

  Deliberately NOT in v1 (extension directions): entry animation
  (@starting-style), backdrop-click close, intercepting
  form method="dialog" submits (those close instantly, no fade).
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Heading shown in the header bar; omit for a chrome-less body. */
    title?: string;
    /** Bindable open state: true -> showModal(), false -> animated close. */
    open?: boolean;
    /** Dialog body. */
    children: Snippet;
    /** Action area (top-border slot) — Cancel / Confirm row. */
    footer?: Snippet;
  }

  let { title, open = $bindable(false), children, footer }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let closing = $state(false);
  // Generation token: a reopen during the 120ms fade supersedes the
  // in-flight close instead of fighting it.
  let closeGen = 0;

  const CLOSE_MS = 120;
  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // state -> element. Rising edge opens; falling edge tears down through
  // the same animated path as the x button and Escape.
  $effect(() => {
    if (open) {
      closeGen += 1;
      closing = false;
      if (dialog && !dialog.open) dialog.showModal();
    } else {
      untrack(() => shut());
    }
  });

  // Native close paths we did not initiate (form method="dialog", an
  // external .close()) land here — adopt the state so bind:open stays
  // truthful. These close instantly; only our own exits run the fade.
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
</script>

<dialog
  bind:this={dialog}
  class="jx-dialog"
  class:closing={closing}
  aria-label={title}
  onclose={handleClose}
  oncancel={handleCancel}
>
  <div class="jx-dialog-head">
    {#if title}
      <h2 class="jx-dialog-title">{title}</h2>
    {:else}
      <span class="jx-dialog-title" aria-hidden="true"></span>
    {/if}
    <button type="button" class="jx-dialog-x" onclick={shut} aria-label="Close">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  </div>
  <div class="jx-dialog-body">
    {@render children()}
  </div>
  {#if footer}
    <div class="jx-dialog-foot">
      {@render footer()}
    </div>
  {/if}
</dialog>

<style>
  /* Surface law: 1px border, hard offset shadow, radius 0 (bevel upgrade
     rides the token sheet, not this component). margin: auto restates the
     UA modal centering. */
  .jx-dialog {
    margin: auto;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    width: min(92vw, 26rem);
    max-width: 100%;
    max-height: calc(100dvh - 2rem);
    overflow: auto;
  }

  .jx-dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 10px 10px 14px;
    border-bottom: 1px solid var(--border);
  }
  .jx-dialog-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 15px;
    line-height: 1.3;
    letter-spacing: 0.01em;
  }

  /* x button: press-button physics at icon scale — hover lifts toward the
     viewer (shadow 2xs -> sm), active presses back into the page. */
  .jx-dialog-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 30px;
    height: 30px;
    padding: 0;
    color: inherit;
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow-2xs);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-dialog-x:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    background: color-mix(in oklab, var(--popover-foreground) 6%, transparent);
  }
  .jx-dialog-x:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-dialog-x svg {
    width: 14px;
    height: 14px;
  }

  .jx-dialog-body {
    padding: 14px;
    font-size: 13px;
    line-height: 1.6;
    color: color-mix(in oklab, var(--popover-foreground) 80%, transparent);
  }

  .jx-dialog-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 14px;
    border-top: 1px solid var(--border);
  }

  /* Brand scrim: the only ::backdrop styling the law allows. */
  .jx-dialog::backdrop {
    background: color-mix(in oklab, var(--primary) 14%, transparent);
  }

  /* Close fade (the component's single motion addition): opacity 120ms on
     the dialog and its backdrop, then a real close(). */
  .jx-dialog.closing {
    opacity: 0;
    transition: opacity 120ms ease-out;
  }
  .jx-dialog.closing::backdrop {
    opacity: 0;
    transition: opacity 120ms ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-dialog.closing,
    .jx-dialog.closing::backdrop {
      transition: none;
    }
    .jx-dialog-x {
      transition: none;
    }
  }
</style>
