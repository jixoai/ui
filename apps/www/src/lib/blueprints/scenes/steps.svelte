<!-- steps blueprint: the wizard at step 2 of 4 — the done step is a link
     back (button marker with the check glyph), the current is aria-current,
     the future is inert. composition-first-apis: explicit ordinals, the
     parts authored in the tree. -->
<script lang="ts">
  import Steps, {
    StepsItem,
    StepsIndicator,
    StepsTitle,
    StepsDescription,
    StepsSeparator,
  } from '$lib/ui/steps/index';

  let current = $state(1);
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Steps bind:current>
    <StepsItem step={0} label="connect" onclick={() => (current = 0)}>
      <StepsIndicator />
      <StepsTitle>connect</StepsTitle>
      <StepsDescription>link the git origin</StepsDescription>
      <StepsSeparator />
    </StepsItem>
    <StepsItem step={1} label="build">
      <StepsIndicator />
      <StepsTitle>build</StepsTitle>
      <StepsDescription>install + typecheck</StepsDescription>
      <StepsSeparator />
    </StepsItem>
    <StepsItem step={2} label="preview">
      <StepsIndicator />
      <StepsTitle>preview</StepsTitle>
      <StepsDescription>deploy to staging</StepsDescription>
      <StepsSeparator />
    </StepsItem>
    <StepsItem step={3} label="ship">
      <StepsIndicator />
      <StepsTitle>ship</StepsTitle>
      <StepsDescription>promote to production</StepsDescription>
      <StepsSeparator />
    </StepsItem>
  </Steps>
</div>
