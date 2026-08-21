<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Input from '$lib/ui/input.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Table from '$lib/ui/table.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tableSource from '$lib/ui/table.svelte?raw';

  // No closing-script tags in this sample — String.raw keeps it verbatim.
  const usage = String.raw`<Table caption="Registry components — environment support" {dense}>
  <thead>
    <tr>
      <th>Component</th>
      <th>Svelte 5</th>
      <th>Prerendered SSR</th>
      <th class="text-right">Files</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>press-button</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
    <tr><td>code-card + highlight</td><td>yes</td><td>yes</td><td class="text-right">2</td></tr>
    <tr><td>table</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
    <tr><td>tree-view</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
  </tbody>
  <tfoot>
    <tr><td>Total</td><td>—</td><td>—</td><td class="text-right">5</td></tr>
  </tfoot>
</Table>`;

  const files = [
    { name: 'registry/files/ui/table.svelte', content: tableSource },
    { name: 'src/lib/ui/table-usage.svelte', content: usage },
  ];

  // Playground: the dense toggle drives the LIVE matrix live.
  let dense = $state(false);
</script>

<svelte:head>
  <title>table · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai table component: a native table with the full semantic set preserved — thead/tbody/tfoot/th/td/caption stay real elements you author as the children snippet; the figure wrapper owns only the hairline frame and the responsive overflow-x scroll."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="table — native semantics, restyled"
      summary="The component never wraps your rows: thead gets a bg-muted font-nav uppercase head, rows carry 12% hairlines with a muted hover, tfoot closes with a top hairline and medium weight, and caption sits top-left as the table title. The table keeps min-width fit-content so columns never compress — narrow viewports scroll the figure frame natively — and numeric columns opt into right alignment through consumer classes, never by component force."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">&lt;table&gt; full semantic set</span>
        <span class="pill">caption + tfoot</span>
        <span class="pill">dense rows</span>
        <span class="pill">fit-content · overflow-x</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: 4×4 compatibility matrix, dense-switched from the playground -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="table"
      description="A 4 × 4 compatibility matrix with caption, tfoot totals and a dense toggle — the same example the overview gallery renders, now driven from the Playground pane."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table.svelte"
      {files}
    >
      <Table
        caption="jixoai components — environment support (2026-08)"
        {dense}
        class="w-full max-w-[40rem]"
      >
        <thead>
          <tr>
            <th>Component</th>
            <th>Svelte 5</th>
            <th>Prerendered SSR</th>
            <th class="text-right">Files</th>
          </tr>
        </thead>
        <tbody>
            <tr><td>press-button</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
            <tr><td>code-card + highlight</td><td>yes</td><td>yes</td><td class="text-right">2</td></tr>
            <tr><td>table</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
            <tr><td>tree-view</td><td>yes</td><td>yes</td><td class="text-right">1</td></tr>
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>—</td><td>—</td><td class="text-right">5</td></tr>
        </tfoot>
      </Table>
      {#snippet playground()}
        <Input
          type="checkbox"
          label="dense rows"
          labelSide="right"
          checked={dense}
          onchange={(event) => {
            dense = event.currentTarget.checked;
          }}
        />
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          dense compacts the row height from 0.75rem to 0.4rem vertical padding — the reference
          density for matrix-heavy pages.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>
