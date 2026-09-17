<!-- table blueprint: a dense semantic table with caption and footer.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Table from '$lib/ui/table/table.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<div class={cx(bpB.tableStage)}>
  <Table density="lg" caption="Registry items" dense>
    <thead>
      <tr><th>name</th><th>type</th><th>files</th></tr>
    </thead>
    <tbody>
      <tr><td>press-button</td><td>ui</td><td>1</td></tr>
      <tr><td>dialog</td><td>ui</td><td>1</td></tr>
      <tr><td>toast</td><td>ui</td><td>2</td></tr>
      <tr><td>jixoai-theme</td><td>theme</td><td>1</td></tr>
    </tbody>
    <tfoot>
      <tr><td colspan="3">4 of 77 items</td></tr>
    </tfoot>
  </Table>
</div>
