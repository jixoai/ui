<!--
  jixoai AlertDialog — the ROOT of the composition-first family
  (registry/files/ui/alert-dialog/alert-dialog.svelte, 2026-08-25).

  The destructive-decision surface on the dialog laws — but the root
  owns ONLY the shared state: bindable open + the onconfirm seam, handed
  to the family through context (shadcn-shaped composition:

    <AlertDialog bind:open onconfirm={del}>       ← state context only
      <AlertDialogTrigger>delete repo</AlertDialogTrigger>
      <AlertDialogContent>                        ← the native <dialog>:
        <AlertDialogTitle>delete repo?</AlertDialogTitle>    showModal,
        <AlertDialogDescription>no undo</AlertDialogDescription>  focus trap,
        <p>…free body…</p>                                   Escape=cancel,
        <AlertDialogActions>                                 scroll lock
          <AlertDialogCancel>cancel</AlertDialogCancel>
          <AlertDialogAction>delete</AlertDialogAction>
        </AlertDialogActions>
      </AlertDialogContent>
    </AlertDialog>

  Recorded divergences from Radix/shadcn (native <dialog> law): no
  Overlay/Portal/Header parts — the dialog element IS the overlay and
  the top layer; Header is caller markup. Actions ≈ Footer. Title and
  description are parts, never props — the ARIA wiring (labelledby/
  describedby over deterministic derived ids) is Content's job.

  What makes it an ALERT dialog (and not dialog.svelte): role=
  alertdialog + aria-labelledby/aria-describedby — Title and
  Description parts are effectively required (an alert without words is
  not an alert), and the confirm seam is explicit on the Root, because
  the destructive decision is the whole point. Keyboard law (APG
  alertdialog): focus lands on the CANCEL action on open — the safe
  exit is one Tab-less keypress away; Escape cancels through the native
  path; Tab is the modal's (the platform's focus trap).
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
  });
</script>

{@render children()}
