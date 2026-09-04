// alert-dialog — pure barrel (composition-first-apis, 2026-08-25):
// default = the canonical main (the state-context root); sub-parts as
// named defaults; export * carries module-level named exports/types.
// No logic lives here.
export { default } from './alert-dialog.svelte';
export * from './alert-dialog.svelte';
export { default as AlertDialogTrigger } from './alert-dialog-trigger.svelte';
export * from './alert-dialog-trigger.svelte';
export { default as AlertDialogContent } from './alert-dialog-content.svelte';
export * from './alert-dialog-content.svelte';
export { default as AlertDialogTitle } from './alert-dialog-title.svelte';
export * from './alert-dialog-title.svelte';
export { default as AlertDialogDescription } from './alert-dialog-description.svelte';
export * from './alert-dialog-description.svelte';
export { default as AlertDialogActions } from './alert-dialog-actions.svelte';
export * from './alert-dialog-actions.svelte';
export { default as AlertDialogAction } from './alert-dialog-action.svelte';
export * from './alert-dialog-action.svelte';
export { default as AlertDialogCancel } from './alert-dialog-cancel.svelte';
export * from './alert-dialog-cancel.svelte';
export { AlertDialogDefaults, type AlertDialogSurfaceVariant, type AlertDialogActionVariant } from './alert-dialog-defaults.svelte';
