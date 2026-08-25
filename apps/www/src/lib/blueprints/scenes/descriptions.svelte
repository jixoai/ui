<!-- descriptions blueprint: the enterprise detail view — a bordered dl
     grid of term/value pairs with one rich cell (a status badge).
     composition-first-apis: rich cells are just children. -->
<script lang="ts">
  import Descriptions, { DescriptionsItem } from '$lib/ui/descriptions/index';
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <p class="font-mono text-xs text-muted-foreground">registry · workspace ws-77</p>
  <div class="mt-3">
    <Descriptions columns={2} bordered>
      <DescriptionsItem term="owner">grace@jixoai.com</DescriptionsItem>
      <DescriptionsItem term="region">iad1 · washington</DescriptionsItem>
      <DescriptionsItem term="created">2026-08-01</DescriptionsItem>
      <DescriptionsItem term="replicas">3 (2 healthy)</DescriptionsItem>
      <DescriptionsItem term="status">
        <Badge tone="primary">passing</Badge>
      </DescriptionsItem>
    </Descriptions>
  </div>
</div>
