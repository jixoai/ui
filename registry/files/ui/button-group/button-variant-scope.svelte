<!--
  jxoai button variant scope (registry/files/ui/button-group/
  button-variant-scope.svelte, r14 tuning 2 — Owner: "Context 技术无法
  控制 DialogHeader/DialogFooter 里面的 button 的默认变体吗？").

  The zero-DOM half of the group's context: a SUBTREE-SCOPED variant
  default for buttons, with no layout attached. The layout half is
  ButtonGroup itself (grid, seams, overflow); this scope is what a
  DIALOG/CARD zone (header/footer) wraps around its content so every
  PressButton/IconButton inside — joined or free-floating — defaults
  to the zone's variant. A button's own explicit variant still wins
  (explicit ?? nearest scope ?? own default), and a ButtonGroup inside
  inherits the scope's variant when it sets none of its own
  (inherit-then-provide, the density maneuver).

  THE PHYSICS SEAM (Owner 2026-09-04): `raised` scopes the press
  texture default through the SAME boundary — a card/dialog FOOT zone
  declares raised={false} and its buttons ride flat (the engrave-tier
  inset press) unless an explicit prop says otherwise. It rides its
  OWN context key (PRESS_TEXTURE_KEY, owned by press-button), not
  BUTTON_GROUP_KEY: the group's key is paint policy and every
  ButtonGroup resets it, while physics must flow THROUGH joined
  groups untouched. Inherit-then-provide here too — a paint-only
  scope (variant, no raised) never un-flattens an enclosing zone.

  Renders its children and nothing else — no element, no paint, no
  seams; it is a context boundary, not a container.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext, setContext } from 'svelte';
  import { BUTTON_GROUP_KEY, type ButtonGroupApi } from './button-group.svelte';
  import { PRESS_TEXTURE_KEY, type PressTextureApi, type PressButtonVariant } from '../press-button/press-button.svelte';

  let {
    /** the variant buttons in this subtree adopt when they set none */
    variant,
    /** the raised default buttons in this subtree adopt when they set
     *  none (absent ⇒ the enclosing zone's value flows through) */
    raised,
    children,
  }: {
    variant?: PressButtonVariant;
    raised?: boolean;
    children: Snippet;
  } = $props();

  setContext<ButtonGroupApi>(BUTTON_GROUP_KEY, {
    get orientation() {
      return 'horizontal' as const;
    },
    get variant() {
      return variant;
    },
    get separator() {
      return false;
    },
  });

  // inherit-then-provide (the density maneuver): a scope that sets no
  // raised of its own passes the enclosing zone's through — only a
  // scope that DECLARES the axis shadows it
  const enclosingTexture = getContext<PressTextureApi | undefined>(PRESS_TEXTURE_KEY);
  setContext<PressTextureApi>(PRESS_TEXTURE_KEY, {
    get raised() {
      return raised ?? enclosingTexture?.raised;
    },
  });
</script>

{@render children()}
