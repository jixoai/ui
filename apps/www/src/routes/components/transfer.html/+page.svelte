<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import Transfer from '$lib/ui/transfer.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import transferSource from '$lib/ui/transfer.svelte?raw';

  // ToC outline: the live demo band + the usage closing section.
  const tocSections = [
    { id: 'transfer-demo', label: 'live demo' },
    { id: 'transfer-base', label: 'usage' },
  ];

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
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
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

  <div id="transfer-demo" data-region="transfer-demo" data-family="transfer-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="transfer"
      description="Check rows on either side, then fire the middle mover — every checked row crosses at once and the selection clears. The echo footer shows the target list."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'target', value: value.length ? value.join(', ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class="w-full max-w-2xl">
        <Transfer {options} bind:value />
      </div>
      {#snippet playground()}
        <div class="jx-play-fields">
          <p class="jx-play-help">
            checking rows on either side arms the middle mover; a move crosses EVERY checked row at
            once and clears the selection. Search filters per panel; disabled rows render but never
            move.
          </p>
        </div>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="transfer-base" data-reveal="" use:reveal>
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
