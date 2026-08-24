<!--
  jixoai empty (registry/files/ui/empty.svelte).
  The no-data state of the eight-state machine — NOTHING more (the
  antd ruling: empty does not absorb error/loading/404; those are
  alert/result surfaces). A figure: terminal-box illustration slot
  (default: the empty directory listing), a title, a description, and
  an optional actions snippet ("create the first…").

    <Empty title="no checks yet">
      {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
    </Empty>

  Pure composition — no JS, no state; the illustration is a slot so
  consumers bring their own glyph without a dependency.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description?: string;
    /** custom illustration — defaults to the terminal empty-listing */
    illustration?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let { title, description, illustration, actions, class: className = '' }: Props = $props();
</script>

<figure class="jx-empty {className}">
  <div class="jx-empty-art" aria-hidden="true">
    {#if illustration}
      {@render illustration()}
    {:else}
      <span class="jx-empty-term">ls checks/</span>
      <span class="jx-empty-zero">0 items</span>
    {/if}
  </div>
  <figcaption class="jx-empty-caption">
    <p class="jx-empty-title">{title}</p>
    {#if description}
      <p class="jx-empty-desc">{description}</p>
    {/if}
    {#if actions}
      <div class="jx-empty-actions">
        {@render actions()}
      </div>
    {/if}
  </figcaption>
</figure>

<style>
  .jx-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 0;
    padding: 2.5rem 1.5rem;
    border: 1px dashed var(--border);
    background: var(--muted);
  }
  .jx-empty-art {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-2xs);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
  .jx-empty-term {
    color: var(--muted-foreground);
  }
  .jx-empty-zero {
    color: var(--primary);
  }
  .jx-empty-caption {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    text-align: center;
  }
  .jx-empty-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.8125rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-empty-desc {
    margin: 0;
    max-width: 36ch;
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--muted-foreground);
  }
  .jx-empty-actions {
    margin-top: 0.375rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.625rem;
  }
</style>
