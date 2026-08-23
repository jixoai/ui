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
  the consumer's layout is never touched. The button follows the press
  law (theme .jx-press) at float scale — the --jx-press-shadow* customs
  re-point all three poses to the --shadow family.
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
    /** floating-surface variant for the MENU panel: solid | acrylic |
        auto (acrylic unless the environment asks for reduced
        transparency) — the button itself keeps press-button physics */
    variant?: 'solid' | 'acrylic' | 'auto';
    /** button content — an icon snippet or a glyph */
    children: Snippet;
    class?: string;
  }

  let {
    label,
    corner = 'bottom-right',
    onclick,
    actions,
    variant = 'auto',
    children,
    class: className = '',
  }: Props = $props();

  const autoId = $props.id();
  const anchorName = $derived(`--jx-fab-${autoId.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  let open = $state(false);
  let btn = $state<HTMLButtonElement | null>(null);
</script>

{#if actions}
  <div class="jx-fab-stack jx-fab-{corner} {className}" style="anchor-name: {anchorName}">
    <div
      id={autoId}
      popover="auto"
      role="menu"
      class="jx-fab-menu jx-surface"
      data-variant={variant}
      bind:this={btn}
      style="position-anchor: {anchorName}; inset-area: top span-right; position-area: top span-right;"
      ontoggle={(e: Event) => (open = (e.currentTarget as HTMLElement).matches(':popover-open'))}
    >
      <!-- surface body (fill + ::after shadow); the popover element
           paints nothing (floating-surface law arch r3) -->
      <div class="jx-fab-menu-body jx-surface-body">
        {@render actions()}
      </div>
    </div>
    <button
      type="button"
      class="jx-press jx-fab"
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
  <button
    type="button"
    class="jx-press jx-fab jx-fab-{corner} {className}"
    aria-label={label}
    {onclick}
  >
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
    /* press law at float scale: rest on --shadow, hover grows to --shadow-md */
    --jx-press-shadow: var(--shadow);
    --jx-press-shadow-hover: var(--shadow-md);
    --jx-press-shadow-active: var(--shadow-md-press);
    border-radius: var(--radius);
    cursor: pointer;
  }
  .jx-fab:hover {
    border-color: var(--primary);
    color: var(--primary);
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
  /* menu surface on the jx-surface law (arch r3): the popover element
     is the PLATFORM shell (no paint); the body carries the fill and
     the ::after shadow layer */
  .jx-fab-menu {
    position: fixed;
    margin: var(--jx-fab-gap, 8px);
    position-try-fallbacks: flip-block, flip-inline;
    position-try: flip-block, flip-inline;
    position-visibility: anchors-visible;
    width: fit-content;
    min-width: 9rem;
    color: var(--popover-foreground);
  }
  .jx-fab-menu-body {
    padding: 0.25rem;
  }
  .jx-fab-menu::backdrop {
    background: transparent;
  }
</style>
