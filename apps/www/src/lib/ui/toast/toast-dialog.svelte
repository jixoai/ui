<!--
  jixoai toast dialog (registry/files/ui/toast/toast-dialog.svelte;
  toast-v2, 2026-09-02) — the expandable reading posture.
  An expandable:true toast opens its FULL content here through a view
  transition: the card and this panel share view-transition-name
  jx-toast-<id>, so the platform morphs one into the other (engines
  without VT get the WAAPI rect-rise the viewport drives — the
  navigation-menu indicator's two-motion-laws precedent). The panel is
  popover=auto: light dismiss collapses back into the stack; the toast
  itself is untouched (its clock stays PAUSED while expanded — the
  viewport pauses on open and resumes on collapse).

  The surface rides the dialog family's restrained ground (border +
  popover + tier shadow — the md rung, the dead shadow-lg rung's
  nearest live tier; NO scrim — expanding a toast is not a modal
  interruption, the page stays reachable). While open, the toast's
  countdown companion freezes with the clock (the drain bar carries
  the paused state).

  tailwindless one-shot W1 (2026-09-17): paint rides the family's
  stylex atoms (toast.stylex.ts).
-->
<script lang="ts">
  import type { ToastItem } from '$lib/toast-store';
  import { cn } from '$lib/utils';
  import { toastStyles as tst } from './toast.stylex';
  import ToastCountdown from './toast-countdown.svelte';

  interface Props {
    item: ToastItem;
    /** collapse (false) or dismiss-and-collapse (true) — the viewport
     *  owns the store calls; the dialog only reports intent */
    onclose: (dismiss: boolean) => void;
    /** the unified hold state — the drain bar freezes with the clock */
    paused?: boolean;
    class?: string;
  }

  let { item, onclose, paused = false, class: className = '' }: Props = $props();

  // the payload's own join (separator's serialize law): plain strings
  // pass through whole; stylex objects contribute their string members
  // ($$css dropped) — the canonical cx (tailwindless W4 unification)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  let panel = $state<HTMLElement | null>(null);

  // the shared-element name — must MATCH the card's (the viewport
  // stamps the card side when it opens the transition)
  const vtName = $derived(`jx-toast-${item.id}`);

  $effect(() => {
    // mount IS the open intent: the panel rides popover=auto, but the
    // attribute alone never opens it — show() arms light dismiss
    // (Escape / outside click → ontoggle 'closed' → collapse) and the
    // :popover-open state (a closed popover is display:none UA-side)
    panel?.showPopover?.();
    panel?.focus();
    // focus RETURN on close is the viewport's job — it owns cardEls
    // (the OPENER card, not this panel's guess at the DOM, R1 P2-5)
  });

  function requestClose(dismiss: boolean): void {
    onclose(dismiss);
  }
</script>

<div
  bind:this={panel}
  data-jx-toast-dialog={item.id}
  popover="auto"
  class={cn(
    // pointer-events auto: the float area is pointer-transparent by law
    // (grid-not-position); the panel OPTS BACK IN like the cards do —
    // without it the whole subtree is invisible to hit tests
    cx(tst.panel),
    className,
  )}
    style={`view-transition-name: ${vtName}; view-transition-class: jx-toast-morph;`}
  role="dialog"
  aria-label={item.title}
  tabindex="-1"
  ontoggle={(e) => {
    // light dismiss (Escape / outside click): collapse, keep the toast
    if (e.newState === 'closed') requestClose(false);
  }}
>
  <div class={cx(tst.panelGrid)}>
    <div class={cx(tst.panelHead)}>
      <div class={cx(tst.panelTitleBlock)}>
        <p class={cx(tst.title, tst.inkForeground)}>{item.title}</p>
        {#if item.description}
          <p class={cx(tst.panelDesc)}>{item.description}</p>
        {/if}
      </div>
      {#if item.leading}
        <div class={cx(tst.panelLeading)}>{@render item.leading()}</div>
      {/if}
    </div>
    {#if item.trailing}
      <div data-jx-toast-dialog-trailing="" class={cx(tst.panelTrailing)}>{@render item.trailing()}</div>
    {/if}
    <div class={cx(tst.panelFooter)}>
      <div class={cx(tst.panelCountdownRow)}>
        {#if item.countdown && (item.duration ?? 5000) > 0}
          <ToastCountdown duration={item.duration ?? 5000} {paused} />
        {/if}
      </div>
      <div class={cx(tst.panelActions)}>
        <button
          type="button"
          class="jx-press {cx(tst.panelAction)}"
          onclick={() => requestClose(false)}
        >
          collapse
        </button>
        <button
          type="button"
          data-jx-toast-dialog-dismiss=""
          class="jx-press {cx(tst.panelAction)}"
          onclick={() => requestClose(true)}
        >
          dismiss
        </button>
      </div>
    </div>
  </div>
</div>
