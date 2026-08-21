<!--
  jixoai popconfirm (registry/files/ui/popconfirm.svelte).
  The LIGHT confirm bubble for risky-but-reversible actions (antd's
  highest-frequency unique gift), per the antd batch-1 ruling: a
  popover=auto panel on the popover laws — NOT an alertdialog. The
  modal weight stays with alert-dialog; this is the quick "sure?" that
  deletes a row without ceremony.

  Semantics:
    light dismiss (outside click / Escape) = CANCEL — any dismissal
    that is not the confirm button runs oncancel; confirm runs
    onconfirm then closes. Focus lands on CANCEL on open (the safe
    action, the alert-dialog law in its light form). The trigger is
    whatever focusable control you compose inside; the wrapper carries
    the anchor name.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    id?: string;
    /** the question — one line, past-tense verb ("Delete this row?") */
    title: string;
    /** optional supporting line */
    description?: string;
    /** runs on confirm (then closes) */
    onconfirm?: () => void;
    /** runs on ANY non-confirm dismissal (light dismiss included) */
    oncancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    /** confirm paint — destructive by default (the loud path is opt-out) */
    confirmTone?: 'destructive' | 'primary';
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** the trigger content; the wrapper span carries the anchoring */
    children: Snippet;
    class?: string;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    title,
    description,
    onconfirm,
    oncancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmTone = 'destructive',
    placement = 'top',
    children,
    class: className = '',
  }: Props = $props();

  const anchorName = $derived(`--jx-pc-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'bottom' ? 'bottom'
    : placement === 'left' ? 'left'
    : 'right'
  );

  let panel = $state<HTMLElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);
  let cancelEl = $state<HTMLButtonElement | null>(null);
  let confirmed = false;

  /** adopt the wrapper's first button as the declarative trigger —
   *  consumers compose any focusable control; we wire popovertarget */
  $effect(() => {
    if (!anchorEl) return;
    const btn = anchorEl.querySelector('button:not([popovertarget])');
    btn?.setAttribute('popovertarget', id);
  });

  function confirm(): void {
    confirmed = true;
    onconfirm?.();
    hide();
  }
  function hide(): void {
    if (panel && typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
  }

  /** the toggle seam: open focuses cancel; close without confirm = cancel */
  function handleToggle(): void {
    const open = panel?.matches(':popover-open') ?? false;
    if (open) {
      confirmed = false;
      requestAnimationFrame(() => {
        if (typeof requestAnimationFrame === 'function' && panel?.matches(':popover-open')) {
          cancelEl?.focus();
        }
      });
    } else if (!confirmed) {
      oncancel?.();
    }
  }
</script>

<span bind:this={anchorEl} class="jx-pc-anchor {className}" style="anchor-name: {anchorName}">
  {#if children}{@render children()}{/if}
</span>

<div
  {id}
  popover="auto"
  class="jx-pc"
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={handleToggle}
>
  <p class="jx-pc-title">{title}</p>
  {#if description}
    <p class="jx-pc-desc">{description}</p>
  {/if}
  <div class="jx-pc-actions">
    <button type="button" class="jx-pc-btn jx-pc-cancel" bind:this={cancelEl} onclick={hide}>
      {cancelLabel}
    </button>
    <button
      type="button"
      class="jx-pc-btn jx-pc-confirm"
      class:jx-pc-confirm-destructive={confirmTone === 'destructive'}
      class:jx-pc-confirm-primary={confirmTone === 'primary'}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
  </div>
</div>

<style>
  .jx-pc-anchor {
    display: inline-flex;
  }
  .jx-pc {
    position: fixed;
    margin: var(--jx-pc-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline;
    position-try: flip-block, flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    max-width: min(88vw, 18rem);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
  }
  @supports not (anchor-name: --jx-pc-fallback) {
    .jx-pc {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      align-self: center;
      justify-self: center;
    }
  }
  .jx-pc::backdrop {
    background: transparent;
  }
  .jx-pc-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-pc-desc {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--muted-foreground);
  }
  .jx-pc-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  .jx-pc-btn {
    appearance: none;
    padding: 0.3125rem 0.75rem;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: var(--shadow-2xs);
  }
  .jx-pc-btn:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-pc-confirm-destructive {
    border-color: var(--destructive);
    background: var(--destructive);
    color: var(--destructive-foreground);
  }
  .jx-pc-confirm-primary {
    border-color: var(--primary);
    color: var(--primary);
  }
</style>
