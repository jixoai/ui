<!--
  jixoai dialog (registry/files/ui/dialog/dialog.svelte).

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

  ROW RULER (r13 + the r14 tuning): the scroll ring (head/body/foot's
  common parent) is a single-column grid whose NAMED ROWS carry the
  dividing lines — Separator components sit in EXPLICIT 1px row tracks
  ([head] [sep-head] [body] [sep-foot] [foot]), edge-to-edge exactly
  where the retired borders sat. Zone presence is resolved here and
  STAMPED (data-sep-head / data-sep-foot on the host — the
  stamped-attribute painting law). THE r14 TUNING (Owner): the
  --jx-dialog-inset token and the [inset 1fr inset] column ruler
  RETIRED — the variable mediated every zone while the real content
  owns its geometry (the head's Input provides the row's height and
  padding; body/foot pad themselves with plain utilities). The head
  zone is FLUSH by default — consumer head snippets span edge-to-edge.
  dialog.css paints stamps only. No-subgrid environments fall back to
  the padding geometry (dialog.css, the law's mandatory fallback).
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { provideEntity } from '$lib/entity.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import './dialog.css';

  interface Props {
    /** Heading shown in the header bar; omit for a chrome-less body. */
    title?: string;
    /** Bindable open state: true -> showModal(), false -> animated close. */
    open?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /**
     * Platform-element utilities appended AFTER the law's own — for
     * GEOMETRY overrides only (a consumer's anchor/width, e.g. the
     * search palette's 14vh top anchor). The platform still paints
     * nothing; anything visual belongs to a variant or the body.
     */
    class?: string;
    /**
     * Replaces the default head row (title + x). The x button is the
     * consumer's to include when it overrides — composition-first.
     */
    head?: Snippet;
    /**
     * Predicate consulted on the native cancel request (Escape):
     * returning TRUE blocks the close (the palette holds the dialog
     * open through an IME composition). The default path is the
     * animated shutdown.
     */
    cancelGuard?: () => boolean;
    /** Dialog body. */
    children: Snippet;
    /** Action area (below the body's separator) — free-form footer. */
    footer?: Snippet;
    /**
     * The actions shortcut face of footer: the snippet's buttons are
     * auto-wrapped in a ButtonGroup (justify end) inside the foot
     * zone. The ghost contract: until ButtonGroup ships its
     * context-passed variant (B batch), the buttons inside SHOULD
     * declare variant="ghost" themselves — the integration point for
     * the group-level default is this ButtonGroup instance. When both
     * footer and actions are passed, actions owns the terminal button
     * cluster (rendered last, at the row's end) and footer renders as
     * the leading content beside it.
     */
    actions?: Snippet;
  }

  let {
    title,
    open = $bindable(false),
    variant = 'auto',
    class: platformClass = '',
    head,
    cancelGuard,
    children,
    footer,
    actions,
  }: Props = $props();

  // THE ENTITY LAW (2026-09-01): the dialog panel IS the solid object —
  // form shells inside dissolve (border + ground transparent; the well
  // inset carries the affordance). provideEntity() accumulates depth,
  // so a dialog nested in a dialog auto-reasserts hairlines at depth 2.
  const entityDepth = provideEntity();

  // Presence resolution (the stamped-attribute painting law): the
  // component resolves which zones exist and stamps; css paints stamps
  // only, never infers from descendant context. The head zone is
  // UNCONDITIONAL (the x-button contract keeps a close affordance on
  // every dialog), so its separator is structural — stamped anyway so
  // the css stays independent of that invariant and the chrome reads
  // off the DOM. The foot zone exists iff either footer face is passed;
  // absent both, the zone AND its separator row simply never render.
  const hasFoot = $derived(footer !== undefined || actions !== undefined);

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
    if (cancelGuard?.() === true) return; // held open (e.g. IME flight)
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
  class="jx-dialog jx-surface m-auto p-0 w-[min(92vw,26rem)] max-w-full text-popover-foreground @container/jx-dialog {motion.supported ? 'jx-waapi' : ''} {platformClass}"
  data-variant={variant}
  data-jx-entity={entityDepth}
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
  <!-- THE RULER HOST (r13): columns [inset 1fr inset] + named separator
       rows; the stamps carry the resolved zone presence -->
  <div
    data-jx-dialog-scroll=""
    data-sep-head=""
    data-sep-foot={hasFoot ? '' : undefined}
    class="jx-surface-scroll max-h-[calc(100dvh-2rem)] overflow-auto"
  >
    <!-- the head zone is FLUSH (the r14 tuning): a consumer head
         snippet (the palette's Input) spans edge-to-edge and owns its
         own geometry; the default title row pads itself -->
    <div data-jx-dialog-head="">
      <!-- the padding belongs to the DEFAULT title row; a consumer head
     snippet renders FLUSH (the r14 law: the snippet's own content
     owns the geometry) -->
<div
      class="flex min-w-0 items-center justify-between gap-3 {head ? '' : 'px-3.5 py-2.5'}"
    >
        {#if head}
          {@render head()}
        {:else if title}
          <h2 data-jx-dialog-title="" class="font-nav text-[15px] leading-[1.3] tracking-[0.01em]">{title}</h2>
        {:else}
          <span data-jx-dialog-title="" aria-hidden="true"></span>
        {/if}
        <button
          type="button"
          class="jx-press jx-dialog-x inline-flex items-center justify-center flex-none size-[30px] p-0 border border-border bg-popover cursor-pointer [&_svg]:stroke-[2.5] [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-sm)] [--jx-press-shadow-active:var(--shadow-sm-press)] hover:bg-[color-mix(in_oklab,var(--popover-foreground)_6%,transparent)]"
          onclick={shut}
          aria-label="Close"
        >
          <!-- glyph from the shared icons module; dialog.css owns its 14px
               descendant scale, the strokier × rides a consuming utility -->
          {@html icons.x}
        </button>
      </div>
    </div>
    <!-- the dividing lines are Separator INSTANCES in their own 1px
         tracks, spanning edge-to-edge (the retired border's extent);
         decorative chrome, hidden from AT -->
    <Separator data-jx-dialog-sep="head" aria-hidden="true" />
    <div data-jx-dialog-body="">
      <div
        class="min-w-0 p-3.5 text-[13px] leading-[1.6] text-[color-mix(in_oklab,var(--popover-foreground)_80%,transparent)]"
      >
        {@render children()}
      </div>
    </div>
    {#if hasFoot}
      <Separator data-jx-dialog-sep="foot" aria-hidden="true" />
      <div data-jx-dialog-foot="">
        <!-- ultra-narrow containers stack the actions in reverse -->
        <div
          class="flex min-w-0 items-center justify-end gap-2.5 px-3.5 py-3 @max-[15rem]/jx-dialog:flex-col-reverse @max-[15rem]/jx-dialog:items-stretch"
        >
          {#if footer}
            {@render footer()}
          {/if}
          {#if actions}
            {#if footer}
              <!-- the ghost contract (Owner r13): between GROUPS exactly
                   one divider — the footer's own cluster and the actions
                   group. Decorative (the ButtonGroupDivider owns the
                   semantic, announced flavor) -->
              <Separator aria-hidden="true" class="self-stretch" />
            {/if}
            <!-- the ghost contract rides the group's context now
                 (ButtonGroup's variant pass-down, r13-B): buttons
                 without an explicit variant adopt ghost -->
            <ButtonGroup justify="end" label="Dialog actions" variant="ghost">
              {@render actions()}
            </ButtonGroup>
          {/if}
        </div>
      </div>
    {/if}
  </div>
  </div>
</dialog>
