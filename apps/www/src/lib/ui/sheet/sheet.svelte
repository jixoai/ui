<!--
  jixoai sheet (registry/files/ui/sheet/sheet.svelte).
  The side drawer on the dialog.svelte laws — a POSITIONING/ANIMATION
  variant of the native <dialog>, not a second state machine: showModal()
  (focus trap, Escape, top layer, backdrop), the same generation-token
  close path, bind:open driving the lifecycle. What changes is where the
  panel sits and how it arrives:

    side: 'left'|'right' (default) |'top'|'bottom' — the panel docks to
    that edge, full-length, and slides in along its axis. The entrance
    is a CSS transform from off-screen (no JS geometry: margin: auto
  centers; edge docking uses inset + translate).

  Notable laws carried over verbatim from dialog.svelte: Escape goes
  through the cancel event and shares the animated close path; a reopen
  during the slide-out supersedes it (generation token); backdrop click
  is NOT wired (deliberate: sheet content is often a form — a stray
  click outside shouldn't destroy it; close via ×, Escape, or your own
  footer action).

  header/footer are optional snippet slots; children is the body.

  Floating-surface law (2026-08-22): the panel rides .jx-surface (::after
  shadow layer, @starting-style entry, variant solid|acrylic|auto) ON TOP
  of the side slide — transform (the slide) and translate (the law's
  rise) compose. DECLARED TIMING EXCEPTION: the sheet keeps its own
  200ms for entry, exit, and the ::backdrop fade (CLOSE_MS=200); the
  dialog-family default is 120ms (Codex r2 — declared, not accidental).

  THE CARD DIALECT (floating-flesh-sweep, 2026-09-09): the interior is
  the structural kernel's — the surface body wraps ONE sticker host
  (data-jx-card, card.css imported — the load-bearing lesson of the
  kernel round) whose three bands carry the drawer: the head band
  (ghost zone; the title row rides CardHeader's children face keeping
  the sheet's own compact uppercase rhythm; the × rides the
  end-action seat as a zone-inheriting IconButton — the hand-drawn
  border button retired), the CardBody band (the scroll cell — the
  kernel's cell law with the sheet's 18px drawer rhythm and popover
  ink overriding through the rhythm escape hatch), and the optional
  foot band (ghost+flat zone over a loose flex row — joined clusters
  are ButtonGroup's law, loose rows stay utilities). The border-b/border-t
  hand lines retired into edge-riding Separator instances.

  What stays sheet's own (the mechanism): edge docking/sizing utilities,
  the slide state machine + keyframes + ::backdrop (sheet.css), the ×
  glyph's descendant scale.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import Icon from '$lib/ui/icon';
  import Separator from '$lib/ui/separator/separator.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import IconButton from '$lib/ui/icon-button/icon-button.svelte';
  import CardBody from '$lib/ui/card/card-body.svelte';
  import CardHeader from '$lib/ui/card/card-header.svelte';
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
  import { SheetDefaults, type SheetSurfaceVariant } from './sheet-defaults.svelte';
  import { sheetStyles } from './sheet.stylex';
  // THE STICKER'S RULE SET (the load-bearing import — stamping
  // data-jx-card without this sheet loads nothing)
  import '$lib/ui/card/card.css';
  import './sheet.css';

  interface Props {
    /** bindable open state — same contract as dialog.svelte */
    open?: boolean;
    /** the edge the panel docks to; slides along that edge's axis */
    side?: 'left' | 'right' | 'top' | 'bottom';
    /** REQUIRED a11y: the dialog's name (aria-labelledby target) */
    title: string;
    /** panel body */
    children: Snippet;
    /** optional header row content (beyond the title + ×) */
    header?: Snippet;
    /** optional sticky footer (action row) */
    footer?: Snippet;
    /** drawer width for left/right (CSS length); default 24rem.
     *  RENAMED from `size` (explicit-props §13, W3-C): a css WIDTH is
     *  not the scale axis — the freed name now belongs to the
     *  universal size lane below */
    width?: string;
    /** floating-surface variant: solid | acrylic | auto (acrylic unless
        the environment asks for reduced transparency) */
    variant?: SheetSurfaceVariant;
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
     *  makes the drawer the CONCENTRIC ANCHOR (the carrier stamps
     *  --jx-radius-effective on the top-layered root — self-carried
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
     *  level4 = the drawer's historic z-feel (8dp, the dialog rung) */
    elevation?: ElevationLane | QueryResult<ElevationLane>;
    /** universal motion axis (§8): intensity — reduced…expressive ·
     *  a coefficient · query() */
    motion?: MotionLane | QueryResult<MotionLane>;
  }

  let {
    open = $bindable(false),
    side = 'right',
    title,
    children,
    header,
    footer,
    width,
    variant,
    density,
    size,
    shape,
    radius,
    color,
    theme,
    elevation,
    motion,
  }: Props = $props();

  // THE DEFAULTS READ POINT (context-defaults-economy 2.2 + W3-C):
  // one record — variant/width resolve their declared owns ('auto' /
  // '24rem' live in SheetDefaults, auditable in one place); the eight
  // universal axes ride the same record (elevation's own level4 is the
  // drawer's historic z-feel on the §7 table)
  const d = $derived(
    SheetDefaults.resolve({ variant, width, density, size, shape, radius, color, theme, elevation, motion }),
  );
  // the §11 carrier stamp + the broadcast supply + the query() anchor
  // (PORTAL LAW, W3-C: the carriers stamp the top-layered root — the
  // resolved axes are self-carried across the promotion)
  const carriers = $derived(stampCarriersForLanes(d));
  provideUniversalLanes({ density, size, shape, radius, color, theme, elevation, motion });
  provideQueryAnchor(() => dialog ?? null);
  // §3/§14 radius consumption — the card's law, the drawer's dialect
  // (the fallback is the auto concentric form verbatim; a bare sheet
  // resolves 0px through the root sheet's invariants)
  const radiusConsumed = $derived(
    d.radius !== undefined && d.radius !== 'auto'
      ? '--jx-radius-consumed: calc(var(--jx-radius-effective, 0px) * var(--jx-radius-factor-effective, 1))'
      : '--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) * var(--jx-radius-factor-effective, 1))',
  );
  // §7's consumption pair: the resolved level's shadow recipe + the
  // PAIRED ladder-rung surface, through the level-table indirection
  const elevationConsumed = $derived(elevationSurfaceOf(d.elevation));
  const rootStyle = $derived(
    [
      carriers,
      radiusConsumed,
      elevationConsumed,
      `--jx-sheet-size: ${d.width}`,
    ].filter(Boolean).join('; ') || undefined,
  );

  let dialog = $state<HTMLDialogElement | null>(null);
  let closing = $state(false);
  let closeGen = 0;

  const CLOSE_MS = 200;
  const prefersReducedMotion = (): boolean =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
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

  /** edge docking per side: the margin that hugs the panel to its edge
   *  (inset: 0 + the auto margin on the cross axes pins it there) */
  const DOCK = {
    left: cx(sheetStyles.dockLeft),
    right: cx(sheetStyles.dockRight),
    top: cx(sheetStyles.dockTop),
    bottom: cx(sheetStyles.dockBottom),
  } as const;
  /** the docked axis geometry: full-height side panels, full-width
   *  top/bottom panels with a dvh cap */
  const AXIS = {
    left: cx(sheetStyles.axisSide),
    right: cx(sheetStyles.axisSide),
    top: cx(sheetStyles.axisEdge),
    bottom: cx(sheetStyles.axisEdge),
  } as const;

  $effect(() => {
    if (open) {
      closeGen += 1;
      closing = false;
      if (dialog && !dialog.open) dialog.showModal();
    } else {
      untrack(() => shut());
    }
  });

  const handleClose = (): void => {
    open = false;
  };

  const handleCancel = (event: Event): void => {
    event.preventDefault();
    shut();
  };

  const shut = (): void => {
    if (!dialog || !dialog.open) return;
    const gen = ++closeGen;
    if (prefersReducedMotion()) {
      closing = false;
      open = false;
      dialog.close();
      return;
    }
    closing = true;
    window.setTimeout(() => {
      if (gen !== closeGen) return;
      closing = false;
      open = false;
      dialog?.close();
    }, CLOSE_MS);
  };
</script>

{#snippet xGlyph()}
  <!-- the strokier × rides the strokeWidth prop; sheet.css owns the
       14px descendant scale -->
  <Icon name="x" strokeWidth={2.5} />
{/snippet}

<dialog
  bind:this={dialog}
  class={cn(
    `jx-sheet jx-sheet-${side} jx-surface`,
    cx(sheetStyles.frame),
    DOCK[side],
    AXIS[side],
    closing && 'closing',
  )}
  data-variant={d.variant}
  data-density={densityRungOf(d.density)}
  class:dark={d.theme === 'dark'}
  style={rootStyle}
  aria-label={title}
  onclose={handleClose}
  oncancel={handleCancel}
>
  <!-- surface body (fill + ::after shadow) wraps the whole drawer; the
       <dialog> paints nothing (floating-surface law arch r3) -->
  <!-- the side-drawer height chain (the vision acceptance's B/C
       catch, an inherited defect healed with the dialect): surface and
       host ride h-full on left/right so the kernel's absorbing body
       row bounds the scroll — the old hard cap (100dvh-4.25rem, whose
       68px chrome guess drifted from the real band heights) retires -->
  <div data-jx-sheet-surface="" class={cn('jx-surface-body', (side === 'left' || side === 'right') && cx(sheetStyles.fill))}>
  <!-- THE STICKER HOST: the kernel's three-band ruler carries the
       drawer (card.css); the stamps carry the band presence -->
  <div
    data-jx-card
    data-sep-head=""
    data-sep-foot={footer ? '' : undefined}
    class={cn((side === 'left' || side === 'right') && cx(sheetStyles.fill))}
  >
    <!-- the head band: ghost zone over the title face + the × seat -->
    <div data-jx-card-head="">
      <ButtonVariantScope variant="ghost">
        <!-- the title face rides CardHeader's children mode (free
             content in the content seat — the sheet's own compact
             uppercase rhythm, self-carried) -->
        <CardHeader>
          <div class={cx(sheetStyles.titleRow)}>
            <h2
              data-jx-sheet-title=""
              class={cx(sheetStyles.title)}
            >{title}</h2>
            {#if header}
              <div data-jx-sheet-head-extra="" class={cx(sheetStyles.headExtra)}>
                {@render header()}
              </div>
            {/if}
          </div>
        </CardHeader>
        <!-- the × rides the end-action seat (the kernel's corner) — a
             zone-inheriting IconButton, nothing hand-painted -->
        <div class="jx-card-end-action-slot">
          <IconButton icon={xGlyph} text="Close" iconOnly tip={false} onclick={shut} class="jx-sheet-x" />
        </div>
      </ButtonVariantScope>
    </div>
    <Separator data-jx-card-sep="head" aria-hidden="true" />
    <!-- the body band: the kernel's scroll cell under the RHYTHM
         escape hatch — the sheet's 18px drawer beat, popover ink, and
         (side drawers) the panel-height cap keep the exact old
         geometry; the both-edges gutter compensation stays the
         kernel's single-sourced formula -->
    <CardBody
      class={cn(
        // same-property overrides of the cell's own utilities need the
        // consumer's `!` (the class-append law — order is not
        // consumer-guaranteed); the sheet's rhythm/ink escape hatch
        // lives in sheet.css keyed on .jx-sheet-body-cell (same
        // !important semantics the former ! utilities carried)
        'jx-sheet-body-cell',
      )}
    >
      <div class={cx(sheetStyles.bodyStack)}>
        {@render children()}
      </div>
    </CardBody>
    {#if footer}
      <Separator data-jx-card-sep="foot" aria-hidden="true" />
      <!-- THE RAW FOOT BAND (carved-action-band, 2026-09-09): dialog's
           r14-9 law verbatim — the footer snippet renders RAW, the
           standard face is <CardFooter>, whose cluster is the CARVED
           ACTION BAND (fills the band vertically from this rim
           Separator to the panel's bottom edge, rides the inline end
           flush, the leadingSeam its carved left edge — never a
           padded row floating buttons in whitespace). The ghost+flat
           zone stays the band's default; a consumer passing bare
           buttons owns their geometry -->
      <div data-jx-card-foot="">
        <ButtonVariantScope variant="ghost" raised={false}>
          {@render footer()}
        </ButtonVariantScope>
      </div>
    {/if}
  </div>
  </div>
</dialog>
