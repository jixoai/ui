<!--
  jixoai kbd (registry/files/ui/kbd/kbd.svelte).
  The keyboard-input glyph: a native <kbd> — the element whose entire
  meaning is "this is keyboard input" — with the grammar's variant
  ladder (variant-grammar frozen r1) over the ENGRAVED geometry: 1px
  border, 2px corner radius (Owner 2026-09-05) + the --shadow-engrave
  inset (the elevation grammar's engrave tier, 2026-09-01 — a glyph
  incised into the plane, not lifted off it), mono. TONAL is the default rung (12%/45% primary
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
  tailwindless one-shot Wave 1b batch A (2026-09-17): the paint rides
  the family's stylex ATOMS (kbd.stylex.ts) joined through cx() below
  — the ladder walks the static VARIANT_CLASS table; `jx-kbd` stays a
  semantic hook only, no css defines it.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { type Density } from '$lib/density.svelte';
  import { KbdDefaults, type KbdVariant } from './kbd-defaults.svelte';
  import { kbdStyles } from './kbd.stylex';

  interface Props extends HTMLAttributes<HTMLElement> {
    density?: Density;
    /** the glyph's paint ladder — prominence, never semantic hue
     *  (inject with jx-hue-* utilities); tonal rides primary by default */
    variant?: KbdVariant;
  }

  let {
    density,
    variant,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  // the family Defaults is the single read point (context-defaults-
  // economy 2.3): explicit ?? ambient/own per slot, one line, no
  // legacy helper channels
  const d = $derived(KbdDefaults.resolve({ variant, density }));

  // the payload's own join (the separator serialize law): every
  // stylex.create member is an OBJECT in dev and the joined string in
  // shipped payloads — composition goes through THIS joiner (all
  // string values except $$css, space-joined).
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

  // the ladder walks static table members — runtime is a pure lookup
  const VARIANT_CLASS: Record<KbdVariant, string> = {
    fill: cx(kbdStyles.base, kbdStyles.fill),
    tonal: cx(kbdStyles.base, kbdStyles.tonal),
    outline: cx(kbdStyles.base, kbdStyles.outline),
  };
</script>

<kbd
  data-jx-kbd={d.variant}
  data-density={d.density}
  class={cx(VARIANT_CLASS[d.variant], className)}
  {...rest}
>
  {@render children?.()}
</kbd>
