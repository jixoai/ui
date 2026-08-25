<!--
  jixoai float button (registry/files/ui/float-button.svelte).
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

  tw4 (2026-08-24): button/stack paint as token utilities (corner is a
  prop → conditional strings; the stack's inner button swaps fixed for
  static the same way — the scoped descendant rule is gone); ONLY the
  MENU panel law (anchor geometry + ::backdrop) remains in
  float-button.css — D1-exempt residue.

  Motion kernel (2026-08-25): the menu panel adopts the shared surface
  motion kernel (lib/surface-motion.ts, popover wiring verbatim) —
  the toggle seam drives play/startTracking/stopTracking against the
  fixed stack anchor, .jx-waapi opts into the jixoai.css formulas,
  and the real shadow rides a DOM child (data-jx-fab-menu-shadow) the
  kernel animates in lockstep.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { createSurfaceMotion } from '$lib/surface-motion';
  import { cn } from '$lib/utils';
  import './float-button.css';

  interface Props {
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
        transparency) — the button itself keeps press-button physics */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** button content — an icon snippet or a glyph */
    children: Snippet;
    class?: string;
  }

  let {
    label,
    corner = 'bottom-right',
    onclick,
    actions,
    variant = 'auto',
    children,
    class: className = '',
  }: Props = $props();

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

  // corner → fixed point (top corners clear the sticky bar: 5.5rem)
  const corners = {
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
    'top-right': 'top-[5.5rem] right-5',
    'top-left': 'top-[5.5rem] left-5',
  } as const;

  // press law at float scale: rest on --shadow, hover grows to --shadow-md
  const fabPaint =
    'jx-press inline-flex h-11 w-11 appearance-none items-center justify-center rounded border border-border bg-popover text-popover-foreground cursor-pointer [--jx-press-shadow:var(--shadow)] [--jx-press-shadow-hover:var(--shadow-md)] [--jx-press-shadow-active:var(--shadow-md-press)] hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:-outline-offset-1';
</script>

{#if actions}
  <div
    data-jx-fab-stack=""
    data-jx-fab={corner}
    class={cn('fixed z-[80] flex flex-col items-center gap-2', corners[corner], className)}
    style="anchor-name: {anchorName}"
    bind:this={anchorEl}
  >
    <div
      id={autoId}
      popover="auto"
      role="menu"
      class={cn('jx-fab-menu jx-surface', motion.supported && 'jx-waapi')}
      data-variant={variant}
      bind:this={panel}
      style="position-anchor: {anchorName}; inset-area: top span-right; position-area: top span-right;"
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
      <div data-jx-fab-menu-body="" class="jx-surface-body p-1">
        {@render actions()}
      </div>
    </div>
    <button
      type="button"
      class={cn(fabPaint, 'static z-[80]', className)}
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
    class={cn(fabPaint, 'fixed z-[80]', corners[corner], className)}
    aria-label={label}
    {onclick}
  >
    {#if children}{@render children()}{/if}
  </button>
{/if}
