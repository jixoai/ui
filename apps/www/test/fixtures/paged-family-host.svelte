<!--
  Family-structure harness (test/paged-family.spec.ts fixture): the
  observable stamps — width tier / aside pose / code printOverflow /
  heading keeper / table / block / doc-level projections.
-->
<script lang="ts">
  import {
    PagedAside,
    PagedBlock,
    PagedCode,
    PagedDoc,
    PagedSection,
    PagedTable,
  } from '$lib/paged';

  let { columns = 'wide', flow = 'web' }: { columns?: 'auto' | '1' | 'wide'; flow?: 'web' | 'print' } =
    $props();
</script>

<PagedDoc {columns} {flow} page={{ size: 'Letter', margin: '20mm 15mm' }} orphans={3} widows={2}>
  <PagedSection id="s1" title="Structure" level={2}>
    {#snippet lede()}the standfirst rides inside the keeper{/snippet}
    <PagedAside><b>note</b> — floats or sinks by the width tier</PagedAside>
    <PagedBlock avoid>
      <p>kept together</p>
    </PagedBlock>
  </PagedSection>
  <PagedSection id="s2" title="Code poses" break="avoid">
    <PagedCode code={'flow pose'} printOverflow="flow" />
    <PagedCode code={'shrink pose'} printOverflow="shrink" />
  </PagedSection>
  <PagedTable minTail={2}>
    <thead>
      <tr><th>col</th></tr>
    </thead>
    <tbody>
      <tr><td>row</td></tr>
    </tbody>
  </PagedTable>
</PagedDoc>
