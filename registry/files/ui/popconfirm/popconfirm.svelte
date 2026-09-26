<!--
  jixoai popconfirm (registry/files/ui/popconfirm/popconfirm.svelte).
  The LIGHT confirm bubble for risky-but-reversible actions (antd's
  highest-frequency unique gift), per the antd batch-1 ruling: a
  popover=auto panel on the popover laws — NOT an alertdialog. The
  modal weight stays with system-dialog; this is the quick "sure?" that
  deletes a row without ceremony.

  Semantics:
    light dismiss (outside click / Escape) = CANCEL — any dismissal
    that is not the confirm button runs oncancel; confirm runs
    onconfirm then closes. Focus lands on CANCEL on open (the safe
    action, the system-dialog law in its light form). The trigger is
    whatever focusable control you compose inside; the wrapper carries
    the anchor name.

  tw4 (2026-08-24) → tailwindless Wave 1 batch 3 (2026-09-17): the
  paint rides the family's stylex ATOMS (popconfirm.stylex.ts) joined
  through cx() — anchoring extras (position-try/-fallbacks,
  position-visibility) are atoms; the panel, surface, and button paint
  (tone voices conditional per prop) walk atom groups; ONLY the
  ::backdrop and the @supports no-anchor fallback stay in
  popconfirm.css (D1-exempt residue). The platform element still
  paints NOTHING; the theme's jx-surface-body owns fill + border +
  blur, the shadow layer owns the shadow (floating-surface law,
  intact). NO display atom ever lands on the panel itself — a base
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
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
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
  import { PopconfirmDefaults, type PopconfirmSurfaceVariant } from './popconfirm-defaults.svelte';
  import { pcStyles } from './popconfirm.stylex';
  import './popconfirm.css';

  interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    density?: DensityLane | QueryResult<DensityLane>;
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
        the environment asks for reduced transparency). Omitted → the
        contract own 'auto' (PopconfirmDefaults — a declared own, not
        ambient) */
    variant?: PopconfirmSurfaceVariant;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size — an explicit lane
     *  makes the bubble the CONCENTRIC ANCHOR; auto consumes the
     *  broadcast against the panel's own ancestors */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() — the consumption pair composes the theme's level
     *  table (shadow recipe + the PAIRED ladder-rung surface); own
     *  level2 = the confirm bubble's historic z-feel (3dp) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
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
    variant,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    content,
    actions,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // (the button-group r11 idiom) The CAPTURE is load-bearing and
  // eager: getDensityContext() rides the $derived.by ARGUMENT subtree,
  // which evaluates at this statement — BEFORE provideDensity writes
  // the key — so it captures the PARENT's context object. A lazily-
  // evaluated read would resolve the key to the panel's OWN write and
  // self-reference through the very getter it feeds
  // (derived_references_self, pinned in defaults-buttons.spec).
  // The W3 universal lane narrows at the legacy edge (the input-group
  // law): 'auto'/number/query lanes carry no legacy rung — the rung
  // stays ambient (§4), the coefficient rides the carriers on the root
  const legacyDensityLane = $derived(
    typeof density === 'string' && density !== 'auto' ? density : undefined,
  );
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(legacyDensityLane, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.2 + W3-C) — ON
  // TOP of the provider lane (the button-group law): the density slot's
  // ambient read resolves the key to this panel's OWN write, whose
  // getter is the captured-parent resolution above, so the chain
  // TERMINATES (it never re-enters this derived) and lands the same
  // values on every lane; variant's own 'auto' and the bubble's own
  // elevation level2 live in PopconfirmDefaults, auditable in one place
  const d = $derived(
    PopconfirmDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (PORTAL LAW, W3-C: the carriers stamp the PANEL — the promoted
  // root is self-carried). The universal density supply rides the
  // bridged provideDensity write above; this supply carries the other
  // seven axes downward
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ size, shape, radius, color, theme, elevation, motion });
  // §3/§14 radius consumption (the fallback is the auto concentric
  // form verbatim — the root sheet's invariants close it)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  // §7's consumption pair + the solid-fill bridge
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));

  const anchorName = $derived(`--jx-pc-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'bottom' ? 'bottom'
    : placement === 'left' ? 'left'
    : 'right'
  );
  // the panel's composed style: the §11 carriers + the §3/§7
  // consumption stamps + the anchor geometry (position-try law verbatim)
  const panelStyle = $derived(
    [
      carriers,
      radiusConsumed,
      elevationConsumed,
      `position-anchor: ${anchorName}`,
      `inset-area: ${area}`,
      `position-area: ${area}`,
    ]
      .filter(Boolean)
      .join('; '),
  );

  let panel = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => panel ?? null);
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
      panelMotion.play(1);
      panelMotion.startTracking();
      requestAnimationFrame(() => {
        if (typeof requestAnimationFrame === 'function' && panel?.matches(':popover-open')) {
          cancelEl?.focus();
        }
      });
    } else {
      panel?.classList.remove('jx-rest');
      panelMotion.play(0);
      panelMotion.stopTracking();
      if (!confirmed) oncancel?.();
    }
  }

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. Wired at the toggle seam above; the live
  // axis measures panel↔anchor (the trigger wrapper)
  const panelMotion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

  onDestroy(() => panelMotion.destroy());

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner, never a
  // raw class={styles.x} interpolation
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
</script>

<span
  bind:this={anchorEl}
  data-jx-pc-anchor=""
  class={cn(cx(pcStyles.anchor), className)}
  {...rest}
  data-density={densityRungOf(d.density)}
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
    'jx-pc jx-surface',
    cx(pcStyles.panel),
    panelMotion.supported && 'jx-waapi',
  )}
  data-variant={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  bind:this={panel}
  style={panelStyle}
  ontoggle={handleToggle}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-pc-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div data-jx-pc-surface="" class="jx-surface-body {cx(pcStyles.surfaceBody)}">
  {#if content}
    {@render content()}
  {:else}
    <p id={titleId} data-jx-pc-title="" class={cx(pcStyles.title)}>{title}</p>
    {#if description}
      <p id={descId} data-jx-pc-desc="" class={cx(pcStyles.description)}>{description}</p>
    {/if}
  {/if}
  {#if actions}
    {@render actions()}
  {:else}
    <div data-jx-pc-actions="" class={cx(pcStyles.actions)}>
    <button
      type="button"
      data-jx-pc-btn=""
      data-jx-pc-cancel=""
      class={cx(pcStyles.button)}
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
        cx(pcStyles.button),
        confirmTone === 'destructive'
          ? cx(pcStyles.buttonDestructive)
          : cx(pcStyles.buttonPrimary),
      )}
      onclick={confirm}
    >
      {confirmLabel}
    </button>
    </div>
  {/if}
  </div>
</div>
