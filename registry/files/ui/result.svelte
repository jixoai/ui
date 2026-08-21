<!--
  jixoai result (registry/files/ui/result.svelte).
  The page-level outcome of an operation: status glyph + title +
  description + actions. Deliberately THIN (the ruling): no 403/404
  routing logic, no illustration system — bring your own through the
  icon snippet. Status paints through the tone law (success = the
  brand's emphasis voice — there is no green in this language;
  error = destructive; the others stay neutral).

  empty ≠ result: empty says "no data"; result says "an operation
  reached an outcome". They are different states and stay different
  components.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** success uses the brand voice (no green in this language) */
    status?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    /** custom glyph — defaults to the status text glyph */
    icon?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { status = 'info', title, description, icon, actions, class: className = '' }: Props = $props();

  const glyph = $derived(
    status === 'success' ? '✓' : status === 'error' ? '✕' : status === 'warning' ? '!' : 'i',
  );
</script>

<div class="jx-result jx-result-{status} {className}">
  <div class="jx-result-icon" aria-hidden="true">
    {#if icon}
      {@render icon()}
    {:else}
      <span class="jx-result-glyph">{glyph}</span>
    {/if}
  </div>
  <h2 class="jx-result-title">{title}</h2>
  {#if description}
    <p class="jx-result-desc">{description}</p>
  {/if}
  {#if actions}
    <div class="jx-result-actions">
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  .jx-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 3rem 1.5rem;
    text-align: center;
  }
  .jx-result-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-xs);
  }
  .jx-result-glyph {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    line-height: 1;
  }
  .jx-result-success .jx-result-icon {
    border-color: var(--primary);
  }
  .jx-result-success .jx-result-glyph {
    color: var(--primary);
  }
  .jx-result-error .jx-result-icon {
    border-color: var(--destructive);
  }
  .jx-result-error .jx-result-glyph {
    color: var(--destructive);
  }
  .jx-result-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 1rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-result-desc {
    margin: 0;
    max-width: 44ch;
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }
  .jx-result-actions {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.625rem;
  }
</style>
