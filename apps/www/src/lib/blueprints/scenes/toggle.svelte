<!-- toggle blueprint: the inline-end switch — an on/off mix across the
     size ramp, real bind:checked state. -->
<script lang="ts">
  import Toggle from '$lib/ui/toggle.svelte';

  let notifications = $state(true);
  let digest = $state(false);
  let telemetry = $state(true);
</script>

<div class="flex h-full w-full flex-col items-start justify-center p-10">
  <div class="flex w-full max-w-[360px] flex-col gap-5">
    <Toggle label="notifications" bind:checked={notifications} />
    <Toggle label="weekly digest" bind:checked={digest} />
    <Toggle label="telemetry" size="sm" bind:checked={telemetry} />
  </div>
</div>
