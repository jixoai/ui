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

  Motion kernel (2026-08-25): adopts the shared WAAPI surface-motion
  kernel (lib/surface-motion.ts) — the toggle seam drives the --jx-p
  timeline and the live panel↔anchor axis; a REAL shadow child (not
  the ::after pseudo) rides under jx-waapi (jixoai.css law).

  composition-first-apis (2026-08-25, the MILDER ruling — a compact
  confirm popover, not a page dialog): the trigger stays children
  (compose any focusable control); the panel's content area (title/
  description) and action row open to `content` / `actions` snippets
  with the CURRENT rendering as defaults. title/description/
  confirmLabel/cancelLabel survive as default strings only — a content
  override owns the semantics (aria-labelledby follows: the override
  wires its own ids).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { onDestroy } from 'svelte';
  import { provideDensity, resolveDensity, getDensityContext, type Density } from '$lib/density.svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './popconfirm.css';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    density?: Density;
    id?: string;
    /** the question — one line, past-tense verb ("Delete this row?");
     *  DEFAULT rendering only (a content snippet replaces it) */
    title: string;
    /** optional supporting line — DEFAULT rendering only */
    description?: string;
    /** runs on confirm (then closes) */
    onconfirm?: () => void;
    /** runs on ANY non-confirm dismissal (light dismiss included) */
    oncancel?: () => void;
    /** confirm label — DEFAULT rendering only */
    confirmLabel?: string;
    /** cancel label — DEFAULT rendering only */
    cancelLabel?: string;
    /** confirm paint — destructive by default (the loud path is opt-out) */
    confirmTone?: 'destructive' | 'primary';
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** replaces the title/description area (the caller owns semantics) */
    content?: Snippet;
    /** replaces the confirm/cancel action row */
    actions?: Snippet;
    /** the trigger content; the wrapper span carries the anchoring */
    children: Snippet;
    class?: string;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    density,
    title,
    description,
    onconfirm,
    oncancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmTone = 'destructive',
    placement = 'top',
    variant = 'auto',
    content,
    actions,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity));
  provideDensity(() => resolvedDensity);

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
      motion.play(1);
      motion.startTracking();
      requestAnimationFrame(() => {
        if (typeof requestAnimationFrame === 'function' && panel?.matches(':popover-open')) {
          cancelEl?.focus();
        }
      });
    } else {
      panel?.classList.remove('jx-rest');
      motion.play(0);
      motion.stopTracking();
      if (!confirmed) oncancel?.();
    }
  }

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. Wired at the toggle seam above; the live
  // axis measures panel↔anchor (the trigger wrapper)
  const motion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

  onDestroy(() => motion.destroy());
</script>

<span
  bind:this={anchorEl}
  data-jx-pc-anchor=""
  class={cn('inline-flex', className)}
  {...rest}
  data-density={resolvedDensity}
  style="anchor-name: {anchorName}"
>
  {#if children}{@render children()}{/if}
</span>

<div
  {id}
  popover="auto"
  role="dialog"
  aria-labelledby={content ? undefined : titleId}
  aria-describedby={description && !content ? descId : undefined}
  class={cn(
    'jx-pc jx-surface fixed m-[var(--jx-pc-gap,8px)] [position-try-fallbacks:flip-block,flip-inline] [position-try:flip-block,flip-inline] [position-visibility:anchors-visible] w-fit max-w-[min(88vw,18rem)] text-popover-foreground',
    motion.supported && 'jx-waapi',
  )}
  data-variant={variant}
  data-density={resolvedDensity}
  bind:this={panel}
  style="position-anchor: {anchorName}; inset-area: {area}; position-area: {area};"
  ontoggle={handleToggle}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-pc-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div data-jx-pc-surface="" class="jx-surface-body flex flex-col gap-[var(--jx-gap)] px-[var(--jx-inset)] py-[var(--jx-stack)]">
  {#if content}
    {@render content()}
  {:else}
    <p id={titleId} data-jx-pc-title="" class="font-nav text-xs tracking-[0.08em] uppercase text-foreground">{title}</p>
    {#if description}
      <p id={descId} data-jx-pc-desc="" class="text-[0.8125rem] leading-[1.5] text-muted-foreground">{description}</p>
    {/if}
  {/if}
  {#if actions}
    {@render actions()}
  {:else}
    <div data-jx-pc-actions="" class="flex justify-end gap-2">
    <button
      type="button"
      data-jx-pc-btn=""
      data-jx-pc-cancel=""
      class="jx-pc-btn min-h-[var(--jx-hit)] appearance-none border border-border bg-background px-[var(--jx-inset)] text-[var(--jx-text)] leading-[var(--jx-line)] text-foreground font-nav tracking-[0.1em] uppercase cursor-pointer shadow-2xs focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      bind:this={cancelEl}
      onclick={hide}
    >
      {cancelLabel}
    </button>
    <button
      type="button"
      data-jx-pc-btn=""
      data-jx-pc-confirm=""
      data-jx-pc-confirm-destructive={confirmTone === 'destructive' ? '' : undefined}
      data-jx-pc-confirm-primary={confirmTone !== 'destructive' ? '' : undefined}
      class={cn(
        'jx-pc-btn min-h-[var(--jx-hit)] appearance-none border border-border bg-background px-[var(--jx-inset)] text-[var(--jx-text)] leading-[var(--jx-line)] text-foreground font-nav tracking-[0.1em] uppercase cursor-pointer shadow-2xs focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
        confirmTone === 'destructive'
          ? 'border-destructive bg-destructive text-destructive-foreground'
          : 'border-primary text-primary',
      )}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
    </div>
  {/if}
  </div>
</div>
