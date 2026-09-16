<!--
  jixoai TimelineItem (registry/files/ui/timeline/timeline-item.svelte;
  W3 drawn-spine rework, Owner 2026-09-15; grid-engine rebuild 2026-09-01).
  The li half: a SUBGRID row (vertical) / column (horizontal) of the
  ol's 5-lane grid. Its state paints as ATTRIBUTES, not part logic
  (the Dot/Title/Time parts stay stateless):

    data-jx-tl-pending  the in-flight flag (hollow dot + muted title —
                        the LOUDER channel: pending WINS over completed)
    data-completed      the value contract's discrete paint — the
                        item's resolved step ≤ the root's current value
                        (reui parity; dots fill, titles step to full
                        ink, times step to muted through timeline.css)
    data-step           the DECLARED ladder position, painted only when
                        the author set `step` (the default — DOM order
                        + 1 — is derived by the reader, never stamped;
                        the geometry engine reads this attribute to
                        build the milestone table)

  THE FLOOR LINE: every item auto-renders the default
  [data-jx-tl-line] — by grid essence it occupies the dot's two block
  neighbors plus the center, bridged into the next node. It is the
  NO-JS FLOOR (SSR and pre-hydration paint it; a degenerate box keeps
  it); once the root's measurement flips data-jx-spine to 'drawn',
  timeline.css retires it and the whole-list SVG spine owns the
  channel. The retired line(i) per-item seam is gone — the root's
  `spine` prop (presets or a geometry-payload snippet) is the only
  seam. Children compose the anatomy (Dot with its 8 directional
  slots, Content, …).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { TIMELINE_KEY, type TimelineApi } from './timeline.svelte';

  interface Props extends HTMLAttributes<HTMLLIElement> {
    /** the chronology milestone; default DOM order + 1 (strictly
     *  ascending — a duplicate is owned by its later item) */
    step?: number;
    /** in-flight entry: hollow dot + muted title (attribute paint) */
    pending?: boolean;
    class?: string;
    children: Snippet;
  }

  let { step, pending = false, class: className = '', children, ...rest }: Props = $props();

  const api = getContext<TimelineApi>(TIMELINE_KEY);

  let liEl = $state<HTMLLIElement | null>(null);
  // the resolved ladder position: the declared step, else DOM order + 1
  // among the list's items (post-hydration: reading live DOM order at
  // effect time; pre-hydration the declared step alone is known)
  let position = $state<number | undefined>(undefined);
  // ONE registration-only effect (the floor-posture law): resolve the
  // DOM position, then register the resolved step with the root — the
  // dev duplicate-warn channel (the geometry engine reads data-step
  // directly; this registration catches the strictly-ascending
  // violation). No paint, no geometry, no listener.
  const resolvedStep = $derived(step ?? position);
  $effect(() => {
    const ol = liEl?.parentElement;
    if (!ol || !liEl) return;
    const siblings = [...ol.children].filter(
      (c) => c instanceof HTMLElement && c.hasAttribute('data-jx-tl-item'),
    );
    const idx = siblings.indexOf(liEl);
    if (idx >= 0) position = idx + 1;
    if (api && resolvedStep !== undefined) {
      api.registerStep(liEl, resolvedStep);
      return () => api.unregisterStep(liEl);
    }
  });

  // the discrete completed paint: resolved step ≤ current (decimals are
  // first-class — 1.5 completes item 1, not item 2); no root context →
  // no paint (an item outside a timeline host is degenerate)
  const completed = $derived(
    api !== undefined && resolvedStep !== undefined && resolvedStep <= api.current,
  );
</script>

<li
  bind:this={liEl}
  data-jx-tl-item=""
  data-jx-tl-pending={pending ? '' : undefined}
  data-completed={completed ? '' : undefined}
  data-step={step}
  class={cn('min-w-0', className)}
  {...rest}
>
  <span data-jx-tl-line="" aria-hidden="true"></span>
  {@render children()}
</li>
