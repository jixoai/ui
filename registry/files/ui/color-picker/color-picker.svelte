<!--
  jixoai color picker (registry/files/ui/color-picker/color-picker.svelte).

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

  tw4 (2026-08-24): trigger/pad/bar/marker static paint is token/arbitrary
  utilities in the markup (the SV ground reads the live hue through the
  --jx-color-picker-hue custom property set inline); the .jx-field scaffold
  is consumed from jx-pure Part A. Only the anchor-positioned panel
  (static residue with its closed-state display law, @supports fallback +
  ::backdrop), the SV pad's overlay pseudos (color-space constants, not
  themeable), the trigger/pick hover/focus machines and the reduced-motion
  kill remain in color-picker.css (D1-exempt residue under the layer law).

  Motion kernel (2026-08-25): the panel rides the shared surface motion
  kernel (lib/surface-motion.ts; popover.svelte wiring law) — WAAPI
  animates the single --jx-p progress number, jixoai.css formulas paint
  every visible property; the toggle seam plays 1/0 with
  start/stopTracking, reading open state LIVE from :popover-open
  (ToggleEvent state fields never trusted). The real shadow layer is a
  DOM child (data-jx-color-picker-shadow) because WAAPI cannot animate
  pseudo-elements. Drags never animate (markers track the pointer
  directly) — the kernel only owns the panel's enter/exit.

  Pure-register fusion (2026-08-28): the panel gains the shared preset
  palette — swatches.svelte, the embeddable half extracted for the
  Input picker bridge (no popover/trigger/motion of its own). The host
  mounts <Swatches value onpick/> below the value input; pickSwatch
  commits through the same applyOklch → emit path as the Eye Dropper,
  so a preset pick re-emits in the active format and the panel stays
  open (the editor is a workshop; the bridge panel is the one that
  closes on pick). Everything else about the host is untouched.
-->
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import Input from '$lib/ui/input/input.svelte';
  import NativeSelect from '$lib/ui/native-select/native-select.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import Swatches from './swatches.svelte';
  import './color-picker.css';
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
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** show the 16×16 swatch in the trigger (default true) */
    showSwatch?: boolean;
    /** show the value text in the trigger (default true) */
    showValue?: boolean;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    class?: string;
    density?: Density;
    'data-density'?: string;
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
    variant = 'auto',
    class: className = '',
    density,
    'data-density': _callerDensity,
  }: Props = $props();

  const inheritedDensity = getDensityContext();
  const resolvedDensity = $derived(resolveDensity(density, inheritedDensity));

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
  // the anchor wrapper — the enter kernel measures the slide direction
  // against it at every open
  let anchorEl = $state<HTMLElement | null>(null);

  // THE orchestration seam: one native event covers every open/close path
  // (popovertarget click, light dismiss, Escape). Open state is read LIVE
  // from :popover-open at fire time — ToggleEvent state fields are never
  // trusted (popover.svelte law).
  function onPanelToggle(): void {
    open = panelEl?.matches(':popover-open') ?? false;
    if (open) {
      motion.play(1);
      motion.startTracking();
    } else {
      panelEl?.classList.remove('jx-rest');
      motion.play(0);
      motion.stopTracking();
      triggerEl?.focus(); // focus restitution on every close path
    }
  }

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. WAAPI animates ONE @property number
  // (--jx-p); every visible property is a CSS formula of it (the
  // declarative motion law in jixoai.css). The kernel here only wires
  // the panel's toggle seam and live anchor
  const motion = createSurfaceMotion(() => panelEl, { anchor: () => anchorEl });

  onDestroy(() => motion.destroy());

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

  /** the embedded palette's discrete pick — the same commit path as the
      Eye Dropper (applyOklch → emit re-formats into the active notation) */
  function pickSwatch(hex: string): void {
    const parsed = parseColor(hex);
    if (parsed) {
      applyOklch(parsed);
      emit();
    }
  }
</script>

<div data-density={resolvedDensity} class={'jx-field ' + className}>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}

  <span data-jx-color-picker-wrap class="relative block w-full" style="anchor-name: {anchorName}" bind:this={anchorEl}>
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class="jx-color-picker-trigger flex items-center w-full border border-border rounded-none bg-background text-foreground cursor-pointer transition-[box-shadow] duration-150 ease-out"
      popovertarget={panelId}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={panelId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
    >
      {#if showSwatch}<span data-jx-color-picker-swatch class="flex-none border border-border bg-muted" style:background={swatch}></span>{/if}
      {#if showValue}<span data-jx-color-picker-value class="flex-[1_1_auto] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-start font-mono text-xs">{value}</span>{/if}
      <span
        class={cn(
          'jx-color-picker-chevron flex-none w-3 h-3 pointer-events-none text-muted-foreground transition-transform duration-150 ease-out',
          open && 'rotate-180',
        )}
        aria-hidden="true"
      ></span>
    </button>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class={cn('jx-color-picker-panel jx-surface', motion.supported && 'jx-waapi')}
    data-variant={variant}
    role="group"
    aria-label="color picker"
    style="position-anchor: {anchorName}; inset-area: bottom span-all; position-area: bottom span-all;"
    ontoggle={onPanelToggle}
  >
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep
         (Owner ruling r18) -->
    <div data-jx-color-picker-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- surface body (bezel paint + ::after shadow + the flex column);
         the popover element paints nothing (floating-surface law arch
         r3) -->
    <div data-jx-color-picker-surface class="jx-surface-body flex flex-col gap-2.5 p-3">
    <div
      bind:this={svEl}
      class="jx-color-picker-sv relative [direction:ltr] w-[200px] h-[150px] border border-border bg-[hsl(var(--jx-color-picker-hue)_100%_50%)] cursor-crosshair touch-none select-none"
      style="--jx-color-picker-hue: {hue}"
      onpointerdown={onSvDown}
      onpointermove={(event) => dragSV && svFromPointer(event)}
      onpointerup={(event) => (dragSV = endDrag(svEl, event, dragSV) ? false : dragSV)}
      onpointercancel={(event) => (dragSV = endDrag(svEl, event, dragSV) ? false : dragSV)}
    >
      <span
        data-jx-color-picker-dot
        class="absolute w-2.5 h-2.5 bg-transparent border border-white shadow-[0_0_0_1px_#000] pointer-events-none"
        style="inset-inline-start: calc({sat * 100}% - 5px); top: calc({(1 - val) * 100}% - 5px)"
      ></span>
    </div>

    <div
      bind:this={hueEl}
      data-jx-color-picker-hue
      class="relative [direction:ltr] w-[200px] h-3 border border-border cursor-crosshair touch-none select-none bg-[linear-gradient(to_right,hsl(0_100%_50%),hsl(60_100%_50%),hsl(120_100%_50%),hsl(180_100%_50%),hsl(240_100%_50%),hsl(300_100%_50%),hsl(360_100%_50%))]"
      onpointerdown={onHueDown}
      onpointermove={(event) => dragHue && hueFromPointer(event)}
      onpointerup={(event) => (dragHue = endDrag(hueEl, event, dragHue) ? false : dragHue)}
      onpointercancel={(event) => (dragHue = endDrag(hueEl, event, dragHue) ? false : dragHue)}
    >
      <span data-jx-color-picker-dot data-jx-color-picker-dot-hue class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-transparent border border-white shadow-[0_0_0_1px_#000] pointer-events-none" style="inset-inline-start: calc({(hue / 360) * 100}% - 5px)"></span>
    </div>

    <NativeSelect data-jx-color-picker-format class="text-xs" value={format} onchange={setFormat} aria-label="color format">
      <option value="hex">hex</option>
      <option value="hsl">hsl</option>
      <option value="oklch">oklch</option>
    </NativeSelect>

    <Input data-jx-color-picker-input class="font-mono text-[13px]" bind:value={textDraft} onchange={commitText} />

    <!-- the shared preset palette (the embeddable half the Input picker
         bridge also mounts); picking stays in the workshop — no close -->
    <Swatches value={swatch} onpick={pickSwatch} />

    {#if canPick}
      <!-- PressButton takes no class prop — the wrapper owns the row width -->
      <div class="jx-color-picker-pick flex justify-center w-full">
        <PressButton variant="outline" onclick={pickFromScreen}>
          Pick from screen
        </PressButton>
      </div>
    {/if}
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
