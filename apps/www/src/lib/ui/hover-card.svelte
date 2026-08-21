<!--
  jixoai hover card (registry/files/ui/hover-card.svelte).
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
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';

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

  function clearTimers(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }

  function open(): void {
    clearTimers();
    if (popoverApi(panel) && !panel!.matches(':popover-open')) panel!.showPopover();
  }
  function close(): void {
    clearTimers();
    if (popoverApi(panel) && panel!.matches(':popover-open')) panel!.hidePopover();
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

  onDestroy(clearTimers);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper
     carries hover/focus intent only; real interaction lives in the
     focusable trigger the consumer composed inside -->
<span
  bind:this={anchorEl}
  class="jx-hover-anchor {className}"
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
  class="jx-hover-card"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={scheduleClose}
  onfocusin={() => clearTimeout(closeTimer)}
  onfocusout={(e) => {
    if (!inside(e.relatedTarget)) scheduleClose();
  }}
>
  {@render children()}
</div>

<style>
  .jx-hover-anchor {
    display: inline-flex;
  }

  .jx-hover-card {
    position: fixed;
    margin: var(--jx-hover-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    max-width: min(88vw, 20rem);
    padding: 0.875rem 1rem;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  @supports not (anchor-name: --jx-hover-fallback) {
    .jx-hover-card {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      align-self: center;
      justify-self: center;
    }
  }
  .jx-hover-card::backdrop {
    background: transparent;
  }
</style>
