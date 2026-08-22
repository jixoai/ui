<!--
  jixoai sheet (registry/files/ui/sheet.svelte).
  The side drawer on the dialog.svelte laws — a POSITIONING/ANIMATION
  variant of the native <dialog>, not a second state machine: showModal()
  (focus trap, Escape, top layer, backdrop), the same generation-token
  close path, bind:open driving the lifecycle. What changes is where the
  panel sits and how it arrives:

    side: 'left'|'right' (default) |'top'|'bottom' — the panel docks to
    that edge, full-length, and slides in along its axis. The entrance
    is a CSS transform from off-screen (no JS geometry: margin: auto
  centers; edge docking uses inset + translate).

  Notable laws carried over verbatim from dialog.svelte: Escape goes
  through the cancel event and shares the animated close path; a reopen
  during the slide-out supersedes it (generation token); backdrop click
  is NOT wired (deliberate: sheet content is often a form — a stray
  click outside shouldn't destroy it; close via ×, Escape, or your own
  footer action).

  header/footer are optional snippet slots; children is the body.

  Floating-surface law (2026-08-22): the panel rides .jx-surface (::after
  shadow layer, @starting-style entry, variant solid|acrylic|auto) ON TOP
  of the side slide — transform (the slide) and translate (the law's
  rise) compose. DECLARED TIMING EXCEPTION: the sheet keeps its own
  200ms for entry, exit, and the ::backdrop fade (CLOSE_MS=200); the
  dialog-family default is 120ms (Codex r2 — declared, not accidental).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';

  interface Props {
    /** bindable open state — same contract as dialog.svelte */
    open?: boolean;
    /** the edge the panel docks to; slides along that edge's axis */
    side?: 'left' | 'right' | 'top' | 'bottom';
    /** REQUIRED a11y: the dialog's name (aria-labelledby target) */
    title: string;
    /** panel body */
    children: Snippet;
    /** optional header row content (beyond the title + ×) */
    header?: Snippet;
    /** optional sticky footer (action row) */
    footer?: Snippet;
    /** drawer width for left/right (CSS length); default 24rem */
    size?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
  }

  let {
    open = $bindable(false),
    side = 'right',
    title,
    children,
    header,
    footer,
    size = '24rem',
    variant = 'auto',
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);
  let closing = $state(false);
  let closeGen = 0;

  const CLOSE_MS = 200;
  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $effect(() => {
    if (open) {
      closeGen += 1;
      closing = false;
      if (dialog && !dialog.open) dialog.showModal();
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
</script>

<dialog
  bind:this={dialog}
  class="jx-sheet jx-sheet-{side} jx-surface"
  class:closing={closing}
  data-variant={variant}
  aria-label={title}
  style="--jx-sheet-size: {size}"
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- surface body (fill + ::after shadow) wraps the whole drawer; the
       <dialog> paints nothing (floating-surface law arch r3) -->
  <div class="jx-sheet-surface jx-surface-body">
  <div class="jx-sheet-head">
    <h2 class="jx-sheet-title">{title}</h2>
    {#if header}
      <div class="jx-sheet-head-extra">{@render header()}</div>
    {/if}
    <button type="button" class="jx-sheet-x" onclick={shut} aria-label="Close">
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
  <div class="jx-sheet-body">
    {@render children()}
  </div>
  {#if footer}
    <div class="jx-sheet-foot">
      {@render footer()}
    </div>
  {/if}
  </div>
</dialog>

<style>
  /* edge docking: the dialog element hugs its side and spans the cross
     axis; movement is a translate along the docked axis */
  .jx-sheet {
    box-sizing: border-box;
    padding: 0;
    /* kill the UA dialog inset/margin defaults first — every side then
       positions explicitly (Codex r1: UA defaults vary across engines).
       PLATFORM element only — no paint (floating-surface law arch r3):
       the .jx-sheet-surface body carries the fill and the shadow. */
    inset: 0;
    margin: 0;
    color: var(--popover-foreground);
    border-radius: var(--radius);
  }
  .jx-sheet-left,
  .jx-sheet-right {
    height: 100dvh;
    width: min(var(--jx-sheet-size), 92vw);
    max-height: none;
  }
  .jx-sheet-left {
    margin: 0 auto 0 0;
    border-radius: 0;
  }
  .jx-sheet-right {
    margin: 0 0 0 auto;
    border-radius: 0;
  }
  .jx-sheet-top,
  .jx-sheet-bottom {
    width: 100vw;
    max-width: 100vw;
    max-height: 85dvh;
  }
  .jx-sheet-top {
    margin: 0 0 auto 0;
    border-radius: 0;
  }
  .jx-sheet-bottom {
    margin: auto 0 0 0;
    border-radius: 0;
  }

  /* r18 EXCEPTION: CSS keyframes remain here — the sheet has no WAAPI
     kernel yet; when it adopts one, these migrate to the kernel like
     popover's did (all-animated-styling-to-WAAPI ruling) */
  /* the slide: enter from off-screen along the docked axis, exit back */
  .jx-sheet-left[open] {
    animation: jx-sheet-in-left 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-sheet-left.closing {
    animation: jx-sheet-out-left 200ms ease-in forwards;
  }
  .jx-sheet-right[open] {
    animation: jx-sheet-in-right 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-sheet-right.closing {
    animation: jx-sheet-out-right 200ms ease-in forwards;
  }
  .jx-sheet-top[open] {
    animation: jx-sheet-in-top 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-sheet-top.closing {
    animation: jx-sheet-out-top 200ms ease-in forwards;
  }
  .jx-sheet-bottom[open] {
    animation: jx-sheet-in-bottom 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-sheet-bottom.closing {
    animation: jx-sheet-out-bottom 200ms ease-in forwards;
  }
  @keyframes jx-sheet-in-left { from { transform: translateX(-100%); } }
  @keyframes jx-sheet-out-left { to { transform: translateX(-100%); } }
  @keyframes jx-sheet-in-right { from { transform: translateX(100%); } }
  @keyframes jx-sheet-out-right { to { transform: translateX(100%); } }
  @keyframes jx-sheet-in-top { from { transform: translateY(-100%); } }
  @keyframes jx-sheet-out-top { to { transform: translateY(-100%); } }
  @keyframes jx-sheet-in-bottom { from { transform: translateY(100%); } }
  @keyframes jx-sheet-out-bottom { to { transform: translateY(100%); } }

  /* scrim law: --scrim — semi-transparent black (light) / white
     (dark), never a brand tint. The jx-surface law adds the rise+fade
     on top of the side slide (transform and translate compose); the
     close press-back runs at the sheet's own 200ms, not the law's
     120ms dialog default (CLOSE_MS alignment). */
  .jx-sheet::backdrop {
    background: var(--scrim);
  }
  /* the unified exit choreography compressed to the sheet's own
     CLOSE_MS (the law reads --jx-surface-exit-ms) */
  .jx-sheet.closing {
    --jx-surface-exit-ms: 200ms;
  }
  .jx-sheet.closing::backdrop {
    transition: opacity 200ms ease-in;
    opacity: 0;
  }

  .jx-sheet-head {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.125rem;
    border-bottom: 1px solid var(--border);
  }
  .jx-sheet-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.8125rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-sheet-head-extra {
    display: flex;
    flex: 1;
    align-items: center;
    min-width: 0;
  }
  .jx-sheet-x {
    flex: none;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
  }
  .jx-sheet-x:hover {
    color: var(--foreground);
    border-color: var(--primary);
  }
  .jx-sheet-x:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-sheet-x svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .jx-sheet-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* scrollbar law: both-edges gutters; padding-inline hands the gutter back */
    scrollbar-gutter: stable both-edges;
    padding-block: 1.125rem;
    padding-inline: max(1.125rem - var(--jx-scrollbar-thin, 0px), 0px);
    overflow-y: auto;
    overscroll-behavior: contain;
    font-size: 0.8125rem;
    line-height: 1.6;
  }
  .jx-sheet-left .jx-sheet-body,
  .jx-sheet-right .jx-sheet-body {
    max-height: calc(100dvh - 4.25rem);
  }
  .jx-sheet-foot {
    display: flex;
    justify-content: flex-end;
    gap: 0.625rem;
    padding: 0.875rem 1.125rem;
    border-top: 1px solid var(--border);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-sheet[open],
    .jx-sheet.closing {
      animation: none;
    }
  }
</style>
