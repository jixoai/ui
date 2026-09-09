/**
 * jixoai system dialogs (registry/files/ui/system-dialog/
 * system-dialog.svelte.ts; system-dialog, 2026-09-09 — Owner:
 * "它需要承担 window.alert/window.prompt/window.confirm 这三种弹窗
 * 的职责").
 *
 * The imperative trio — drop-in replacements for the window natives,
 * on the family's one alert engine (the centered system pose, the
 * carved split strip, the shared animated close):
 *
 *   await alert('Saved')                          // → void
 *   await confirm('Delete the pipeline?')          // → boolean
 *   const name = await prompt('Rename to?')        // → string | null
 *
 * Every call mounts its own host (they stack in the top layer like
 * the natives do), resolves EXACTLY ONCE — an affirmative action
 * resolves its value, any close without an action (Escape, the
 * Cancel) resolves the cancel value (false / null) — and unmounts
 * after the exit window so the animation plays out. Client-only by
 * nature (interaction-mounted), SSR never sees these run.
 */
import { mount, unmount } from 'svelte';
import SystemHost from './system-dialog-host.svelte';

/** the shared payload every trio member accepts (a bare string
 *  shorthand fills the title) */
export interface SystemDialogOptions {
  title: string;
  description?: string;
  /** the confirm rung's paint: 'destructive' (the fill rung's
   *  jx-pair-destructive default — the question usually guards a
   *  dangerous act) | 'primary' (the brand pair) */
  tone?: 'destructive' | 'primary';
}

export interface SystemConfirmOptions extends SystemDialogOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface SystemPromptOptions extends SystemConfirmOptions {
  /** the input's visible label */
  inputLabel?: string;
  placeholder?: string;
  /** the input's starting value */
  initialValue?: string;
}

const EXIT_MS = 500; // the exit window (the motion kernel's discrete
// display run) — the host stays mounted through it, then leaves

type Resolved = boolean | string | null;

/** mount one system host; resolve exactly once; unmount after exit */
function openSystem(props: Record<string, unknown>): void {
  const target = document.createElement('div');
  document.body.appendChild(target);
  let gone = false;
  const instance = mount(SystemHost, {
    target,
    props: {
      ...props,
      onresolve: (value: Resolved) => {
        if (gone) return;
        gone = true;
        (props.onresolve as ((v: Resolved) => void) | undefined)?.(value);
        setTimeout(() => {
          unmount(instance);
          target.remove();
        }, EXIT_MS);
      },
    },
  });
}

function toOptions(options: string | SystemDialogOptions): SystemDialogOptions {
  return typeof options === 'string' ? { title: options } : options;
}

/** window.alert's posture: one affirmative action, nothing to decide */
export function alert(options: string | SystemDialogOptions): Promise<void> {
  const o = toOptions(options);
  return new Promise((resolve) => {
    openSystem({
      mode: 'alert',
      title: o.title,
      description: o.description,
      tone: o.tone ?? 'primary',
      confirmLabel: 'ok',
      cancelLabel: 'cancel',
      onresolve: () => resolve(),
    });
  });
}

/** window.confirm's posture: the safe Cancel + the confirm → boolean */
export function confirm(options: string | SystemConfirmOptions): Promise<boolean> {
  const o = toOptions(options) as SystemConfirmOptions;
  return new Promise((resolve) => {
    openSystem({
      mode: 'confirm',
      title: o.title,
      description: o.description,
      tone: o.tone ?? 'destructive',
      confirmLabel: o.confirmLabel ?? 'confirm',
      cancelLabel: o.cancelLabel ?? 'cancel',
      onresolve: (value) => resolve(Boolean(value)),
    });
  });
}

/** window.prompt's posture: a labeled input → string | null */
export function prompt(options: string | SystemPromptOptions): Promise<string | null> {
  const o = toOptions(options) as SystemPromptOptions;
  return new Promise((resolve) => {
    openSystem({
      mode: 'prompt',
      title: o.title,
      description: o.description,
      tone: o.tone ?? 'primary',
      confirmLabel: o.confirmLabel ?? 'submit',
      cancelLabel: o.cancelLabel ?? 'cancel',
      inputLabel: o.inputLabel,
      placeholder: o.placeholder,
      initialValue: o.initialValue,
      onresolve: (value) => resolve(typeof value === 'string' ? value : null),
    });
  });
}
