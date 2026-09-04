<!--
  button-group-scroll-host — test fixture (button-group-scroll.spec.ts,
  Owner 2026-09-04): the third overflow mode's shapes — a bare scroll
  group, a ghost scroll group (seams still join the scrolling line),
  the veil-carrying effects, and the vertical bare scroller.
-->
<script lang="ts">
  import ButtonGroup, {
    type ButtonGroupScrollEffect,
  } from '$lib/ui/button-group/button-group.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';

  let {
    overflow = 'scroll',
    variant = undefined,
    scrollEffect = undefined,
    orientation = 'horizontal',
    testid = 'scroll-group',
  }: {
    overflow?: 'wrap' | 'collapse' | 'scroll';
    variant?: 'fill' | 'tonal' | 'outline' | 'ghost';
    scrollEffect?: ButtonGroupScrollEffect;
    orientation?: 'horizontal' | 'vertical';
    testid?: string;
  } = $props();
</script>

<ButtonGroup
  label="scroll actions"
  {orientation}
  {overflow}
  {variant}
  {scrollEffect}
  data-testid={testid}
>
  <PressButton>one</PressButton>
  <PressButton>two</PressButton>
  <PressButton>three</PressButton>
</ButtonGroup>
