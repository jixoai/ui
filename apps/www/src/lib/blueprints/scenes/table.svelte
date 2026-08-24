<!-- table blueprint: a dense semantic table with caption and footer. -->
<script lang="ts">
  import Table from '$lib/ui/table/table.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Table caption="Registry items" dense>
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
