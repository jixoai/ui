<!-- recipes blueprint: the guide's own subject — where wrapping stops.
     The antd concept mappings rendered with REAL components: the
     data-table mapping (Table), the status-chip mapping (Badge), the
     action mapping (PressButton). The watermark/flex-grid/typography
     recipes are patterns, not components — the table IS their index. -->
<script lang="ts">
  import Table from '$lib/ui/table/table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="flex h-full w-full flex-col gap-5 p-10">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h2 class="font-nav text-lg tracking-tight">antd concept → jxoai recipe</h2>
    <Badge tone="primary">where wrapping stops</Badge>
  </div>
  <Table caption="the deliberate non-components" dense>
    <thead>
      <tr><th>antd</th><th>jixoai</th><th>kind</th></tr>
    </thead>
    <tbody>
      <tr><td>Watermark</td><td>CSS repeating tile</td><td>recipe</td></tr>
      <tr><td>Flex / Grid</td><td>utility classes</td><td>recipe</td></tr>
      <tr><td>Typography</td><td>token scale + font-nav</td><td>recipe</td></tr>
    </tbody>
  </Table>
  <div class="flex flex-wrap gap-3">
    <PressButton variant="outline">tour contract</PressButton>
    <PressButton variant="outline">image preview</PressButton>
  </div>
</div>
