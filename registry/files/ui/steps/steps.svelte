<!--
  jixoai steps — the ROOT half (registry/files/ui/steps/steps.svelte,
  composition-first-apis, 2026-08-25).
  The wizard progress as a composed family (shadcn-vue Stepper law):
  the root owns ONLY the shared state — `current`, 0-based, bindable —
  and hands it to the subtree through context (Symbol.for, so family
  files stay independent registry items):

    <Steps bind:current>
      <StepsItem step={0} onclick={() => go(0)}>   ← REQUIRED ordinal;
                                                       state = pure
                                                       comparison
        <StepsIndicator />                          ← number → ✓ when
                                                       done; THE button
                                                       when onclick+done
        <StepsTitle>connect</StepsTitle>
        <StepsDescription>link the repo</StepsDescription>
        <StepsSeparator />                          ← self-hides on the
                                                       last item (css)
      </StepsItem>
    </Steps>

  Ordinals are caller truth (the family context contract): state is a
  pure `step < / == / > current` comparison computed inside each Item,
  so duplicates paint every match current and gaps simply paint no
  current — nothing to corrupt, zero registration.
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface StepsApi {
    /** 0-based index of the current step — the one source of truth */
    readonly current: number;
  }

  /** context key — global symbol registry, independent registry items */
  export const STEPS_KEY = Symbol.for('jx-steps');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setContext } from 'svelte';
  import { cn } from '$lib/utils';
  import './steps.css';
  import { getDensityContext, resolveDensity, type Density } from '$lib/density.svelte';

  interface Props extends HTMLAttributes<HTMLOListElement> {
    density?: Density;
    /** 0-based ordinal of the current step; bindable (bind:current) */
    current?: number;
    class?: string;
    children: Snippet;
  }

  let {
    density,
    current = $bindable(0),
    class: className = '',
    children,
    ...rest
  }: Props = $props();
  const resolvedDensity = $derived(resolveDensity(density, getDensityContext()));

  setContext<StepsApi>(STEPS_KEY, {
    get current() {
      return current;
    },
  });
</script>

<ol data-jx-steps="" data-density={resolvedDensity} class={cn('flex flex-wrap', className)} {...rest} role="list">
  {@render children()}
</ol>
