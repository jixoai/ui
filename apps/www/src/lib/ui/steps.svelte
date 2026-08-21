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
-->
<script lang="ts">
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
</script>

<ol class="jx-steps {className}" role="list">
  {#each steps as step, index (index)}
    {@const state = index < current ? 'done' : index === current ? 'current' : 'todo'}
    <li class="jx-step jx-step-{state}" aria-current={state === 'current' ? 'step' : undefined}>
      {#if state === 'done' && onstepclick}
        <button
          type="button"
          class="jx-step-marker"
          aria-label="completed: {step.title} — go back"
          onclick={() => onstepclick?.(index)}
        >
          <span class="jx-step-index" aria-hidden="true">✓</span>
        </button>
      {:else}
        <span class="jx-step-marker" aria-hidden="true">
          <span class="jx-step-index">{index + 1}</span>
        </span>
      {/if}
      <span class="jx-step-text">
        <span class="jx-step-title">{step.title}</span>
        {#if step.description}
          <span class="jx-step-desc">{step.description}</span>
        {/if}
      </span>
    </li>
  {/each}
</ol>

<style>
  .jx-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .jx-step {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    flex: 1 1 0;
    min-width: 9rem;
    position: relative;
    padding-right: 1rem;
  }
  /* the connector: a line running from this marker toward the next */
  .jx-step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 0.75rem;
    left: calc(1.5rem + 0.625rem);
    right: 0.5rem;
    height: 1px;
    background: var(--border);
  }
  .jx-step-done:not(:last-child)::after {
    background: var(--primary);
  }
  .jx-step-marker {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 0.6875rem;
    padding: 0;
  }
  button.jx-step-marker {
    cursor: pointer;
  }
  button.jx-step-marker:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
  button.jx-step-marker:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-step-done .jx-step-marker {
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-step-current .jx-step-marker {
    border-color: var(--primary);
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .jx-step-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  .jx-step-title {
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted-foreground);
  }
  .jx-step-current .jx-step-title {
    color: var(--foreground);
  }
  .jx-step-desc {
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--muted-foreground);
    opacity: 0.8;
  }
</style>
