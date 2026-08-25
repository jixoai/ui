<!-- composition-a spec fixture: the StepsIndicator child({ props })
     contract on its interactive (button) form — the consumer replaces
     the element, appends own utilities after props.class (layer-law
     merge), and keeps the button semantics. -->
<script lang="ts">
  import { cn } from '$lib/utils';
  import Steps, { StepsItem, StepsIndicator, StepsTitle, StepsSeparator } from '../../src/lib/ui/steps';
</script>

<Steps current={1}>
  <StepsItem step={0} label="connect" onclick={() => {}}>
    <StepsIndicator>
      {#snippet child({ props })}
        <button {...props} class={cn(props.class, 'ring-1')} data-testid="replaced-marker">
          <span data-jx-step-index="" aria-hidden="true">✓</span>
        </button>
      {/snippet}
    </StepsIndicator>
    <StepsTitle>connect</StepsTitle>
    <StepsSeparator />
  </StepsItem>
</Steps>
