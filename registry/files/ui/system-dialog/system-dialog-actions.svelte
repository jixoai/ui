<!--
  jixoai SystemDialogActions
  (registry/files/ui/system-dialog/system-dialog-actions.svelte, 2026-08-25).
  The action row (shadcn Footer, renamed to what it holds) — THE
  CARVED ACTION BAND (carved-action-band, 2026-09-09), round 3
  rulings:

    THE RIM IS A REAL SEPARATOR (Owner: "body/footer 之间的分割线和
    Dialog 的标准不一样"): not a border-t token line (washed out over
    the acrylic, off-standard ink) — a Separator INSTANCE, the same
    contrast-ghost ink engine Dialog's riding separators paint. The
    strip still bleeds out of the body padding through negative
    margins (the anchored form's own craft — a popover-sized surface
    rents no banded ruler).

    THE BUTTONS SPLIT THE STRIP EVENLY (Owner: "均分 footer，文字过多
    可以撑开"): the macOS system-alert posture — ONE full-width
    ButtonGroup whose columns are minmax(auto, 1fr): equal shares by
    default, a long label may widen its column past the equal split;
    the 1px seam between the members is the group's (never a gap).
    Buttons FILL the strip vertically (the rim is the band's top
    edge, the block height IS the strip — never a padded row floating
    buttons in whitespace).

  Compose SystemDialogCancel + SystemDialogAction inside.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<!-- THE ACTION-BAND ZONE (floating-flesh-sweep, 2026-09-09): ghost +
     flat over the band — the Cancel renders quiet with zero paint props
     while the Action's explicit fill still wins. The bleed arithmetic
     (the anchored form's own): gap(10px) + mt(8px) = the body's 18px
     breathing room above the rim; -mx/-mb cancel the body padding so
     the rim spans the full surface and the split rides the panel's
     edges flush -->
<ButtonVariantScope variant="ghost" raised={false}>
  <div
    data-jx-sysdlg-actions=""
    class={cn('mt-[8px] -mx-5 -mb-[1.125rem]', className)}
    {...rest}
  >
    <Separator aria-hidden="true" />
    <!-- THE SPLIT IS A FLEX LAW (Owner r4: "空间足够的情况下，文字应该
         铺开的，而不是换行。默认是平均空间"): grid fr CANNOT express it —
         an fr's unit is computed from the space LEFT OVER after the
         intrinsic bases, so max-content-floored fr tracks freeze at
         their content and never equal-fill (measured: 120+143 of 382,
         the void parked at the end). The declaration switches the
         group to flex; the members ride flex:1 1 0 + min-width:
         max-content (system-dialog.css) — EQUAL halves that FILL the
         strip, a long label floors its own cell wider, never a wrap.
         The seam machinery survives the swap (the injected 1px ink
         span stretches; the -1px junction collapse works in flex) -->
    <ButtonGroup label="Actions" class="w-full" style="display:flex">
      {@render children()}
    </ButtonGroup>
  </div>
</ButtonVariantScope>
