<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import InputOtp from '$lib/ui/input-otp/input-otp.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import inputOtpSource from '$lib/ui/input-otp/input-otp.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.

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
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
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

  <div id="otp-demo" data-region="otp-demo" data-family="otp-demo" data-reveal="">
    <ComponentCanvas
      title="input-otp"
      description="Type, or paste a whole code into the first slot — it distributes. The joined value surfaces in the echo footer; the frame only turns brand-colored when COMPLETE."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/input-otp.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[{ label: 'value', value: code || '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex flex-col items-start gap-4">
        <InputOtp name="demo-otp" length={6} label="one-time code" bind:value={code} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            numeric=true (default) filters non-digits; numeric={false} accepts letters for alpha
            codes. The slot/value sync is untracked on the slots side — typing can never be
            "re-synced" against a stale value.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="otp-base" data-reveal="">
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

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="InputOtp variants"
      summary="The default numeric six-slot code, an alpha code (numeric={false}), a shorter code, and the error state."
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-3 border border-border p-4">
          <InputOtp label="numeric (6)" length={6} />
          <span class="text-muted-foreground text-[12px]">digits only · inputmode numeric</span>
        </div>
        <div class="flex flex-col gap-3 border border-border p-4">
          <InputOtp label="alpha (numeric={false})" length={6} numeric={false} />
          <span class="text-muted-foreground text-[12px]">letters accepted · inputmode text</span>
        </div>
        <div class="flex flex-col gap-3 border border-border p-4">
          <InputOtp label="short code (4)" length={4} />
          <span class="text-muted-foreground text-[12px]">length clamps to 1…12</span>
        </div>
        <div class="flex flex-col gap-3 border border-border p-4">
          <InputOtp label="error" length={6} value="123" error="code expired — resend" />
          <span class="text-muted-foreground text-[12px]">dashed destructive border on every slot</span>
        </div>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Name the field; the joined code submits as ONE value — a partial code submits empty, never a partial lie."
    >
      <CodeBlock code={usage} lang="svelte" meta="InputOtp usage" />
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The slots are real inputs in a labelled group; the typing mechanics (advance, backstep, paste distribution) are the only layer on top."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Focus entering from outside lands on the first EMPTY slot' },
          { key: 'any digit / char', action: 'Fills the slot and advances; overflow distributes into the next slots' },
          { key: 'Backspace', action: 'On an empty slot, steps back and clears the previous one' },
          { key: '← / →', action: 'Walks between slots, selecting the landed value' },
          { key: 'paste', action: 'A whole code pasted into any slot distributes across the set' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'On the container, labelled by the label prop (aria-label fallback: "one-time code")' },
          { name: 'autocomplete', value: '"one-time-code"', description: 'On the first slot — the platform offers the SMS code' },
          { name: 'inputmode', value: '"numeric" / "text"', description: 'Follows the numeric prop for the right mobile keyboard' },
          { name: 'aria-invalid', value: "'true'", description: 'On every slot when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line' },
        ]}
      />
    </SectionCard>
  </div>
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="Slot size and rhythm derive from the density scope; resize the scope and the whole code field follows."
    >
      <div class="flex flex-col gap-6">
        <DensityDemo>
          <InputOtp label="density sample" length={6} />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: 'slot size', default: 'max(var(--jx-hit), calc(var(--jx-line) * 2))', source: 'component' },
            { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' },
            { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' },
            { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' },
          ]}
        />
      </div>
    </SectionCard>
  </div>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Props spread onto every slot input; form submission (joined value, required, reset) rides the jx-form-field bridge."
    >
      <PropsTable
        props={[
          { name: 'name', type: 'string', default: '—', description: 'Form field name — the joined code submits under it.' },
          { name: 'length', type: 'number', default: '6', description: 'Slot count, clamped to 1…12.' },
          { name: 'value', type: 'string', default: "''", description: 'The joined code; bind:value for controlled use.', bindable: true },
          { name: 'numeric', type: 'boolean', default: 'true', description: 'Digits-only slots; false accepts letters for alpha codes.' },
          { name: 'label', type: 'string', default: '—', description: 'Reads above the slots; also the group aria-label.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: dashes every slot border (destructive) + the message line.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims and freezes the whole slot set.' },
          { name: 'density', type: "'xs' | 'sm' | 'default' | 'lg'", default: 'inherited', description: 'Overrides the inherited density scope.' },
        ]}
      />
    </SectionCard>
  </div>
</div>
