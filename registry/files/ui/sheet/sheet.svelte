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

  tw4 (2026-08-24): utility-authored — edge docking, sizing, and the
  head/body/foot paint live in the markup (side maps to a utility
  string; the body's scrollbar compensation rides an arbitrary-property
  utility next to the theme's jx-surface-scroll gutter law); ONLY the
  slide keyframes + the [open]/.closing animation choreography (a state
  machine utilities cannot order), the ::backdrop rules, and the
  reduced-motion kill stay in sheet.css (D1-exempt residue).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import { cn } from '$lib/utils';
  import './sheet.css';

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

  /** edge docking per side: the margin that hugs the panel to its edge
   *  (inset: 0 + the auto margin on the cross axes pins it there) */
  const dockUtilities = {
    left: 'mr-auto',
    right: 'ml-auto',
    top: 'mb-auto',
    bottom: 'mt-auto',
  } as const;
  /** the docked axis geometry: full-height side panels, full-width
   *  top/bottom panels with a dvh cap */
  const axisUtilities = {
    left: 'h-dvh w-[min(var(--jx-sheet-size),92vw)] max-h-none',
    right: 'h-dvh w-[min(var(--jx-sheet-size),92vw)] max-h-none',
    top: 'w-screen max-w-[100vw] max-h-[85dvh]',
    bottom: 'w-screen max-w-[100vw] max-h-[85dvh]',
  } as const;

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
  class={cn(
    `jx-sheet jx-sheet-${side} jx-surface inset-0 m-0 p-0 rounded-none text-popover-foreground`,
    dockUtilities[side],
    axisUtilities[side],
    closing && 'closing',
  )}
  data-variant={variant}
  aria-label={title}
  style="--jx-sheet-size: {size}"
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- surface body (fill + ::after shadow) wraps the whole drawer; the
       <dialog> paints nothing (floating-surface law arch r3) -->
  <div class="jx-sheet-surface jx-surface-body">
  <div class="jx-sheet-head flex items-center gap-3 px-[1.125rem] py-3.5 border-b border-border">
    <h2 class="jx-sheet-title font-nav text-[0.8125rem] tracking-[0.12em] uppercase text-foreground">{title}</h2>
    {#if header}
      <div class="jx-sheet-head-extra flex flex-1 items-center min-w-0">{@render header()}</div>
    {/if}
    <button
      type="button"
      class="jx-sheet-x flex-none appearance-none inline-flex items-center justify-center size-7 border border-border bg-transparent text-muted-foreground cursor-pointer hover:text-foreground hover:border-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      onclick={shut}
      aria-label="Close"
    >
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
  <div
    class={cn(
      'jx-sheet-body jx-surface-scroll flex flex-col gap-4 overflow-y-auto overscroll-contain pt-[1.125rem] pb-[1.125rem] [padding-inline:max(1.125rem-var(--jx-scrollbar-thin,0px),0px)] text-[0.8125rem] leading-[1.6]',
      (side === 'left' || side === 'right') && 'max-h-[calc(100dvh-4.25rem)]',
    )}
  >
    {@render children()}
  </div>
  {#if footer}
    <div class="jx-sheet-foot flex justify-end gap-2.5 px-[1.125rem] py-3.5 border-t border-border">
      {@render footer()}
    </div>
  {/if}
  </div>
</dialog>
