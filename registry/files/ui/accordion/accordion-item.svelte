<!--
  jixoai accordion item (registry/files/ui/accordion-item.svelte).
  The leaf half of the accordion pair: a styled <details>/<summary> with
  nothing added semantically — the browser already exposes the toggle,
  the disclosure state, and the keyboard contract. Drop it inside
  accordion.svelte (the group frame) or use it bare for a one-off
  disclosure.

  bind:open is supported (Svelte binds <details> open natively) — the
  exclusive mode on the group still works through the DOM, so manual
  open changes participate in the same radio behavior.

  The summary is a snippet (icons, badges compose); the marker is a CSS
  chevron that rotates on [open] — the native ::marker is retired.
  CONSTRAINT: no interactive elements (buttons/links) inside the summary
  snippet — they fight the summary's own click/keyboard contract. Put
  per-row actions in the body, or use a menu outside the accordion.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** disclosure state; bindable (bind:open) for controlled use */
    open?: boolean;
    /** the summary line — plain text or a composed snippet */
    summary: Snippet;
    children: Snippet;
    class?: string;
  }

  let { open = $bindable(false), summary, children, class: className = '' }: Props = $props();
</script>

<details class="jx-acc-item {className}" bind:open>
  <summary class="jx-acc-summary">{@render summary()}</summary>
  <div class="jx-acc-body">
    {@render children()}
  </div>
</details>

<style>
  .jx-acc-item {
    display: block;
  }

  .jx-acc-summary {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    box-sizing: border-box;
    padding: 0.6875rem 0.875rem;
    cursor: pointer;
    list-style: none;
    user-select: none;
    font-family: var(--font-nav);
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--foreground);
    transition: color 150ms ease-out;
  }
  /* retire the native marker everywhere (Safari needs the pair) */
  .jx-acc-summary::-webkit-details-marker {
    display: none;
  }
  .jx-acc-summary::marker {
    content: '';
  }
  /* the chevron: CSS-drawn, rotates with the disclosure state */
  .jx-acc-summary::after {
    content: '';
    margin-left: auto;
    flex: none;
    width: 0.4375rem;
    height: 0.4375rem;
    border-right: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    transform: rotate(45deg);
    transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-acc-item[open] > .jx-acc-summary::after {
    transform: rotate(225deg);
  }
  .jx-acc-summary:hover {
    color: var(--primary);
  }
  .jx-acc-summary:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  .jx-acc-body {
    padding: 0 0.875rem 0.875rem calc(0.875rem + 0.625rem);
    font-size: 0.8125rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }

  /* height:auto animation where the engine allows it (progressive
     enhancement — see the group's interpolate-size note; the item also
     sets it itself so BARE items outside any group animate too) */
  @supports selector(::details-content) and (interpolate-size: allow-keywords) {
    .jx-acc-item {
      interpolate-size: allow-keywords;
    }
    .jx-acc-item::details-content {
      height: 0;
      overflow: clip;
      transition:
        height 200ms cubic-bezier(0.22, 1, 0.36, 1),
        content-visibility 200ms allow-discrete;
    }
    .jx-acc-item[open]::details-content {
      height: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-acc-summary::after,
    .jx-acc-item::details-content {
      transition: none;
    }
  }
</style>
