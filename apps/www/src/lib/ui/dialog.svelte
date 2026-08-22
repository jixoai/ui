<!--
  jixoai dialog (registry/files/ui/dialog.svelte).

  NativeHTML base (2026-08-20): the native <dialog> element driven by
  showModal()/close(). The platform supplies the focus trap, the Escape
  key (cancel event), an inert page behind, top-layer rendering, and
  closed-by-default (no-JS page loads never paint dialog contents inline).
  The component adds exactly two things: bindable open state, and a 120ms
  close fade (skipped under prefers-reduced-motion) whose layer choreography
  (surface sinks, shadow presses back) lives in the jx-surface law.

  Floating-surface law (2026-08-22): the panel carries jx-surface — the
  hard offset shadow is a REAL ::after layer, entry runs the
  @starting-style pull-apart, and variant='solid' | 'acrylic' | 'auto'
  picks the paint (auto: acrylic unless the environment asks for reduced
  transparency). The ::backdrop scrim is --scrim: semi-transparent black
  in light mode, white in dark mode — never a brand tint.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    /** Heading shown in the header bar; omit for a chrome-less body. */
    title?: string;
    /** Bindable open state: true -> showModal(), false -> animated close. */
    open?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** Dialog body. */
    children: Snippet;
    /** Action area (top-border slot) — Cancel / Confirm row. */
    footer?: Snippet;
  }

  let { title, open = $bindable(false), variant = 'auto', children, footer }: Props = $props();

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
  class="jx-dialog jx-surface"
  class:closing={closing}
  data-variant={variant}
  aria-label={title}
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- the surface body (fill + acrylic blur + the ::after shadow
       layer) wraps the scroll ring; the <dialog> itself paints nothing
       (floating-surface law arch r3) -->
  <div class="jx-dialog-surface jx-surface-body">
  <div class="jx-dialog-scroll">
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
  </div>
  </div>
</dialog>

<style>
  /* Surface law (arch r3): the <dialog> is the PLATFORM element —
     border + motion only, no paint (the UA sheet's dialog background
     dies here); the .jx-dialog-surface body carries the fill and the
     ::after shadow layer, and never clips. margin: auto restates the
     UA modal centering. */
  .jx-dialog {
    margin: auto;
    padding: 0;
    color: var(--popover-foreground);
    width: min(92vw, 26rem);
    max-width: 100%;
  }
  .jx-dialog-scroll {
    max-height: calc(100dvh - 2rem);
    overflow: auto;
    /* scrollbar law: both-edges gutters (no ring padding to hand back —
       the head/body rows carry their own) */
    scrollbar-gutter: stable both-edges;
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

  /* Scrim law (Owner, 2026-08-22): semi-transparent black in light mode,
     white in dark mode (--scrim) — a scrim dims/lightens, never colors. */
  .jx-dialog::backdrop {
    background: var(--scrim);
  }

  /* Close fade: the jx-surface law styles the panel + shadow layer
     (120ms press-back); only the ::backdrop fade is component-owned. */
  .jx-dialog.closing::backdrop {
    opacity: 0;
    transition: opacity 120ms ease-out;
  }
  /* r18 EXCEPTION: ::backdrop is a pseudo-element — unreachable from
     WAAPI, so the scrim fade stays a CSS transition by necessity */

  @media (prefers-reduced-motion: reduce) {
    .jx-dialog.closing::backdrop {
      transition: none;
    }
    .jx-dialog-x {
      transition: none;
    }
  }
</style>
