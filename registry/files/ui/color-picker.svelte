<!--
  jixoai color picker (registry/files/ui/color-picker.svelte).

  2026-08-20 · Form wave 2 (original request: "Color 选择器" with SV pad,
  hue bar, format switch, direct value input and Eye Dropper). The native
  input[type=color] cannot offer any of that — this is the one form-family
  member that is a full custom widget.

  Orthogonal intents:
  1. trigger — the family trigger paint (1px border shell, radius 0, inset
     focus law, chevron that flips while open) carrying the 16×16 swatch,
     a font-mono 12px value readout, and label[for] binding (a button IS
     labelable). error → "! message" line + dashed border + aria wiring.
  2. popover — native popover="auto" + popovertarget (light dismiss,
     Escape, top layer for free), CSS Anchor Positioning under the trigger
     with flip-block fallback; engines without anchors get the authored
     viewport-center fallback (select.svelte law). ontoggle syncs
     aria-expanded and restitutes focus to the trigger on every close.
  3. color geometry — SV pad 200×150 (pure-hue ground + white→transparent
     horizontal and black→transparent vertical overlays) and a 12px full-
     spectrum hue bar, both driven by Pointer Events with capture; the pad
     keeps direction:ltr because it maps color space, not document flow.
  4. value model — OKLCH is the intermediate representation (the token
     system's space, see lib/color-utils.ts): parse(value) → oklch → hsv
     for the pad, drag → hsv → oklch → format → value. Format switching
     (hex / hsl / oklch via NativeSelect) re-emits the same color in the
     new notation; the value Input commits parsed pastes and reverts
     invalid ones. Eye Dropper rides window.EyeDropper when present.

  The panel surface is the terminal bezel (var(--terminal) in both modes)
  — the same law as the Select panel, so the picker reads as one family.
  Reduced motion: nothing animates during drag (markers track the pointer
  directly); only the chevron flip is transitioned and neutralized.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import Input from '$lib/ui/input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import {
    colorFormats,
    formatColor,
    hsvToOklch,
    oklchToHsv,
    parseColor,
    type ColorFormat,
    type Oklch,
  } from '$lib/color-utils';

  interface Props {
    /** committed color string; bind:value — notation follows `format` */
    value?: string;
    /** output/input notation (default 'hex') */
    format?: ColorFormat;
    /** field label; renders label[for] above the trigger */
    label?: string;
    /** error text → "! message" line + dashed trigger border */
    error?: string;
    /** show the 16×16 swatch in the trigger (default true) */
    showSwatch?: boolean;
    /** show the value text in the trigger (default true) */
    showValue?: boolean;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    class?: string;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    value = $bindable('#000000'),
    format = 'hex',
    label,
    error,
    showSwatch = true,
    showValue = true,
    id = autoId,
    class: className = '',
  }: Props = $props();

  const panelId = $derived(`${id}-panel`);
  // CSS custom-ident-safe anchor name (select.svelte law)
  const anchorName = $derived(`--jx-color-picker-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  // ---- color state: HSV working model, OKLCH intermediate ---------------
  const initial = parseColor(value) ?? ({ l: 0, c: 0, h: 0 } satisfies Oklch);
  const initialHsv = oklchToHsv(initial);
  let hue = $state(initialHsv.h);
  let sat = $state(initialHsv.s);
  let val = $state(initialHsv.v);
  /** the last string WE emitted — external changes never match it */
  let lastEmitted = value;
  /** live text in the panel's value input */
  let textDraft = $state(value);

  const current = $derived(hsvToOklch(hue, sat, val));
  const swatch = $derived(formatColor(current, 'hex'));

  function applyOklch(color: Oklch): void {
    const hsv = oklchToHsv(color);
    // achromatic inputs keep the stored hue so S/V drags stay predictable
    if (hsv.s > 0.001) hue = hsv.h;
    sat = hsv.s;
    val = hsv.v;
  }

  function emit(): void {
    const text = formatColor(hsvToOklch(hue, sat, val), format);
    lastEmitted = text;
    value = text;
    textDraft = text;
  }

  // external value writes (bindings, resets) flow back into the pad
  $effect(() => {
    if (value === lastEmitted) return;
    const parsed = parseColor(value ?? '');
    if (!parsed) return;
    applyOklch(parsed);
    textDraft = value;
    lastEmitted = value;
  });

  // ---- popover orchestration (select.svelte toggle law) -----------------
  let open = $state(false);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  function onPanelToggle(event: ToggleEvent): void {
    open = event.newState === 'open';
    if (!open) triggerEl?.focus(); // focus restitution on every close path
  }

  // ---- SV pad + hue bar: pointer capture drags ---------------------------
  let svEl = $state<HTMLDivElement | null>(null);
  let hueEl = $state<HTMLDivElement | null>(null);
  let dragSV = $state(false);
  let dragHue = $state(false);

  const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

  function svFromPointer(event: PointerEvent): void {
    if (!svEl) return;
    const rect = svEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    sat = clamp01((event.clientX - rect.left) / rect.width);
    val = 1 - clamp01((event.clientY - rect.top) / rect.height);
    emit();
  }

  function hueFromPointer(event: PointerEvent): void {
    if (!hueEl) return;
    const rect = hueEl.getBoundingClientRect();
    if (rect.width === 0) return;
    hue = 360 * clamp01((event.clientX - rect.left) / rect.width);
    emit();
  }

  function onSvDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    dragSV = true;
    svEl?.setPointerCapture(event.pointerId);
    svFromPointer(event);
  }

  function onHueDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    dragHue = true;
    hueEl?.setPointerCapture(event.pointerId);
    hueFromPointer(event);
  }

  function endDrag(el: HTMLElement | null, event: PointerEvent, wasDragging: boolean): boolean {
    if (!wasDragging) return false;
    if (el?.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    return true;
  }

  // ---- value input + format switch + eye dropper -------------------------
  function commitText(event: Event): void {
    const text = (event.currentTarget as HTMLInputElement).value;
    const parsed = parseColor(text);
    if (parsed) {
      applyOklch(parsed);
      emit(); // canonicalizes into the active format
    } else {
      textDraft = value; // revert invalid pastes
    }
  }

  function setFormat(event: Event): void {
    const next = (event.currentTarget as HTMLSelectElement).value as ColorFormat;
    if (!colorFormats.includes(next) || next === format) return;
    format = next;
    emit();
  }

  type EyeDropperCtor = new () => { open(): Promise<{ sRGBHex: string }> };
  let canPick = $state(false);

  onMount(() => {
    canPick = 'EyeDropper' in window;
  });

  async function pickFromScreen(): Promise<void> {
    const Ctor = (window as Window & { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (!Ctor) return;
    try {
      const { sRGBHex } = await new Ctor().open();
      const parsed = parseColor(sRGBHex);
      if (parsed) {
        applyOklch(parsed);
        emit();
      }
    } catch {
      // user dismissed the system picker — keep the current color
    }
  }
</script>

<div class="jx-field {className}">
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}

  <span class="jx-color-picker-wrap" style="anchor-name: {anchorName}">
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class="jx-color-picker-trigger"
      popovertarget={panelId}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={panelId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
    >
      {#if showSwatch}<span class="jx-color-picker-swatch" style:background={swatch}></span>{/if}
      {#if showValue}<span class="jx-color-picker-value">{value}</span>{/if}
      <svg
        class="jx-color-picker-chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class="jx-color-picker-panel"
    role="group"
    aria-label="color picker"
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <div
      bind:this={svEl}
      class="jx-color-picker-sv"
      style="--jx-color-picker-hue: {hue}"
      onpointerdown={onSvDown}
      onpointermove={(event) => dragSV && svFromPointer(event)}
      onpointerup={(event) => (dragSV = endDrag(svEl, event, dragSV) ? false : dragSV)}
      onpointercancel={(event) => (dragSV = endDrag(svEl, event, dragSV) ? false : dragSV)}
    >
      <span
        class="jx-color-picker-dot"
        style="inset-inline-start: calc({sat * 100}% - 5px); top: calc({(1 - val) * 100}% - 5px)"
      ></span>
    </div>

    <div
      bind:this={hueEl}
      class="jx-color-picker-hue"
      onpointerdown={onHueDown}
      onpointermove={(event) => dragHue && hueFromPointer(event)}
      onpointerup={(event) => (dragHue = endDrag(hueEl, event, dragHue) ? false : dragHue)}
      onpointercancel={(event) => (dragHue = endDrag(hueEl, event, dragHue) ? false : dragHue)}
    >
      <span class="jx-color-picker-dot jx-color-picker-dot-hue" style="inset-inline-start: calc({(hue / 360) * 100}% - 5px)"></span>
    </div>

    <NativeSelect class="jx-color-picker-format" value={format} onchange={setFormat} aria-label="color format">
      <option value="hex">hex</option>
      <option value="hsl">hsl</option>
      <option value="oklch">oklch</option>
    </NativeSelect>

    <Input class="jx-color-picker-input font-mono text-[13px]" bind:value={textDraft} onchange={commitText} />

    {#if canPick}
      <!-- PressButton takes no class prop — the wrapper owns the row width -->
      <div class="jx-color-picker-pick">
        <PressButton variant="outline" onclick={pickFromScreen}>
          Pick from screen
        </PressButton>
      </div>
    {/if}
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>

<style>
  .jx-field {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    width: 100%;
  }
  .jx-label {
    width: fit-content;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    cursor: pointer;
  }

  /* ---- trigger: family shell + swatch + mono readout + chevron -------- */
  .jx-color-picker-wrap {
    position: relative;
    display: block;
    width: 100%;
  }
  .jx-color-picker-trigger {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    transition: box-shadow 150ms ease-out;
  }
  .jx-color-picker-trigger:hover:not(:focus-visible) {
    box-shadow: var(--shadow-2xs);
  }
  /* the site focus law: inset 1px outline on the ring token */
  .jx-color-picker-trigger:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
    box-shadow: none;
  }
  .jx-color-picker-trigger[aria-invalid='true'] {
    border-style: dashed;
  }
  .jx-color-picker-swatch {
    flex: none;
    width: 16px;
    height: 16px;
    border: 1px solid var(--border);
    background: var(--muted);
  }
  .jx-color-picker-value {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: start;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .jx-color-picker-chevron {
    flex: none;
    width: 0.75rem;
    height: 0.75rem;
    pointer-events: none;
    color: var(--muted-foreground);
    transition: transform 150ms ease-out;
  }
  .jx-color-picker-trigger[aria-expanded='true'] .jx-color-picker-chevron {
    transform: rotate(180deg);
  }

  /* ---- panel: terminal bezel popover (select.svelte law) --------------- */
  .jx-color-picker-panel {
    position: fixed;
    margin: 0;
    position-try-fallbacks: flip-block;
    width: 226px; /* 200px pad + 2×12px padding + 2px border */
    padding: 12px;
    border: 1px solid var(--border);
    background: var(--terminal);
    color: var(--terminal-foreground);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* center on the anchor (the panel is wider than the trigger) */
    justify-self: anchor-center;
  }
  /* display:flex on the panel would defeat the UA sheet's closed-popover
     hiding — closed panels MUST be display:none or they render at their
     static position and intercept pointer events (found in smoke test) */
  .jx-color-picker-panel:not(:popover-open) {
    display: none;
  }
  /* Engines without CSS Anchor Positioning: authored viewport-center */
  @supports not (anchor-name: --jx-color-picker-fallback) {
    .jx-color-picker-panel {
      position-anchor: auto !important;
      inset-area: none !important;
      inset: 0;
      margin: auto;
      width: min(92vw, 226px);
      height: fit-content;
    }
  }
  .jx-color-picker-panel::backdrop {
    background: transparent;
  }

  /* ---- SV pad: pure-hue ground + the two overlay gradients -------------
     direction is pinned ltr: the pad maps color space (sat right, value
     up), not document flow — RTL flips the trigger, never the map. */
  .jx-color-picker-sv {
    position: relative;
    direction: ltr;
    width: 200px;
    height: 150px;
    background: hsl(var(--jx-color-picker-hue) 100% 50%);
    border: 1px solid var(--border);
    cursor: crosshair;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .jx-color-picker-sv::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #fff, transparent);
  }
  .jx-color-picker-sv::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #000, transparent);
  }
  .jx-color-picker-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background: transparent;
    border: 1px solid #fff;
    box-shadow: 0 0 0 1px #000; /* readable on any ground */
    pointer-events: none;
  }

  /* ---- hue bar: full spectrum, 12px tall, square marker ---------------- */
  .jx-color-picker-hue {
    position: relative;
    direction: ltr;
    width: 200px;
    height: 12px;
    background: linear-gradient(
      to right,
      hsl(0 100% 50%),
      hsl(60 100% 50%),
      hsl(120 100% 50%),
      hsl(180 100% 50%),
      hsl(240 100% 50%),
      hsl(300 100% 50%),
      hsl(360 100% 50%)
    );
    border: 1px solid var(--border);
    cursor: crosshair;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  .jx-color-picker-dot-hue {
    top: 50%;
    transform: translateY(-50%);
  }

  /* ---- panel controls ride the bezel ----------------------------------- */
  .jx-color-picker-format {
    font-size: 12px;
  }
  .jx-color-picker-pick {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .jx-color-picker-pick :global(button) {
    justify-content: center;
    width: 100%;
  }

  .jx-error {
    display: flex;
    gap: 0.5em;
    margin: 0;
    font-family: var(--font-nav);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-error-mark {
    font-weight: 700;
    color: var(--destructive);
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-color-picker-trigger,
    .jx-color-picker-chevron {
      transition: none;
    }
  }
</style>
