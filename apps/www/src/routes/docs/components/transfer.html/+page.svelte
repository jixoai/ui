<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Transfer from '$lib/ui/transfer/transfer.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import transferSource from '$lib/ui/transfer/transfer.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.

  const options = [
    { value: 'a', label: 'alpha' },
    { value: 'b', label: 'beta' },
    { value: 'c', label: 'gamma' },
    { value: 'keep', label: 'keeper' },
  ];

  // Playground protocol: the page owns the snapshot + reset; echo projects
  // the target list; the drawer's usage file tracks it live.
  const canvasInitial = { value: ['keep'] };
  let value = $state(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }
  const usageLive = $derived(`<Transfer {options} value={[${value.map((v) => JSON.stringify(v)).join(', ')}]} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Transfer from '@ui/transfer.svelte';
${close}

const options = [
  { value: 'a', label: 'alpha' },
  { value: 'b', label: 'beta' },
];

<Transfer {options} bind:value />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/transfer.svelte', content: transferSource },
    { name: 'src/lib/ui/transfer-usage.svelte', content: usage },
  ];

  // Material3 usage section — the two-panel bind pattern, verbatim.
  const usageCode = usage;

  // Material3 types section: plain panels vs titled panels + a disabled row.
  const typesPlain = [
    { value: 'html', label: 'html' },
    { value: 'css', label: 'css' },
    { value: 'js', label: 'js' },
  ];
  const typesTitled = [
    { value: 'draft', label: 'draft post', disabled: true },
    { value: 'review', label: 'in review' },
    { value: 'done', label: 'published' },
  ];
  let typesPlainValue = $state<string[]>([]);
  let typesTitledValue = $state<string[]>(['done']);
</script>

<svelte:head>
  <title>Transfer · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai transfer: the two-panel selector — real fieldsets of real checkboxes per side, middle buttons batch-move checked rows, per-panel search filters; value is the target list and selection clears after each move."
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
      eyebrow="registry:ui · antd 裁决"
      title="transfer — two fieldsets and a batch mover"
      summary="The two-panel selector the ruled way: each side is a real fieldset of real checkbox rows — grouping, labeling and toggling all native. The middle buttons batch-move every checked row at once, then the selection clears (checked is a transient moving state, never the value). Per-panel search filters its own list; disabled rows render but never move. value is the TARGET list — what sits on the right is the answer."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">fieldset + checkbox rows</span>
        <span class="pill">batch move · selection clears</span>
        <span class="pill">per-panel search</span>
        <span class="pill">value = target list</span>
      </div>
    </SectionCard>
  </div>

  <div id="transfer-demo" data-region="transfer-demo" data-family="transfer-demo" data-reveal="">
    <ComponentCanvas
      title="transfer"
      description="Check rows on either side, then fire the middle mover — every checked row crosses at once and the selection clears. The echo footer shows the target list."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
      output={[{ label: 'target', value: value.length ? value.join(', ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-2xl">
        <Transfer {options} bind:value />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            checking rows on either side arms the middle mover; a move crosses EVERY checked row at
            once and clears the selection. Search filters per panel; disabled rows render but never
            move.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="transfer-base" data-reveal="">
    <SectionCard
      family="transfer-base"
      headerRegion="transfer-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Transfer variants" summary="Plain source/target panels by default; titled panels rename the fieldsets, and disabled rows render but never move.">
    <div class="grid items-start gap-4 min-[900px]:grid-cols-2">
      <div class="border border-border p-4"><Transfer options={typesPlain} bind:value={typesPlainValue} /></div>
      <div class="border border-border p-4"><Transfer options={typesTitled} bind:value={typesTitledValue} sourceTitle="available" targetTitle="chosen" /></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="value is the target list — what sits on the right is the answer; checked is a transient moving state, never the value."><CodeBlock code={usageCode} lang="svelte" meta="Transfer usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Grouping, labeling and toggling are all native — each panel is a real fieldset of real checkbox rows."><A11yTable keys={[{ key: 'Tab', action: 'Walk the fieldsets, checkbox rows, search lanes and mover buttons' }, { key: 'Space', action: 'Toggle the focused checkbox row (native input)' }]} aria={[{ name: 'fieldset / legend', value: 'native', description: 'Each panel is a real fieldset; the legend shows visible/total counts.' }, { name: 'aria-label (movers)', value: 'move selected to {side}', description: 'Names each middle mover button.' }, { name: 'aria-label (search)', value: 'filter {panel}', description: 'Names each per-panel search lane.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Rows, movers and search lanes paint through theme colors; the panels stack under a 480px container query."><div class="flex flex-col gap-5"><DensityDemo><Transfer options={typesPlain} bind:value={typesPlainValue} /></DensityDemo><TokenTable tokens={[{ name: '--jx-scrollbar-thin', default: 'stable gutter', source: 'component', description: 'List padding reserves the scrollbar lane when gutters are stable.' }, { name: 'panel surface', default: 'var(--card) + shadow-2xs', source: 'color', description: 'Each fieldset panel.' }, { name: 'hover / focus', default: '--muted / --ring / --primary', source: 'color', description: 'Row hover, search focus outline, mover hover lean.' }, { name: 'stacking law', default: 'max-width 480px', source: 'structural', description: 'Container query: panels stack, movers center between them.' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density', description: 'Row and mover targets inside the density scope.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The target list binds both ways; a name wires the values into FormData through the jx-form-field bridge."><div class="flex flex-col gap-8"><PropsTable props={[{ name: 'options', type: 'TransferOption[]', default: '—', description: 'The full option set; placement derives from value.', required: true }, { name: 'value', type: 'string[]', default: '[]', description: 'Values living on the TARGET side.', bindable: true }, { name: 'name', type: 'string', default: '—', description: 'Form field name — target values submit as multi-entry FormData.' }, { name: 'sourceTitle', type: 'string', default: "'source'", description: 'Source fieldset legend.' }, { name: 'targetTitle', type: 'string', default: "'target'", description: 'Target fieldset legend.' }, { name: 'searchPlaceholder', type: 'string', default: "'filter…'", description: 'Search lane placeholder.' }, { name: 'onchange', type: '(value: string[]) => void', default: '—', description: 'Fires after each batch move with the new target list.' }, { name: 'class', type: 'string', default: "''", description: 'Extra classes on the root.' }]} /><PropsTable title="TransferOption" props={[{ name: 'value', type: 'string', default: '—', description: 'The submit value.', required: true }, { name: 'label', type: 'string', default: '—', description: 'Row label.', required: true }, { name: 'disabled', type: 'boolean', default: '—', description: 'Row renders but never moves.' }]} /></div></SectionCard></div>
</div>
