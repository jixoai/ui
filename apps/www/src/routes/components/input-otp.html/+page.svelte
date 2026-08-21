<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import InputOtp from '$lib/ui/input-otp.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inputOtpSource from '$lib/ui/input-otp.svelte?raw';

  let code = $state('');

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import InputOtp from '@ui/input-otp.svelte';
${close}

<InputOtp name="otp" length={6} label="one-time code" bind:value />`;

  const canvasUsage = `<InputOtp name="otp" length={6} label="one-time code" bind:value />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/input-otp.svelte', content: inputOtpSource },
    { name: 'src/lib/ui/input-otp-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Input OTP · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai input OTP: N single-character slots with auto-advance, backstep, paste distribution — submitting ONE joined value through the ElementInternals bridge."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ElementInternals"
      title="input-otp — six slots, one form value"
      summary="Single-character inputs with the mechanics a raw stack lacks: typing overflows into the next slots, backspace steps back, paste distributes, focus entering from outside lands on the first empty slot. The group is not a single native control — exactly the jx-form-field bridge case: the joined code submits as ONE value; a partial code submits empty (never a partial lie)."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">paste distributes</span>
        <span class="pill">backspace steps back</span>
        <span class="pill">one-time-code autocomplete</span>
        <span class="pill">bridge single value</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="input-otp"
      description="Type, or paste a whole code into the first slot — it distributes. The joined value surfaces below; the frame only turns brand-colored when COMPLETE."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-otp.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-col items-start gap-4">
        <InputOtp name="demo-otp" length={6} label="one-time code" bind:value={code} />
        <span class="text-muted-foreground text-[12.5px]">
          value: <code class="text-accent">{code || '—'}</code>
        </span>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          numeric=true (default) filters non-digits; numeric={false} accepts letters for alpha
          codes. The slot/value sync is untracked on the slots side — typing can never be
          "re-synced" against a stale value.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="otp-base" eyebrow="ElementInternals 桥" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>
