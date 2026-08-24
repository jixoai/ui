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

  tw4 (2026-08-24): utility-authored — the platform element keeps its
  geometry-only utilities (it still paints NOTHING; fill + border +
  blur stay the theme's jx-surface-body, the shadow the shadow layer),
  and the head/body/foot paint lives in the markup. ONLY the scrim
  pseudo and the x-glyph descendant scale stay in dialog.css
  (D1-exempt residue). The old reduced-motion block died with its
  targets: the WAAPI kernel owns the ::backdrop timeline now (the
  theme's kernel reduced-motion block kills it), and the x button's
  transition chain is the press law's own (jixoai.css).
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import './dialog.css';

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
  class="jx-dialog jx-surface m-auto p-0 w-[min(92vw,26rem)] max-w-full text-popover-foreground {motion.supported ? 'jx-waapi' : ''}"
  data-variant={variant}
  aria-label={title}
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- the REAL shadow layer (a DOM child because pseudo-elements are
       unreachable from the motion timeline) -->
  <div data-jx-dialog-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- the surface body (fill + acrylic blur) wraps the scroll ring; the
       <dialog> itself paints nothing (floating-surface law arch r3) -->
  <div data-jx-dialog-surface="" class="jx-surface-body">
  <div data-jx-dialog-scroll="" class="jx-surface-scroll max-h-[calc(100dvh-2rem)] overflow-auto">
    <div data-jx-dialog-head="" class="flex items-center justify-between gap-3 py-2.5 pr-2.5 pl-3.5 border-b border-border">
      {#if title}
        <h2 data-jx-dialog-title="" class="font-nav text-[15px] leading-[1.3] tracking-[0.01em]">{title}</h2>
      {:else}
        <span data-jx-dialog-title="" aria-hidden="true"></span>
      {/if}
      <button
        type="button"
        class="jx-press jx-dialog-x inline-flex items-center justify-center flex-none size-[30px] p-0 border border-border bg-popover cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-sm)] [--jx-press-shadow-active:var(--shadow-sm-press)] hover:bg-[color-mix(in_oklab,var(--popover-foreground)_6%,transparent)]"
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
    <div data-jx-dialog-body="" class="p-3.5 text-[13px] leading-[1.6] text-[color-mix(in_oklab,var(--popover-foreground)_80%,transparent)]">
      {@render children()}
    </div>
    {#if footer}
      <div data-jx-dialog-foot="" class="flex justify-end gap-2.5 px-3.5 py-3 border-t border-border">
        {@render footer()}
      </div>
    {/if}
  </div>
  </div>
</dialog>
