<!--
  jixoai SystemDialogHost host
  (registry/files/ui/system-dialog/system-dialog-host.svelte;
  system-dialog, 2026-09-09 — Owner: "它需要承担 window.alert/
  window.prompt/window.confirm 这三种弹窗的职责").
  The imperative trio's private mount host: one composition of the
  family parts covering the three system postures —

    alert    a single affirmative action (informational)
    confirm  Cancel + Confirm → boolean
    prompt   a labeled input + Cancel + Confirm → string | null

  THE CENTER POSE: unlike the anchored form (which rises beside its
  trigger through CSS Anchor Positioning), a system dialog has NO
  trigger to rise beside — Content's pose="center" drops the anchor
  chain and the UA's popover centering owns the panel (margin auto +
  fit-content, inset 0): the window.confirm posture.

  FOCUS: prompt lands on the INPUT (the answer is the task; the APG
  safe-landing law serves the CHOICE surfaces, and alert/confirm keep
  it — Cancel stays the landing). Enter submits the prompt; Escape is
  Content's own (every route resolves through the shared close path).

  RESOLUTION: exactly-once through the onresolve seam — an action
  resolves its value, and a close WITHOUT an action (Escape, a
  programmatic close) resolves the cancel value. Never throw, never
  hang.
-->
<script lang="ts">
  import SystemDialog from './system-dialog.svelte';
  import SystemDialogContent from './system-dialog-content.svelte';
  import SystemDialogTitle from './system-dialog-title.svelte';
  import SystemDialogDescription from './system-dialog-description.svelte';
  import SystemDialogActions from './system-dialog-actions.svelte';
  import SystemDialogAction from './system-dialog-action.svelte';
  import SystemDialogCancel from './system-dialog-cancel.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import { SystemDialogDefaults, type SystemDialogTone } from './system-dialog-defaults.svelte';

  export type SystemMode = 'alert' | 'confirm' | 'prompt';

  interface Props {
    mode: SystemMode;
    title: string;
    description?: string;
    /** the affirmative label ('OK' | 'confirm' | 'submit' own defaults) */
    confirmLabel: string;
    /** the safe label ('cancel' own default; unused by alert) */
    cancelLabel: string;
    /** the confirm rung's paint: destructive fill (the family default —
        the question usually guards a dangerous act) | the brand pair */
    tone?: SystemDialogTone;
    /** prompt-only: the input's visible label */
    inputLabel?: string;
    /** prompt-only */
    placeholder?: string;
    /** prompt-only: the initial value */
    initialValue?: string;
    /** EXACTLY-ONCE resolution (the mounting api owns the promise) */
    onresolve: (value: boolean | string | null) => void;
  }

  let {
    mode,
    title,
    description,
    confirmLabel,
    cancelLabel,
    tone = mode === 'confirm' ? 'destructive' : 'primary',
    inputLabel,
    placeholder,
    initialValue = '',
    onresolve,
  }: Props = $props();

  let open = $state(true);
  let text = $state(initialValue);
  let settled = false;

  const cancelValue = $derived(mode === 'prompt' ? null : false);
  const confirmValue = $derived.by(() => (mode === 'prompt' ? text : true));

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2, the A3 law the gate demanded): the confirm tone rides
  // its OWN slot; the mode-conditional default above is this host's
  // declared own, ambient never consulted for it
  const d = $derived(SystemDialogDefaults.resolve({ tone }));

  // the primary rung: the consumer recipe for the brand pair over the
  // fill rung (the family docs' own — the destructive default needs
  // nothing, jx-pair-destructive already rides it)
  const actionClass = $derived(
    d.tone === 'primary' ? '[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]' : '',
  );

  function settle(value: boolean | string | null): void {
    if (settled) return;
    settled = true;
    onresolve(value);
  }

  // prompt focuses its input once the panel is open (Content's landing
  // is 'none' for prompt — this host owns the landing; the stamp rides
  // Input's rest lane onto the native control)
  $effect(() => {
    if (open && mode === 'prompt') {
      requestAnimationFrame(() => {
        document
          .querySelector(':popover-open [data-jx-sysdlg-prompt-input]')
          ?.focus();
      });
    }
  });

  // a close WITHOUT an action (Escape, programmatic) resolves the
  // cancel value — the promise never hangs
  $effect(() => {
    if (!open) settle(cancelValue);
  });
</script>

<SystemDialog bind:open>
  <SystemDialogContent pose="center" focusLanding={mode === 'prompt' ? 'none' : 'cancel'}>
    <SystemDialogTitle>{title}</SystemDialogTitle>
    {#if description}
      <SystemDialogDescription>{description}</SystemDialogDescription>
    {/if}
    {#if mode === 'prompt'}
      <!-- the family's Input at BARE chrome (the borderless-chrome law:
           no frame inside the bounded panel — the shell affords through
           the focus ring alone), glyph off for the quiet system posture -->
      <!-- Enter rides the WRAPPER's keydown (bubbling from the native
           control) — not the Input's rest lane, whose spread target is
           the shell's own business -->
      <div
        onkeydown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            settle(confirmValue);
            open = false;
          }
        }}
      >
        <Input
          bind:value={text}
          chrome="bare"
          icon={null}
          label={inputLabel ?? 'value'}
          {placeholder}
          data-jx-sysdlg-prompt-input
        />
      </div>
    {/if}
    <SystemDialogActions>
      {#if mode !== 'alert'}
        <SystemDialogCancel onclick={() => settle(cancelValue)}>{cancelLabel}</SystemDialogCancel>
      {/if}
      <SystemDialogAction class={actionClass} onclick={() => settle(confirmValue)}>
        {confirmLabel}
      </SystemDialogAction>
    </SystemDialogActions>
  </SystemDialogContent>
</SystemDialog>
