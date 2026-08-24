<!--
  Test host for the OTP bridge contract: a named field whose bridge
  value tests read directly.
-->
<script lang="ts">
  import InputOtp from '../../src/lib/ui/input-otp/input-otp.svelte';

  let { name = 'otp', length = 3 }: { name?: string; length?: number } = $props();
</script>

<InputOtp {name} {length} label="enter code" />
