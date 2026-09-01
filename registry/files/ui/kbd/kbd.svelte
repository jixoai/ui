<!--
  jixoai kbd (registry/files/ui/kbd/kbd.svelte).
  The keyboard-input glyph: a native <kbd> — the element whose entire
  meaning is "this is keyboard input" — with the grammar's variant
  ladder (variant-grammar frozen r1) over the ENGRAVED geometry: 1px
  border + the --shadow-engrave inset (the elevation grammar's engrave
  tier, 2026-09-01 — a glyph incised into the plane, not lifted off
  it), mono. TONAL is the default rung (12%/45% primary
  tint — --jx-tonal aliases primary at :root); fill and outline sit
  beside it. Semantic hue injects from the outside (class="jx-hue-error"),
  never as a variant name. restProps flow through, so title/data-* land
  verbatim; composition with <samp>, text, or an <a> (documented
  shortcut) is the consumer's call.

  Purposefully not: key-parsing, platform detection (⌘/Ctrl), or a
  <kbd> per key auto-split. Those are string-parsing opinions that
  belong to the caller; the element composes fine by hand:

    <kbd>⌘</kbd> + <kbd>K</kbd>

  tw4 (2026-08-24): utility-authored — the paint composes from token
  utilities (layer law: consumer utilities always win); `jx-kbd` stays
  as a semantic hook only, no css defines it. Variant rungs are
  byte-aligned with chip/press-button's variant map (the TW4 collision
  law: a rung is the SOLE border-color source — the frame never
  carries a named border paint).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    density?: Density;
    /** the grammar's paint ladder — prominence, never semantic hue
     *  (inject with jx-hue-* utilities); tonal rides primary by default */
    variant?: 'fill' | 'tonal' | 'outline';
  }

  let {
    density,
    variant = 'tonal',
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  const variants = {
    fill: `[background:var(--jx-fill)] [border-color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText] forced-colors:border-[ButtonText]`,
    tonal: `bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
    outline: `bg-transparent [border-color:var(--jx-outline)] text-foreground forced-colors:bg-[Canvas] forced-colors:text-[CanvasText] forced-colors:border-[CanvasText]`,
  } as const;
</script>

<kbd
  data-jx-kbd={variant}
  data-density={resolvedDensity}
  class={cn(
    'inline-block [padding-inline:var(--jx-gap)] border rounded-none shadow-engrave font-mono [font-size:var(--jx-text-secondary)] [line-height:var(--jx-line-secondary)] whitespace-nowrap',
    variants[variant],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</kbd>
