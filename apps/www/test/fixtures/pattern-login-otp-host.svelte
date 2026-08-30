<!--
  Test host for the login OTP second factor (terminal-patterns
  2026-08-30): exposes the joined code and the verify callback.
-->
<script lang="ts">
  import PatternLoginOtp from '../../src/lib/ui/pattern-login/pattern-login-otp.svelte';

  let {
    length = 6,
    onverify,
  }: { length?: number; onverify?: (code: string) => void } = $props();

  let code = $state('');
</script>

<PatternLoginOtp {length} bind:value={code} {onverify} />
