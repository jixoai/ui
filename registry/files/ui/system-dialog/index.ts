// system-dialog — pure barrel (composition-first-apis, 2026-08-25):
// default = the canonical main (the state-context root); sub-parts as
// named defaults; export * carries module-level named exports/types.
// No logic lives here.
export { default } from './system-dialog.svelte';
export * from './system-dialog.svelte';
export { default as SystemDialogTrigger } from './system-dialog-trigger.svelte';
export * from './system-dialog-trigger.svelte';
export { default as SystemDialogContent } from './system-dialog-content.svelte';
export * from './system-dialog-content.svelte';
export { default as SystemDialogTitle } from './system-dialog-title.svelte';
export * from './system-dialog-title.svelte';
export { default as SystemDialogDescription } from './system-dialog-description.svelte';
export * from './system-dialog-description.svelte';
export { default as SystemDialogActions } from './system-dialog-actions.svelte';
export * from './system-dialog-actions.svelte';
export { default as SystemDialogAction } from './system-dialog-action.svelte';
export * from './system-dialog-action.svelte';
export { default as SystemDialogCancel } from './system-dialog-cancel.svelte';
export * from './system-dialog-cancel.svelte';
export { SystemDialogDefaults, type SystemDialogSurfaceVariant, type SystemDialogActionVariant } from './system-dialog-defaults.svelte';
export { default as SystemDialogHost } from './system-dialog-host.svelte';
export { alert, confirm, prompt } from './system-dialog.svelte.ts';
export type {
  SystemDialogOptions,
  SystemConfirmOptions,
  SystemPromptOptions,
} from './system-dialog.svelte.ts';
