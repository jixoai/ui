<!-- composition-a spec fixture: the steps family composed with explicit
     ordinals — parameterized ordinals/current/interactivity for the
     ordinal-semantics fixture table, the done-marker button law and the
     bind:current seam. -->
<script lang="ts">
  import Steps, {
    StepsItem,
    StepsIndicator,
    StepsTitle,
    StepsDescription,
    StepsSeparator,
  } from '../../src/lib/ui/steps';

  interface Props {
    /** the authored ordinals (duplicates and gaps included on purpose) */
    ordinals?: number[];
    /** the initial 0-based current */
    current?: number;
    /** items get an onclick — done markers become buttons, clicks navigate */
    interactive?: boolean;
    /** forwarded with the step ordinal on every marker click */
    onclick?: (step: number) => void;
  }

  let {
    ordinals = [0, 1, 2],
    current: initial = 1,
    interactive = false,
    onclick,
  }: Props = $props();

  // the fixture SNAPSHOT-seeds current from the initial prop (fresh mount
  // per render call) — the warning below is the intended shape
  // svelte-ignore state_referenced_locally
  let current = $state(initial);

  const handler =
    (step: number) =>
    (): void => {
      current = step;
      onclick?.(step);
    };
</script>

<Steps bind:current>
  {#each ordinals as step, index (index)}
    <StepsItem {step} label="step {step}" onclick={interactive ? handler(step) : undefined}>
      <StepsIndicator />
      <StepsTitle>step {step}</StepsTitle>
      <StepsDescription>ordinal {step}</StepsDescription>
      <StepsSeparator />
    </StepsItem>
  {/each}
</Steps>
