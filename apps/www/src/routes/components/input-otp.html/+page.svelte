<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import InputOtp from '$lib/ui/input-otp.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inputOtpSource from '$lib/ui/input-otp.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.
  const tocSections = [
    { id: 'otp-demo', label: 'live demo' },
    { id: 'otp-base', label: 'usage' },
  ];

  // Playground protocol: the page owns the snapshot + reset; the echo footer
  // replaces the hand-written "value" caption; the usage file tracks live.
  const canvasInitial = { code: '' };
  let code = $state(canvasInitial.code);
  function resetCanvas(): void {
    code = canvasInitial.code;
  }
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<InputOtp name="otp" length={6} label="one-time code" value=${q(code)} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

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

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
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

  <div id="otp-demo" data-region="otp-demo" data-family="otp-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="input-otp"
      description="Type, or paste a whole code into the first slot — it distributes. The joined value surfaces in the echo footer; the frame only turns brand-colored when COMPLETE."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-otp.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'value', value: code || '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex flex-col items-start gap-4">
        <InputOtp name="demo-otp" length={6} label="one-time code" bind:value={code} />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <p class="jx-play-help">
            numeric=true (default) filters non-digits; numeric={false} accepts letters for alpha
            codes. The slot/value sync is untracked on the slots side — typing can never be
            "re-synced" against a stale value.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="otp-base" data-reveal="" use:reveal>
    <SectionCard
      family="otp-base"
      headerRegion="otp-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
