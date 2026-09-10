<!--
  jixoai chip (registry/files/ui/chip/chip.svelte).
  The grammar's compact ACTIVATION: a control-scale pill that filters,
  toggles, and navigates — the badge's micro-label voice on the hit
  lane. Not a badge (display, sub-lane height) and deliberately not a
  PressButton wrapper: the composition borrows the press law
  (.jx-press) from the press-button folder, but the anatomy is its own.

  Variant grammar (openspec/changes/variant-grammar, frozen r1): the
  four-step ladder consumed as GLOBAL tokens — fill (solid ground +
  same-hue border), tonal (12%/45% tint recipe), outline (structural
  border + 8% hover overlay, border unchanged), ghost (transparent
  rest, tonal hover, geometry preserved via the transparent border).
  Semantic hue is INJECTED into --jx-fill/--jx-fill-ink/--jx-tonal/
  --jx-outline from the outside (class="jx-hue-error"),
  never named as a variant.

  Scale law (Owner ruling, 2026-09-01, supersedes the 2026-08-29
  hit-lane floor): the chip is the badge's ACTIVATION TWIN — badge
  geometry verbatim (height from --jx-line-secondary, inline insets
  only, never block padding); the ONLY structural difference from a
  Badge is the activation root (button/anchor + press physics + the
  focus law). Pseudo-element lane expansion stays rejected: the real
  box is the target.

  Effect loops (effect-attachments, 2026-09-09): the effect prop and
  its DEFAULT ripple RETIRED with the attachment migration — the chip
  is a PLAIN activation (zero effect knowledge; ink, when wanted,
  arrives through the component-tag attachment, the r4 uniform syntax:
  <Chip {@attach pressEffect(ripple())}> — the rest lane forwards it
  onto this root, where the runtime mounts it). The press law's pose
  sheet still imports from the press-button
  folder (.jx-press lives in press-button.css).

  Forced colors (design §6, explicit degradation): fill →
  ButtonFace/ButtonText, tonal/outline → Canvas/CanvasText (the
  color-mix tints drop), ghost transparent at rest / ButtonFace on
  hover; the focus ring stays 2px Highlight, offset 2, never removed.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { type Density } from '$lib/density.svelte';
  import { ChipDefaults, type ChipShape, type ChipVariant } from './chip-defaults.svelte';
  // the press law's pose sheet (.jx-press) — shared from the
  // press-button folder; the effect layers' paint rides there too
  import '../press-button/press-button.css';

  /* the REST LANE (the press-button convention): arbitrary attributes
   * flow through VERBATIM and land on the root (button or anchor); the
   * family's own typed props and component-owned stamps win by spread
   * order. The component-tag ATTACHMENT rides this lane too (r4,
   * 2026-09-10): `<Chip {@attach pressEffect(…)}>` compiles to a
   * symbol-keyed prop the spread forwards onto the root —
   * data-jx-attach="root" stays as the optional named stamp */
  interface Props extends Omit<
    HTMLAttributes<HTMLElement>,
    'onclick' | 'class' | 'aria-label' | 'style' | 'type'
  > {
    /** DENSITY override: explicit ?? ambient scope, else unstamped */
    density?: Density;
    /** the grammar ladder — prominence, never semantic hue; omitted →
     *  the ambient paint zone, else the frozen own 'tonal' */
    variant?: ChipVariant;
    /** square keeps the site radius; pill rounds fully */
    shape?: ChipShape;
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    ariaLabel?: string;
    /** appended to the composed classes (same-family overrides need
     *  the consumer's `!` — same-property utility order is not
     *  consumer-guaranteed) */
    class?: string;
    /** leading lane — svg sized var(--jx-text-secondary) */
    slotStart?: Snippet;
    /** trailing lane — svg sized var(--jx-text-secondary) */
    slotEnd?: Snippet;
    children: Snippet;
  }

  let {
    density,
    variant,
    shape,
    href,
    external = undefined,
    onclick,
    type = 'button',
    ariaLabel,
    class: className = '',
    slotStart,
    slotEnd,
    children,
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 2.3): variant rides the paint axis slot (zone ambient,
  // frozen own 'tonal'), shape/density their literal/no-opinion slots
  const d = $derived(ChipDefaults.resolve({ variant, shape, density }));

  // badge geometry verbatim (the badge's activation twin): height from
  // the secondary line, inline insets only; slot lanes replace their
  // side's padding (the data-icon law, badge dialect: the inset halves
  // — the lane carries the edge). The focus utilities pin the §6
  // forced-colors ring: 2px Highlight, offset 2.
  const base =
    'inline-flex items-center justify-center gap-[calc(var(--jx-gap)/2)] box-border max-w-full [padding-inline:var(--jx-inset)] has-[[data-icon=inline-start]]:pl-[calc(var(--jx-inset)/2)] has-[[data-icon=inline-end]]:pr-[calc(var(--jx-inset)/2)] font-nav [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] tracking-[0.14em] uppercase whitespace-nowrap forced-colors:focus-visible:outline-2 forced-colors:focus-visible:outline-offset-2 forced-colors:focus-visible:[outline-color:Highlight]';
  const silhouette = $derived(d.shape === 'pill' ? 'rounded-full' : 'rounded-(--radius)');
  // the bordered, shadow-bearing body (ghost presses without a shadow).
  // TW4 collision law (batch D probe, 2026-08-26): a rung is the SOLE
  // border-color source — named border paints (.border-border) sort
  // AFTER arbitrary values and would silently win, so the frame never
  // carries one; typed arbitrary forms (bg-[color-mix(…)],
  // [border-color:var(…)], text-[color:var(…)]) are preferred over raw
  // arbitrary properties (they emit @supports fallbacks). These strings
  // are byte-aligned with press-button's landed variant-grammar map.
  const frame = 'jx-press border';
  const variants = {
    fill: `${frame} [background:var(--jx-fill)] [border-color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText] forced-colors:border-[ButtonText]`,
    tonal: `${frame} bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
    outline: `${frame} bg-transparent [border-color:var(--jx-outline)] text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
    // ghost keeps the box geometry (1px border, transparent color) but
    // presses without a shadow; hover derives entirely from --jx-tonal
    ghost: `jx-press border border-transparent bg-transparent text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] hover:text-[color:var(--jx-tonal)] [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none] forced-colors:bg-transparent forced-colors:text-[CanvasText] forced-colors:border-transparent forced-colors:hover:bg-[ButtonFace] forced-colors:hover:text-[ButtonText]`,
  } as const;

  const classes = $derived(cn(base, silhouette, variants[d.variant], className));
  const isExternal = $derived(external ?? (href !== undefined && !href.startsWith('/')));
</script>

{#snippet start()}
  {#if slotStart}
    <span data-icon="inline-start" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">
      {@render slotStart()}
    </span>
  {/if}
{/snippet}

{#snippet end()}
  {#if slotEnd}
    <span data-icon="inline-end" class="inline-flex [&>svg]:size-[var(--jx-text-secondary)]">
      {@render slotEnd()}
    </span>
  {/if}
{/snippet}

{#if href}
  <a
    {...rest}
    {href}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noreferrer' : undefined}
    aria-label={ariaLabel}
    data-density={d.density}
    data-jx-chip={d.variant}
    data-jx-attach="root"
    class={classes}
    onclick={onclick}
  >
    {@render start()}
    {@render children()}
    {@render end()}
  </a>
{:else}
  <button
    {...rest}
    {type}
    onclick={onclick}
    aria-label={ariaLabel}
    data-density={d.density}
    data-jx-chip={d.variant}
    data-jx-attach="root"
    class={classes}
  >
    {@render start()}
    {@render children()}
    {@render end()}
  </button>
{/if}
