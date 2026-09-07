// text — pure barrel: default = the canonical base (Text renders <p>
// by default); export * carries the base's module-script Raw sugars
// (P Strong Em Del Mark Ins Sub Sup — the one-vocabulary law) plus
// any module-level named exports/types. No logic lives here.
export { default } from './text.svelte';
export * from './text.svelte';
export { TextDefaults, type TextMark } from './text-defaults.svelte';
