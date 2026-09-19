<!-- descriptions blueprint: the enterprise detail view — a bordered dl
     grid of term/value pairs with one rich cell (a status badge).
     composition-first-apis: rich cells are just children. -->
<script lang="ts">
  import Descriptions, { DescriptionsItem } from '$lib/ui/descriptions/index';
  import Badge from '$lib/ui/badge/badge.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';
  import Stack from '$lib/ui/stack';

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

<Stack direction="column" justify="center" class={cx(bpA.descriptionsStage)}>
  <p class={cx(bpA.descriptionsLabel)}>registry · workspace ws-77</p>
  <div class={cx(bpA.descriptionsFrame)}>
    <Descriptions density="lg" columns={2} bordered>
      <DescriptionsItem term="owner">grace@jixoai.com</DescriptionsItem>
      <DescriptionsItem term="region">iad1 · washington</DescriptionsItem>
      <DescriptionsItem term="created">2026-08-01</DescriptionsItem>
      <DescriptionsItem term="replicas">3 (2 healthy)</DescriptionsItem>
      <DescriptionsItem term="status">
        <Badge>passing</Badge>
      </DescriptionsItem>
    </Descriptions>
  </div>
</Stack>
