<!--
  jixoai icon button (registry/files/ui/icon-button.svelte).
  The icon+text button with an explicit two-part contract:

    icon  the glyph — ALWAYS decorative (the component wraps it
          aria-hidden; bring your own svg/glyph snippet)
    text  the ONE label — a single string, single-sourced

  Two postures:
    text      icon + text side by side — the default
    iconOnly  a square button; text does not disappear — it moves to
              the tooltip AND stays the accessible name (aria-label).
              An icon-only button must say itself.

  Inheritance by composition (2026-08-25, Owner ruling): the button
  IS a press-button — this component wraps it and owns only the
  two-part contract + the icon-only posture. Every press-button
  capability passes through verbatim: the paint variants (primary …
  copied), the effect loops (shimmer/pulse/rainbow/ripple), href/
  external anchoring, type, class. Press law and shadow tokens are
  therefore identical to a text button BY CONSTRUCTION (the square
  rides the same 42px band, not a smaller silhouette); the
  pre-composition copy had drifted its own markup and geometry.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Density } from '$lib/density.svelte';
  import PressButton, { type PressEffect } from '$lib/ui/press-button/press-button.svelte';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';

  interface Props {
    /** DENSITY override forwarded to the press-button control root */
    density?: Density;
    /** the glyph — always decorative; an svg or character snippet */
    icon: Snippet;
    /** the ONE label: visible text by default, tooltip + accessible name in iconOnly */
    text: string;
    /** paint — the press-button variant union, verbatim */
    variant?:
      | 'primary'
      | 'secondary'
      | 'outline'
      | 'ghost'
      | 'destructive'
      | 'link'
      | 'copied';
    /** collapse to the square: text moves to the tooltip + aria-label */
    iconOnly?: boolean;
    /** iconOnly: which side the tooltip leans */
    placement?: 'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end';
    /** iconOnly: the tip's pointer notch, aimed at the anchor point the
     *  placement names (on by default — a square trigger reads best with
     *  the pin; opt out for plain bubbles) */
    arrow?: boolean;
    /** the one opt-in effect loop — shimmer()/pulse()/rainbow()/ripple() */
    effect?: PressEffect;
    href?: string;
    /** Opens non-internal hrefs (not starting with "/") in a new tab. */
    external?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit';
    class?: string;
  }

  let {
    density,
    icon,
    text,
    variant = 'outline',
    iconOnly = false,
    placement,
    arrow = true,
    effect = undefined,
    href,
    external = undefined,
    onclick,
    type = 'button',
    class: className = '',
  }: Props = $props();
</script>

{#snippet control()}
  <PressButton
    {density}
    {variant}
    square={iconOnly}
    {effect}
    {href}
    {external}
    {onclick}
    {type}
    ariaLabel={iconOnly ? text : undefined}
    class={className}
  >
    <span class="shrink-0" aria-hidden="true">{@render icon()}</span>
    {#if !iconOnly}<span>{text}</span>{/if}
  </PressButton>
{/snippet}

<!-- one control, two shells — the tooltip wraps it only in icon-only -->
{#if iconOnly}
  <Tooltip {text} placement={placement ?? 'top'} {arrow}>
    {@render control()}
  </Tooltip>
{:else}
  {@render control()}
{/if}
