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
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
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
    variant = 'auto',
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
  let isOpen = $state(false);
  const titleId = $derived(`${id}-title`);
  const descId = $derived(`${id}-desc`);

  /** adopt the wrapper's first button as the declarative trigger —
   *  consumers compose any focusable control; we wire popovertarget
   *  and mirror the open state (aria-expanded/aria-controls) */
  $effect(() => {
    if (!anchorEl) return;
    let btn = anchorEl.querySelector<HTMLButtonElement>(`[popovertarget="${id}"]`);
    if (!btn) {
      btn = anchorEl.querySelector('button:not([popovertarget])');
      btn?.setAttribute('popovertarget', id);
    }
    // BOTH paths carry the pair; the live state mirrors every run
    btn?.setAttribute('aria-controls', id);
    btn?.setAttribute('aria-expanded', String(isOpen));
  });

  function confirm(): void {
    confirmed = true;
    try {
      onconfirm?.();
    } finally {
      hide();
    }
  }
  function hide(): void {
    if (panel && typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
  }

  /** the toggle seam: open focuses cancel; close without confirm = cancel */
  function handleToggle(): void {
    const open = panel?.matches(':popover-open') ?? false;
    isOpen = open;
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
  role="dialog"
  aria-labelledby={titleId}
  aria-describedby={description ? descId : undefined}
  class="jx-pc jx-surface"
  data-variant={variant}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={handleToggle}
>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div class="jx-pc-surface jx-surface-body">
  <p id={titleId} class="jx-pc-title">{title}</p>
  {#if description}
    <p id={descId} class="jx-pc-desc">{description}</p>
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
    color: var(--popover-foreground);
  }
  /* the surface body IS the flex column (padding lives with it); flex
     display sits on the OPEN state only — a base-state display override
     would defeat the UA sheet's closed-popover display:none and leave
     the invisible panel hit-testable (Codex r1, color-picker.svelte
     law). The exit transition still runs — allow-discrete holds the
     open display for the 200ms fade. */
  .jx-pc-surface {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 0.875rem;
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
