<!--
  jixoai alert (registry/files/ui/alert/alert.svelte).
  The inline notice block: 1px border, hard offset shadow, and the
  variant ladder as its surface. Not the modal one (that is
  system-dialog, a later registry item) — this is the in-flow banner
  for loaded/failed states.

  Live-region semantics are a prop, not a guess:
    assertive={false} (default) → role="status"  polite announcements
    assertive={true}            → role="alert"   immediate (errors —
                                  pair with the error-status injection)

  Variant grammar (2026-08-26, variant-grammar change): the old
  tone law (default/primary/destructive) is superseded; the
  one-brand-hue idea survives as the TOKEN defaults. Prominence is
  the ladder, hue is injection through the global tokens:
    outline (default)  transparent ground, [border-color:var(--jx-outline)],
                       title foreground — the plain notice
    tonal              12% tinted ground + 45% border + title
                       [color:var(--jx-tonal)] — emphasis; brand tint
                       by default, injected per intent through class
                       utilities: jx-hue-error for failed STATUSES, jx-hue-success
                       for passing (the arbitrary-property class remains
                       the escape hatch for unlisted hues).
  Action vs status is the caller's call (design §3): destructive is
  an ACTION hue (delete/cancel — PressButton's fill pair); Alert is
  a status surface, so failures inject --error, never --destructive.

  Surface ruling: the banner IS its variant surface — the old bg-card
  ground is gone, the ladder paint replaces it. The 1px border and
  the hard offset shadow-2xs STAY: every sibling static surface on
  the site (kbd, menubar, toggle-group, transfer panels, empty's art
  block) pairs border + shadow-2xs — the hard offset is the site's
  terminal material law, not a card-specific trait.

  Composition: optional `icon` snippet lands inline-start of the title
  (bring your own — lucide, svg, text glyph); children is the body copy.

  Dismissal (grindstone #17-1, 2026-09-13): the LIFECYCLE axis, third
  and orthogonal to variant (paint) and assertive (aria) — undefined =
  persistent (no button, no timer; the ID7 unresolved-frame shape
  stays), 'manual' = a × button at the title row's inline-end firing
  onDismiss('button'), 'auto' = manual + a mount-armed dismissAfter
  timer firing onDismiss('timer'). Presence stays the caller's: the
  alert only SIGNALS, it never unmounts itself. The timer arms once
  at mount, re-arms when dismissAfter changes, and teardown cancels
  (an unmounted alert never fires). Two documented caveats, not
  runtime couplings: same-instance message swaps do NOT reset the
  clock — key the alert ({#key notice}) when each message deserves a
  fresh deadline; assertive + 'auto' (immediate announcement that
  evaporates in 6s) reads aggressive to screen-reader users — pair
  'auto' with polite (the default). The × button rides INSIDE the
  live region (the toast-viewport family precedent, Owner ruling).

  tw4 (2026-08-24) → tailwindless Wave 1 batch 3 (2026-09-17): the
  paint rides the family's stylex ATOMS (alert.stylex.ts) joined
  through cx() — the ladder maps variant → atom groups for the
  surface/title/body ink; consumer classes still win (the F9 layer
  law). ONLY the passed-through icon-glyph normalization (a descendant
  boundary) stays in alert.css; `jx-alert*` classes are semantic
  hooks, css defines them not.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import {
    densityRungOf,
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
  import { AlertDefaults, type AlertVariant } from './alert-defaults.svelte';
  import { alertStyles } from './alert.stylex';
  import './alert.css';

  interface Props {
    /** ladder prominence: outline (plain notice) | tonal (tinted
     *  emphasis); omitted → the ambient paint zone, else the frozen
     *  own 'outline' */
    variant?: AlertVariant;
    /** true → role=alert (assertive); false → role=status (polite) */
    assertive?: boolean;
    /** one-line heading; omitted renders a bare body block */
    title?: string;
    /** icon snippet, rendered inline-start of the title */
    icon?: Snippet;
    /** the dismissal contract, orthogonal to variant and assertive:
     *  undefined = persistent (no button, no timer); 'manual' = a ×
     *  button firing onDismiss('button'); 'auto' = manual + a
     *  mount-armed timer firing onDismiss('timer'). CAVEATS (documented,
     *  never coupled at runtime): a same-instance message swap does not
     *  reset the clock — key the alert for a fresh deadline; pairing
     *  with assertive (role=alert + a 6s evaporation) is aggressive to
     *  screen-reader users */
    dismiss?: 'manual' | 'auto';
    /** 'auto' duration in ms (default 6000); a change re-arms the timer */
    dismissAfter?: number;
    /** the dismissal signal — button click or timer deadline; presence
     *  stays the caller's (the alert never unmounts itself) */
    onDismiss?: (how: 'button' | 'timer') => void;
    /** the × button's aria-label (default 'dismiss', the toast ruling) */
    dismissLabel?: string;
    /** density policy: the universal §4 lane (named rungs + the
     *  documented small/medium/large aliases · auto · a coefficient
     *  number · query()) */
    density?: DensityLane | QueryResult<DensityLane>;
    /** universal size axis (§1): root font-size — named steps · auto
     *  (inherit) · a px number · query() (ONE number moves the whole
     *  notice: title, body and the × affordance scale) */
    size?: SizeLane | QueryResult<SizeLane>;
    /** universal shape axis (§2): corner geometry; auto = inherit */
    shape?: ShapeLane | QueryResult<ShapeLane>;
    /** universal radius axis (§3): corner size; auto = the concentric
     *  broadcast (the banner SUPPLIES the anchor for nested auto
     *  consumers) */
    radius?: RadiusLane | QueryResult<RadiusLane>;
    /** universal color axis (§5): the hue axis of the oklch system */
    color?: ColorLane | QueryResult<ColorLane>;
    /** universal theme axis (§6): light/dark/system; auto = tree
     *  inheritance (the .dark class bridge) */
    theme?: ThemeLane | QueryResult<ThemeLane>;
    /** universal elevation axis (§7): official M3 levels · dp ·
     *  query() */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
    /** body copy; omit for a title-only notice */
    children?: Snippet;
    class?: string;
    style?: string;
  }

  let {
    variant,
    assertive = false,
    title,
    icon,
    dismiss,
    dismissAfter = 6000,
    onDismiss,
    dismissLabel,
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
    style: consumerStyle,
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): variant rides the paint axis slot (zone ambient,
  // frozen own 'outline'); W3-D5 widens the record to the EIGHT-axis
  // surface (density was already the no-opinion slot — now the
  // bridged universal member) — one resolution record, the §10
  // carriers JOIN the consumer style attr (the merge law), the §11
  // supply + the query() anchor follow the standard wiring (the
  // anchor after the state decl)
  const d = $derived(
    AlertDefaults.resolve({ variant, density, size, shape, radius, color, theme, elevation, motion }),
  );
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  let uniRoot = $state<HTMLDivElement>();
  provideQueryAnchor(() => uniRoot ?? null);
  const rootStyle = $derived(
    [carriers, consumerStyle ?? undefined].filter(Boolean).join('; ') || undefined,
  );

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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // variant grounds (design.md §1 recipes, verbatim) — the ladder
  // surface REPLACES the card ground; the border + hard offset shadow
  // are the terminal material law and stay (the banner atom). Each
  // rung's atom carries its design §6 forced-colors degradation: the
  // color-mix tints do NOT drop on their own under forced colors
  // (probed, r2) — Canvas + CanvasText with the 1px border surviving
  // is the lawful result.
  const surface: Record<AlertVariant, string> = {
    outline: cx(alertStyles.surfaceOutline),
    tonal: cx(alertStyles.surfaceTonal),
  };
  // the title consumes the variant ink; the BODY consumes it too on
  // the tonal rung (r2 blocker fix: an error banner no longer paints
  // a red title over gray body copy) — outline keeps the muted body,
  // the neutral rung's own ink ramp for long copy
  const titleColor: Record<AlertVariant, string> = {
    outline: cx(alertStyles.titleOutline),
    tonal: cx(alertStyles.titleTonal),
  };
  const bodyColor: Record<AlertVariant, string> = {
    outline: cx(alertStyles.bodyOutline),
    tonal: cx(alertStyles.bodyTonal),
  };

  // ---- the dismissal timer (grindstone #17-1) — the notice.ts law
  // inlined: armed once at mount, re-armed when dismissAfter (or the
  // mode) changes, CANCELLED at teardown — an unmounted alert never
  // fires. The deadline signals only; presence stays the caller's
  let dismissTimer = 0;

  function fireTimer(): void {
    dismissTimer = 0;
    onDismiss?.('timer');
  }

  $effect(() => {
    if (dismiss !== 'auto') return;
    dismissTimer = window.setTimeout(fireTimer, dismissAfter);
    return () => {
      if (dismissTimer) window.clearTimeout(dismissTimer);
      dismissTimer = 0;
    };
  });
</script>

{#snippet dismissButton()}
  <!-- the × affordance: a ghost text glyph (the number-input law — no
       icon dependency in this family), hit-sized, riding the title
       row's inline-end; the button lives INSIDE the live region (the
       toast-viewport family precedent, Owner ruling #17) -->
  <button
    type="button"
    data-jx-alert-dismiss=""
    class={cx(alertStyles.dismissBtn)}
    aria-label={dismissLabel ?? 'dismiss'}
    onclick={() => onDismiss?.('button')}
  ><span aria-hidden="true">×</span></button>
{/snippet}

<div
  bind:this={uniRoot}
  class={cn(cx(alertStyles.banner), surface[d.variant], className)}
  data-jx-alert={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  role={assertive ? 'alert' : 'status'}
>
  {#if title}
    <p data-jx-alert-title="" class={cn(cx(alertStyles.titleRow), titleColor[d.variant])}>
      {#if icon}<span class="jx-alert-icon {cx(alertStyles.iconLane)}">{@render icon()}</span>{/if}{title}
      {#if dismiss}{@render dismissButton()}{/if}
    </p>
  {:else if dismiss}
    <div data-jx-alert-dismiss-row="" class={cx(alertStyles.dismissRow)}>{@render dismissButton()}</div>
  {/if}
  {#if children}
    <div data-jx-alert-body="" class={cn(cx(alertStyles.bodyText), bodyColor[d.variant])}>
      {@render children()}
    </div>
  {/if}
</div>
