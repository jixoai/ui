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

  tw4 (2026-08-24): title/desc/actions paint as token utilities in the
  markup (canPrev and last-step states are JS-known → conditional
  strings); tour.css keeps the D1-exempt geometry — the anchor-size()
  hole (its @supports form re-sets inset/background, so no inset or
  background utility may ride the hole), the panel's anchor() placement
  (+ @supports fallback), and ::backdrop.

  Motion kernel (2026-08-25): adopts the shared WAAPI surface-motion
  kernel (lib/surface-motion.ts) — the open $effect drives the --jx-p
  timeline at showPopover/hidePopover (tour start/end only; step moves
  ride the live axis, anchored to the leased target); a REAL shadow
  child (not the ::after pseudo) rides under jx-waapi (jixoai.css law).
  The KNOWN GAP above still applies to the exit: the {#if} unmount can
  race the 460ms window.

  composition-first-apis (2026-08-25): steps[{target,title?,description?}]
  stay (targets are behavior-domain data, driver.js precedent; title/
  description are METADATA consumed by the DEFAULT card). `card` is the
  structural escape — a snippet receiving TourApi {index, total, step,
  next, prev, skip} — callers author the whole card interior (buttons
  included; the label props died with the closed card). The default
  rendering (the current card) remains when absent; with a custom card
  the panel itself takes the landing focus (no Next button exists).
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './tour.css';

  export interface TourStep {
    /** CSS selector for the step's target, or a resolver (invalid
     *  selectors are caught — the step reads as unavailable) */
    target: string | (() => HTMLElement | null);
    /** metadata for the DEFAULT card rendering (a custom card snippet
     *  receives it on api.step — render it or ignore it) */
    title?: string;
    description?: string;
  }

  /** the card snippet's API surface (composition-first-apis) */
  export interface TourApi {
    /** zero-based index of the current step */
    readonly index: number;
    /** steps.length */
    readonly total: number;
    /** the current step object (its title/description are yours to
     *  render or ignore) */
    readonly step: TourStep;
    /** advance (finishes on the last step) */
    next(): void;
    /** back (no-op when no earlier step is enterable) */
    prev(): void;
    /** end the tour now (the Escape path) */
    skip(): void;
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
    /** replaces the default card interior — receives TourApi; the
     *  default rendering (title/description/meta/nav) stays when absent */
    card?: Snippet<[TourApi]>;
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
    card,
    variant = 'auto',
    class: className = '',
  }: Props = $props();

  let index = $state(0);
  /** the resolved element of the CURRENT step (null = unavailable) */
  let targetEl = $state<HTMLElement | null>(null);
  let finished = false;
  let panelEl = $state<HTMLElement | null>(null);
  let nextEl = $state<HTMLButtonElement | null>(null);

  // the shared declarative motion kernel (r29) — anchored to the
  // CURRENT step's resolved target (the lease holder); the live axis
  // re-measures per step with zero extra wiring
  const motion = createSurfaceMotion(() => panelEl, { anchor: () => targetEl });

  onDestroy(() => motion.destroy());

  // the manual popover needs its explicit show — the panel is in the
  // top layer while the tour renders, hidden on removal. Open/step
  // change moves the focus onto NEXT (the contract's landing spot;
  // non-modal — no trap, the user may Tab away). The kernel plays ONLY
  // where the popover actually shows/hides: step-to-step re-runs pass
  // through both guards synchronously (lastP stays 1 — a no-op)
  $effect(() => {
    // index is a dep: EVERY step change re-lands the focus on Next
    // (the same panel persists across steps — open alone won't re-run)
    if (!(open && panelEl) || index < 0) return;
    if (typeof panelEl.showPopover === 'function' && !panelEl.matches(':popover-open')) {
      panelEl.showPopover();
      motion.play(1);
      motion.startTracking();
    }
    requestAnimationFrame(() => {
      if (typeof requestAnimationFrame === 'function' && panelEl?.matches(':popover-open')) {
        // the landing spot: the default card's Next button; a custom
        // card has no Next — the panel itself (tabindex=-1) takes it
        (nextEl ?? panelEl)?.focus();
      }
    });
    return () => {
      if (panelEl && typeof panelEl.hidePopover === 'function' && panelEl.matches(':popover-open')) {
        panelEl.classList.remove('jx-rest');
        motion.play(0);
        motion.stopTracking();
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

  // nav buttons: the terminal chip (border, bg, shadow-2xs) + the
  // Next variant's brand lean; disabled rides a conditional swap
  const navBtn =
    'inline-flex cursor-pointer appearance-none border px-[0.875rem] py-1.5 font-nav text-[0.6875rem] uppercase tracking-[0.1em] shadow-2xs disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
</script>

{#if open && step}
  <!-- the hole: target-sized via CSS anchor-size, ONE huge shadow tint.
       inset stays in the css (the anchored form re-sets it — a markup
       inset utility would beat the components layer and break it) -->
  <div
    class="jx-tour-hole fixed pointer-events-none"
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
    class={cn('jx-tour jx-surface', motion.supported && 'jx-waapi', className)}
    data-variant={variant}
    style="position-anchor: {leaseName}"
    bind:this={panelEl}
    onkeydown={handleKeydown}
  >
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep -->
    <div data-jx-tour-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- surface body (fill + ::after shadow); the popover element paints
         nothing (floating-surface law arch r3) -->
    <div data-jx-tour-surface="" class="jx-surface-body flex flex-col gap-2 px-4 py-[0.875rem]">
    {#if card}
      {@render card({ index, total: steps.length, step, next, prev, skip: () => finish(index) })}
    {:else}
    {#if step.title}
      <p data-jx-tour-title="" class="m-0 font-nav text-[0.8125rem] uppercase tracking-[0.1em] text-foreground">{step.title}</p>
    {/if}
    {#if step.description}
      <p data-jx-tour-desc="" class="m-0 text-[0.8125rem] leading-[1.55] text-muted-foreground">{step.description}</p>
    {/if}
    <div data-jx-tour-meta="" class="font-mono text-[0.6875rem] text-muted-foreground" aria-hidden="true">{index + 1} / {steps.length}</div>
    <div data-jx-tour-actions="" class="mt-1 flex items-center justify-between gap-3">
      <button
        type="button"
        data-jx-tour-skip=""
        class="cursor-pointer appearance-none border-0 bg-transparent font-nav text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground underline decoration-dotted hover:text-foreground focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1"
        onclick={() => finish(index)}
      >
        Skip tour
      </button>
      <div data-jx-tour-nav="" class="flex gap-2">
        <button type="button" data-jx-tour-btn="" class={navBtn} disabled={!canPrev} onclick={prev}>
          Back
        </button>
        <button
          type="button"
          data-jx-tour-btn=""
          data-jx-tour-next=""
          class={cn(navBtn, 'border-primary bg-background text-primary')}
          bind:this={nextEl}
          onclick={next}
        >
          {index >= steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
    {/if}
    </div>
  </div>
{/if}
