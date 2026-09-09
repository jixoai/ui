<!--
  jixoai AlertDialogActions
  (registry/files/ui/alert-dialog/alert-dialog-actions.svelte, 2026-08-25).
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

  Compose AlertDialogCancel + AlertDialogAction inside.
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
    data-jx-adlg-actions=""
    class={cn('mt-[8px] -mx-5 -mb-[1.125rem]', className)}
    {...rest}
  >
    <Separator aria-hidden="true" />
    <!-- the split rides an INLINE STYLE, not a utility: the group's own
         auto-cols-auto is a same-property utility and the cascade order
         of two utilities is not consumer-guaranteed (the vision r3
         catch — the arbitrary-property class silently lost and the
         strip fell back to content-sized columns); a declaration beats
         every utility without a fight -->
    <ButtonGroup
      label="Actions"
      class="w-full"
      style="grid-auto-columns:minmax(auto,1fr)"
    >
      {@render children()}
    </ButtonGroup>
  </div>
</ButtonVariantScope>
