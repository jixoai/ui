<!-- steps blueprint: the wizard at step 2 of 4 — the done step is a link
     back (button marker with the check glyph), the current is aria-current,
     the future is inert. composition-first-apis: explicit ordinals, the
     parts authored in the tree.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Steps, {
    StepsItem,
    StepsIndicator,
    StepsTitle,
    StepsDescription,
    StepsSeparator,
  } from '$lib/ui/steps/index';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

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

  let current = $state(1);
</script>

<Stack direction="column" justify="center" class={cx(bpB.stepsStage)}>
  <Steps density="lg" bind:current>
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
</Stack>
