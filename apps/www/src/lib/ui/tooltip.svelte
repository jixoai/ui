<!--
  jixoai tooltip (registry/files/ui/tooltip.svelte).
  The hover-intent hint, built the same way as popover.svelte: a native
  Popover API panel (popover="manual" — no light dismiss; the tooltip
  owns its own exit) anchored to the trigger through CSS Anchor
  Positioning, zero JS geometry.

  Intent model (the part CSS alone cannot do — the reason this is a
  component and not a utility class):
    pointerenter → open after openDelay (400ms)     hover intent
    pointerleave → close after closeDelay (100ms)   lets the pointer
                     cross the gap onto the tooltip itself (the panel's
                     own pointerenter cancels the pending close)
    focusin     → open NOW                           keyboard/screen
                     readers never wait for hover timers
    focusout    → close NOW
    Escape      → close NOW (manual popovers skip the native Esc path)
    toggle      → aria mirrors :popover-open, the only open truth

  a11y: the wrapper carries aria-describedby → the panel id permanently;
  hidden popover content is display:none, so assistive tech only reads
  the tip while it is actually shown. Non-interactive by contract — put
  actionable content in a popover, not a tooltip.

  Anchoring, flip fallbacks and anchors-visible scroll hiding follow the
  popover.svelte laws; engines without anchor positioning fall back to
  viewport-center (never worse).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** panel id (aria-describedby pairs the trigger wrapper to the tip);
        auto-generated when omitted */
    id?: string;
    /** the tip itself — plain text; composed content belongs in a popover */
    text: string;
    /** anchored side; 'top' (default) is the tooltip convention */
    placement?: 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
    /** hover-intent open delay (ms); focus opens immediately regardless */
    openDelay?: number;
    /** grace before closing, so the pointer can cross onto the tip */
    closeDelay?: number;
    class?: string;
    /** the trigger content; the wrapper span carries the anchoring */
    children: Snippet;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    text,
    placement = 'top',
    openDelay = 400,
    closeDelay = 100,
    class: className = '',
    children,
  }: Props = $props();

  const anchorName = `--jx-tip-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'top-start' ? 'top span-left'
    : placement === 'top-end' ? 'top span-right'
    : placement === 'bottom' ? 'bottom'
    : placement === 'bottom-start' ? 'bottom span-left'
    : 'bottom span-right'
  );

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

  function onEnter(): void {
    clearTimeout(closeTimer);
    openTimer = setTimeout(open, openDelay);
  }
  function onLeave(): void {
    clearTimeout(openTimer);
    closeTimer = setTimeout(close, closeDelay);
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<span
  class="jx-tip-anchor {className}"
  style="anchor-name: {anchorName}"
  aria-describedby={id}
  onpointerenter={onEnter}
  onpointerleave={onLeave}
  onfocusin={open}
  onfocusout={close}
>
  {@render children()}
</span>

<div
  {id}
  popover="manual"
  role="tooltip"
  class="jx-tip"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={onLeave}
>
  {text}
</div>

<style>
  .jx-tip-anchor {
    display: inline-flex;
  }

  /* Tip law: quiet inverse surface, 1px border, no shadow (hints do not
     press on the page — that weight belongs to interactive panels). */
  .jx-tip {
    position: fixed;
    margin: var(--jx-tip-gap, 6px);
    position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    position-try: flip-block, flip-inline, flip-block flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    max-width: min(80vw, 18rem);
    padding: 5px 9px;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
  }
  @supports not (anchor-name: --jx-tip-fallback) {
    .jx-tip {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      align-self: center;
      justify-self: center;
    }
  }
  .jx-tip::backdrop {
    background: transparent;
  }
</style>
