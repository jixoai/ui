<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import ToggleGroup from '$lib/ui/toggle-group.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import toggleGroupSource from '$lib/ui/toggle-group.svelte?raw';

  // ToC outline: the live demo band + usage + the antd segmented mapping.
  const tocSections = [
    { id: 'tgroup-demo', label: 'live demo' },
    { id: 'tgroup-base', label: 'usage' },
    { id: 'tgroup-segmented', label: 'segmented → type=single' },
  ];

  // Playground protocol: the page owns the snapshots + reset; the echo footer
  // replaces the hand-written "value/values" captions; usage file tracks live.
  const canvasInitial = { single: '', many: [] as string[] };
  let single = $state<string>(canvasInitial.single);
  let many = $state<string[]>(canvasInitial.many);
  function resetCanvas(): void {
    single = canvasInitial.single;
    many = canvasInitial.many;
  }
  const usageLive = $derived(`<ToggleGroup name="align" type="single" label="alignment" {options} value=${JSON.stringify(single)} />

<ToggleGroup name="style" type="multiple" label="text style" {options} value={[${many.map((v) => JSON.stringify(v)).join(', ')}]} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import ToggleGroup from '@ui/toggle-group.svelte';
${close}

<ToggleGroup name="align" type="single" label="alignment" options={[
  { value: 'left', label: 'left' },
  { value: 'center', label: 'center' },
  { value: 'right', label: 'right' },
]} />

<ToggleGroup name="style" type="multiple" label="text style" options={[…]} />`;

  const canvasUsage = `<ToggleGroup name="align" type="single" label="alignment" {options} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/toggle-group.svelte', content: toggleGroupSource },
    { name: 'src/lib/ui/toggle-group-usage.svelte', content: canvasUsage },
  ];

  const align = [
    { value: 'left', label: 'left' },
    { value: 'center', label: 'center' },
    { value: 'right', label: 'right' },
  ];
  const style = [
    { value: 'bold', label: 'bold' },
    { value: 'italic', label: 'italic' },
    { value: 'underline', label: 'underline' },
  ];
</script>

<svelte:head>
  <title>Toggle group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toggle group: joined buttons submitting as one form field — single picks a value, multiple submits one FormData entry per press through the bridge's multivalue mode."
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
      title="toggle-group — pressed states, one field"
      summary="A row of press-state buttons that submits as ONE form field. single presses one button ('' when none); multiple presses several — the bridge's multivalue mode submits one FormData entry per active value, the checkbox-set contract, never a CSV. role=group + aria-pressed for both modes; arrow-walking is tabs' job, not a toggle set's."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">aria-pressed</span>
        <span class="pill">multivalue bridge</span>
        <span class="pill">FormData multi-entry</span>
      </div>
    </SectionCard>
  </div>

  <div id="tgroup-demo" data-region="tgroup-demo" data-family="tgroup-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="toggle-group"
      description="Single swaps; multiple stacks — the bound values surface in the echo footer, one row per mode."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toggle-group.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[
        { label: 'single', value: single || '—' },
        { label: 'multiple', value: many.length ? many.join(', ') : '—' },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex flex-col items-start gap-5">
        <ToggleGroup name="demo-align" type="single" label="alignment" options={align} bind:value={single} />
        <ToggleGroup name="demo-style" type="multiple" label="text style" options={style} bind:value={many} />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <p class="jx-play-help">
            buttons carry Space/Enter natively and Tab walks the row; per-button content composes
            through the item snippet. disabled on an option dims only that button.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tgroup-base" data-reveal="" use:reveal>
    <SectionCard
      family="tgroup-base"
      headerRegion="tgroup-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="tgroup-segmented" data-reveal="" use:reveal>
    <SectionCard
      family="tgroup-segmented"
      headerRegion="tgroup-segmented"
      eyebrow="composition"
      title="segmented → toggle-group type=single"
      summary="antd's Segmented maps to the single mode — same one-active-submit contract. The mapping is SEMANTIC, not 1:1 paint: antd's sliding selection indicator and its exact keyboard walk are not imitated; if a future case needs the slide indicator or a strict single tab stop, that becomes a dedicated API upgrade — not a silent divergence."
    >
      <CodeBlock
        code={`<!-- antd: <Segmented options={['daily','weekly','monthly']} /> -->
<ToggleGroup name="range" type="single" label="range" options={[
  { value: 'daily', label: 'daily' },
  { value: 'weekly', label: 'weekly' },
  { value: 'monthly', label: 'monthly' },
]} />`}
        lang="svelte"
        meta="mapping"
      />
    </SectionCard>
  </div>
  </div>
</div>
