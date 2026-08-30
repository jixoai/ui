<!--
  radio — canonical page (docs-restructure P0, 2026-08-25).
  Split out of the form family page: the radio block of the pure-CSS
  selectors section. The form.html route remains as the family hub.
-->
<script lang="ts">
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Radio from '$lib/ui/radio/radio.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlaySegmented, PlayHelp } from '$lib/playground';

  // Same-source law: the canvas drawer shows the exact registry copy this site runs.
  import radioSource from '$lib/ui/radio/radio.svelte?raw';

  // hero summary derives from the registry catalog — no hand-maintained copy
  const heroSummary = CATALOG.find((entry) => entry.name === 'radio')?.summary;
  if (!heroSummary) throw new Error('catalog entry "radio" is missing — registry.json meta drift');

  // ToC outline: the demo section. The engine pairs these ids with the
  // SectionCard data-family extents + header data-region leaves.

  const usage = `<!-- same-name radios keep native arrow-key walking -->
<Radio label="node" name="runtime" checked />
<Radio label="bun" name="runtime" />
<Radio label="deno" name="runtime" />

<!-- labelSide="left" flips the label to the inline-start -->
<Radio label="pro" name="plan" labelSide="left" />`;

  // ---- canvas playground (site-polish F10: the standard opening) -----------
  const canvasInitial = {
    group: 'bun',
    disabled: false,
    labelSide: 'right' as 'left' | 'right',
  };
  let canvasGroup = $state(canvasInitial.group);
  let canvasDisabled = $state(canvasInitial.disabled);
  let canvasLabelSide = $state(canvasInitial.labelSide);

  function resetRadioCanvas(): void {
    canvasGroup = canvasInitial.group;
    canvasDisabled = canvasInitial.disabled;
    canvasLabelSide = canvasInitial.labelSide;
  }

  const canvasUsage = $derived(`<Radio
  label="node"
  name="runtime"
  bind:group={picked}${canvasDisabled ? '\n  disabled' : ''}
/>
<Radio label="bun" name="runtime" bind:group={picked} />
<Radio label="deno" name="runtime" bind:group={picked} />
<!-- picked = '${canvasGroup}' -->`);

  // stable named resolver: the usage file tracks live playground state
  const resolveRadioUsage =
    (file: TreeFile): string =>
      file.name.endsWith('usage.svelte') ? canvasUsage : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/radio/radio.svelte', content: radioSource },
    { name: 'src/lib/ui/radio-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Radio · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai radio component: pure-CSS selector — appearance-none + 16px circle, :checked turns the border primary and pops an 8px dot from scale(0) to scale(1). Same-name groups keep native arrow-key walking; error wiring identical to checkbox."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail (2026-08-20): aside precedes main content in the DOM —
       desktop sticky right column, mobile the glass single-row bar pinned
       under the scaffold header (height 0, see toc.css); the content
       column reserves the rail clearance with its mobile top padding -->

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Entry"
      title="radio — 16px circle, scaled dot"
      summary={heroSummary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS · zero icon deps</span>
        <span class="pill">:checked dot pop</span>
        <span class="pill">native arrow-key walking</span>
        <span class="pill">labelSide left / right</span>
        <span class="pill">label[for] + aria wiring</span>
      </div>
    </SectionCard>
  </div>

  <!-- component canvas (site-polish F10): the standard opening — live demo + PLAYGROUND -->
  <div data-reveal="">
    <ComponentCanvas
      title="radio"
      description="appearance-none circle with a scaled dot — the native input keeps form participation, keyboard toggling, and same-name arrow-key walking; the glyph is pure CSS."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/radio/radio.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetRadioCanvas}
      output={[{ label: 'group', value: canvasGroup }]}
      resolveFileContent={resolveRadioUsage}
    >
      <div class="flex w-full max-w-xs flex-col items-start gap-3">
        <Radio label="node" name="canvas-radio" value="node" bind:group={canvasGroup} labelSide={canvasLabelSide} disabled={canvasDisabled} />
        <Radio label="bun" name="canvas-radio" value="bun" bind:group={canvasGroup} labelSide={canvasLabelSide} disabled={canvasDisabled} />
        <Radio label="deno" name="canvas-radio" value="deno" bind:group={canvasGroup} labelSide={canvasLabelSide} disabled={canvasDisabled} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="labelSide">
            <PlaySegmented
              bind:value={canvasLabelSide}
              options={[
                { value: 'left', label: 'left' },
                { value: 'right', label: 'right' },
              ]}
            />
          </PlayRow>
          <PlayRow label="disabled">
            <PlayToggle bind:value={canvasDisabled} />
          </PlayRow>
          <PlayHelp>
            the group is the bind channel (bind:group, Svelte's radio law) — arrow keys walk
            the same-name set exactly as the platform walks native radios.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the selectors, redrawn in pure CSS -->
  <div id="demo" data-reveal="">
    <SectionCard
      family="demo"
      headerRegion="demo"
      eyebrow="radio"
      title="The selector, redrawn in pure CSS"
      summary="A control where the paint deserved its own drawing code: the component strips appearance off the native input and draws its glyph with a pseudo-element — a scaled dot. Zero icon fonts, zero SVG, zero dependencies; the native input underneath keeps form participation, keyboard toggling, and :checked state."
    >
      <div class="flex flex-col gap-5">
        <p class="text-muted-foreground text-pretty text-[13px] leading-6">
          :checked turns the border primary and pops an 8px dot from
          <code class="text-accent">scale(0)</code> to
          <code class="text-accent">scale(1)</code> (150ms ease-out). Same-name radios keep
          native arrow-key walking — tab into the group and use the arrows.
        </p>
        <CardGrid min="200px">
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="node" name="demo_rt" checked />
            <Radio label="bun" name="demo_rt" />
            <Radio label="deno" name="demo_rt" />
          </div>
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="label left" name="demo_rt2" labelSide="left" />
            <Radio label="also left" name="demo_rt2" labelSide="left" checked />
          </div>
          <div class="demo-cell flex flex-col items-start gap-2" data-no-subgrid>
            <Radio label="disabled" name="demo_rt3" disabled />
            <Radio label="disabled + checked" name="demo_rt3" checked disabled />
          </div>
        </CardGrid>
        <CodeBlock code={usage} lang="svelte" meta="Radio usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Radio variants" summary="Same-name radios form one native choice set; use label placement and disabled state as needed.">
    <div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><Radio label="selected" name="types-radio" checked /></div><div class="border border-border p-4"><Radio label="label left" name="types-radio-left" labelSide="left" /></div><div class="border border-border p-4"><Radio label="disabled" name="types-radio-disabled" disabled /></div></div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Give every option the same name and bind the selected value when the parent needs it."><CodeBlock code={usage} lang="svelte" meta="Radio usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Native radio grouping supplies arrow-key walking and form semantics; the component adds explicit validation wiring."><A11yTable keys={[{ key: 'Arrow keys', action: 'Move selection within same-name radio group' }, { key: 'Space', action: 'Select the focused radio' }]} aria={[{ name: 'aria-invalid', value: 'true', description: 'Set when error is present' }, { name: 'aria-describedby', value: '{id}-error', description: 'References the validation message' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The ring, dot, and label all consume the shared density scale."><div class="flex flex-col gap-5"><DensityDemo><Radio label="density sample" name="density-radio" /></DensityDemo><TokenTable tokens={[{ name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend native HTML input attributes; these additions define the radio-specific contract."><PropsTable props={[{ name: 'label', type: 'string', default: '—', description: 'Same-row label rendered with label[for].' }, { name: 'group', type: 'string | number', default: '—', description: 'Bindable selected value for the radio channel.', bindable: true }, { name: 'labelSide', type: "'left' | 'right'", default: "'right'", description: 'Places the label before or after the control.' }, { name: 'error', type: 'string', default: '—', description: 'Adds invalid state and an associated message.' }, { name: 'density', type: 'Density', default: 'inherited', description: 'Overrides the inherited density scope.' }]} /></SectionCard></div>
</div>
