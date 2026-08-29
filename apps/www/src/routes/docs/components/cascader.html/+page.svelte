<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Cascader from '$lib/ui/cascader/cascader.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import cascaderSource from '$lib/ui/cascader/cascader.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.

  const options = [
    {
      value: 'asia',
      label: 'Asia',
      children: [
        { value: 'japan', label: 'Japan' },
        { value: 'korea', label: 'Korea' },
      ],
    },
    {
      value: 'eu',
      label: 'Europe',
      children: [{ value: 'fr', label: 'France' }],
    },
  ];

  // Playground protocol: the page owns the snapshot + reset; echo projects
  // the joined path; the drawer's usage file tracks it live.
  const canvasInitial = { value: [] as string[] };
  let value = $state<string[]>(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }
  const usageLive = $derived(`<Cascader
  label="region"
  options={options}
  bind:value={[${value.map((v) => JSON.stringify(v)).join(', ')}]}
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Cascader from '@ui/cascader.svelte';
${close}

const options = [
  { value: 'asia', label: 'Asia', children: [
    { value: 'japan', label: 'Japan' },
    { value: 'korea', label: 'Korea' },
  ] },
];

<Cascader {options} label="region" bind:value />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/cascader.svelte', content: cascaderSource },
    { name: 'src/lib/ui/cascader-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Cascader · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai cascader: the cascade selector as a chain of N plain select elements — native keyboard and mobile pickers, zero custom panels; the joined leaf path is the form value, a partial path submits empty."
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
      eyebrow="registry:ui · General"
      title="cascader — a chain of selects, natively"
      summary="The cascade selector the ruled way: N plain select elements, each listing the children of the previous pick — native keyboard, native mobile pickers, zero custom panels to keep honest. Picking a parent grows the chain by one select; re-picking an earlier level truncates everything deeper. The joined leaf path submits through the bridge; a partial path submits empty — never a half-truth in FormData."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">chain of native selects</span>
        <span class="pill">path value · partial submits empty</span>
        <span class="pill">native keyboard + mobile pickers</span>
        <span class="pill">zero custom panels</span>
      </div>
    </SectionCard>
  </div>

  <div id="cascader-demo" data-region="cascader-demo" data-family="cascader-demo" data-reveal="">
    <ComponentCanvas
      title="cascader"
      stage="center"
      description="Pick Asia, then Japan — the chain grows one select at a time; re-picking an earlier level truncates the deeper ones. The echo footer shows the joined path."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/cascader.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'path', value: value.length ? value.join(' / ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-md">
        <Cascader {options} label="region" bind:value />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            picking a parent grows the chain by one select; re-picking an earlier level truncates
            everything deeper. The complete leaf path is the form value.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="cascader-base" data-reveal="">
    <SectionCard
      family="cascader-base"
      headerRegion="cascader-base"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Cascader variants" summary="One mode — the chain of native selects; the honest-value rules are the variants that matter.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">complete path</p>
        <p class="text-[13px] leading-6">Every level picked, last pick a leaf — the joined path (default <code class="text-accent">'asia/japan'</code>) submits under name.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">partial path</p>
        <p class="text-[13px] leading-6">A half-picked chain submits <code class="text-accent">''</code> — never a half-truth in FormData (the input-otp law).</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">disabled / option.disabled</p>
        <p class="text-[13px] leading-6"><code class="text-accent">disabled</code> blocks the whole chain; an option may disable itself at any level.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Feed the tree; bind the path; picking a parent grows the chain, re-picking truncates deeper levels."><CodeBlock code={usage} lang="svelte" meta="Cascader usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Every level is a real native select — the platform's keyboard and mobile pickers come free."><A11yTable keys={[{ key: 'Tab', action: 'Moves focus through the chain, level by level' }, { key: '↑ / ↓', action: 'Move within the focused select’s options (native)' }, { key: 'Enter / Space', action: 'Open the focused select and commit a pick (native)' }]} aria={[{ name: 'role', value: 'group', description: 'On the root; aria-label defaults to the label prop (“cascade” if omitted).' }, { name: 'aria-label', value: 'level n', description: 'Per select — each level is independently named.' }, { name: 'aria-labelledby', value: '{id}-label', description: 'The chain is labelled by the visible label when present.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The select shells are fixed utility paint; the corner rides the theme radius."><div class="flex flex-col gap-5"><DensityDemo><Cascader {options} label="density" /></DensityDemo><TokenTable tokens={[{ name: '--radius', default: 'theme radius', source: 'structural', description: 'Select shell corner (rounded-(--radius)).' }, { name: 'select rhythm', default: '13px text, fixed padding', source: 'structural' }, { name: 'chain gap', default: '6px (gap-1.5)', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Nine props; the value is the picked path, the submission is the joined string."><PropsTable props={[{ name: 'options', type: 'CascaderOption[]', default: '—', description: 'The tree: { value, label, disabled?, children? }.', required: true }, { name: 'name', type: 'string', default: '—', description: 'Form field name — the joined path submits under it through the bridge.' }, { name: 'value', type: 'string[]', default: '[]', description: 'The selected path (bind:value) — e.g. [\'asia\', \'japan\'].', bindable: true }, { name: 'separator', type: 'string', default: "'/'", description: 'Path join for the submitted string.' }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Blocks the whole chain (form disable propagates too).' }, { name: 'label', type: 'string', default: '—', description: 'Reads above the chain; names the group.' }, { name: 'placeholder', type: 'string', default: "'select…'", description: 'Placeholder for the first select.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the root.' }]} /></SectionCard></div>
</div>
