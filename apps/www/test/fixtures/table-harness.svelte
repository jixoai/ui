<!--
  Table contract-test harness (test/fixtures/table-harness.svelte).
  The component's children prop must be a real Svelte 5 snippet, so the
  fixed consumer markup lives here — the full native semantic set with
  the opt-in cell attributes (data-label, data-sticky) the two
  container-query laws read. Props mirror the Table API for variation.
-->
<script lang="ts">
  import Table from '../../src/lib/ui/table.svelte';

  let {
    caption = '',
    dense = false,
    stack = true,
    frameClass = '',
  }: { caption?: string; dense?: boolean; stack?: boolean; frameClass?: string } = $props();
</script>

<Table {caption} {dense} {stack} class={frameClass}>
  <thead>
    <tr>
      <th data-sticky="start" scope="col">Component</th>
      <th scope="col">Svelte 5</th>
      <th data-sticky="end" scope="col">Files</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-sticky="start" data-label="Component">press-button</td>
      <td data-label="Svelte 5">yes</td>
      <td data-sticky="end" data-label="Files">1</td>
    </tr>
  </tbody>
  <tfoot>
    <tr><td>Total</td><td>—</td><td>1</td></tr>
  </tfoot>
</Table>
