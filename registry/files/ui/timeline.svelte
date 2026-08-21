<!--
  jixoai timeline (registry/files/ui/timeline.svelte).
  The activity stream: an ol of timestamped entries with a CSS spine
  and dot markers — the list's order is the chronology, the spine is
  decoration. Each item is {time?, title, children (body)}; the LAST
  item can be flagged pending (hollow dot) for in-flight activity.
  Pure composition, zero JS.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface TimelineItem {
    title: string;
    /** the timestamp line as displayed — formatting is yours */
    time?: string;
    /** machine-readable instant (ISO 8601) for <time datetime> */
    datetime?: string;
    /** in-flight entry: hollow dot, muted title */
    pending?: boolean;
  }

  interface Props {
    items: TimelineItem[];
    /** per-item body, keyed by index */
    body?: Snippet<[TimelineItem, number]>;
    class?: string;
  }

  let { items, body, class: className = '' }: Props = $props();
</script>

<ol class="jx-timeline {className}" role="list">
  {#each items as item, index (index)}
    <li class="jx-tl-item" class:jx-tl-pending={item.pending}>
      <span class="jx-tl-dot" aria-hidden="true"></span>
      <div class="jx-tl-body">
        {#if item.time}
          <p class="jx-tl-time">
            <time datetime={item.datetime || undefined}>{item.time}</time>
          </p>
        {/if}
        <p class="jx-tl-title">{item.title}</p>
        {#if body}
          {@render body(item, index)}
        {/if}
      </div>
    </li>
  {/each}
</ol>

<style>
  .jx-timeline {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .jx-tl-item {
    position: relative;
    display: flex;
    gap: 0.875rem;
    padding-bottom: 1.25rem;
    padding-left: 1.25rem;
  }
  /* the spine: one line through every dot */
  .jx-tl-item::before {
    content: '';
    position: absolute;
    left: 0.3125rem;
    top: 0.5rem;
    bottom: -0.25rem;
    width: 1px;
    background: var(--border);
  }
  .jx-tl-item:last-child::before {
    bottom: auto;
    height: 0;
  }
  .jx-tl-dot {
    position: absolute;
    left: 0;
    top: 0.3125rem;
    width: 0.625rem;
    height: 0.625rem;
    box-sizing: border-box;
    border: 1px solid var(--primary);
    background: var(--primary);
  }
  .jx-tl-pending .jx-tl-dot {
    background: transparent;
  }
  .jx-tl-body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .jx-tl-time {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--muted-foreground);
  }
  .jx-tl-title {
    margin: 0;
    font-family: var(--font-nav);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground);
  }
  .jx-tl-pending .jx-tl-title {
    color: var(--muted-foreground);
  }
</style>
