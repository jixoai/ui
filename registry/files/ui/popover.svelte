<!--
  jixoai popover (registry/files/ui/popover.svelte).

  NativeHTML base (2026-08-20): the Popover API — `popover="auto"` on the
  panel plus a trigger button wired declaratively through `popovertarget`.
  Light dismiss (outside click / focus loss), Escape, aria-expanded on the
  trigger, one-auto-popover-at-a-time, and top-layer rendering are all
  browser-native. The component ships ZERO script — markup and styling
  only.

  Placement (v1): native anchoring defaults to viewport-center (UA
  `margin: auto`). We restage that as an authored strategy —
  `inset-area: center` where supported, inset + margin:auto fallback —
  and treat ANCHORED placement next to the trigger as the extension
  direction (CSS Anchor Positioning: `anchor-name` on the trigger,
  `position-anchor` + `inset-area` here; a future `placement` prop).
  Deliberately not in v1.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** Popover id; the trigger targets it via popovertarget. */
    id: string;
    /** Trigger button label (press-button outline physics, native button). */
    triggerLabel: string;
    children: Snippet;
  }

  let { id, triggerLabel, children }: Props = $props();
</script>

<button type="button" class="jx-pop-trigger" popovertarget={id}>
  {triggerLabel}
  <svg
    class="jx-pop-caret"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
</button>

<div {id} popover="auto" class="jx-pop">
  {@render children()}
</div>

<style>
  /* Trigger: the press-button outline recipe on a native button — it must
     stay a real <button> because popovertarget only works on buttons. */
  .jx-pop-trigger {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
    border: 1px solid var(--border);
    background: var(--background);
    box-shadow: var(--shadow-xs);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      background-color 150ms ease-out;
  }
  .jx-pop-trigger:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    background: var(--muted);
  }
  .jx-pop-trigger:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }

  /* Caret: flips while open via :has + ::popover-open (progressive —
     engines without it simply keep the closed caret). */
  .jx-pop-caret {
    width: 13px;
    height: 13px;
    flex: none;
    transition: transform 150ms ease-out;
  }
  .jx-pop-trigger:has(+ .jx-pop:popover-open) .jx-pop-caret {
    transform: rotate(180deg);
  }

  /* Panel law: 1px border, hard offset shadow, radius 0. Placement is the
     authored centering described in the head comment — the UA `margin:
     auto` default is replaced by inset-area with an explicit fallback. */
  .jx-pop {
    position: fixed;
    margin: 0;
    inset-area: center;
    width: fit-content;
    height: fit-content;
    max-width: min(92vw, 22rem);
    max-height: 72vh;
    overflow: auto;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--popover-foreground);
    border: 1px solid var(--border);
    background: var(--popover);
    box-shadow: var(--shadow);
  }
  @supports not (inset-area: center) {
    .jx-pop {
      inset: 0;
      margin: auto;
    }
  }
  /* Popovers get a ::backdrop too; light dismiss must never dim the page. */
  .jx-pop::backdrop {
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-pop-trigger,
    .jx-pop-caret {
      transition: none;
    }
  }
</style>
