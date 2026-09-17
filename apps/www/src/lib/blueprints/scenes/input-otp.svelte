<!-- input-otp blueprint: six slots, three filled — and a complete code in
     its dashed error state below. -->
<script lang="ts">
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

  let code = $state('482');
  let backup = $state('904177');

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpA.inputOtpStage)}>
  <InputOtp label="one-time code" bind:value={code} />
  <InputOtp label="backup code" bind:value={backup} error="code expired — request a new one" />
</div>
