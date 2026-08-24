<!-- input-otp blueprint: six slots, three filled — and a complete code in
     its dashed error state below. -->
<script lang="ts">
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';

  let code = $state('482');
  let backup = $state('904177');
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-6 p-10">
  <InputOtp label="one-time code" bind:value={code} />
  <InputOtp label="backup code" bind:value={backup} error="code expired — request a new one" />
</div>
