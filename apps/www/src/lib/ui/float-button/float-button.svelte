<!--
  jixoai float button (registry/files/ui/float-button/float-button.svelte).
  The floating action button (antd's FloatButton + the back-top
  convention): a fixed corner button, optionally opening a small
  popover menu of related actions. Two idioms ship in the same
  component:

    plain      <FloatButton onclick={compose}>…</FloatButton>  — a lone
               fixed action (compose, support, back-to-top)
    menu       children snippet + actions snippet — the button toggles
               a popover=auto stack above it (native light dismiss)

  Positioning is a prop, not a wrapper: corner picks the fixed point;
  the consumer's layout is never touched. The button follows the press
  law (theme .jx-press) at float scale — the --jx-press-shadow* customs
  re-point all three poses to the --shadow family.

  tw4 (2026-08-24) → tailwindless Wave 1 batch 3 (2026-09-17): the
  button/stack paint rides the family's stylex ATOMS
  (float-button.stylex.ts) joined through cx() — corner is a prop →
  per-corner atom groups; the stack's inner button swaps fixed for
  static the same way; ONLY the MENU panel law (anchor geometry +
  ::backdrop) remains in float-button.css — D1-exempt residue.

  Motion kernel (2026-08-25): the menu panel adopts the shared surface
  motion kernel (lib/surface-motion.ts, popover wiring verbatim) —
  the toggle seam drives play/startTracking/stopTracking against the
  fixed stack anchor, .jx-waapi opts into the jixoai.css formulas,
  and the real shadow rides a DOM child (data-jx-fab-menu-shadow) the
  kernel animates in lockstep.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type Density } from '$lib/density.svelte';
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import { FloatButtonDefaults, type FloatButtonSurfaceVariant } from './float-button-defaults.svelte';
  import { fabStyles } from './float-button.stylex';
  import './float-button.css';

  interface Props {
    /** density policy: explicit ?? ambient scope, else unstamped */
    density?: Density;
    /** accessible name — required (an icon-only button must say itself) */
    label: string;
    /** which corner to float in */
    corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** plain idiom: the click action */
    onclick?: () => void;
    /** menu idiom: the stacked actions (renders above the button) */
    actions?: Snippet;
    /** floating-surface variant for the MENU panel: solid | acrylic |
        auto (acrylic unless the environment asks for reduced
        transparency) — the button itself keeps press-button physics.
        Omitted → the contract own 'auto' (FloatButtonDefaults — a
        declared own, not ambient) */
    variant?: FloatButtonSurfaceVariant;
    /** button content — an icon snippet or a glyph */
    children: Snippet;
    class?: string;
  }

  let {
    density,
    label,
    corner = 'bottom-right',
    onclick,
    actions,
    variant,
    children,
    class: className = '',
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): variant's own 'auto' lives in FloatButtonDefaults,
  // auditable in one place; the density slot resolves
  // explicit ?? ambient scope — no opinion stamps nothing, the
  // ambient css scope channel keeps flowing
  const d = $derived(FloatButtonDefaults.resolve({ variant, density }));

  const autoId = $props.id();
  const anchorName = $derived(`--jx-fab-${autoId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  let open = $state(false);
  // the menu popover panel and the fixed stack wrapper carrying
  // anchor-name — the kernel measures the slide axis panel↔anchor, live
  // (Codex r1 review: the panel is a <div popover=auto> — a `btn` name
  // + HTMLButtonElement type misdescribed the binding)
  let panel = $state<HTMLDivElement | null>(null);
  let anchorEl = $state<HTMLElement | null>(null);

  // ── MOTION KERNEL — the shared declarative half (r29): see
  // lib/surface-motion.ts. WAAPI animates ONE @property number
  // (--jx-p); every visible property is a CSS formula of it (the
  // declarative motion law in jixoai.css). The kernel here only wires
  // the menu's toggle seam and the live stack anchor
  const motion = createSurfaceMotion(() => panel, { anchor: () => anchorEl });

  onDestroy(() => motion.destroy());

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

  // corner → fixed point (top corners clear the sticky bar: 5.5rem)
  const corners = {
    'bottom-right': cx(fabStyles.bottomRight),
    'bottom-left': cx(fabStyles.bottomLeft),
    'top-right': cx(fabStyles.topRight),
    'top-left': cx(fabStyles.topLeft),
  } as const;

  // press law at float scale (the customs re-point all three poses)
  const fabPaint = cx(fabStyles.body);
</script>

{#if actions}
  <div
    data-jx-fab-stack=""
    data-density={d.density}
    data-jx-fab={corner}
    class={cn(cx(fabStyles.stack), corners[corner], className)}
    style="anchor-name: {anchorName}"
    bind:this={anchorEl}
  >
    <!-- position-area law (W5 sweep, 2026-09-15 — spec-true): the menu
         occupies the region ABOVE the stack, END-aligned — `top
         span-left` names exactly that (spanning from the left edge
         inward to the stack's inline-end: right edges together), the
         classic corner-FAB look and the DIRECT geometry for the
         default bottom-right corner. The mirror corners are adapted
         by DESIGN through the css's flip-inline (an engine-derived
         spec-grammar flip, never an ad-hoc inset). The pre-sweep
         literal `top span-right` (which renders start-aligned)
         encoded the inverted model. ONE literal feeds BOTH emissions
         (position-area + the legacy inset-area alias) -->
    <div
      id={autoId}
      popover="auto"
      role="menu"
      class={cn('jx-fab-menu jx-surface', motion.supported && 'jx-waapi')}
      data-variant={d.variant}
      bind:this={panel}
      style="position-anchor: {anchorName}; inset-area: top span-left; position-area: top span-left;"
      ontoggle={(e: Event) => {
        const el = e.currentTarget as HTMLElement;
        open = el.matches(':popover-open');
        if (open) {
          motion.play(1);
          motion.startTracking();
        } else {
          el.classList.remove('jx-rest');
          motion.play(0);
          motion.stopTracking();
        }
      }}
    >
      <!-- surface body (fill + ::after shadow); the popover element
           paints nothing (floating-surface law arch r3) -->
      <div data-jx-fab-menu-shadow="" class="jx-surface-shadow" aria-hidden="true"></div>
      <!-- the REAL shadow layer: a DOM child because pseudo-elements are
           unreachable from WAAPI — the kernel animates it in lockstep -->
      <div data-jx-fab-menu-body="" class="jx-surface-body {cx(fabStyles.menuBody)}">
        {@render actions()}
      </div>
    </div>
    <button
      type="button"
      class={cn('jx-press', fabPaint, cx(fabStyles.stackButton), className)}
      data-density={d.density}
      aria-label={label}
      aria-expanded={open}
      aria-haspopup={actions ? 'menu' : undefined}
      aria-controls={actions ? autoId : undefined}
      popovertarget={autoId}
    >
      {@render children()}
    </button>
  </div>
{:else}
  <button
    type="button"
    data-jx-fab={corner}
    data-density={d.density}
    class={cn('jx-press', fabPaint, cx(fabStyles.fixedButton), corners[corner], className)}
    aria-label={label}
    {onclick}
  >
    {#if children}{@render children()}{/if}
  </button>
{/if}
