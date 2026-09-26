<!--
  jixoai select (registry/files/ui/select/select.svelte).
  The RICH sibling of native-select.svelte: a custom listbox for when the
  native popup can't say what you need — per-option descriptions, a fully
  painted panel, presentation that must match the site, not the UA. For
  plain form submission or mobile reach for NativeSelect instead (a real
  name/value pair in FormData, the platform's overlay picker on touch).

  NativeHTML orchestration on the Popover base (popover.svelte law): the
  panel carries popover="auto" and the trigger is wired with
  popovertarget, so light dismiss (outside click), Escape, one-auto-
  popover-at-a-time, and top-layer rendering are ALL browser-native; the
  anchor is CSS Anchor Positioning (anchor-name on the wrapper,
  position-anchor + position-area + position-try-fallbacks on the panel;
  engines without it fall back to authored viewport-center). The JS on
  top is orchestration only: aria-expanded sync + focus restitution via
  the native toggle event, focus into the list, and roving highlight
  (aria-activedescendant) for ↑/↓/Home/End/Enter — exactly the parts the
  platform doesn't give a listbox.

  Panel surface law (language-switcher menu + tree-view row precedent):
  the panel is a terminal bezel — background var(--terminal), foreground
  var(--terminal-foreground) in BOTH modes — so the selected row
  (var(--terminal-hover) fill + 2px var(--primary) edge line) stays
  readable in light and dark alike. The edge line uses LOGICAL
  border-inline-start, so under dir="rtl" it flips to the inline-start
  (right) edge automatically; every other offset in this file is logical
  too.

  Trigger: visually the closed native select (1px var(--border) shell,
  radius 0, chevron that flips while open, inset focus law) but a real
  <button> — label[for] binds to it, aria-haspopup="listbox" +
  aria-expanded ride along, and ↑/↓ open it like the native control.

  NativeHTML base audit (2026-08-20, updated by the form-field bridge the
  same day): NO native <select> hides inside — a <button> trigger carries
  no name/value pair of its own (NativeSelect keeps the plain-native
  route). Form association rides the FACELESS jx-form-field bridge
  (registry/files/lib/form-field.ts): a display:contents form-associated
  custom element fed name/value/disabled attributes; the committed VALUE
  (never the label) reaches FormData through ElementInternals, form reset
  bubbles back as jx-reset, form/fieldset disable as jx-disabled. Style,
  structure and ARIA stay in this file — the bridge owns no paint.

  tw4 (2026-08-24): trigger/rows/scroll static paint is token utilities
  in the markup (markup-known states — selected/active/disabled rows, the
  open chevron flip — ride conditional utilities); the .jx-field scaffold
  is consumed from jx-pure Part A. Only the anchor-positioned panel
  (static residue with its @supports fallback + ::backdrop), the
  hover/focus/disabled state machines and the reduced-motion kill remain
  in select.css (D1-exempt residue under the layer law).

  Surface motion kernel (2026-08-25): popover.svelte law adopted — the
  toggle seam drives the shared WAAPI kernel (lib/surface-motion.ts)
  against the live wrap anchor; the panel carries jx-waapi behind
  motion.supported plus the REAL .jx-surface-shadow child; jixoai.css
  owns every visible formula.
-->
<script module lang="ts">
  /** One row of the Select listbox. */
  export interface SelectOption {
    /** the committed value ($bindable value on the field) */
    value: string;
    /** the row's (and the trigger's) display text */
    label: string;
    /** optional muted second line rendered inside the panel only */
    description?: string;
    /** unselectable row — skipped by keyboard navigation and click */
    disabled?: boolean;
  }
</script>

<script lang="ts">
  // side-effect import: registers the faceless <jx-form-field> element
  // (client-only, idempotent) that carries this field's form association
  import '$lib/form-field';
  import { onDestroy } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
    elevationSurfaceOf,
    provideQueryAnchor,
    provideUniversalLanes,
    stampCarriersForLanes,
    type ColorLane,
    type DensityLane,
    type ElevationLane,
    type MotionLane,
    type QueryResult,
    type RadiusLane,
    type ShapeLane,
    type SizeLane,
    type ThemeLane,
  } from '$lib/defaults.svelte';
  import { SelectDefaults } from './select-defaults.svelte';
  import { selectStyles } from './select.stylex';
  import './select.css';

  // 'onchange' is OMITTED from the rest lane ON PURPOSE (issue #6): the
  // native change event never fires on the trigger BUTTON, so a rest-
  // forwarded handler was a silently dead binding — the prop below is
  // the sugar that fires on the component's own commit path
  interface Props extends Omit<HTMLButtonAttributes, 'onchange' | 'color'> {
    /** the full option list (order = panel order) */
    options: SelectOption[];
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** committed value; bind:value — undefined shows the placeholder */
    value?: string;
    /** trigger text when nothing is selected */
    placeholder?: string;
    /** field label; renders label[for] above the control */
    label?: string;
    /** form field name — the bridge submits the committed VALUE under it */
    name?: string;
    /** wired into label[for] / error[id]; auto-generated when omitted */
    id?: string;
    /** error text → aria-invalid + aria-describedby + dashed border */
    error?: string;
    /** NOT implemented in v1 — reserved extension direction (multi-
        select listbox); accepted for API stability, ignored with a
        console warning */
    multiple?: boolean;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency; the bezel fill
        follows the variant through the jx-surface fill props) */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** COMMIT HOOK (issue #6): fires with the newly committed value on
        the selection commit path — click, Enter, Space — alongside
        the bind:value write. Sugar over bind:value; the native change
        event never fires on the trigger button, so this prop owns the
        channel outright */
    onchange?: (value: string) => void;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (the trigger surface and the
     *  portaled listbox both carry the resolved lane) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() — own level2 (the anchored panel's menu rung) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    options,
    density,
    'data-density': _callerDensity,
    value = $bindable(),
    placeholder = 'Select...',
    label,
    name,
    id = autoId,
    error,
    disabled = false,
    multiple = false,
    variant = 'auto',
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    onchange,
    class: className = '',
    ...rest
  }: Props = $props();

  // the payload's own join (the separator serialize law): plain strings
  // pass through whole; dev objects contribute their string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // form lifecycle: what jx-reset restores, and the form-disable mirror
  const initialValue = value;
  // the family Defaults is the single read point (context-defaults-
  // economy 3.1 + W3-D3): one record — variant keeps its inline
  // default + inline union (this Props interface feeds the GENERATED
  // meta chain, drift-locked); the eight universal axes ride the same
  // record (elevation own level2 — the panel's menu rung). The TRIGGER
  // surface (.jx-field) and the PORTALED listbox panel BOTH stamp the
  // carriers: the top-layer promotion moves paint, not DOM, but the
  // panel is self-carried by the batch C portal law (CSS inheritance
  // does not cross the promotion; the Svelte context does — the
  // supply below feeds both)
  const d = $derived(
    SelectDefaults.resolve({
      variant,
      density,
      size,
      shape,
      radius,
      color,
      theme,
      elevation,
      motion,
    }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  const fieldStyle = $derived(carriers || undefined);
  let formDisabled = $state(false);
  const isDisabled = $derived(disabled || formDisabled);

  const panelId = $derived(`${id}-panel`);
  const listboxId = $derived(`${id}-listbox`);
  // Anchor names are CSS custom-ident-ish: sanitize the id into a stable
  // dashed token so any consumer id yields a valid --jx-sel-* name.
  const anchorName = $derived(`--jx-sel-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const optionId = (index: number): string => `${id}-opt-${index}`;

  const errorId = $derived(`${id}-error`);
  const invalid = $derived(error != null && error !== '');
  const describedBy = $derived(invalid ? errorId : undefined);
  const invalidAttr = $derived(invalid ? 'true' : undefined);

  const selected = $derived(options.find((option) => option.value === value));

  let open = $state(false);
  /** roving highlight index (-1 = none) — the keyboard/aria cursor */
  let active = $state(-1);
  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  let listEl = $state<HTMLUListElement | null>(null);
  // the wrap span carrying anchor-name — the motion kernel measures the
  // slide axis panel↔anchor against it, live
  let anchorEl = $state<HTMLElement | null>(null);

  // the query() anchor rides the PANEL (the promoted root — declared
  // above, the W3-C TDZ law); §3/§14 radius consumption (the popover
  // dialect): an explicit lane composes radius-effective × the
  // factor; auto computes the concentric max(0px, R − P) against the
  // panel's own ancestors (the var() fallbacks load-bearing — IACVT
  // never lands). §7's consumption pair + the solid-fill bridge ride
  // the panel with them
  provideQueryAnchor(() => panelEl ?? null);
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));
  const panelStyle = $derived(
    [
      carriers,
      radiusConsumed,
      elevationConsumed,
      `position-anchor: ${anchorName}`,
      'inset-area: bottom span-all',
      'position-area: bottom span-all',
    ]
      .filter(Boolean)
      .join('; ') || undefined,
  );

  // v1: `multiple` is a reserved extension direction — say so loudly
  // instead of silently ignoring a prop the caller believes in.
  $effect(() => {
    if (multiple) {
      console.warn(
        'jixoai Select: the multiple prop is not implemented in v1 (reserved extension direction) and is ignored.'
      );
    }
  });

  function firstEnabled(): number {
    return options.findIndex((option) => !option.disabled);
  }
  function lastEnabled(): number {
    for (let i = options.length - 1; i >= 0; i--) if (!options[i].disabled) return i;
    return -1;
  }

  /** step the highlight by delta, skipping disabled rows, clamped at the
      ends (APG listbox: no wrap — Home/End cover the jumps) */
  function moveActive(delta: 1 | -1): void {
    let i = active;
    for (let steps = 0; steps < options.length; steps++) {
      i += delta;
      if (i < 0 || i >= options.length) return;
      if (!options[i].disabled) {
        active = i;
        return;
      }
    }
  }

  function choose(option: SelectOption): void {
    if (option.disabled) return; // a disabled row neither selects nor closes
    value = option.value;
    onchange?.(value); // the commit hook (issue #6) — every commit path
    // funnels here: click, Enter, Space
    panelEl?.hidePopover(); // the toggle handler restitutes focus
  }

  // THE orchestration seam: one native event covers every open/close path
  // (popovertarget click, light dismiss, Escape, our own hide/show calls).
  // Open is read LIVE from :popover-open (popover.svelte law — ToggleEvent
  // state fields are never trusted); the motion calls bracket the
  // unchanged orchestration inside each branch.
  function onPanelToggle(): void {
    open = panelEl?.matches(':popover-open') ?? false;
    if (open) {
      panelMotion.play(1);
      panelMotion.startTracking();
      // continue from context, like the native select: highlight the
      // selected row, else the first enabled one
      const selectedIndex = options.findIndex((option) => option.value === value);
      active = selectedIndex >= 0 ? selectedIndex : firstEnabled();
      // APG listbox-in-popover: focus moves into the list; the panel is
      // already in the top layer when toggle fires
      listEl?.focus();
    } else {
      panelEl?.classList.remove('jx-rest');
      panelMotion.play(0);
      panelMotion.stopTracking();
      // focus restitution on EVERY close path — light dismiss and Escape
      // are free from popover="auto"; this line covers the focus part
      triggerEl?.focus();
    }
  }

  // ── MOTION KERNEL — the shared declarative half (popover.svelte law,
  // lib/surface-motion.ts): WAAPI animates ONE @property number (--jx-p);
  // every visible property is a CSS formula of it (jixoai.css). Here it
  // wires only this panel's toggle seam and live wrap anchor
  // renamed panelMotion (W3-D3): the §8 axis prop owns the `motion`
  // name now — the kernel local takes the popover.svelte spelling
  const panelMotion = createSurfaceMotion(() => panelEl, { anchor: () => anchorEl });
  onDestroy(() => panelMotion.destroy());

  function onListKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const first = firstEnabled();
      if (first >= 0) active = first;
    } else if (event.key === 'End') {
      event.preventDefault();
      const last = lastEnabled();
      if (last >= 0) active = last;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[active];
      if (option && !option.disabled) choose(option);
    }
    // Escape needs no handler: popover="auto" closes on it natively
  }

  // native-select muscle memory: ↑/↓ on the closed trigger opens it
  function onTriggerKeydown(event: KeyboardEvent): void {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      panelEl?.showPopover();
    }
  }

  // keep the highlight row visible when it moves off-panel
  $effect(() => {
    if (open && active >= 0) {
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    }
  });
</script>

<div class="jx-field" data-density={densityRungOf(d.density)} class:dark={d.theme === 'dark'} style={fieldStyle}>
  <!-- faceless form bridge (form-field.ts law): the committed value rides
       ElementInternals into FormData; jx-reset / jx-disabled bubble the
       form lifecycle back into this component. Owns no box, no content —
       the `contents` utility keeps the prerendered HTML from flashing an
       extra flex gap pre-upgrade.
       disabled passes `|| undefined`: Svelte has no boolean-attribute
       semantics for custom elements and would render disabled="false"
       as a PRESENT attribute (presence = true in HTML). -->
  <jx-form-field
    class={cx(selectStyles.bridge)}
    aria-hidden="true"
    {name}
    value={value ?? ''}
    disabled={isDisabled || undefined}
    onjx-reset={() => (value = initialValue)}
    onjx-disabled={(event: CustomEvent<boolean>) => (formDisabled = event.detail)}
  ></jx-form-field>
  {#if label}<label class="jx-label" for={id}>{label}</label>{/if}
  <span data-jx-sel-wrap class={cx(selectStyles.wrap)} style="anchor-name: {anchorName}" bind:this={anchorEl}>
    <!-- aria-invalid rides the trigger although the checker's per-role
         list doesn't include it: it IS a WAI-ARIA global state, and the
         family law wires invalid state on the control itself -->
    <!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
    <!-- jx-html-input (B1, ui-plugin-followup): the trigger's form-lane
         law is the standard layer's text-like control box — border, hit,
         inset, text/leading, hover/focus/disabled/invalid states all
         single-sourced there; markup keeps only layout (flex row) and
         the closed-control cursor. Core utilities sort AFTER the custom
         @utility in the built sheet, so `flex` reliably overrides the
         law's display:block (probe-verified). -->
    <button
      bind:this={triggerEl}
      type="button"
      id={id}
      class={cn(
        'jx-sel-trigger jx-html-input',
        cx(selectStyles.trigger),
        className,
      )}
      popovertarget={panelId}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-invalid={invalidAttr}
      aria-describedby={describedBy}
      disabled={isDisabled}
      onkeydown={onTriggerKeydown}
      {...rest}
    >
      <span
        data-jx-sel-value
        data-jx-sel-placeholder={!selected ? '' : undefined}
        class={cn(
          cx(selectStyles.value),
          !selected && cx(selectStyles.valuePlaceholder),
        )}
      >
        {selected?.label ?? placeholder}
      </span>
      <!-- the chevron = an ICON SLOT (B1): the span paints currentColor
           through the mask on --jx-icon-chevron (the same slot
           jx-html-select reads), so a face/plugin override re-skins the
           composite and the native control with one variable. The inline
           lucide SVG fallback default keeps the glyph without the sheet.
           Size = var(--jx-icon) — the density kernel's icon law
           (mediaIcon_d = line height), the same equation jx-html-select
           paints its background glyph at; the glyph's own box padding is
           the value→chevron optical gap (the native law's text reserve
           inset+icon, no extra flex gap). -->
      <span
        class={cn(
          'jx-sel-chevron',
          cx(selectStyles.chevron),
          open && cx(selectStyles.chevronOpen),
        )}
        aria-hidden="true"
      ></span>
    </button>
  </span>

  <div
    bind:this={panelEl}
    id={panelId}
    popover="auto"
    class={cn('jx-sel-panel jx-surface', panelMotion.supported && 'jx-waapi')}
    data-variant={d.variant}
    data-density={densityRungOf(d.density)}
    class:dark={d.theme === 'dark'}
    style={panelStyle}
    ontoggle={onPanelToggle}
  >
    <!-- surface body (bezel paint + ::after shadow) + scroll ring
         (floating-surface law arch r3: the platform element paints
         nothing; the bezel fill resolves through the panel's fill
         props cascading into the body) -->
    <div data-jx-sel-panel-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
    <!-- the REAL shadow layer: a DOM child because pseudo-elements are
         unreachable from WAAPI — the kernel animates it in lockstep
         (Owner ruling r18) -->
    <div data-jx-sel-panel-body class="jx-surface-body">
    <div data-jx-sel-scroll class={cx(selectStyles.scroll)}>
    <ul
      bind:this={listEl}
      id={listboxId}
      class={cn('jx-sel-list', cx(selectStyles.list))}
      role="listbox"
      tabindex="-1"
      aria-label={label ?? placeholder}
      aria-activedescendant={active >= 0 ? optionId(active) : undefined}
      onkeydown={onListKeydown}
    >
      {#each options as option, index (option.value)}
        <!-- option rows are click-only BY PATTERN: the keyboard path rides
             the focusable list (jx-sel-list keydown + aria-activedescendant
             roving highlight), never the row itself -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id={optionId(index)}
          role="option"
          aria-selected={option.value === value ? 'true' : 'false'}
          aria-disabled={option.disabled ? 'true' : undefined}
          data-jx-sel-active={index === active ? '' : undefined}
          data-jx-sel-selected={option.value === value ? '' : undefined}
          data-jx-sel-disabled={option.disabled ? '' : undefined}
          class={cn(
            'jx-sel-option',
            cx(selectStyles.option),
            index === active && cx(selectStyles.rowActive),
            option.value === value && cx(selectStyles.rowActive, selectStyles.rowSelectedEdge),
            option.disabled && cx(selectStyles.rowDisabled),
          )}
          onclick={() => choose(option)}
        >
          <span data-jx-sel-option-label class={cx(selectStyles.optionLabel)}>{option.label}</span>
          {#if option.description}
            <span data-jx-sel-option-desc class={cx(selectStyles.optionDesc)}>{option.description}</span>
          {/if}
        </li>
      {/each}
    </ul>
    </div>
    </div>
  </div>

  {#if invalid}
    <p id={errorId} class="jx-error"><span class="jx-error-mark" aria-hidden="true">!</span>{error}</p>
  {/if}
</div>
