<script lang="ts">
  // separator.svelte — StyleX re-authoring. W3C-first kept: horizontal
  // IS <hr>, vertical takes the role=separator route. Variant×orientation
  // expanded as hand-rolled conditional classes (the TW variant-prefix
  // surface — forced-colors:, hover: — had no direct equivalent need
  // here: the ink law is stateless).
  import * as stylex from '@stylexjs/stylex';

  // class-string composition: 0.19.0 exposes no callable type on the
  // namespace (runtime-only call signature); attrs().class is the typed form
  const sx = (...args: Parameters<typeof stylex.attrs>) => stylex.attrs(...args).class;
  import { separatorStyles as s } from './separator.stylex';

  export type SeparatorVariant =
    | 'fused'
    | 'dashed'
    | 'dense'
    | 'dotted'
    | 'wavy'
    | 'fade'
    | 'solid';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    variant?: SeparatorVariant;
  }

  let { orientation = 'horizontal', variant = 'fused' }: Props = $props();

  // the variant×orientation table, hand-expanded (StyleX has no
  // variant prefixes; the 7×2 matrix is 14 branches — mechanical,
  // explicit, and typo-checked by key type)
  const table: Record<SeparatorVariant, Record<'horizontal' | 'vertical', string>> = {
    fused: {
      horizontal: sx(s.horizontal),
      vertical: sx(s.vertical),
    },
    solid: {
      horizontal: sx(s.horizontal, s.solidHorizontal),
      vertical: sx(s.vertical, s.solidVertical),
    },
    dashed: {
      horizontal: sx(s.horizontal, s.dashedH),
      vertical: sx(s.vertical, s.dashedV),
    },
    dense: {
      horizontal: sx(s.horizontal, s.denseH),
      vertical: sx(s.vertical, s.denseV),
    },
    dotted: {
      horizontal: sx(s.horizontal, s.dottedH),
      vertical: sx(s.vertical, s.dottedV),
    },
    wavy: {
      horizontal: sx(s.horizontal, s.wavyH),
      vertical: sx(s.vertical, s.wavyV),
    },
    fade: {
      horizontal: sx(s.horizontal, s.fadeH),
      vertical: sx(s.vertical, s.fadeV),
    },
  };

  const classes = $derived(table[variant][orientation]);
</script>

{#if orientation === 'vertical'}
  <div class={classes} role="separator" aria-orientation="vertical" data-jx-separator={variant}></div>
{:else}
  <hr class={classes} data-jx-separator={variant} data-orientation="horizontal" />
{/if}
