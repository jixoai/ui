<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import Range from '$lib/ui/range.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Table from '$lib/ui/table.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tableSource from '$lib/ui/table.svelte?raw';

  // No closing-script tags in this sample — String.raw keeps it verbatim.
  const usage = String.raw`<Table caption="registry consumers — frame-width laws">
  <thead>
    <tr>
      <th data-sticky="start" scope="col">Consumer</th>
      <th scope="col">Status</th>
      <th scope="col">Items</th>
      <th scope="col">Coverage</th>
      <th scope="col">Since</th>
      <th data-sticky="end" scope="col">Docs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-sticky="start" data-label="Consumer">unipty</td>
      <td data-label="Status">live</td>
      <td data-label="Items" class="text-right">12</td>
      <td data-label="Coverage">92%</td>
      <td data-label="Since">2025-11</td>
      <td data-sticky="end" data-label="Docs"><a href="…">view</a></td>
    </tr>
    <!-- …rows follow the same law: data-label stacks, data-sticky pins -->
  </tbody>
</Table>

<!-- color freedom: every paint routes through --jx-table-* locals.
     hover follows --brand-hue by default; one var retunes it: -->
<Table style="--jx-table-hover: color-mix(in oklab, var(--secondary) 12%, var(--background))">
  …
</Table>`;

  const files = [
    { name: 'registry/files/ui/table.svelte', content: tableSource },
    { name: 'src/lib/ui/table-usage.svelte', content: usage },
  ];

  // Frame-width playground: the slider drags the demo wrapper across the
  // 30rem container-query line — scroll law (sticky pins + native scroll)
  // on the wide side, the CodePen card law on the narrow side.
  const canvasInitial = { frameWidth: 560, dense: false, stack: true, hoverTone: 'brand' };
  let frameWidth = $state(canvasInitial.frameWidth);
  let dense = $state(canvasInitial.dense);
  let stack = $state(canvasInitial.stack);
  let hoverTone = $state(canvasInitial.hoverTone);
  function resetCanvas(): void {
    frameWidth = canvasInitial.frameWidth;
    dense = canvasInitial.dense;
    stack = canvasInitial.stack;
    hoverTone = canvasInitial.hoverTone;
  }

  // ToC outline: pairs with the region ids below, in page order.

  const hoverMixes: Record<string, string> = {
    brand: 'color-mix(in oklab, var(--primary) 7%, var(--background))',
    neutral: 'color-mix(in oklab, var(--muted) 55%, var(--background))',
    signal: 'color-mix(in oklab, var(--secondary) 12%, var(--background))',
  };
  const frameStyle = $derived(
    `width: min(${frameWidth}px, 100%); --jx-table-hover: ${hoverMixes[hoverTone] ?? hoverMixes.brand};`,
  );

  const consumers = [
    { name: 'unipty', host: 'unipty.jixoai.com', status: 'live', items: 12, coverage: 92, since: '2025-11' },
    { name: 'openspecui', host: 'openspecui.com', status: 'live', items: 9, coverage: 78, since: '2026-01' },
    { name: 'ui.jixoai.com', host: 'this site', status: 'live', items: 24, coverage: 100, since: '2026-08' },
    { name: 'jixoai/www', host: 'internal', status: 'beta', items: 6, coverage: 45, since: '2026-08' },
    { name: 'agent-console', host: 'internal', status: 'wip', items: 3, coverage: 12, since: '2026-07' },
  ] as const;
</script>

<svelte:head>
  <title>table · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai table component deepened with the CodePen JjxGgmm container-query law: the figure frame reads its own width — wide frames keep the scroll law with opt-in pinned columns (data-sticky), narrow frames fold into label:value card rows (data-label). Every paint routes through the --jx-table-* token surface, so hover already carries the --brand-hue flow."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="table — frame-width laws, token paint"
      summary="The figure frame is a named inline-size container, so every responsive decision reads the FRAME's width, never the viewport's. Wide (≥ 30rem): the scroll law — fit-content columns, native overflow-x, consumer cells opt into pinned columns with data-sticky=start|end behind a hairline fold mark. Narrow: the CodePen card law — thead folds away, td[data-label] renders a muted label with the value flushed right, the first cell heads the card; stack=false pins any table to the scroll law. Every color routes through the --jx-table-* locals (surface/head/hover/hairline/rule/edge) — hover follows --brand-hue by default, one var retunes it per instance."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">container queries on the frame</span>
        <span class="pill">data-sticky pin law</span>
        <span class="pill">data-label card law</span>
        <span class="pill">--jx-table-* color surface</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: drag the frame across the 30rem line -->
  <div id="table-workbench" data-region="table-workbench" data-reveal="">
    <ComponentCanvas
      title="table"
      description="A registry-consumer operations table — Consumer and Docs pin to the scrollport while Items/Coverage scroll under them; drag the frame width past 30rem and the same rows re-lay out into label:value cards. The hover tone control retunes --jx-table-hover live."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table.svelte"
      {files}
      stage="start"
      onreset={resetCanvas}
      echo={[
        { label: 'frame', value: `${frameWidth}px` },
        { label: 'stack', value: stack ? 'on' : 'off' },
        { label: 'hover', value: hoverTone },
      ]}
    >
      <div class="frame-rig" style={frameStyle}>
        <Table caption="registry consumers — frame-width laws" {dense} {stack}>
          <thead>
            <tr>
              <th data-sticky="start" scope="col">Consumer</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-right">Items</th>
              <th scope="col">Coverage</th>
              <th scope="col">Since</th>
              <th data-sticky="end" scope="col">Docs</th>
            </tr>
          </thead>
          <tbody>
            {#each consumers as consumer (consumer.name)}
              <tr>
                <td data-sticky="start" data-label="Consumer">
                  <div class="who">
                    <span class="who-name">{consumer.name}</span>
                    <span class="who-host">{consumer.host}</span>
                  </div>
                </td>
                <td data-label="Status"><span class="badge" data-tone={consumer.status}>{consumer.status}</span></td>
                <td data-label="Items" class="text-right">{consumer.items}</td>
                <td data-label="Coverage">
                  <span class="meter" role="img" aria-label="{consumer.coverage}% coverage">
                    <span class="meter-fill" style:width="{consumer.coverage}%"></span>
                  </span>
                  <span class="meter-value">{consumer.coverage}%</span>
                </td>
                <td data-label="Since">{consumer.since}</td>
                <td data-sticky="end" data-label="Docs">
                  <a class="doc-link" href={`https://${consumer.host === 'this site' ? 'ui.jixoai.com' : consumer.host}/`} target="_blank" rel="noreferrer">view</a>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td>—</td><td class="text-right">54</td><td>—</td><td>—</td><td>—</td></tr>
          </tfoot>
        </Table>
      </div>
      {#snippet playground()}
        <Range label="frame width" min={240} max={680} step={8} bind:value={frameWidth} />
        <div class="grid grid-cols-1 gap-2">
          <Input
            type="checkbox"
            label="stack below 30rem"
            labelSide="right"
            checked={stack}
            onchange={(event) => {
              stack = event.currentTarget.checked;
            }}
          />
          <Input
            type="checkbox"
            label="dense rows"
            labelSide="right"
            checked={dense}
            onchange={(event) => {
              dense = event.currentTarget.checked;
            }}
          />
        </div>
        <NativeSelect
          label="hover tone (--jx-table-hover)"
          value={hoverTone}
          onchange={(event) => {
            hoverTone = event.currentTarget.value;
          }}
        >
          <option value="brand">brand — --primary 7%</option>
          <option value="neutral">neutral — --muted 55%</option>
          <option value="signal">signal — --secondary 12%</option>
        </NativeSelect>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          The frame is the container: cross 30rem and the scroll law (data-sticky pins) flips into
          the card law (data-label rows). brand hover follows --brand-hue — the site hue runtime
          recolors it live; consumers override one var per instance.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- semantic set: the untouched native baseline -->
  <div id="table-semantic-set" data-region="table-semantic-set" data-reveal="">
    <ComponentCanvas
      title="table · semantic set"
      description="The untouched native baseline — caption, thead/tbody/tfoot authored by hand, numeric right-align through consumer classes. The same table now also carries data-label on every cell, so the narrow-frame card law needs zero extra markup."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table.svelte"
      files={[{ name: 'registry/files/ui/table.svelte', content: tableSource }]}
      stage="stretch"
    >
      <Table caption="jixoai components — environment support (2026-08)" class="w-full max-w-[40rem]">
        <thead>
          <tr>
            <th>Component</th>
            <th>Svelte 5</th>
            <th>Prerendered SSR</th>
            <th class="text-right">Files</th>
          </tr>
        </thead>
        <tbody>
          <tr><td data-label="Component">press-button</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
          <tr><td data-label="Component">code-card + highlight</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">2</td></tr>
          <tr><td data-label="Component">table</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
          <tr><td data-label="Component">tree-view</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>—</td><td>—</td><td class="text-right">5</td></tr>
        </tfoot>
      </Table>
    </ComponentCanvas>
  </div>
  </div>
</div>

<style>
  /* demo-content paint (consumer side): identity block, status badges,
     coverage meter — all riding theme tokens so the hue runtime flows */
  .frame-rig {
    max-width: 100%;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    line-height: 1.35;
  }
  .who-name {
    font-weight: 500;
  }
  .who-host {
    color: var(--muted-foreground);
    font-size: 11px;
  }

  .badge {
    border: 1px solid;
    display: inline-flex;
    align-items: center;
    font-size: 10.5px;
    gap: 0.45rem;
    letter-spacing: 0.08em;
    padding: 0.1rem 0.55rem;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .badge::before {
    border-radius: 50%;
    content: '';
    height: 4px;
    width: 4px;
  }
  .badge[data-tone='live'] {
    border-color: color-mix(in oklab, var(--chart-4) 55%, var(--border));
    color: color-mix(in oklab, var(--chart-4) 72%, var(--foreground));
    background: color-mix(in oklab, var(--chart-4) 12%, var(--background));
  }
  .badge[data-tone='live']::before {
    background: var(--chart-4);
  }
  .badge[data-tone='beta'] {
    border-color: color-mix(in oklab, var(--secondary) 55%, var(--border));
    color: color-mix(in oklab, var(--secondary) 60%, var(--foreground));
    background: color-mix(in oklab, var(--secondary) 14%, var(--background));
  }
  .badge[data-tone='beta']::before {
    background: var(--secondary);
  }
  .badge[data-tone='wip'] {
    border-color: color-mix(in oklab, var(--muted-foreground) 45%, var(--border));
    color: var(--muted-foreground);
  }
  .badge[data-tone='wip']::before {
    background: var(--muted-foreground);
  }

  .meter {
    background: color-mix(in oklab, var(--muted-foreground) 18%, transparent);
    block-size: 4px;
    display: inline-block;
    inline-size: 5rem;
    vertical-align: middle;
  }
  .meter-fill {
    background: var(--primary);
    block-size: 100%;
    display: block;
  }
  .meter-value {
    color: var(--muted-foreground);
    font-size: 11px;
    margin-inline-start: 0.5rem;
    vertical-align: middle;
  }

  .doc-link {
    color: var(--primary);
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }
  .doc-link:hover {
    color: color-mix(in oklab, var(--primary) 70%, var(--foreground));
  }

  /* stack law: the meter row keeps its bar+value pair on one line */
  :global(td[data-label='Coverage']) {
    white-space: nowrap;
  }
</style>
