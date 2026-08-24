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

  tw4 (2026-08-24): utility-authored — anchoring extras ride
  arbitrary-property utilities (position-try/-fallbacks,
  position-visibility); the panel, surface, and button paint (tone
  voices conditional per prop) live in the markup; ONLY the
  ::backdrop and the @supports no-anchor fallback stay in
  popconfirm.css (D1-exempt residue). The platform element still
  paints NOTHING; the theme's jx-surface-body owns fill + border +
  blur, the shadow layer owns the shadow (floating-surface law,
  intact). NO display utility ever lands on the panel itself — a base
  display override would defeat the UA sheet's closed-popover
  display:none (Codex r1, color-picker.svelte law).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './popconfirm.css';

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

<span bind:this={anchorEl} class={cn('jx-pc-anchor inline-flex', className)} style="anchor-name: {anchorName}">
  {#if children}{@render children()}{/if}
</span>

<div
  {id}
  popover="auto"
  role="dialog"
  aria-labelledby={titleId}
  aria-describedby={description ? descId : undefined}
  class="jx-pc jx-surface fixed m-[var(--jx-pc-gap,8px)] [position-try-fallbacks:flip-block,flip-inline] [position-try:flip-block,flip-inline] [position-visibility:anchors-visible] w-fit max-w-[min(88vw,18rem)] text-popover-foreground"
  data-variant={variant}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={handleToggle}
>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div class="jx-pc-surface jx-surface-body flex flex-col gap-2 px-3.5 py-3">
  <p id={titleId} class="jx-pc-title font-nav text-xs tracking-[0.08em] uppercase text-foreground">{title}</p>
  {#if description}
    <p id={descId} class="jx-pc-desc text-[0.8125rem] leading-[1.5] text-muted-foreground">{description}</p>
  {/if}
  <div class="jx-pc-actions flex justify-end gap-2">
    <button
      type="button"
      class="jx-pc-btn jx-pc-cancel appearance-none px-3 py-[5px] border border-border bg-background text-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase cursor-pointer shadow-2xs focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      bind:this={cancelEl}
      onclick={hide}
    >
      {cancelLabel}
    </button>
    <button
      type="button"
      class={cn(
        'jx-pc-btn jx-pc-confirm appearance-none px-3 py-[5px] border border-border bg-background text-foreground font-nav text-[0.6875rem] tracking-[0.1em] uppercase cursor-pointer shadow-2xs focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
        confirmTone === 'destructive'
          ? 'jx-pc-confirm-destructive border-destructive bg-destructive text-destructive-foreground'
          : 'jx-pc-confirm-primary border-primary text-primary',
      )}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
  </div>
  </div>
</div>
