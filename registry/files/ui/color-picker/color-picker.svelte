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
  3. editor delegation (2026-08-28 pure-register fusion) — the panel body
     IS editor.svelte, the embeddable professional editor extracted for
     the Input picker bridge (SV pad + hue bar + format switch + value
     input + Eye Dropper + Swatches; no popover/trigger/motion of its
     own). The host seeds the editor's NOTATION by canonicalizing the
     initial color through `format` (the editor infers its format mode
     from the seed string — the format-prop law survives the extraction);
     picks forward VERBATIM to the bindable value (the raised string
     already carries the editor's active notation); external value
     writes pass through RAW and the editor re-seats its pad.

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

  Pure-register fusion (2026-08-28): the whole editor body (color
  geometry + value model, the old intents 3/4) moved into editor.svelte
  so the Input picker bridge can mount the CONTINUOUS professional
  picking experience as its default color panel (the 48-cell discrete
  grid alone felt "潦草"). This host keeps the popover shell, the
  trigger and the notation seed; everything about its external contract
  (props, classes, DOM law, emitted notations) is unchanged.
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';
  import Editor from './editor.svelte';
  import './color-picker.css';
  import { formatColor, parseColor, type ColorFormat, type Oklch } from '$lib/color-utils';

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

  // ---- editor wiring: notation seed + verbatim pick forwarding ----------
  const initial = parseColor(value) ?? ({ l: 0, c: 0, h: 0 } satisfies Oklch);
  /** the editor seed: the initial color rendered in the `format` notation —
      the editor infers its format mode from this string, so the format
      prop keeps deciding the emitted notation across the extraction.
      Mount-time seed by contract: external writes ride the $effect below */
  // svelte-ignore state_referenced_locally
  let editorValue = $state(formatColor(initial, format));
  /** the last string WE forwarded — external changes never match it */
  let lastEmitted = value;

  const swatch = $derived(formatColor(parseColor(editorValue) ?? initial, 'hex'));

  /** the editor's continuous commit: forward verbatim to the bindable
      value (the raised string already carries the active notation) */
  function handlePick(color: string): void {
    lastEmitted = color;
    editorValue = color;
    value = color;
  }

  // external value writes (bindings, resets) pass through RAW — the
  // editor re-parses and re-seats its own pad and text draft
  $effect(() => {
    if (value === lastEmitted) return;
    const parsed = parseColor(value ?? '');
    if (!parsed) return;
    lastEmitted = value;
    editorValue = value;
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
         r3) — the column content is the embeddable Editor -->
    <div data-jx-color-picker-surface class="jx-surface-body flex flex-col gap-2.5 p-3">
    <Editor value={editorValue} onpick={handlePick} />
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
