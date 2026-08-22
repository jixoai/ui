<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Cascader from '$lib/ui/cascader.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import cascaderSource from '$lib/ui/cascader.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.
  const tocSections = [
    { id: 'cascader-demo', label: 'live demo' },
    { id: 'cascader-base', label: 'usage' },
  ];

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
      eyebrow="registry:ui · antd 裁决"
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

  <div id="cascader-demo" data-region="cascader-demo" data-family="cascader-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="cascader"
      description="Pick Asia, then Japan — the chain grows one select at a time; re-picking an earlier level truncates the deeper ones. The echo footer shows the joined path."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/cascader.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'path', value: value.length ? value.join(' / ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-md">
        <Cascader {options} label="region" bind:value />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <p class="jx-play-help">
            picking a parent grows the chain by one select; re-picking an earlier level truncates
            everything deeper. The complete leaf path is the form value.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="cascader-base" data-reveal="" use:reveal>
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
