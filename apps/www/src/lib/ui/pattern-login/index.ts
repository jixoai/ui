// pattern-login — pure barrel (folder law): default = the canonical
// main (the ssh login card); the OTP second-factor screen as a named
// default; export * carries module-level named exports/types. No
// logic lives here.
export { default } from './pattern-login.svelte';
export * from './pattern-login.svelte';
export { default as PatternLoginOtp } from './pattern-login-otp.svelte';
export * from './pattern-login-otp.svelte';
