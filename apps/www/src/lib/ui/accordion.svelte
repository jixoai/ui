<!--
  jixoai accordion (registry/files/ui/accordion.svelte).
  W3C-first: the accordion IS <details>/<summary>. Native toggle
  semantics, native keyboard support, native SSR state (the open item
  ships open in the HTML) — no ARIA roles to maintain, nothing to
  hydrate. This file is the GROUP half; pair with accordion-item.svelte.

  The group adds exactly what a pile of bare <details> lacks:
    1. border collapse — one 1px frame around the set, 1px seams
       between items (not a stack of double borders)
    2. exclusive mode — opt-in "radio behavior": opening one item
       closes its siblings. Implemented by ONE capture-phase `toggle`
       listener on this container (toggle does not bubble, but capture
       sees it; Svelte events have no capture modifier, so it is a
       manual addEventListener in the action below), and it also
       governs raw <details> children a consumer drops in —
       composition over registration.

  Height animation is progressive enhancement: interpolate-size:
  allow-keywords + ::details-content transition animates to
  height:auto on supporting engines; everywhere else it snaps (native
  behavior, never broken).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** radio behavior: opening one DIRECT child closes its siblings
     *  (nested accordions and wrapper divs do not participate) */
    exclusive?: boolean;
    children: Snippet;
    class?: string;
  }

  let { exclusive = false, children, class: className = '' }: Props = $props();

  /** capture-phase toggle delegation (see header note); parameterized so
   *  a dynamic `exclusive` flip takes effect without a remount */
  function exclusiveGuard(node: HTMLElement, enabled: boolean) {
    let on = enabled;
    const handler = (event: Event) => {
      if (!on) return;
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      if ((event as ToggleEvent).newState !== 'open') return;
      for (const sibling of node.querySelectorAll(':scope > details[open]')) {
        if (sibling !== details) sibling.removeAttribute('open');
      }
    };
    node.addEventListener('toggle', handler, true);
    return {
      update(next: boolean) {
        on = next;
      },
      destroy: () => node.removeEventListener('toggle', handler, true),
    };
  }
</script>

<div class="jx-accordion {className}" use:exclusiveGuard={exclusive}>
  {@render children()}
</div>

<style>
  .jx-accordion {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--border);
    background: var(--card);
    border-radius: var(--radius);
  }
  /* the 1px seam between items — shared frame, no double borders */
  .jx-accordion :global(> * + *) {
    border-top: 1px solid var(--border);
  }
  /* height:auto animation is allowed where the engine supports it —
     inherited by the items (interpolate-size is an inherited property);
     the item file owns the actual ::details-content rules */
  @supports selector(::details-content) and (interpolate-size: allow-keywords) {
    .jx-accordion {
      interpolate-size: allow-keywords;
    }
  }
</style>
