<!-- descriptions blueprint: the enterprise detail view — a bordered dl
   grid of term/value pairs with one rich cell (a status badge). -->
<script lang="ts">
  import Descriptions from '$lib/ui/descriptions.svelte';
  import type { DescriptionItem } from '$lib/ui/descriptions.svelte';
  import Badge from '$lib/ui/badge.svelte';

  const items: DescriptionItem[] = [
    { term: 'owner', value: 'grace@jixoai.com' },
    { term: 'region', value: 'iad1 · washington' },
    { term: 'created', value: '2026-08-01' },
    { term: 'replicas', value: '3 (2 healthy)' },
    { term: 'status' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <p class="font-mono text-xs text-muted-foreground">registry · workspace ws-77</p>
  <div class="mt-3">
    {#snippet value(item)}
      {#if item.term === 'status'}
        <Badge tone="primary">passing</Badge>
      {:else}
        {item.value ?? '—'}
      {/if}
    {/snippet}
    <Descriptions {items} columns={2} bordered {value} />
  </div>
</div>
