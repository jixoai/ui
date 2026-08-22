<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Popconfirm from '$lib/ui/popconfirm.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import popconfirmSource from '$lib/ui/popconfirm.svelte?raw';

  let outcome = $state('');

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { outcome: '' };
  function resetCanvas(): void {
    outcome = canvasInitial.outcome;
  }

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'popconfirm-base', label: 'usage' }];

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Popconfirm from '@ui/popconfirm.svelte';
${close}

<Popconfirm
  title="Delete this row?"
  description="The history goes with it."
  confirmLabel="Delete"
  onconfirm={del}
  oncancel={() => console.log('kept')}
>
  <PressButton>delete row</PressButton>
</Popconfirm>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/popconfirm.svelte', content: popconfirmSource },
    { name: 'src/lib/ui/popconfirm-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Popconfirm · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai popconfirm: the LIGHT confirm bubble — light dismiss IS the cancel path, focus lands on Cancel, destructive confirm paint by default. Not an alertdialog."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · antd 裁决"
      title="popconfirm — the light sure-bubble"
      summary="The LIGHT confirm bubble for risky-but-reversible actions (antd's highest-frequency unique gift). Ruled NOT an alertdialog — modal weight stays with alert-dialog: light dismiss (outside click / Escape) IS the cancel path, focus lands on Cancel on open, and confirm paints destructive by default."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role=dialog</span>
        <span class="pill">light dismiss = cancel</span>
        <span class="pill">focus → Cancel</span>
        <span class="pill">destructive default</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="popconfirm"
      description="Open it — focus lands on Cancel. Confirm runs the action; clicking outside or pressing Escape runs the cancel path instead. Either way the outcome surfaces below."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/popconfirm.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'outcome', value: outcome || '—' }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <Popconfirm
          title="Delete this row?"
          description="The check history goes with it."
          confirmLabel="Delete"
          onconfirm={() => (outcome = 'deleted')}
          oncancel={() => (outcome = 'kept')}
        >
          <PressButton>delete row</PressButton>
        </Popconfirm>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the wrapper auto-wires the first button inside as the declarative popovertarget trigger
          and mirrors aria-expanded/aria-controls. confirmTone='primary' flips the loud path for
          positive confirmations. A throwing onconfirm still closes (try/finally).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="popconfirm-base" data-reveal="" use:reveal>
    <SectionCard family="popconfirm-base" headerRegion="popconfirm-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
