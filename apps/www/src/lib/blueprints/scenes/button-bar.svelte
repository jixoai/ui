<!-- button-bar blueprint: the free-floating action lane — a card foot
     with a loose ghost member beside a joined cluster, and the
     vertical one-column lane beside it. Everything rides the lane's
     ghost + flat defaults. -->
<script lang="ts">
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import ButtonBar from '$lib/ui/button-bar/button-bar.svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
</script>

<div class="flex h-full w-full items-center justify-center gap-14 p-10">
  <div class="flex w-[300px] flex-col gap-4">
    <div class="flex flex-col gap-1">
      <span class="text-[13px] font-medium">deployment preview</span>
      <span class="text-[11px] opacity-70">main · checks passed</span>
    </div>
    <ButtonBar label="deployment actions">
      <PressButton>discard</PressButton>
      <ButtonGroup label="publish">
        <PressButton>draft</PressButton>
        <PressButton>publish</PressButton>
      </ButtonGroup>
    </ButtonBar>
  </div>
  <ButtonBar label="sort actions" orientation="vertical">
    <PressButton>by name</PressButton>
    <PressButton>by size</PressButton>
    <PressButton>by date</PressButton>
  </ButtonBar>
</div>
