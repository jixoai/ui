<!-- composition-a spec fixture: the descriptions family composed —
     term prop → dt, children → dd, one childless Item for the em dash,
     parameterized columns/bordered HOW-props. -->
<script lang="ts">
  import Descriptions, { DescriptionsItem } from '../../src/lib/ui/descriptions';

  interface Props {
    columns?: number;
    bordered?: boolean;
  }

  let { columns = 1, bordered = false }: Props = $props();
</script>

<Descriptions {columns} {bordered}>
  <DescriptionsItem term="build">4f2a</DescriptionsItem>
  <DescriptionsItem term="notes" />
</Descriptions>
