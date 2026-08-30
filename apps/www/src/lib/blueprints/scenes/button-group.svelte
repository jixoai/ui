<!-- button-group blueprint: the joined action row — outline rungs over
     the hairline seam law, one divider member, and the vertical
     orientation beside it. -->
<script lang="ts">
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-14 p-10">
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
