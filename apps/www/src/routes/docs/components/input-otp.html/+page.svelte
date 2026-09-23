<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
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
  import { rt } from '$lib/surface/routes.stylex';

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

  // ---- the universal props demo (explicit-props W3-A) --------------------
  const universalUsage = `<InputOtp label="px number" size={14} density="small" />
<InputOtp label="named steps" size="large" radius="medium" />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/input-otp-universal.svelte', content: universalUsage },
  ];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/input-otp.svelte', content: inputOtpSource },
    { name: 'src/lib/ui/input-otp-usage.svelte', content: canvasUsage },
  ];

  // canvas-everywhere sweep (2026-09-08): hand-authored mirror of the
  // variants grid below — the same-source resolveRawCode migration of
  // this string is the recorded follow-up
  const inputOtpTypesDemo = `<script lang="ts">
  import InputOtp from '@ui/input-otp.svelte';
${close}

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
</div>`;

  const typesFiles: TreeFile[] = [
    { name: 'input-otp-types-demo.svelte', content: inputOtpTypesDemo, kind: 'usage' },
  ];
  // ---- the measured per-axis table (task 29) — every cell measured or
  // negative-grepped over ui/input-otp/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the slot geometry IS the density contract: the slot box rides max(--jx-hit, --jx-line × 2) — measured 32 / 36 / 40 / 48px across xs/sm/default/lg (the line×2 leg WINS at xs/sm, where 2 lines outgrow the hit); the cell voice rides --jx-text 11/12/13/15px; the slot rhythm --jx-gap 8/8/12/16px; the label --jx-text-secondary. The ambient attr stays absent under DensityDemo scope boxes (the two-channel finding — tokens cascade from the ancestor scope). Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "THE §11 ECHO — the stamp lands verbatim (measured root inline: --jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem); computed 14px / 18px at the demo lanes) and the slots follow NOTHING of it: the slot voice is --jx-text (density-governed) and the slot box is the hit/line lane. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps the carriers; zero readers in the family css (grep receipt). The slot corner is the family radius law: the typed --jx-radius token. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (grep receipt). The slot corner rides the typed --jx-radius token directly — the axis carrier finds no reader. Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-color-effective; zero readers (grep receipt). The voices are typed tokens: slot ink/paper --jx-foreground/--jx-background, caret --jx-primary, complete border --jx-primary, invalid --jx-destructive. Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE BRIDGE + A TWO-VOICE SPLIT — the .dark class lands on the family root and the voices answer by emission form. TYPED POLE (frozen at :root): the slot frame and ground — measured inside a scoped .dark the border stays oklch(0 0 0) and the ground oklch(1 0 0): a code field keeps its light paper in a dark island. RAW MACHINES (flip): the focus ring var(--ring) (measured flipping to the dark ring oklch(0.7044 0.1872 …)) and the complete-state focus ink var(--primary). The code itself is user data — the value never re-themes. system/auto ride tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-elevation-effective; zero readers (grep receipt: zero shadow declarations — a flat code field by design). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — stamps --jx-motion-effective; zero readers (grep receipt: zero transition declarations in the family css and atoms — the complete-state border swap is instant, no ring animation to kill). Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import InputOtp from '@ui/input-otp.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case (18px)
     wins — the §11 echo the root stamps (the slots follow the density
     kernels, not this stamp) -->
<InputOtp label="responsive code" length={6} size={query({ md: 18 }, 14)} />`;

  const queryFiles: TreeFile[] = [
    { name: 'input-otp-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // ── the API table's EXTRA lane (task 29): the density row carries the
  // family's ambient-scope contract — an axis NAME, so the universal fold
  // would hide it; docs.extra (same object reference) exempts it. ──
  const apiDensityRow = {
    name: 'density',
    type: "'2xs' | 'xs' | 'sm' | 'default' | 'lg'",
    default: 'ambient scope',
    description:
      'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows. These are the rung ids you pass; the axes table carries the alias ladder they resolve to, with the measured geometry (slot box 32/36/40/48px).',
  };

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Input OTP · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai input OTP: N single-character slots with auto-advance, backstep, paste distribution — submitting ONE joined value through the ElementInternals bridge."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ElementInternals"
      title="input-otp — six slots, one form value"
      summary="Single-character inputs with the mechanics a raw stack lacks: typing overflows into the next slots, backspace steps back, paste distributes, focus entering from outside lands on the first empty slot. The group is not a single native control — exactly the jx-form-field bridge case: the joined code submits as ONE value; a partial code submits empty (never a partial lie)."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">paste distributes</span>
        <span class="pill">backspace steps back</span>
        <span class="pill">one-time-code autocomplete</span>
        <span class="pill">bridge single value</span>
      </div>
    </SectionCard>
  </div>

    <!-- ② install (the archetype's install anchor) -->
    <div id="install" data-reveal="">
      <DocsInstall name="input-otp" />
    </div>

    <!-- ③ overview (docs-eight-axes-mdn task 29, tier 2) -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="N real inputs with the mechanics a raw stack lacks — and the ElementInternals bridge that makes them submit as ONE honest value. The per-slot model is the choice: real inputs are what one-time-code autofill targets, and backstep, arrow keys, and paste distribution come free from native input behavior — a single-hidden-input alternative would have to rebuild all three."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The a11y model is PER-SLOT: the slots are real
            <code class={cx(rt.inkPrimary)}>&lt;input&gt;</code>s inside a labelled
            <code class={cx(rt.inkPrimary)}>role="group"</code> — no single hidden master input, no
            synthesized aria. The platform affordances stay native: the first slot carries
            <code class={cx(rt.inkPrimary)}>autocomplete="one-time-code"</code> (the SMS code lands on
            it), <code class={cx(rt.inkPrimary)}>inputmode</code> follows the
            <code class={cx(rt.inkPrimary)}>numeric</code> prop for the right mobile keyboard, and
            <code class={cx(rt.inkPrimary)}>aria-invalid</code> +
            <code class={cx(rt.inkPrimary)}>aria-describedby</code> wire the error line. The mechanics
            layered on top are focus management only: typing overflows into the next slots, a
            pasted code distributes from the slot it landed in, backspace on an empty slot steps
            back, and focus entering the set from outside lands on the first EMPTY slot
            (measured live in the accessibility table).
          </p>
          <p class={cx(rt.para)}>
            Form semantics ride the jx-form-field bridge (the group is not one native control):
            the joined code submits as ONE value under
            <code class={cx(rt.inkPrimary)}>name</code> — a 6-slot OTP submits
            <code class={cx(rt.inkPrimary)}>"123456"</code>, never six fragments — and an INCOMPLETE
            code submits the empty string (never a partial lie).
            <code class={cx(rt.inkPrimary)}>required</code> and form reset flow through the bridge
            like every jixoai form control. The two-way slot/value sync is untracked on the slots
            side: freshly typed characters can never be re-synced against a stale value.
          </p>
          <p class={cx(rt.para)}>
            The paint is typed tokens end to end — slot frame, ground, ink, caret, the
            filled/complete/invalid borders — so a scoped .dark moves nothing on the surface
            (typed-frozen; measured in the axes table) while the FOCUS ring and the
            complete-state focus ink are the raw machines that do flip. Density is the one live
            ladder: the slot box rides max(--jx-hit, --jx-line × 2) — measured 32/36/40/48px.
            Kinship: <code class={cx(rt.inkPrimary)}>input</code> (the shell/label/error law),
            <code class={cx(rt.inkPrimary)}>number-input</code> (the stepped-entry sibling).
          </p>
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
      <div class={cx(rt.col16, rt.itemsStart)}>
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

  
  </div>
</div>

<!-- Material3 standard sections (2026-08-26): types / usage / a11y /
     theming / api appended after the demo sections, same wrapper law as
     checkbox.html. -->
<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="InputOtp variants"
      summary="The default numeric six-slot code, an alpha code (numeric={false}), a shorter code, and the error state."
    >
      <ComponentCanvas title="input-otp · variants" stage="fill" files={typesFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.col12, rt.panel)}>
          <InputOtp label="numeric (6)" length={6} />
          <span class={cx(rt.inkMuted, rt.text12)}>digits only · inputmode numeric</span>
        </div>
        <div class={cx(rt.col12, rt.panel)}>
          <InputOtp label="alpha (numeric={false})" length={6} numeric={false} />
          <span class={cx(rt.inkMuted, rt.text12)}>letters accepted · inputmode text</span>
        </div>
        <div class={cx(rt.col12, rt.panel)}>
          <InputOtp label="short code (4)" length={4} />
          <span class={cx(rt.inkMuted, rt.text12)}>length clamps to 1…12</span>
        </div>
        <div class={cx(rt.col12, rt.panel)}>
          <InputOtp label="error" length={6} value="123" error="code expired — resend" />
          <span class={cx(rt.inkMuted, rt.text12)}>dashed destructive border on every slot</span>
        </div>
        </div>
      </ComponentCanvas>
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
  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="Slot size and rhythm derive from the density scope; resize the scope and the whole code field follows."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo>
          <InputOtp label="density sample" length={6} />
        </DensityDemo>
        <TokenTable
          tokens={[
            { name: 'slot size', default: 'max(var(--jx-hit), calc(var(--jx-line) * 2))', source: 'component' },
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' },
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
      summary="Props spread onto every slot input; form submission (joined value, required, reset) rides the jx-form-field bridge. The density row rides the EXTRA lane (reference identity): it carries an axis NAME with a family-specific ambient-scope contract, so the universal fold would hide it — the carriers-bijection ruling, task 29."
    >
      <PropsTable
        universal
        docs={{ extra: [apiDensityRow] }}
          props={[
          { name: 'name', type: 'string', default: '—', description: 'Form field name — the joined code submits under it.' },
          { name: 'length', type: 'number', default: '6', description: 'Slot count, clamped to 1…12.' },
          { name: 'value', type: 'string', default: "''", description: 'The joined code; bind:value for controlled use.', bindable: true },
          { name: 'numeric', type: 'boolean', default: 'true', description: 'Digits-only slots; false accepts letters for alpha codes.' },
          { name: 'label', type: 'string', default: '—', description: 'Reads above the slots; also the group aria-label.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: dashes every slot border (destructive) + the message line.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims and freezes the whole slot set.' },
          apiDensityRow,
        ]}
      />
    </SectionCard>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on input-otp"
      summary="SEVEN of the eight axes stamp-and-supply or go unused — density is the one CONSUMED ladder (the slot geometry IS the contract: measured 32/36/40/48px boxes, 11/12/13/15px voices, 8/8/12/16px rhythm). Size is the §11 echo with the density-governed slot voice as its nothing-follows proof (the pre-29 'CONSUMES size and color' text is falsified here). The theme split is two-voice: typed slot frames frozen under scoped .dark, raw focus machines that flip. The native input carries NO size-like attribute collision (the §1 native-wrapper rule)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density ladder, the size echo, and the typed-frozen
          split were measured on this page's served DOM (probe, task 29); the
          supply-only rows carry grep receipts over ui/input-otp/. The universal
          demo folds in below, with a query() seat: the size lane rides the md
          viewport key (48rem).
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="input-otp · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <InputOtp label="responsive code" length={6} size={responsiveSize} name="univ-otp-query" />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the
                root stamp reads 14px; at 48rem and wider the md case wins —
                18px. The number lane goes bare (results infer); string lanes
                take both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
      <ComponentCanvas title="input-otp · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><InputOtp label="size 14 · density small" size={14} density="small" name="univ-otp-px" /></div>
        <div class={cx(rt.panel)}><InputOtp label="size large · radius medium" size="large" density="large" radius="medium" name="univ-otp-named" /></div>
        </div>
      </ComponentCanvas>
      </div>
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
    <!-- see-also -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="input-otp" />
    </div>
  </div>
</div>
