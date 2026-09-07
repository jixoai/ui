<!--
  jixoai blockquote (registry/files/ui/blockquote/blockquote.svelte,
  markdown-coverage-components §1.1). The quote/admonition surface: the
  semantic body IS the native <blockquote>; `cite` never swaps the root
  — it renders the MDN attribution posture (footer > cite) after the
  body. One surface, two postures, both on the alert-shaped two-rung
  ladder:
    outline (own)  transparent ground, 1px left rule, muted body — the
                   classic GitHub/Tailwind quote, visually continuous
                   with the jx-pure face's own blockquote rule it
                   replaces
    tonal          the alert tonal recipe VERBATIM (12% tinted ground,
                   45% border, rounded px-3.5 py-3, title/body in
                   --jx-tonal) — the callout/Notion posture; hue rides
                   injection through the jx-hue-* class utilities, and
                   the markdown map's GitHub-alert detection lands here
                   as tonal + label + hue.

  Availability is FROZEN at two rungs because a quote's readability
  excludes fill AND ghost: fill buries long-form copy under saturated
  ground; ghost is INTERACTIVE-CHROME vocabulary (rest-transparent,
  hover-tonal, border geometry preserved) which a static quote misuses
  — nothing about a quote responds to hover. The borderless manuscript
  indent is a FUTURE STRUCTURAL AXIS, never a paint rung (the ladder
  stays paint-pure; availability joins the frozen table via the
  frozen-availability amendment chain).

  Composition mirrors alert: `label` renders the alert title-row form
  (a fixed 0.8125rem chrome row — the one font-size the surface
  carries), `icon` lands inline-start of it (bring your own glyph —
  lucide, svg, text), children is the body. The root stamps NO
  font-size: the ambient scale flows by inheritance (the typography
  trio law) — a quote is body copy, not chrome, and the p
  un-short-circuit law keeps working because P never escapes the face.
  The cite footer is chrome ink (muted, the label's 0.8125rem) in both
  rungs — attribution metadata, not body flow. Children render as
  DIRECT children of the root (no wrapper div): the markdown sheet's
  container-inner sibling stack law operates on `blockquote > * + *`,
  and the element-based rhythm/flush selectors keep matching because
  the root IS the native element. The root carries NO margins and NO
  flex gap (the figure posture — the container rhythm owns spacing in
  the markdown scope; standalone consumers compose spacing through
  their own containers).

  Escape law (§2.1): the markdown map mounts this root with
  no-jx-pure — a box-owning block surface escapes so the face's
  element rules stop double-painting it; the sheet compensates for
  what the escape descopes.

  Per-rung forced-colors degradations follow alert exactly: the
  color-mix tints do not drop on their own under forced colors —
  Canvas ground + CanvasText ink, the 1px rule surviving on outline.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLBlockquoteAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { BlockquoteDefaults, type BlockquoteVariant } from './blockquote-defaults.svelte';

  interface Props extends HTMLBlockquoteAttributes {
    /** ladder prominence: outline (plain quote) | tonal (tinted
     *  admonition); omitted → the ambient paint zone, else the frozen
     *  own 'outline' */
    variant?: BlockquoteVariant;
    /** one-line uppercase heading in the alert title-row form; omitted
     *  renders a bare body block */
    label?: string;
    /** icon snippet, rendered inline-start of the label */
    icon?: Snippet;
    /** attribution, rendered as <footer><cite> after the body (the
     *  MDN posture) — NOT the native cite attribute */
    cite?: string;
    /** body copy; the ambient font-size flows by inheritance */
    children?: Snippet;
    class?: string;
  }

  let {
    variant,
    label,
    icon,
    cite,
    children,
    class: className = '',
    ...rest
  }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): variant rides the paint axis slot (zone ambient,
  // frozen own 'outline'); density is the no-opinion slot — nothing
  // stamps, the ambient css scope channel keeps flowing
  const d = $derived(BlockquoteDefaults.resolve({ variant }));

  // variant grounds (design §1.1 recipes, verbatim) — the rungs are
  // asymmetric BY DESIGN: outline is the left-rule quote (border-s +
  // ps only; the TW4 logical-side name — `border-inline-start` is not
  // a utility token and silently compiles to nothing), tonal is the
  // alert border box. Forced colors per rung: Canvas/CanvasText, the
  // 1px rule surviving on outline, the tonal ground dropping to Canvas.
  const surface = {
    outline:
      'border-s [border-color:var(--jx-outline)] ps-[0.875rem] forced-colors:border-[CanvasText]',
    tonal: 'border bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] rounded px-3.5 py-3 forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
  } as const;
  // the label consumes the variant ink; the BODY consumes the rung's
  // own ramp — outline keeps the face's muted quote body (the
  // manuscript posture), tonal tints both like the alert rows
  const titleColor = {
    outline: 'text-foreground forced-colors:text-[CanvasText]',
    tonal: '[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
  const bodyColor = {
    outline: 'text-muted-foreground forced-colors:text-[CanvasText]',
    tonal: 'text-[color:var(--jx-tonal)] forced-colors:text-[CanvasText]',
  } as const;
</script>

<blockquote
  class={cn('box-border', surface[d.variant], bodyColor[d.variant], className)}
  data-jx-blockquote={d.variant}
  {...rest}
>
  {#if label}
    <p
      data-jx-blockquote-label=""
      class={cn('flex items-center gap-2 font-nav text-[0.8125rem] tracking-[0.08em] uppercase', titleColor[d.variant])}
    >{#if icon}<span class="inline-flex">{@render icon()}</span>{/if}{label}</p>
  {/if}
  {@render children?.()}
  {#if cite}
    <footer data-jx-blockquote-cite="" class="text-[0.8125rem] text-muted-foreground">
      <cite class="italic">{cite}</cite>
    </footer>
  {/if}
</blockquote>
