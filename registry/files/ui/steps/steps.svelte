<!--
  jixoai steps (registry/files/ui/steps.svelte).
  The wizard progress: an ol of steps where ORDER is the semantics.
  The ruling on clickability: COMPLETED steps are links back (the
  user already owns that state), the CURRENT step is aria-current,
  FUTURE steps are inert (never aria-disabled — they are not disabled
  controls, they simply are not yet reachable).

  The connector is a CSS line between markers; the marker for a
  completed step carries a check glyph. onstepclick receives the index
  of a completed step the user re-entered.

  tw4 (2026-08-24): utility-authored — marker/title state paints map
  to conditional color utilities in the markup; ONLY the connector
  pseudo build (a ::after line with its done-state repaint) stays in
  steps.css. `jx-step*` classes are semantic hooks, css defines them
  (the connector) or nothing (the rest).
-->
<script lang="ts">
  import { cn } from '$lib/utils';
  import './steps.css';

  export interface StepItem {
    title: string;
    description?: string;
  }

  interface Props {
    steps: StepItem[];
    /** 0-based index of the current step */
    current: number;
    /** fired when the user re-enters a COMPLETED step */
    onstepclick?: (index: number) => void;
    class?: string;
  }

  let { steps, current, onstepclick, class: className = '' }: Props = $props();

  const markerPaint = {
    done: 'border-primary bg-card text-primary',
    current: 'border-primary bg-primary text-primary-foreground',
    todo: 'border-border bg-card text-muted-foreground',
  } as const;
</script>

<ol class={cn('jx-steps flex flex-wrap', className)} role="list">
  {#each steps as step, index (index)}
    {@const state = index < current ? 'done' : index === current ? 'current' : 'todo'}
    <li
      class={cn(`jx-step jx-step-${state} relative flex flex-1 items-start gap-2.5 min-w-[9rem] pr-4`)}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      {#if state === 'done' && onstepclick}
        <button
          type="button"
          class={cn(
            'jx-step-marker flex-none inline-flex items-center justify-center size-6 border font-nav text-[0.6875rem] cursor-pointer hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
            markerPaint[state],
          )}
          aria-label="completed: {step.title} — go back"
          onclick={() => onstepclick?.(index)}
        >
          <span class="jx-step-index" aria-hidden="true">✓</span>
        </button>
      {:else}
        <span class={cn('jx-step-marker flex-none inline-flex items-center justify-center size-6 border font-nav text-[0.6875rem]', markerPaint[state])} aria-hidden="true">
          <span class="jx-step-index">{index + 1}</span>
        </span>
      {/if}
      <span class="jx-step-text flex min-w-0 flex-col gap-[0.125rem]">
        <span class={cn('jx-step-title font-nav text-xs tracking-[0.08em] uppercase', state === 'current' ? 'text-foreground' : 'text-muted-foreground')}>{step.title}</span>
        {#if step.description}
          <span class="jx-step-desc text-xs leading-[1.45] text-muted-foreground opacity-80">{step.description}</span>
        {/if}
      </span>
    </li>
  {/each}
</ol>
