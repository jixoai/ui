<!--
  Hue popover (apps/www/src/lib/components/hue-popover.svelte).
  The ui.jixoai.com brand control: a palette icon that opens a native
  Popover with the ThemeToggle (full variant, icons only), a brand-hue
  range slider, and a play/pause toggle for the 24h wall-clock cycle.

  Fusion (2026-08-21): interaction/layout from this component's lineage
  (try-position anchoring, pre-positioning, icon toggle palette ↔ X) +
  theme/styling from the registry popover component (token-driven panel,
  press-physics trigger, backdrop/caret/overflow/reduced-motion laws).
-->
<script lang="ts">
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
  import { currentHue, playing, toggleHuePlay, setHueManually } from '$lib/hue-runtime';

  let hue = $state(0);
  let isPlaying = $state(true);
  let triggerEl = $state<HTMLElement | null>(null);
  let popEl = $state<HTMLElement | null>(null);
  let pos = $state<{ top: string; left: string }>({ top: '0px', left: '0px' });
  let isOpen = $state(false);

  currentHue.subscribe((v) => (hue = v));
  playing.subscribe((v) => (isPlaying = v));

  const GAP = 8;

  /** try-position: below-right → below-left → above-right → above-left,
   *  clamped to the viewport. Returns the first fully-visible placement. */
  const computePosition = (): { top: string; left: string } => {
    if (!triggerEl || !popEl) return { top: '0px', left: '0px' };
    const trigger = triggerEl.getBoundingClientRect();
    const pop = popEl.getBoundingClientRect();
    const vw = innerWidth;
    const vh = innerHeight;

    const candidates = [
      { top: trigger.bottom + GAP, left: trigger.right - pop.width },
      { top: trigger.bottom + GAP, left: trigger.left },
      { top: trigger.top - GAP - pop.height, left: trigger.right - pop.width },
      { top: trigger.top - GAP - pop.height, left: trigger.left },
    ];

    for (const c of candidates) {
      if (c.top >= 0 && c.top + pop.height <= vh && c.left >= 0 && c.left + pop.width <= vw) {
        return { top: `${c.top}px`, left: `${c.left}px` };
      }
    }

    const fallback = candidates[0]!;
    return {
      top: `${Math.max(GAP, Math.min(fallback.top, vh - pop.height - GAP))}px`,
      left: `${Math.max(GAP, Math.min(fallback.left, vw - pop.width - GAP))}px`,
    };
  };

  const position = (): void => {
    pos = computePosition();
  };

  // toggle event: track open state + refine position with real dimensions
  $effect(() => {
    if (!popEl) return;
    const handler = () => {
      isOpen = popEl.matches(':popover-open');
      if (isOpen) {
        requestAnimationFrame(position);
      }
    };
    popEl.addEventListener('toggle', handler);
    return () => popEl.removeEventListener('toggle', handler);
  });
</script>

<div class="relative">
  <button
    type="button"
    popovertarget="hue-popover"
    class="jx-hue-trigger"
    aria-label={isOpen ? 'Close brand hue & theme' : 'Brand hue & theme'}
    aria-expanded={isOpen}
    bind:this={triggerEl}
    onclick={() => {
      // popovertarget handles the toggle; pre-position here (onclick fires
      // before the popover target activation behavior)
      if (!popEl?.matches(':popover-open')) {
        const trigger = triggerEl?.getBoundingClientRect();
        if (trigger) {
          const estWidth = 240;
          pos = {
            top: `${trigger.bottom + GAP}px`,
            left: `${Math.max(GAP, trigger.right - estWidth)}px`,
          };
        }
      }
    }}
  >
    {#if isOpen}
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    {:else}
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2.4a2 2 0 0 0-1.4 3.4c.4.5.6 1.1.6 1.6a2 2 0 0 1-2 2Z" />
        <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    {/if}
  </button>

  <div
    id="hue-popover"
    popover="auto"
    class="jx-hue-pop"
    bind:this={popEl}
    style="top: {pos.top}; left: {pos.left};"
  >
    <div class="flex flex-col gap-4 p-3.5">
      <!-- theme: the registry ThemeToggle, full variant, icons only -->
      <div class="flex flex-col gap-2">
        <p class="jx-hue-label">Theme</p>
        <ThemeToggle variant="full" hideLabels />
      </div>

      <!-- hue section -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <p class="jx-hue-label">--brand-hue</p>
          <span class="font-nav text-primary text-[12px] tabular-nums">{Math.round(hue)}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="359"
          step="1"
          value={Math.round(hue)}
          class="jx-hue-slider"
          oninput={(e) => setHueManually(e.currentTarget.valueAsNumber)}
        />
      </div>

      <!-- play/pause -->
      <div class="flex items-center justify-between">
        <p class="jx-hue-label">Auto-cycle</p>
        <button type="button" class="jx-hue-play" onclick={toggleHuePlay} aria-label={isPlaying ? 'Pause hue cycle' : 'Play hue cycle'}>
          {#if isPlaying}
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="0" />
              <rect x="14" y="4" width="4" height="16" rx="0" />
            </svg>
          {:else}
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7Z" />
            </svg>
          {/if}
          <span class="text-[10px]">{isPlaying ? '24h cycle' : 'paused'}</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* ── trigger: press physics on a 32×32 icon button (from the registry
     popover's trigger recipe, adapted for icon-only) ── */
  .jx-hue-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    color: inherit;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: transparent;
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      border-color 150ms ease-out;
  }
  .jx-hue-trigger:hover {
    transform: translate(-1px, -1px);
    border-color: color-mix(in oklab, currentColor 70%, transparent);
    box-shadow: var(--shadow-xs);
  }
  .jx-hue-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  /* ── panel: token-driven, from the registry popover's panel law ── */
  .jx-hue-pop {
    position: fixed;
    margin: 0;
    inset: auto;
    min-width: 220px;
    max-width: min(92vw, 22rem);
    max-height: 72vh;
    overflow: auto;
    padding: 0;
    font-size: 13px;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  .jx-hue-pop::backdrop {
    background: transparent;
  }

  /* ── section labels ── */
  .jx-hue-label {
    font-family: var(--font-nav);
    font-size: 10px;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  /* ── hue slider: rainbow track ── */
  .jx-hue-slider {
    width: 100%;
    height: 18px;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    cursor: pointer;
  }
  .jx-hue-slider::-webkit-slider-runnable-track {
    height: 6px;
    background: linear-gradient(
      to right,
      oklch(0.6489 0.237 0),
      oklch(0.6489 0.237 60),
      oklch(0.6489 0.237 120),
      oklch(0.6489 0.237 180),
      oklch(0.6489 0.237 240),
      oklch(0.6489 0.237 300),
      oklch(0.6489 0.237 360)
    );
  }
  .jx-hue-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    margin-top: -4px;
    border: 2px solid var(--border);
    background: var(--primary);
    cursor: grab;
  }
  .jx-hue-slider::-moz-range-track {
    height: 6px;
    background: linear-gradient(
      to right,
      oklch(0.6489 0.237 0),
      oklch(0.6489 0.237 60),
      oklch(0.6489 0.237 120),
      oklch(0.6489 0.237 180),
      oklch(0.6489 0.237 240),
      oklch(0.6489 0.237 300),
      oklch(0.6489 0.237 360)
    );
  }
  .jx-hue-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--border);
    background: var(--primary);
    cursor: grab;
  }

  /* ── play/pause button ── */
  .jx-hue-play {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-family: var(--font-nav);
    font-size: 11px;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: transparent;
    color: color-mix(in oklab, currentColor 70%, transparent);
    cursor: pointer;
    transition:
      color 150ms ease-out,
      border-color 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-hue-play:hover {
    color: currentColor;
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }

  /* ── reduced motion: all transitions off ── */
  @media (prefers-reduced-motion: reduce) {
    .jx-hue-trigger,
    .jx-hue-play {
      transition: none;
    }
    .jx-hue-trigger:hover,
    .jx-hue-trigger:active {
      transform: none;
      box-shadow: none;
    }
  }
</style>
