<!--
  Hue popover (apps/www/src/lib/components/hue-popover.svelte).
  The ui.jixoai.com brand control: a palette icon that opens a popover with
  the ThemeToggle (full variant, icons only), a brand-hue range slider, and
  a play/pause toggle for the 24h wall-clock cycle.

  Fusion (2026-08-21, complete): this is now a pure consumer of the
  registry popover component — native Popover API + CSS Anchor
  Positioning (anchor-name wrapper, position-anchor + inset-area panel,
  native flip fallbacks). Zero JS geometry: no measure, no rAF reposition,
  no first-frame jump. The custom palette/X trigger rides the component's
  `trigger` snippet; the content panel keeps the token-driven styling.
-->
<script lang="ts">
  import Popover from '$lib/ui/popover/popover.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import { currentHue, playing, toggleHuePlay, setHueManually } from '$lib/hue-runtime';

  let hue = $state(0);
  let isPlaying = $state(true);
  let popEl = $state<HTMLElement | null>(null);
  let isOpen = $state(false);

  currentHue.subscribe((v) => (hue = v));
  playing.subscribe((v) => (isPlaying = v));

  // open state only (for the trigger icon); positioning is pure CSS.
  $effect(() => {
    if (!popEl) return;
    const handler = () => (isOpen = popEl.matches(':popover-open'));
    popEl.addEventListener('toggle', handler);
    return () => popEl.removeEventListener('toggle', handler);
  });
</script>

<Popover id="hue-popover" triggerLabel="Brand hue & theme" placement="bottom-end">
  {#snippet trigger()}
    <button
      type="button"
      popovertarget="hue-popover"
      class="jx-press jx-hue-trigger min-h-[var(--jx-d-ctl-hit)] px-[var(--jx-d-ctl-pad)] text-[length:var(--jx-d-ctl-text)] gap-[var(--jx-d-ctl-gap)]"
      aria-label={isOpen ? 'Close brand hue & theme' : 'Brand hue & theme'}
      aria-expanded={isOpen}
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
  {/snippet}

  <div bind:this={popEl} class="jx-hue-content">
    <div class="flex flex-col gap-[var(--jx-d-ctl-gap)] p-[var(--jx-d-ctl-pad)]">
      <!-- theme: the registry ThemeToggle, full variant, icons only -->
      <div class="flex flex-col gap-2">
        <p class="jx-hue-label">Theme</p>
        <ThemeToggle variant="full" hideLabels />
      </div>

      <!-- hue section -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <p class="jx-hue-label">Brand hue</p>
          <code data-jx-hue-value>{hue}°</code>
        </div>
        <!-- rides the Tier-1 .jx-range law; scoped .jx-hue-range adds only
             the rainbow track fill + the marker thumb (see style block) -->
        <input
          class="jx-range jx-hue-range"
          type="range"
          min="0"
          max="359"
          step="1"
          bind:value={hue}
          oninput={(e) => setHueManually(Number(e.currentTarget.value))}
          aria-label="Brand hue"
        />
      </div>

      <!-- 24h auto-cycle -->
      <div class="flex items-center justify-between gap-3">
        <p class="jx-hue-label">Auto cycle · 24h</p>
        <button
          type="button"
          class="jx-hue-play"
          data-jx-hue-play-on={isPlaying ? '' : undefined}
          onclick={toggleHuePlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? 'Pause the hue cycle' : 'Play the hue cycle'}
        >
          {#if isPlaying}
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          {:else}
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>
</Popover>

<style>
  /* ── trigger: press law on a 32×32 icon button (shadow only appears on
     hover; active presses on the anchored layer) ── */
  .jx-hue-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    color: inherit;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: transparent;
    --jx-press-shadow: none;
    --jx-press-shadow-hover: var(--shadow-xs);
    --jx-press-shadow-active: var(--shadow-xs-press);
    cursor: pointer;
  }
  .jx-hue-trigger:hover {
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }

  /* ── panel: token-driven, from the registry popover's panel law ── */

  /* ── section labels ── */
  .jx-hue-label {
    font-family: var(--font-nav);
    font-size: 10px;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  /* ── hue slider: NOT a .jx-range geometry consumer anymore — the
     Tier-1 paint box shrank to rail height (equal-thickness amendment)
     and its overflow clip would shear this 14px marker. The rainbow
     groove IS the value display, so no fill shadow exists here at all:
     the input keeps its own fat hit strip, unclipped thumb, and only
     the appearance reset + focus law ride the Tier-1 face ── */
  .jx-hue-range::-webkit-slider-runnable-track {
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
  .jx-hue-range {
    height: 1.75rem; /* own fat hit strip — the rail-height Tier-1 box does not apply */
    overflow: visible; /* no fill shadow here — the 14px marker must not be clipped */
  }
  .jx-hue-range::-webkit-slider-runnable-track {
    height: 8px; /* the rainbow groove, centered in the strip */
    border-radius: calc(infinity * 1px);
  }
  .jx-hue-range::-moz-range-track {
    height: 8px;
    border-radius: calc(infinity * 1px);
  }
  .jx-hue-range::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
    /* center the 16px marker on the 8px groove */
    margin-top: -4px;
    border-width: 2px;
    border-radius: calc(infinity * 1px);
    box-shadow: none;
    cursor: grab;
  }
  .jx-hue-range::-moz-range-track {
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
  .jx-hue-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-width: 2px;
    border-radius: calc(infinity * 1px);
    box-shadow: none;
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
    .jx-hue-play {
      transition: none;
    }
  }

  /* hue content sits inside the registry popover panel (.jx-pop owns the
     surface law); only the hue-specific internals live here. */
  .jx-hue-content {
    width: 15rem;
  }
</style>