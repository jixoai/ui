<!--
  jixoai SystemDialogContent
  (registry/files/ui/system-dialog/system-dialog-content.svelte;
  popover-engine rebuild, 2026-09-01 — Owner ruling: the alert rises
  BESIDE its trigger, Popover technology as the base).
  The surface half: a popover="manual" panel anchored to the Trigger
  through the CSS Anchor Positioning API (anchor-name on the trigger,
  position-anchor + position-area + position-try on the panel) — the
  alert rises at the button that asked the question, flipping via the
  native try-fallbacks when the viewport edge is near. The old native
  <dialog>+showModal() centering is retired WITH its bug class (the
  missing m-auto that sent the dialog to the top-left corner).

  Manual popover = alert gravity: NO light dismiss (an outside click
  must not silently answer a destructive question); Escape is OURS —
  re-routed into the animated cancel. SCOPING (D-12, 2026-09-02): the
  keydown lives on the panel itself, so Escape cancels while focus is
  INSIDE the panel; the alert is non-modal by design (no trap) — a
  user who tabs back to the page has left the question, and Escape
  there is the page's own. The top layer + ::backdrop scrim
  still come from the platform. role=alertdialog + aria-labelledby/
  aria-describedby wire the deterministic derived ids (a Content
  without a Title part is caller error — the alertdialog contract).

  On open, focus lands on the CANCEL action (APG safe-landing law),
  looked up DOM-delegated. Engines without the popover API (jsdom
  included) degrade to the state alone — the guard keeps everything
  truthful everywhere.
-->
<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
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
  import { SYSTEM_DIALOG_KEY, type SystemDialogApi } from './system-dialog.svelte';
  import { SystemDialogDefaults, type SystemDialogSurfaceVariant } from './system-dialog-defaults.svelte';
  import { sysdlgStyles } from './system-dialog.stylex';
  import './system-dialog.css';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency). Omitted → the
        contract own 'auto' (SystemDialogDefaults — a declared own, not
        ambient) */
    variant?: SystemDialogSurfaceVariant;
    /** the SYSTEM pose (system-dialog, 2026-09-09): 'anchored' (default)
        rides the CSS Anchor Positioning geometry against the trigger;
        'center' drops the anchor chain and lets the UA's popover
        centering own the panel (margin auto + fit-content, inset 0) —
        the window.alert/prompt/confirm posture for panels with no
        trigger to rise beside */
    pose?: 'anchored' | 'center';
    /** where focus lands on open: 'cancel' (default, the APG
        safe-landing law) | 'none' (the caller owns the landing — the
        prompt form focuses its input) */
    focusLanding?: 'cancel' | 'none';
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
     *  makes the alert the CONCENTRIC ANCHOR (the carrier stamps
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
     *  level3 = the system alert's historic z-feel (6dp — one rung
     *  under the modal dialog, it rises beside its trigger, not over
     *  the page) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    children?: Snippet;
    class?: string;
  }

  // style is destructured OUT of rest so the consumer's declarations
  // ride AFTER the anchoring style (the Trigger's merge law, :36) —
  // {...rest} before the fix let a consumer style attribute silently
  // drop the anchor geometry (D-4, 2026-09-02)
  let {
    variant,
    pose = 'anchored',
    focusLanding = 'cancel',
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
    children,
    class: className = '',
    style = '',
    ...rest
  }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 3.2 + W3-C):
  // one record — variant's own 'auto' and the alert's own elevation
  // level3 live in SystemDialogDefaults; the seven other axes are
  // no-own (the ambient context flows through the top-layered panel)
  const d = $derived(
    SystemDialogDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (PORTAL LAW, W3-C: the carriers stamp the PANEL — the promoted
  // root is self-carried; the Action/Cancel parts inside resolve
  // against this supply through the Svelte context, which follows the
  // COMPONENT tree, never the top-layer promotion)
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

  // the payload's own join (separator's serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — Svelte's class interpolation stringifies
  // objects, so composition goes through THIS joiner (all string
  // values except $$css, space-joined — never a raw class={styles.x})
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

  const api = getContext<SystemDialogApi>(SYSTEM_DIALOG_KEY);

  // the anchoring style MUST follow the context init: the template reads
  // api.uid, and at its former position (before `api`) the 25c32355 fix
  // SSR-crashed — Cannot access 'api' before initialization (TDZ). A plain
  // const is correct here: uid is instance-stable and pose is static per
  // usage (the mounted host never flips its pose mid-flight).
  const anchorStyle = pose === 'center'
    ? 'margin: auto'
    : `position-anchor: --${api.uid}; position-area: block-end; inset-area: block-end; position-try: flip-block, flip-inline, flip-block flip-inline; position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline; margin: var(--jx-gap, 0.5rem)`;

  let panel = $state<HTMLDivElement | null>(null);
  provideQueryAnchor(() => panel ?? null);

  // the shared declarative motion kernel — same law as popover.svelte:
  // --jx-p drives every formula; hidePopover() fires IMMEDIATELY on the
  // falling edge, the exit rides the kernel's discrete window
  const panelMotion = createSurfaceMotion(() => panel);

  onDestroy(() => panelMotion.destroy());

  $effect(() => {
    if (api.open) {
      // guarded: jsdom (and any popover-less engine) degrades to the
      // state alone — aria-expanded and the wiring stay truthful
      panel?.showPopover?.();
      panelMotion.play(1);
      panelMotion.startTracking();
      // APG: the SAFE action takes focus — the destructive path must be
      // a deliberate move, never the landing spot. DOM-delegated lookup
      // scoped to THIS panel; the rAF re-checks the open state (the
      // popconfirm law — a fast close must not refocus the dead panel)
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          if (!panel?.matches(':popover-open')) return;
          if (focusLanding === 'none') return; // the caller owns the landing
          // cancel first (the safe-landing law); a strip with NO cancel
          // (the alert posture's single affirmative) lands on the action
          (
            panel?.querySelector<HTMLButtonElement>('[data-jx-sysdlg-cancel]') ??
            panel?.querySelector<HTMLButtonElement>('[data-jx-sysdlg-action]')
          )?.focus();
        });
      }
    } else {
      untrack(() => shut());
    }
  });

  // Escape is OURS on a manual popover: the alert cancels through the
  // STATE — the declarative shut below is the family's single closing
  // path (every surface closes the same way: state flips, effect reacts)
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      api.setOpen(false);
    }
  }

  const shut = (): void => {
    if (!panel) return;
    // the anchored alert RETURNS focus to its invoker — only when the
    // focus was ours (a user who tabbed away is not pulled back)
    const hadFocus = panel.contains(panel.ownerDocument.activeElement);
    panelMotion.stopTracking();
    panel.classList.remove('jx-rest');
    panelMotion.play(0);
    panel?.hidePopover?.();
    if (hadFocus) api.restoreInvoker();
  };
</script>

<!-- the panel: margin is SYMMETRIC (all sides, D-13 2026-09-02 — the
     .jx-menu family precedent): a flip-block fallback must find the
     same gap on the flipped side, never stick to the trigger -->
<div
  bind:this={panel}
  popover="manual"
  class={cn(
    'jx-surface',
    cx(sysdlgStyles.panel),
    panelMotion.supported && 'jx-waapi',
    className,
  )}
  data-variant={d.variant}
  data-jx-sysdlg=""
  data-pose={pose}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={[carriers, radiusConsumed, elevationConsumed, anchorStyle, style].filter(Boolean).join('; ')}
  {...rest}
  role="alertdialog"
  aria-labelledby="{api.uid}-title"
  aria-describedby="{api.uid}-desc"
  onkeydown={handleKeydown}
>
  <!-- the REAL shadow layer: a DOM child because pseudo-elements are
       unreachable from the motion timeline -->
  <div data-jx-sysdlg-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
  <!-- surface body (fill + ::after shadow) wraps ALL content; the
       popover element paints nothing (floating-surface law arch r3) -->
  <div data-jx-sysdlg-surface="" class="jx-surface-body">
    <div data-jx-sysdlg-body="" class={cx(sysdlgStyles.body)}>
      {@render children?.()}
    </div>
  </div>
</div>
