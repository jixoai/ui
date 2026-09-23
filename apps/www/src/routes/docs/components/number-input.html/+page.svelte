<!--
  number-input — canonical page, MDN archetype rebuild
  (docs-eight-axes-mdn task 32, tier 2).
  Skeleton: hero (h1 ×1) / install / overview / live demo / types /
  usage / theming / api / axes / accessibility / see-also — toc == DOM,
  chrome (install, see-also) out of the toc, api → axes → accessibility
  LAST. Every axes-row claim is measured on the served DOM (probe,
  task 32) or negative-grepped over ui/number-input/.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import NumberInput from '$lib/ui/number-input/number-input.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayHelp } from '$lib/playground';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'number-input')?.summary;
  if (!heroSummary) throw new Error('catalog entry "number-input" is missing — registry.json meta drift');

  // Same-source law: the canvas drawer shows the exact registry copy this
  // site runs — one ?raw import (audit P1-A2).
  import numberInputSource from '$lib/ui/number-input/number-input.svelte?raw';

  const numberUsage = `<!-- click steps once; hold accelerates (300ms → 100ms/step);
     typing commits on change and clamps into [min, max] -->
<NumberInput label="workers" bind:value={workers} min={1} max={16} />

<!-- decimal steps snap to the step's precision -->
<NumberInput label="timeout (s)" bind:value={timeout} min={0.5} max={5} step={0.5} />`;

  // ---- the universal props demo ------------------------------------------
  const universalUsage = `<NumberInput label="floor rung" density="2xs" />
<NumberInput label="dark field" theme="dark" />`;

  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/number-input-universal.svelte', content: universalUsage },
  ];

  const numberInputFiles: TreeFile[] = [
    { name: 'registry/files/ui/number-input/number-input.svelte', content: numberInputSource },
    { name: 'src/lib/ui/number-input-usage.svelte', content: numberUsage, kind: 'usage' },
  ];

  // ---- demo state -------------------------------------------------------------
  let workers = $state(4);
  let timeout = $state(1.5);
  let workersRtl = $state(2);

  // ---- canvas playground --------------------------------------------------------
  const canvasInitial = { workers: 4 };
  let canvasWorkers = $state(canvasInitial.workers);

  function resetNumberCanvas(): void {
    canvasWorkers = canvasInitial.workers;
  }

  const numberUsageLive = $derived(`<NumberInput
  label="workers"
  min={1}
  max={16}
  bind:value
/>`);

  // stable named resolver: lazy read evaluated inside the canvas's
  // $derived — never a value snapshot
  const resolveNumberUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? numberUsageLive : file.content;

  // ---- hand-authored mirrors for the drawers ---------------------------------
  const close = '</' + 'script>';

  const numberInputRtlDemo = `<script lang="ts">
  import NumberInput from '@ui/number-input.svelte';

let workersRtl = $state(2);
${close}

<div class="grid gap-5 min-[760px]:grid-cols-2">
  <div dir="rtl" class="flex flex-col gap-4 border-border border p-4">
    <NumberInput label="workers (rtl)" bind:value={workersRtl} min={1} max={16} />
    <span class="text-muted-foreground text-[12px]">
      dir="rtl" on the wrapper — the [- +] order flips without a physical property in
      sight
    </span>
  </div>
  <div class="flex flex-col justify-center gap-2 text-muted-foreground text-[13px] leading-6">
    <p class="text-pretty">
      Nothing in the component branches on direction: the stepper is a flex row in DOM
      order (minus, input, plus). The writing mode does the rest.
    </p>
  </div>
</div>`;

  const numberInputRtlFiles: TreeFile[] = [
    { name: 'number-input-rtl-demo.svelte', content: numberInputRtlDemo, kind: 'usage' },
  ];

  const numberInputTypesDemo = `<script lang="ts">
  import NumberInput from '@ui/number-input.svelte';
${close}

<div class="grid gap-4 sm:grid-cols-2">
  <div class="border border-border p-4"><NumberInput label="workers" value={4} min={1} max={16} /></div>
  <div class="border border-border p-4"><NumberInput label="timeout (s)" value={1.5} min={0.5} max={5} step={0.5} /></div>
  <div class="border border-border p-4"><NumberInput label="error" value={7} min={1} max={4} error="max 4 workers per pod" /></div>
  <div class="border border-border p-4"><NumberInput label="disabled" value={3} min={1} max={8} disabled /></div>
</div>`;

  const numberInputTypesFiles: TreeFile[] = [
    { name: 'number-input-types-demo.svelte', content: numberInputTypesDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law)
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ── the measured per-axis table (task 32) — every cell measured on the
  // served DOM or negative-grepped over ui/number-input/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "CONSUMED — the WHOLE composite is the ladder: shell min-height, the steppers' width AND height (full-hit squares — measured 40×40px at the default rung, 24×24px at 2xs) and the voice (--jx-text 13px, 10px at 2xs) all ride the kernel channels. Ambient (the field's data-density attr renders null, measured) the channels cascade from the ancestor [data-density] scope; an explicit lane stamps the rung attr on the field root and the global scope selector re-scopes in place (measured data-density=2xs → 24px, restored 40px on removal). THE FLOOR: the 2xs rung lands the steppers at exactly 24px — the WCAG 2.5.8 target-size minimum. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY, §1 COLLISION GUARDED — the axis never reaches the native element as a size attribute (stripped from the rest spread; the §1 native collision rule) and the family has ZERO readers of --jx-size-effective (grep receipt): the field's voices are the density kernel's px channels. The §11 stamp moves the field root's font-size only. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "OWN SQUARE, AXIS UNREAD — the segmented-control row is AUTHORED corner-square (borderRadius: none in the shell atoms; measured 0px at the ambient lane) — the square row is the family's identity. Zero shape-channel readers (grep receipt). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "OWN SQUARE, AXIS UNREAD — same authored corner (measured borderRadius 0px); zero radius-channel readers (grep receipt). An explicit lane stamps the carriers for composed descendants only. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY, §1 COLLISION GUARDED — the hue axis never reaches the native element (§1) and the family paints the neutral surface + ink voices with zero color-channel readers (grep receipt). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE SPLIT VOICE (form-family law, measured per element) — explicit dark rides the .dark class bridge on the field root. RE-DERIVING legacy chains: the well shadow (--shadow-well, black ink → white ink), the focus ring (--ring → the drifted dark primary) and the stepper hover (--muted 0.9551 → 0.2178) all flip. FROZEN :root atom snapshots (stylex defineVars, no tokenScope stamp): the shell background stayed oklch(1 0 0) while --background flipped to oklch(0 0 0); the shell border and cell ink likewise. system/auto = tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'OWN WELL, AXIS UNREAD — the shell carries the control-well inset (--shadow-well, the fillable-composite F-1 ruling: hover deepens to --shadow-well-hover, intensity not tier); --jx-elevation-effective has zero readers (grep receipt). Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SHEET CONSTANTS + A JS CLOCK, AXIS UNREAD — the pose transitions ride --motion-150/--motion-ease-out with the prefers-reduced-motion kill; --jx-motion-effective has zero readers (grep receipt). The hold accelerator is a JS clock, measured receipt: first step ON pointerdown, plateau through the 300ms delay, then 100ms/step steady-state (steps at ~420/700/1000ms in the probe), and a window-level pointerup ends the run from anywhere. Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive density — a string lane takes both
  // generics; md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'large' }, 'small');

  const queryUsage = `<script lang="ts">
  import NumberInput from '@ui/number-input.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (small) applies; at 48rem+ the md case (large)
     wins — 32px steppers become 48px, the whole kernel ladder re-rungs -->
<NumberInput label="responsive" density={query({ md: 'large' }, 'small')} />`;

  const queryFiles: TreeFile[] = [
    { name: 'number-input-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Number input · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai number-input component: the [- NUM +] stepper — click steps once and clamps into [min, max], hold accelerates 300ms → 100ms/step, typing commits on change. A segmented control, not a text-field fork; RTL-aware through logical properties only."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="number-input — the [- NUM +] stepper"
      summary={heroSummary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">click / hold / type</span>
        <span class="pill">min / max / step clamp</span>
        <span class="pill">hold acceleration 300ms → 100ms</span>
        <span class="pill">steppers ride the hit floor</span>
        <span class="pill">rtl: logical properties only</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="number-input" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview"
      summary="A segmented control, not a text-field fork: two stepper squares around a borderless native number input, with the hold clock, the commit clamp, and the readonly-not-disabled disabled story."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          The geometry is one bordered row split three ways: two stepper buttons (text glyphs in
          font-nav bold — no icon dependency) around a borderless, centered native
          <code class={cx(rt.inkPrimary)}>&lt;input type="number"&gt;</code>. The parts are
          full-hit squares — measured 40×40px at the default rung — whose own 1px borders form the
          dividers: negative margins overlap the shell border so every line stays exactly 1px. The
          native spinners are hidden (<code class={cx(rt.inkPrimary)}>appearance: textfield</code>,
          the platform stepper law) but native behavior is kept: ↑/↓ step with min/max/step read
          straight off the element attributes. DOM order is minus, input, plus and the row is plain
          flex — <code class={cx(rt.inkPrimary)}>dir="rtl"</code> flips it with zero physical CSS.
        </p>
        <p class={cx(rt.para)}>
          The behavior has three measured clocks: a CLICK steps once and clamps into
          [min, max]; a HOLD steps immediately, plateaus through a 300ms delay, then
          accelerates to one step every 100ms until pointerup ANYWHERE (window-level
          listeners — sliding off the button never strands the interval); TYPING commits on
          change — empty reverts to undefined, committed rewrites normalize ("007" → "7",
          the float-step snap keeps 0.5 steps on 0.5), and out-of-range values clamp. A
          disabled field disables the buttons in lockstep while the input turns
          <code class={cx(rt.inkPrimary)}>readonly, not disabled</code> — it stays focusable and
          selectable so assistive tech can still read the value; the trade is that a readonly
          value still submits, so drop the <code class={cx(rt.inkPrimary)}>name</code> when a
          disabled field must exit FormData. There is NO formatting or locale layer by contract:
          display is String(value), commit is valueAsNumber — locale-raw, the family owns only
          stepping.
        </p>
        <p class={cx(rt.para)}>
          The axes split by role (all measured in the axes table): density is the whole composite
          — the steppers ride the same hit channel as the shell, landing at exactly the WCAG
          2.5.8 24px floor at the 2xs rung; the square corner is authored (shape/radius axes
          unread); the theme is the form-family split voice (well/ring/hover re-derive under
          .dark while the shell atoms stay frozen); elevation is the own control-well (the F-1
          fillable-composite ruling); size and color are supply-only with the §1 native-collision
          guard. The chrome axis is AMBIENT (the control-integration context resolves frame |
          bare — not a component prop): in a bare context the fill and borders fold away for
          in-panel compositions (measured: shell background/border and button borders transparent,
          well none). Kinship:
          <code class={cx(rt.inkPrimary)}>input</code> and the form families (the same field
          scaffold, the same error wiring), <code class={cx(rt.inkPrimary)}>input-otp</code> (the
          digit-exact shell cousin).
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- live demo (toc section) -->
  <div id="live-demo" data-reveal="">
    <ComponentCanvas
      title="number-input"
      description="The [- NUM +] stepper: click steps once and clamps into [min, max], hold accelerates 300ms → 100ms/step, typing commits on change."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/number-input/number-input.svelte"
      files={numberInputFiles}
      stage="center"
      onreset={resetNumberCanvas}
      output={[
        { label: 'value', value: canvasWorkers },
        { label: 'range', value: '1…16' },
      ]}
      resolveFileContent={resolveNumberUsage}
    >
      <div class={cx(rt.flex, rt.wFull, rt.niMaxWXs, rt.col, rt.itemsStart, rt.gap12)}>
        <NumberInput label="workers" bind:value={canvasWorkers} min={1} max={16} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="drive the value">
            <PlayRange bind:value={canvasWorkers} min={1} max={16} />
          </PlayRow>
          <PlayHelp>
            the slider and the stepper share one binding — drag one, watch the other; Tab into the
            input and ↑/↓ step natively.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="types"
      title="Types"
      summary="The integer stepper, the decimal-step stepper, the error state, and the disabled field — plus the RTL posture: geometry from logical properties only."
    >
      <div class={cx(rt.flex, rt.col, rt.gap20)}>
        <ComponentCanvas title="number-input · variants" stage="fill" files={numberInputTypesFiles}>
          <div class={cx(rt.gridSm2)}>
            <div class={cx(rt.panel)}><NumberInput label="workers" value={4} min={1} max={16} /></div>
            <div class={cx(rt.panel)}><NumberInput label="timeout (s)" value={1.5} min={0.5} max={5} step={0.5} /></div>
            <div class={cx(rt.panel)}><NumberInput label="error" value={7} min={1} max={4} error="max 4 workers per pod" /></div>
            <div class={cx(rt.panel)}><NumberInput label="disabled" value={3} min={1} max={8} disabled /></div>
          </div>
        </ComponentCanvas>
        <div class={cx(rt.mt4, rt.tBorder, rt.pt20)}>
          <h3 class={cx(rt.title15)}>RTL — geometry from logical properties</h3>
          <ComponentCanvas class={cx(rt.mt16)} title="number-input · rtl" stage="fill" files={numberInputRtlFiles}>
            <div class={cx(rt.grid760a)}>
              <div dir="rtl" class={cx(rt.flex, rt.col, rt.gap16, rt.frame, rt.p16)}>
                <NumberInput label="workers (rtl)" bind:value={workersRtl} min={1} max={16} />
                <span class={cx(rt.inkMuted, rt.text12)}>
                  dir="rtl" on the wrapper — the [- +] order flips without a physical property in
                  sight
                </span>
              </div>
              <div class={cx(rt.flex, rt.col, rt.justifyCenter, rt.gap8, rt.bodyMuted)}>
                <p class={cx(rt.pretty)}>
                  Nothing in the component branches on direction: the stepper is a flex row in DOM
                  order (minus, input, plus). The writing mode does the rest.
                </p>
              </div>
            </div>
          </ComponentCanvas>
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
      summary="Bind the numeric value; min/max/step drive both the buttons and the native input's own stepping."
    >
      <CodeBlock code={numberUsage} lang="svelte" meta="NumberInput usage" />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard
      family="theming"
      headerRegion="theming"
      eyebrow="theming"
      title="Density and tokens"
      summary="The shell AND the stepper squares share the density hit channel — the full ladder including the 2xs floor rung (24px, the WCAG 2.5.8 minimum) is rendered live below; the shell's well shadow and the focus ring ride the theme's structural tokens."
    >
      <div class={cx(rt.col24)}>
        <DensityDemo scopes={['2xs', 'xs', 'sm', 'default', 'lg']}>
          <NumberInput label="density sample" value={4} min={1} max={16} />
        </DensityDemo>
        <div class={cx(rt.mt20)}>
          <TokenTable
            tokens={[
              { name: '--jx-hit', default: '24 / 28 / 32 / 40 / 48px', source: 'density' },
              { name: '--jx-text', default: '10 / 11 / 12 / 13 / 15px', source: 'density' },
              { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density' },
              { name: '--shadow-well', default: 'inset 1px 1px 0px hsl(0 0% 0% / 0.12)', source: 'structural' },
              { name: '--ring', default: 'var(--primary)', source: 'structural' },
              { name: '--motion-150', default: '150ms', source: 'structural' },
            ]}
          />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="The generated meta carries 22 entries (21 named props + the synthesized rest); the hand table serves the 8 consumer rows — density’s row text is the family’s ambient-scope vocabulary. The universal fold serves the eight axis rows; everything else (name, placeholder, autocomplete…) rides through restProps onto the native input."
    >
      <PropsTable
        universal
          props={[
          { name: 'value', type: 'number', default: '—', description: 'Committed quantity; undefined renders empty.', bindable: true },
          { name: 'min', type: 'number', default: '—', description: 'Lower bound; stepping and the change-commit clamp into it.' },
          { name: 'max', type: 'number', default: '—', description: 'Upper bound; stepping and the change-commit clamp into it.' },
          { name: 'step', type: 'number', default: '1', description: 'Step increment; also the native input\u2019s step attribute. Decimal steps snap to the step\u2019s precision (0.5 steps land on 0.5).' },
          { name: 'label', type: 'string', default: '—', description: 'Field label rendered as label[for] above the control.' },
          { name: 'error', type: 'string', default: '—', description: 'Error text: sets aria-invalid=true on the input and wires aria-describedby to the "! message" line (announced via the described-by relation, not the visible text alone).' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the buttons in lockstep; the input turns readonly, not disabled — focusable and readable for AT. A readonly value still submits: drop the name when it must exit FormData.' },
          { name: 'density', type: "'2xs' | 'xs' | 'sm' | 'default' | 'lg'", default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows. The channels it drives are measured in the axes table (40×40px steppers at default, 24×24px at the 2xs floor).' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on number-input"
      summary="Density is the one consumed ladder — and the composite makes it visible: the stepper squares ride the same hit channel as the shell, from the 48px lg rung down to the 24px 2xs floor (the WCAG 2.5.8 minimum). The square corner is authored (shape/radius unread); the theme is the form-family split voice (well/ring/hover re-derive, shell atoms frozen); elevation is the own control-well; size and color supply with the §1 native-collision guard; motion rides the sheet constants plus the measured hold clock."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the density ladder (40×40px steppers at default; 24×24px + 10px voice at the
          2xs stamp, restored on removal), the hold clock (immediate step → 300ms plateau →
          100ms/step: values 4→5→7→10→13 at ~80/420/700/1000ms in the probe), the commit clamp
          ("007" → 7, 99 → 16 under max=16, empty → undefined), the theme split (--background
          flipped to oklch(0 0 0) while the shell stayed oklch(1 0 0); --shadow-well/--ring/--muted
          all flipped) and the bare-chrome strip were measured on this page's served DOM (probe,
          task 32); the unread/supply-only rows carry grep receipts over ui/number-input/. The
          error state's shell renders the dashed DESTRUCTIVE border through the family's unlayered
          attribute carve-out (border-style dashed + --jx-destructive — the atom-vs-atom cascade
          kill, fixed family-side after task 32 flagged it; re-measured dashed here), and the
          error WIRING — aria-invalid + described-by — is fully live. The query() seat below rides
          the md viewport key (48rem) on the consumed density lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="number-input · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <NumberInput label="responsive" density={responsiveDensity} min={0} max={10} value={3} />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (small — 32px steppers, 12px voice)
                applies; at 48rem and wider the md case wins (large — 48px steppers, 15px voice).
                The string lane takes both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="number-input · universal props" stage="fill" files={universalFiles}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}><NumberInput label="floor rung (2xs)" value={3} min={1} max={8} density="2xs" /></div>
              <div class={cx(rt.panel)}><NumberInput label="large" value={3} min={1} max={8} density="large" /></div>
              <div class={cx(rt.panel)}><NumberInput label="dark field" value={3} min={1} max={8} theme="dark" /></div>
              <div class={cx(rt.panel)}><NumberInput label="dense" value={3} min={1} max={8} density="large" /></div>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The inner control is a real type=number input (implicit spinbutton semantics); the stepper squares ride the hit-channel floor; disabled keeps the value readable for assistive tech; the error is announced through the described-by relation."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus to the centered number input (the field\u2019s single stop)' },
          { key: '↑ / ↓', action: 'Steps by the step increment, clamped into [min, max] — native input behavior, kept' },
          { key: 'Enter / blur', action: 'Commits typed text; empty reverts to undefined, values clamp into range' },
          { key: 'hold − / +', action: 'Steps once on press, accelerates after 300ms to one step every 100ms; releasing ANYWHERE ends the run (window-level pointerup)' },
        ]}
        aria={[
          { name: 'spinbutton (implicit)', value: 'input[type=number]', description: 'The native element carries the spinbutton role with value/min/max semantics — no ARIA needed' },
          { name: 'aria-label', value: '"decrease" / "increase"', description: 'On the two stepper buttons (type="button"). Hardcoded English — a localization gap to know when translating' },
          { name: 'aria-invalid', value: "'true'", description: 'On the input when the error prop is provided' },
          { name: 'aria-describedby', value: '{id}-error', description: 'Points at the "! message" validation line — the error is announced through the relation (the "!" mark is aria-hidden)' },
          { name: 'readonly (disabled)', value: 'attribute', description: 'Disabled turns the input readonly, not disabled — the value stays focusable and readable' },
        ]}
      />
    </SectionCard>
  </div>

    <!-- see-also (chrome — out of the toc) -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="number-input" />
    </div>
  </div>
</div>
