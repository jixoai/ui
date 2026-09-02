<!--
  button-group-overflow-host — test fixture (button-group-overflow.spec.ts).
  A props-driven horizontal group for the overflow state machine: five
  PressButtons (an optional divider between the second and third) and
  a passthrough to the group's exported remeasure() — the tests stub
  getBoundingClientRect per element (jsdom lays nothing out) and then
  poke the machine, exactly like a ResizeObserver callback would.
-->
<script lang="ts">
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';

  let {
    overflow = 'wrap',
    withDivider = false,
    onAction = (_action: string) => {},
  }: {
    overflow?: 'wrap' | 'collapse';
    withDivider?: boolean;
    onAction?: (action: string) => void;
  } = $props();

  let group = $state<{ remeasure(): void } | null>(null);

  /** run one measurement pass by hand (the dynamic-children seam) */
  export function poke(): void {
    group?.remeasure();
  }
</script>

<ButtonGroup label="overflow laws" {overflow} data-testid="og" bind:this={group}>
  <PressButton onclick={() => onAction('copy')}>copy</PressButton>
  <PressButton onclick={() => onAction('move')}>move</PressButton>
  {#if withDivider}<ButtonGroupDivider data-testid="og-divider" />{/if}
  <PressButton onclick={() => onAction('delete')}>delete</PressButton>
  <PressButton onclick={() => onAction('rename')}>rename</PressButton>
  <PressButton onclick={() => onAction('export')}>export</PressButton>
</ButtonGroup>
