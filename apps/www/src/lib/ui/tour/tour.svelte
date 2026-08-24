<!--
  jixoai tour (registry/files/ui/tour.svelte).
  The guided walkthrough, implemented EXACTLY against the design
  contract recorded on the recipes page (batch-3 ruling, batch-4
  closure):

    anchoring    the anchor-name on each step's target is a REVERSIBLE
                 LEASE: set on enter, restored (original inline value
                 or removal) on advance/close/unmount — capability
                 wiring in the popovertarget class, never style authoring
    highlight    a target-sized transparent hole + ONE huge box-shadow
                 tint, sized and positioned by CSS anchor + anchor-size()
                 — ZERO geometry JS, no four-block mask; engines without
                 anchor positioning degrade to a tint with NO hole (the
                 panel still anchors where it can, never silently fixed)
    surface      popover="manual" + role="dialog" + aria-modal="false" —
                 NON-MODAL: no focus trap, no inert, the page scrolls;
                 the default scrim is pointer-events:none (a visual hint,
                 not a blockade — a modal/guided mode would be its own
                 future surface, deliberately not mixed in here)
    targets      re-resolved EVERY step (selector or resolver fn);
                 invalid selectors are caught; a missing/hidden target
                 is UNAVAILABLE → deterministic forward skip; when every
                 step is unavailable the tour ends via onfinish; a target
                 merely out of view is scrolled to with
                 scrollIntoView({block:'nearest'}) — no geometry reads
    keyboard     ←/→ step, Enter = next, Escape/Skip = finish; open
                 focuses NEXT; finishing restores the invoker's focus
    SSR          nothing renders until open

  Floating-surface law (2026-08-22): the card rides .jx-surface (::after
  shadow layer, @starting-style pull-apart entry, variant solid|acrylic|
  auto). KNOWN GAP (accepted): the {#if open && step} wrapper removes the
  node on close, so the allow-discrete exit choreography never runs — the
  tour closes instantly, exactly as it did before the law. Rewiring the
  render guard to keep the node through the exit is a future change.
-->
<script lang="ts">
  import { untrack } from 'svelte';

  export interface TourStep {
    /** CSS selector for the step's target, or a resolver (invalid
     *  selectors are caught — the step reads as unavailable) */
    target: string | (() => HTMLElement | null);
    title: string;
    description?: string;
  }

  interface Props {
    steps: TourStep[];
    /** bindable open state — the tour runs while true */
    open?: boolean;
    /** zero-based first step (skipped-forward past unavailable ones) */
    startAt?: number;
    /** fires when the tour finishes (end reached, skipped, or all steps
     *  unavailable) with the step index it stopped on */
    onfinish?: (index: number) => void;
    /** step change notification (analytics/progress) */
    onstep?: (index: number) => void;
    nextLabel?: string;
    prevLabel?: string;
    skipLabel?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: 'solid' | 'acrylic' | 'auto';
    class?: string;
  }

  const autoId = $props.id();
  /** the per-instance lease name set on the CURRENT target */
  const leaseName = `--jx-tour-${autoId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  let {
    steps,
    open = $bindable(false),
    startAt = 0,
    onfinish,
    onstep,
    nextLabel = 'Next',
    prevLabel = 'Back',
    skipLabel = 'Skip tour',
    variant = 'auto',
    class: className = '',
  }: Props = $props();

  let index = $state(0);
  /** the resolved element of the CURRENT step (null = unavailable) */
  let targetEl = $state<HTMLElement | null>(null);
  let finished = false;
  let panelEl = $state<HTMLElement | null>(null);
  let nextEl = $state<HTMLButtonElement | null>(null);

  // the manual popover needs its explicit show — the panel is in the
  // top layer while the tour renders, hidden on removal. Open/step
  // change moves the focus onto NEXT (the contract's landing spot;
  // non-modal — no trap, the user may Tab away)
  $effect(() => {
    // index is a dep: EVERY step change re-lands the focus on Next
    // (the same panel persists across steps — open alone won't re-run)
    if (!(open && panelEl) || index < 0) return;
    if (typeof panelEl.showPopover === 'function' && !panelEl.matches(':popover-open')) {
      panelEl.showPopover();
    }
    requestAnimationFrame(() => {
      if (typeof requestAnimationFrame === 'function' && panelEl?.matches(':popover-open')) {
        nextEl?.focus();
      }
    });
    return () => {
      if (panelEl && typeof panelEl.hidePopover === 'function' && panelEl.matches(':popover-open')) {
        panelEl.hidePopover();
      }
    };
  });

  const step = $derived(steps[index]);
  /** Back is honest: disabled when NO earlier step is enterable */
  const canPrev = $derived.by(() => {
    for (let i = index - 1; i >= 0; i--) {
      if (!isUnavailable(resolve(steps[i]!))) return true;
    }
    return false;
  });
  const invokerFocus = { el: null as HTMLElement | null };

  /** resolve a step's target; invalid selectors read as unavailable */
  function resolve(current: TourStep): HTMLElement | null {
    try {
      if (typeof current.target === 'function') return current.target();
      return document.querySelector<HTMLElement>(current.target);
    } catch {
      return null;
    }
  }

  /** a hidden/unrendered target is as unavailable as a missing one.
   *  offsetParent is null for EVERYTHING in layout-less engines (jsdom),
   *  so: the hidden attribute always counts, and checkVisibility only
   *  where the engine actually implements it */
  function isUnavailable(el: HTMLElement | null): boolean {
    if (el === null || !el.isConnected || el.hidden) return true;
    if (typeof el.checkVisibility === 'function') return !el.checkVisibility();
    return false;
  }

  // the lease: one target at a time, held BY REFERENCE (a document
  // query could miss shadow/detached holders), restored on every change
  let leasedEl: HTMLElement | null = null;
  function lease(el: HTMLElement): void {
    release();
    leasedEl = el;
    el.dataset.jxTourPriorAnchor = el.style.anchorName;
    el.style.anchorName = leaseName;
    // bring the target into view without reading geometry
    el.scrollIntoView({ block: 'nearest' });
  }
  function release(): void {
    if (!leasedEl) return;
    const prior = leasedEl.dataset.jxTourPriorAnchor;
    if (prior === undefined || prior === '') leasedEl.style.removeProperty('anchor-name');
    else leasedEl.style.anchorName = prior;
    delete leasedEl.dataset.jxTourPriorAnchor;
    if (leasedEl.getAttribute('style') === '') leasedEl.removeAttribute('style');
    leasedEl = null;
  }

  /** enter a step: resolve, skip past unavailable steps in the travel
   *  direction (forward by default, backward for prev), finish when
   *  none remain — deterministic in one pass */
  function enterStep(next: number, direction: 1 | -1 = 1): void {
    index = next;
    const order =
      direction === 1
        ? steps.map((_, i) => i).slice(next)
        : steps
            .map((_, i) => i)
            .slice(0, next + 1)
            .reverse();
    for (const i of order) {
      const el = resolve(steps[i]!);
      if (!isUnavailable(el)) {
        index = i;
        targetEl = el;
        lease(el);
        onstep?.(i);
        return;
      }
    }
    // every step in the travel direction unavailable → finish
    finish(direction === 1 ? steps.length - 1 : 0);
  }

  function finish(stoppedAt: number): void {
    if (finished) return;
    finished = true;
    release();
    targetEl = null;
    open = false;
    onfinish?.(stoppedAt);
    invokerFocus.el?.focus();
  }

  function next(): void {
    if (index >= steps.length - 1) {
      finish(index);
      return;
    }
    enterStep(index + 1);
  }
  function prev(): void {
    // parity with the disabled Back button: no enterable earlier step ⇒
    // a no-op, NEVER an accidental finish
    if (!canPrev) return;
    enterStep(index - 1, -1);
  }

  // lifecycle: open → enter the start step; close → release + restore
  $effect(() => {
    if (open) {
      finished = false;
      invokerFocus.el = untrack(() => document.activeElement as HTMLElement | null);
      enterStep(Math.max(0, Math.min(startAt, steps.length - 1)));
    } else {
      untrack(() => {
        release();
        targetEl = null;
      });
    }
  });

  $effect(() => () => release());

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      next();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      finish(index);
    }
  }
</script>

{#if open && step}
  <!-- the hole: target-sized via CSS anchor-size, ONE huge shadow tint -->
  <div
    class="jx-tour-hole"
    class:jx-tour-hole-anchored={targetEl !== null}
    style="position-anchor: {leaseName}"
    aria-hidden="true"
  ></div>

  <div
    {autoId}
    popover="manual"
    role="dialog"
    tabindex="-1"
    aria-modal="false"
    aria-label={step.title}
    class="jx-tour jx-surface {className}"
    data-variant={variant}
    style="position-anchor: {leaseName}"
    bind:this={panelEl}
    onkeydown={handleKeydown}
  >
    <!-- surface body (fill + ::after shadow); the popover element paints
         nothing (floating-surface law arch r3) -->
    <div class="jx-tour-surface jx-surface-body">
    <p class="jx-tour-title">{step.title}</p>
    {#if step.description}
      <p class="jx-tour-desc">{step.description}</p>
    {/if}
    <div class="jx-tour-meta" aria-hidden="true">{index + 1} / {steps.length}</div>
    <div class="jx-tour-actions">
      <button type="button" class="jx-tour-skip" onclick={() => finish(index)}>{skipLabel}</button>
      <div class="jx-tour-nav">
        <button type="button" class="jx-tour-btn" disabled={!canPrev} onclick={prev}>
          {prevLabel}
        </button>
        <button
          type="button"
          class="jx-tour-btn jx-tour-next"
          bind:this={nextEl}
          onclick={next}
        >
          {index >= steps.length - 1 ? 'Finish' : nextLabel}
        </button>
      </div>
    </div>
    </div>
  </div>
{/if}

<style>
  /* the hole anchors to the leased target: sized by anchor-size,
     tinted by one huge box-shadow — zero geometry JS. Without anchor
     positioning support: a plain full-viewport tint, no hole. */
  .jx-tour-hole {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: color-mix(in oklab, var(--background) 55%, transparent);
  }
  @supports (anchor-name: --jx-tour-support) and (width: anchor-size(width)) {
    .jx-tour-hole-anchored {
      inset: auto;
      top: anchor(top);
      left: anchor(left);
      width: anchor-size(width);
      height: anchor-size(height);
      background: transparent;
      border: 1px solid var(--primary);
      box-shadow: 0 0 0 100vmax color-mix(in oklab, var(--background) 55%, transparent);
    }
  }

  /* panel by anchor() functions — the SAME primitives the hole uses
     (inset-area is unsupported in engines where anchor() works; the
     walkthrough-5 geometry probe proved function positioning reliable) */
  /* PLATFORM element (floating-surface law arch r3): anchoring + motion
     only, no paint; the surface body carries fill/flex/padding and the
     ::after shadow layer */
  .jx-tour {
    position: fixed;
    top: calc(anchor(bottom) + var(--jx-tour-gap, 12px));
    left: anchor(left);
    width: fit-content;
    max-width: min(88vw, 20rem);
    color: var(--popover-foreground);
  }
  .jx-tour-surface {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
  }
  @supports not (anchor-name: --jx-tour-support) {
    .jx-tour {
      position-anchor: auto !important;
      inset: 0;
      margin: auto 1rem auto auto;
      align-self: center;
    }
  }
  .jx-tour::backdrop {
    background: transparent;
  }

  .jx-tour-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.8125rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-tour-desc {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--muted-foreground);
  }
  .jx-tour-meta {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--muted-foreground);
  }
  .jx-tour-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }
  .jx-tour-skip {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: underline dotted;
    cursor: pointer;
  }
  .jx-tour-skip:hover {
    color: var(--foreground);
  }
  .jx-tour-nav {
    display: flex;
    gap: 0.5rem;
  }
  .jx-tour-btn {
    appearance: none;
    padding: 0.375rem 0.875rem;
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
  .jx-tour-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .jx-tour-btn:focus-visible,
  .jx-tour-skip:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-tour-next {
    border-color: var(--primary);
    color: var(--primary);
  }
</style>
