<!--
  jixoai hover card (registry/files/ui/hover-card/hover-card.svelte).
  The rich cousin of tooltip.svelte: same intent model (hover delay in,
  cancellable close grace, focus opens instantly, Escape closes) on a
  popover=manual panel with CSS Anchor Positioning — but the panel is
  INTERACTIVE content, so two laws differ:

    role: NOT role=tooltip — the panel is supplementary rich content
    (user cards, link previews). It carries no imposed role; compose
    headings/links inside. No aria-describedby either: the card is not
    a description of the trigger.

    focus: the close grace spans the PANEL too — pointer/focus inside
    the card cancels any pending close (pointerenter on the panel, and
    a focusout check that treats panel content as inside). Only a real
    exit (pointer leaves both, focus leaves both, Escape) dismisses.

  Delays are hover-card paced: 300ms open, 200ms close grace.
  Non-interactive by necessity? No — interactive BY DESIGN; if you only
  need text, that is what tooltip.svelte is for.

  tw4 (2026-08-24): anchor/body paint as token utilities in the markup;
  hover-card.css keeps ONLY the D1-exempt panel law — anchor geometry
  (the gap margin must stay: the @supports viewport-center fallback
  re-sets it to auto in the same layer), and the transparent ::backdrop.

  Motion kernel (2026-08-25): adopts the shared WAAPI surface-motion
  kernel (lib/surface-motion.ts) — open()/close() drive the --jx-p
  timeline at the show/hide call sites and the live panel↔anchor
  axis; a REAL shadow child (not the ::after pseudo) rides under
  jx-waapi (jixoai.css law).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './hover-card.css';

  interface Props {
    id?: string;
    /** the card content — compose freely (headings, links, images) */
    children: Snippet;
    /** the trigger content; the wrapper span carries the anchoring */
    trigger: Snippet;
    /** anchored side; 'bottom' (under, like a peek) is the convention */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    openDelay?: number;
    closeDelay?: number;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    children,
    trigger,
    placement = 'bottom',
    openDelay = 300,
    closeDelay = 200,
    variant = 'auto',
    class: className = '',
  }: Props = $props();

  // id is mount-stable by contract; $derived keeps the name truthful
  const anchorName = $derived(`--jx-hover-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'left' ? 'left'
    : placement === 'right' ? 'right'
    : 'bottom'
  );

  let anchorEl = $state<HTMLElement | null>(null);
  let panel = $state<HTMLElement | null>(null);
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const popoverApi = (
    el: HTMLElement | null,
  ): el is HTMLElement & { showPopover(): void; hidePopover(): void } =>
    !!el && typeof el.showPopover === 'function';

  // the shared declarative motion kernel (r29) — same law as popover;
  // the live axis measures panel↔anchor (the trigger wrapper)
  const motion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

  function clearTimers(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }

  function open(): void {
    clearTimers();
    if (popoverApi(panel) && !panel!.matches(':popover-open')) {
      panel!.showPopover();
      motion.play(1);
      motion.startTracking();
    }
  }
  function close(): void {
    clearTimers();
    if (popoverApi(panel) && panel!.matches(':popover-open')) {
      panel!.classList.remove('jx-rest');
      motion.play(0);
      motion.stopTracking();
      panel!.hidePopover();
    }
  }

  /** inside = trigger wrapper OR the card panel — exits of one that
   *  land in the other are crossings, not dismissals */
  function inside(node: Node | null): boolean {
    return !!node && ((anchorEl?.contains(node) ?? false) || (panel?.contains(node) ?? false));
  }

  function scheduleClose(): void {
    clearTimeout(openTimer);
    closeTimer = setTimeout(close, closeDelay);
  }

  onDestroy(() => {
    clearTimers();
    motion.destroy();
  });
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper
     carries hover/focus intent only; real interaction lives in the
     focusable trigger the consumer composed inside -->
<span
  bind:this={anchorEl}
  data-jx-hover-anchor=""
  class={cn('inline-flex', className)}
  style="anchor-name: {anchorName}"
  onpointerenter={() => {
    clearTimeout(closeTimer);
    openTimer = setTimeout(open, openDelay);
  }}
  onpointerleave={scheduleClose}
  onfocusin={open}
  onfocusout={(e) => {
    if (!inside(e.relatedTarget)) scheduleClose();
  }}
>
  {@render trigger()}
</span>

<!-- svelte-ignore a11y_no_static_element_interactions -- the panel's
     pointer handlers only cancel the close grace; its interactive
     content is composed by the consumer -->
<div
  {id}
  popover="manual"
  class={cn(
    'jx-hover-card jx-surface fixed w-fit max-w-[min(88vw,20rem)] text-[0.8125rem] leading-[1.55] text-popover-foreground',
    motion.supported && 'jx-waapi',
  )}
  data-variant={variant}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={scheduleClose}
  onfocusin={() => clearTimeout(closeTimer)}
  onfocusout={(e) => {
    if (!inside(e.relatedTarget)) scheduleClose();
  }}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-hover-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div data-jx-hover-body="" class="jx-surface-body px-4 py-[0.875rem]">
    {@render children()}
  </div>
</div>
