<!--
  Hue popover (apps/www/src/lib/components/hue-popover.svelte).
  The ui.jixoai.com brand control: a palette icon that opens a native
  Popover with the theme toggle (dark | light), a brand-hue range slider,
  and a play/pause toggle for the 30s auto-cycle.
-->
<script lang="ts">
  import { currentHue, playing, toggleHuePlay, setHueManually } from '$lib/hue-runtime';

  let hue = $state(0);
  let isPlaying = $state(true);

  // sync from stores
  currentHue.subscribe((v) => (hue = v));
  playing.subscribe((v) => (isPlaying = v));

  const setTheme = (mode: 'light' | 'dark'): void => {
    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.style.colorScheme = mode === 'dark' ? 'dark' : 'light';
  };

  const isDark = $derived(
    typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'),
  );
</script>

<div class="relative">
  <button
    type="button"
    popovertarget="hue-popover"
    class="jx-hue-trigger"
    aria-label="Brand hue & theme"
  >
    <!-- palette icon -->
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2.4a2 2 0 0 0-1.4 3.4c.4.5.6 1.1.6 1.6a2 2 0 0 1-2 2Z" />
      <circle cx="7.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="11.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  </button>

  <div id="hue-popover" popover class="jx-hue-pop">
    <div class="flex flex-col gap-4 p-4">
      <!-- theme section -->
      <div class="flex flex-col gap-2">
        <p class="font-nav text-primary text-[10px] uppercase tracking-[0.2em]">Theme</p>
        <div class="flex gap-2">
          <button
            type="button"
            class="jx-hue-btn {!isDark ? 'jx-hue-btn-on' : ''}"
            onclick={() => setTheme('light')}
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            light
          </button>
          <button
            type="button"
            class="jx-hue-btn {isDark ? 'jx-hue-btn-on' : ''}"
            onclick={() => setTheme('dark')}
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
            </svg>
            dark
          </button>
        </div>
      </div>

      <!-- hue section -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <p class="font-nav text-primary text-[10px] uppercase tracking-[0.2em]">--brand-hue</p>
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
        <!-- rainbow gradient track -->
        <div class="jx-hue-track" aria-hidden="true"></div>
      </div>

      <!-- play/pause -->
      <div class="flex items-center justify-between">
        <p class="font-nav text-primary text-[10px] uppercase tracking-[0.2em]">Auto-cycle</p>
        <button type="button" class="jx-hue-play" onclick={toggleHuePlay} aria-label={isPlaying ? 'Pause hue cycle' : 'Play hue cycle'}>
          {#if isPlaying}
            <!-- pause icon -->
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="0" />
              <rect x="14" y="4" width="4" height="16" rx="0" />
            </svg>
          {:else}
            <!-- play icon -->
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7Z" />
            </svg>
          {/if}
          <span class="text-[10px]">{isPlaying ? '30s cycle' : 'paused'}</span>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .jx-hue-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    color: inherit;
    cursor: pointer;
    transition: border-color 150ms ease-out, color 150ms ease-out;
  }
  .jx-hue-trigger:hover {
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }
  .jx-hue-pop {
    margin: 0;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    min-width: 220px;
  }
  .jx-hue-pop::backdrop {
    background: transparent;
  }
  .jx-hue-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 11px;
    font-family: var(--font-nav);
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: transparent;
    color: color-mix(in oklab, currentColor 70%, transparent);
    cursor: pointer;
    transition: all 150ms ease-out;
  }
  .jx-hue-btn:hover {
    color: currentColor;
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }
  .jx-hue-btn-on {
    background: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }
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
  .jx-hue-play {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-family: var(--font-nav);
    border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
    background: transparent;
    color: color-mix(in oklab, currentColor 70%, transparent);
    cursor: pointer;
    transition: all 150ms ease-out;
  }
  .jx-hue-play:hover {
    color: currentColor;
    border-color: color-mix(in oklab, currentColor 70%, transparent);
  }
  .jx-hue-track {
    display: none; /* the slider itself carries the rainbow track */
  }
</style>
