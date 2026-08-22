<!--
  jixoai float button (registry/files/ui/float-button.svelte).
  The floating action button (antd's FloatButton + the back-top
  convention): a fixed corner button, optionally opening a small
  popover menu of related actions. Two idioms ship in the same
  component:

    plain      <FloatButton onclick={compose}>…</FloatButton>  — a lone
               fixed action (compose, support, back-to-top)
    menu       children snippet + actions snippet — the button toggles
               a popover=auto stack above it (native light dismiss)

  Positioning is a prop, not a wrapper: corner picks the fixed point;
  the consumer's layout is never touched. The surface follows the
  press-button laws (lift on hover, press on active) at a fixed size.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** accessible name — required (an icon-only button must say itself) */
    label: string;
    /** which corner to float in */
    corner?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    /** plain idiom: the click action */
    onclick?: () => void;
    /** menu idiom: the stacked actions (renders above the button) */
    actions?: Snippet;
    /** button content — an icon snippet or a glyph */
    children: Snippet;
    class?: string;
  }

  let { label, corner = 'bottom-right', onclick, actions, children, class: className = '' }: Props =
    $props();

  const autoId = $props.id();
  let open = $state(false);
  let btn = $state<HTMLButtonElement | null>(null);
</script>

{#if actions}
  <div class="jx-fab-stack jx-fab-{corner} {className}">
    <div
      id={autoId}
      popover="auto"
      class="jx-fab-menu"
      bind:this={btn}
      ontoggle={(e: Event) => (open = (e.currentTarget as HTMLElement).matches(':popover-open'))}
    >
      {@render actions()}
    </div>
    <button
      type="button"
      class="jx-fab"
      aria-label={label}
      aria-expanded={open}
      aria-haspopup={actions ? 'menu' : undefined}
      aria-controls={actions ? autoId : undefined}
      popovertarget={autoId}
    >
      {@render children()}
    </button>
  </div>
{:else}
  <button type="button" class="jx-fab jx-fab-{corner} {className}" aria-label={label} {onclick}>
    {#if children}{@render children()}{/if}
  </button>
{/if}

<style>
  .jx-fab {
    position: fixed;
    z-index: 80;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
    border-radius: var(--radius);
    cursor: pointer;
    transition:
      transform 150ms ease-out,
      box-shadow 150ms ease-out,
      border-color 150ms ease-out;
  }
  .jx-fab:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-fab:active {
    transform: translate(1px, 1px);
    box-shadow: none;
  }
  .jx-fab:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  .jx-fab-bottom-right {
    right: 1.25rem;
    bottom: 1.25rem;
  }
  .jx-fab-bottom-left {
    left: 1.25rem;
    bottom: 1.25rem;
  }
  .jx-fab-top-right {
    right: 1.25rem;
    top: 5.5rem;
  }
  .jx-fab-top-left {
    left: 1.25rem;
    top: 5.5rem;
  }

  /* menu idiom: the fixed stack anchors the popover visually */
  .jx-fab-stack {
    position: fixed;
    z-index: 80;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .jx-fab-stack .jx-fab {
    position: static;
  }
  .jx-fab-menu {
    /* popover in top layer; visually docked above the stack via margin */
    margin: 0;
    width: fit-content;
    min-width: 9rem;
    padding: 0.25rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--popover-foreground);
    box-shadow: var(--shadow);
  }
  .jx-fab-menu::backdrop {
    background: transparent;
  }
</style>
