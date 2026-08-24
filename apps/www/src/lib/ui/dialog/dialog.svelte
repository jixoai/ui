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
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';

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

  // the shared declarative motion kernel (r29): the dialog rides the
  // SAME timeline law as the popover — --jx-p drives every formula in
  // jixoai.css (blurIn/slide/materials/shadow + the ::backdrop scrim's
  // opacity). No anchor: a centered dialog's axis IS the project
  // default (bottom-right). dialog.close() fires IMMEDIATELY on the
  // falling edge — the allow-discrete display window holds the panel
  // rendered through the whole exit, exactly like hidePopover
  const motion = createSurfaceMotion(() => dialog);

  // state -> element. Rising edge opens; falling edge tears down
  // through the same animated path as the x button and Escape.
  $effect(() => {
    if (open) {
      if (dialog && !dialog.open) dialog.showModal();
      motion.play(1);
      motion.startTracking();
    } else {
      untrack(() => shut());
    }
  });

  onDestroy(() => motion.destroy());

  // Native close paths we did not initiate (form method="dialog", an
  // external .close()) land here — adopt the state so bind:open stays
  // truthful.
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
    dialog.close(); // the discrete window carries the exit
  };
</script>

<dialog
  bind:this={dialog}
  class="jx-dialog jx-surface {motion.supported ? 'jx-waapi' : ''}"
  data-variant={variant}
  aria-label={title}
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- the REAL shadow layer (a DOM child because pseudo-elements are
       unreachable from the motion timeline) -->
  <div class="jx-dialog-shadow jx-surface-shadow" aria-hidden="true"></div>
  <!-- the surface body (fill + acrylic blur) wraps the scroll ring; the
       <dialog> itself paints nothing (floating-surface law arch r3) -->
  <div class="jx-dialog-surface jx-surface-body">
  <div class="jx-dialog-scroll">
    <div class="jx-dialog-head">
      {#if title}
        <h2 class="jx-dialog-title">{title}</h2>
      {:else}
        <span class="jx-dialog-title" aria-hidden="true"></span>
      {/if}
      <button type="button" class="jx-press jx-dialog-x" onclick={shut} aria-label="Close">
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

  /* x button: press law at icon scale (2xs rest pose, sm hover) */
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
    --jx-press-shadow: var(--shadow-2xs);
    --jx-press-shadow-hover: var(--shadow-sm);
    --jx-press-shadow-active: var(--shadow-sm-press);
    cursor: pointer;
  }
  .jx-dialog-x:hover {
    background: color-mix(in oklab, var(--popover-foreground) 6%, transparent);
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
