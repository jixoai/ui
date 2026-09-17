<!-- button-group blueprint: the joined action row — outline rungs over
     the hairline seam law, one divider member, and the vertical
     orientation beside it. -->
<script lang="ts">
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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
</script>

<div class={cx(bpA.buttonGroupStage)}>
  <ButtonGroup label="export actions">
    <PressButton variant="outline">copy</PressButton>
    <PressButton variant="outline">move</PressButton>
    <ButtonGroupDivider />
    <PressButton variant="outline">delete</PressButton>
  </ButtonGroup>
  <ButtonGroup label="sort actions" orientation="vertical">
    <PressButton variant="ghost">by name</PressButton>
    <PressButton variant="ghost">by size</PressButton>
    <PressButton variant="ghost">by date</PressButton>
  </ButtonGroup>
</div>
