<!--
  jixoai timeline (registry/files/ui/timeline.svelte).
  The activity stream: an ol of timestamped entries with a CSS spine
  and dot markers — the list's order is the chronology, the spine is
  decoration. Each item is {time?, title, children (body)}; the LAST
  item can be flagged pending (hollow dot) for in-flight activity.
  Pure composition, zero JS.

  tw4 (2026-08-24): static paint rides token utilities in the markup
  (the pending hollow-dot and muted title are deterministic per-state
  strings — never two colliding utilities); ONLY the spine pseudo-
  element build stays in timeline.css (D1-exempt residue, static
  geometry in @layer components — it overrides no utility paint).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './timeline.css';

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

<ol data-jx-timeline="" class={cn('m-0 p-0 list-none', className)} role="list">
  {#each items as item, index (index)}
    <li data-jx-tl-pending={item.pending ? '' : undefined} class={cn('jx-tl-item relative flex gap-[0.875rem] pb-5 pl-5')}>
      <span
        data-jx-tl-dot=""
        class={cn(
          'absolute left-0 top-[0.3125rem] w-2.5 h-2.5 box-border border border-primary',
          item.pending ? 'bg-transparent' : 'bg-primary',
        )}
        aria-hidden="true"
      ></span>
      <div data-jx-tl-body="" class="flex flex-col gap-1 min-w-0">
        {#if item.time}
          <p data-jx-tl-time="" class="m-0 font-mono text-[0.6875rem] text-muted-foreground">
            <time datetime={item.datetime || undefined}>{item.time}</time>
          </p>
        {/if}
        <p
          data-jx-tl-title=""
          class={cn(
            'm-0 font-nav text-xs tracking-[0.08em] uppercase',
            item.pending ? 'text-muted-foreground' : 'text-foreground',
          )}
        >{item.title}</p>
        {#if body}
          {@render body(item, index)}
        {/if}
      </div>
    </li>
  {/each}
</ol>
