<!--
  jixoai hover card (registry/files/ui/hover-card/hover-card.svelte).
  The rich cousin of tooltip.svelte: same intent model (hover delay in,
  cancellable close grace, focus opens instantly, Escape closes) on a
  popover=manual panel with CSS Anchor Positioning — but the panel is
  INTERACTIVE content, so two laws differ:

    role: NOT role=tooltip — the panel is supplementary rich content
    (user cards, link previews). It carries no imposed role; compose
    headings/links inside. No aria-describedby either: the card is not
    a description of the trigger.

    focus: the close grace spans the PANEL too — pointer/focus inside
    the card cancels any pending close (pointerenter on the panel, and
    a focusout check that treats panel content as inside). Only a real
    exit (pointer leaves both, focus leaves both, Escape) dismisses.

  Delays are hover-card paced: 300ms open, 200ms close grace.
  Non-interactive by necessity? No — interactive BY DESIGN; if you only
  need text, that is what tooltip.svelte is for.

  tw4 (2026-08-24): anchor/body paint as token utilities in the markup;
  hover-card.css keeps ONLY the D1-exempt panel law — anchor geometry
  (the gap margin must stay: the @supports viewport-center fallback
  re-sets it to auto in the same layer), and the transparent ::backdrop.

  Motion kernel (2026-08-25): adopts the shared WAAPI surface-motion
  kernel (lib/surface-motion.ts) — open()/close() drive the --jx-p
  timeline at the show/hide call sites and the live panel↔anchor
  axis; a REAL shadow child (not the ::after pseudo) rides under
  jx-waapi (jixoai.css law).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
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
  import { HoverCardDefaults, type HoverCardSurfaceVariant } from './hover-card-defaults.svelte';
  import { hoverCardStyles } from './hover-card.stylex';
  import './hover-card.css';

  // the payload's own join (separator's serialize law — the chip
  // precedent): objects in dev, joined strings in payloads, never a
  // raw class={styles.x} interpolation
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  interface Props {
    id?: string;
    /** the card content — compose freely (headings, links, images) */
    children: Snippet;
    /** the trigger content; the wrapper span carries the anchoring */
    trigger: Snippet;
    /** anchored side; 'bottom' (under, like a peek) is the convention */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    openDelay?: number;
    closeDelay?: number;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency). Omitted → the
        contract own 'auto' (HoverCardDefaults — a declared own, not
        ambient) */
    variant?: HoverCardSurfaceVariant;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size — an explicit lane
     *  makes the card the CONCENTRIC ANCHOR (the carrier stamps
     *  --jx-radius-effective on the top-layer root — self-carried
     *  across the promotion, the batch C portal law); auto consumes
     *  the broadcast against the panel's own ancestors */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() — the consumption pair composes the theme's level
     *  table (shadow recipe + the PAIRED ladder-rung surface); own
     *  level2 = the peek card's historic z-feel (3dp) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    class?: string;
  }

  const autoId = $props.id();

  let {
    id = autoId,
    children,
    trigger,
    placement = 'bottom',
    openDelay = 300,
    closeDelay = 200,
    variant,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    class: className = '',
  }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.2 + W3-C):
  // one record — variant's own 'auto' and the peek card's own
  // elevation level2 live in HoverCardDefaults; the seven other axes
  // are no-own (the ambient context flows through the top-layered
  // panel, which stays a DOM descendant at its authored position)
  const d = $derived(
    HoverCardDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (PORTAL LAW, W3-C: the carriers stamp the PANEL — the promoted
  // root is self-carried)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  // §3/§14 radius consumption (the fallback is the auto concentric
  // form verbatim — the root sheet's invariants close it)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  // §7's consumption pair + the solid-fill bridge
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));

  // id is mount-stable by contract; $derived keeps the name truthful
  const anchorName = $derived(`--jx-hover-${id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  const area = $derived(
    placement === 'top' ? 'top'
    : placement === 'left' ? 'left'
    : placement === 'right' ? 'right'
    : 'bottom'
  );

  let anchorEl = $state<HTMLElement | null>(null);
  let panel = $state<HTMLElement | null>(null);
  provideQueryAnchor(() => panel ?? null);
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const popoverApi = (
    el: HTMLElement | null,
  ): el is HTMLElement & { showPopover(): void; hidePopover(): void } =>
    !!el && typeof el.showPopover === 'function';

  // the shared declarative motion kernel (r29) — same law as popover;
  // the live axis measures panel↔anchor (the trigger wrapper)
  const panelMotion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

  function clearTimers(): void {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
  }

  function open(): void {
    clearTimers();
    if (popoverApi(panel) && !panel!.matches(':popover-open')) {
      panel!.showPopover();
      panelMotion.play(1);
      panelMotion.startTracking();
    }
  }
  function close(): void {
    clearTimers();
    if (popoverApi(panel) && panel!.matches(':popover-open')) {
      panel!.classList.remove('jx-rest');
      panelMotion.play(0);
      panelMotion.stopTracking();
      panel!.hidePopover();
    }
  }

  /** inside = trigger wrapper OR the card panel — exits of one that
   *  land in the other are crossings, not dismissals */
  function inside(node: Node | null): boolean {
    return !!node && ((anchorEl?.contains(node) ?? false) || (panel?.contains(node) ?? false));
  }

  function scheduleClose(): void {
    clearTimeout(openTimer);
    closeTimer = setTimeout(close, closeDelay);
  }

  onDestroy(() => {
    clearTimers();
    panelMotion.destroy();
  });
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && close()} />

<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper
     carries hover/focus intent only; real interaction lives in the
     focusable trigger the consumer composed inside -->
<span
  bind:this={anchorEl}
  data-jx-hover-anchor=""
  class={cn(cx(hoverCardStyles.anchor), className)}
  style="anchor-name: {anchorName}"
  onpointerenter={() => {
    clearTimeout(closeTimer);
    openTimer = setTimeout(open, openDelay);
  }}
  onpointerleave={scheduleClose}
  onfocusin={open}
  onfocusout={(e) => {
    if (!inside(e.relatedTarget)) scheduleClose();
  }}
>
  {@render trigger()}
</span>

<!-- svelte-ignore a11y_no_static_element_interactions -- the panel's
     pointer handlers only cancel the close grace; its interactive
     content is composed by the consumer -->
<div
  {id}
  popover="manual"
  class={cn(
    cx('jx-hover-card jx-surface', hoverCardStyles.panel),
    panelMotion.supported && 'jx-waapi',
  )}
  data-variant={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  bind:this={panel}
  style={[
    carriers,
    radiusConsumed,
    elevationConsumed,
    `position-anchor: ${anchorName}`,
    `inset-area: ${area}`,
    `position-area: ${area}`,
  ]
    .filter(Boolean)
    .join('; ')}
  onpointerenter={() => clearTimeout(closeTimer)}
  onpointerleave={scheduleClose}
  onfocusin={() => clearTimeout(closeTimer)}
  onfocusout={(e) => {
    if (!inside(e.relatedTarget)) scheduleClose();
  }}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from WAAPI — the kernel animates it in lockstep -->
  <div data-jx-hover-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow); the popover element paints
       nothing (floating-surface law arch r3) -->
  <div data-jx-hover-body="" class={cx('jx-surface-body', hoverCardStyles.body)}>
    {@render children()}
  </div>
</div>
