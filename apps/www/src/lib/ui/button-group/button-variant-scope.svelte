<!--
  jxoai button variant scope (registry/files/ui/button-group/
  button-variant-scope.svelte, r14 tuning 2 — Owner: "Context 技术无法
  控制 DialogHeader/DialogFooter 里面的 button 的默认变体吗？").

  The zero-DOM half of the group's context: a SUBTREE-SCOPED variant
  default for buttons, with no layout attached. The layout half is
  ButtonGroup itself (grid, seams, overflow); this scope is what a
  DIALOG zone (header/footer) wraps around its content so every
  PressButton/IconButton inside — joined or free-floating — defaults
  to the zone's variant. A button's own explicit variant still wins
  (explicit ?? nearest scope ?? own default), and a ButtonGroup inside
  inherits the scope's variant when it sets none of its own
  (inherit-then-provide, the density maneuver).

  Renders its children and nothing else — no element, no paint, no
  seams; it is a context boundary, not a container.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';
  import { BUTTON_GROUP_KEY, type ButtonGroupApi } from './button-group.svelte';
  import type { PressButtonVariant } from '../press-button/press-button.svelte';

  let {
    /** the variant buttons in this subtree adopt when they set none */
    variant,
    children,
  }: {
    variant?: PressButtonVariant;
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
</script>

{@render children()}
