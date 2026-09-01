<!--
  jixoai AlertDialog — the ROOT of the composition-first family
  (registry/files/ui/alert-dialog/alert-dialog.svelte, 2026-08-25).

  The destructive-decision surface — but the root owns ONLY the shared
  state: bindable open + the onconfirm seam, handed to the family
  through context (shadcn-shaped composition:

    <AlertDialog bind:open onconfirm={del}>       ← state context only
      <AlertDialogTrigger>delete repo</AlertDialogTrigger>
      <AlertDialogContent>                        ← popover="manual",
        <AlertDialogTitle>delete repo?</AlertDialogTitle>       anchored
        <AlertDialogDescription>no undo</AlertDialogDescription>  to the
        <p>…free body…</p>                                    trigger, no
        <AlertDialogActions>                                  light
          <AlertDialogCancel>cancel</AlertDialogCancel>       dismiss
          <AlertDialogAction>delete</AlertDialogAction>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialog>

  Recorded divergences from Radix/shadcn: no Overlay/Portal/Header
  parts — the popover element IS the surface (its ::backdrop paints
  the scrim) and rides the platform's top layer; Header is caller
  markup. Actions ≈ Footer. Title and description are parts, never
  props — the ARIA wiring (labelledby/describedby over deterministic
  derived ids) is Content's job.

  What makes it an ALERT dialog (and not popover.svelte): role=
  alertdialog + aria-labelledby/aria-describedby — Title and
  Description parts are effectively required (an alert without words is
  not an alert), and the confirm seam is explicit on the Root, because
  the destructive decision is the whole point. Alert gravity on the
  popover base (popover-engine rebuild, 2026-09-01): MANUAL — no light
  dismiss, an outside click must not silently answer a destructive
  question; Escape is the component's own cancel; the panel RISES
  BESIDE its trigger (CSS Anchor Positioning, try-fallbacks at the
  viewport edge) and hides itself when the anchor scrolls away
  (position-visibility: anchors-visible). No focus trap, no scroll
  lock — the anchored alert is a question at its button, not a mode
  takeover. Keyboard law (APG alertdialog): focus lands on the CANCEL
  action on open — the safe exit is one Tab-less keypress away; hiding
  the popover restores focus to the invoker.
  (props-discipline sweep, 2026-08-25): no ...rest — the root renders no element (context-only fragment: {@render children()}); consumer attributes have no landing element, so the standing contract is carried by the family's real parts (Trigger/Content/Title/…).
-->
<script lang="ts" module>
  /** context surface the family shares (import type where needed) */
  export interface AlertDialogApi {
    /** deterministic id base — Title/Description derive their ids */
    readonly uid: string;
    readonly open: boolean;
    setOpen(next: boolean): void;
    /** the confirm seam: runs the caller's onconfirm, then closes
     *  through Content's shared animated path */
    confirm(): void;
    /** Trigger registers itself on open — the anchored alert must
     *  RETURN focus to its invoker when it hides (the popover spec's
     *  restore contract, kept deterministically by the family) */
    setInvoker(el: HTMLElement | null): void;
    restoreInvoker(): void;
  }

  /** context key — registered on the global symbol registry so the
   *  family files stay independent registry items */
  export const ALERT_DIALOG_KEY = Symbol.for('jx-alert-dialog');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  interface Props {
    /** bindable open state — the controlled seam (bind:open) */
    open?: boolean;
    /** the agreement seam: runs on AlertDialogAction, then the dialog
     *  closes through the shared animated path */
    onconfirm?: () => void;
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let { open = $bindable(false), onconfirm, children }: Props = $props();

  // the last element that opened the family — focus returns here on
  // hide (non-reactive on purpose: pure DOM bookkeeping)
  let invoker: HTMLElement | null = null;

  setContext<AlertDialogApi>(ALERT_DIALOG_KEY, {
    uid: autoId,
    get open() {
      return open;
    },
    setOpen(next: boolean) {
      open = next;
    },
    confirm() {
      onconfirm?.();
      open = false;
    },
    setInvoker(el: HTMLElement | null) {
      invoker = el;
    },
    restoreInvoker() {
      invoker?.focus();
    },
  });
</script>

{@render children()}
