<!--
  Numbering-registry harness (test/paged-registry.spec.ts fixture):
  keyed reordering, a conditional insert, a nested section, a figure
  and margin notes — the dynamic cases the registry must survive in
  document order.
-->
<script lang="ts">
  import { PagedDoc, PagedFigure, PagedRef, PagedSection, PagedToC } from '$lib/paged';

  let order = $state(['a', 'b']);
  let extra = $state(false);
</script>

<button type="button" data-testid="reorder" onclick={() => (order = [...order].reverse())}>
  reorder
</button>
<button type="button" data-testid="toggle-extra" onclick={() => (extra = !extra)}>extra</button>

<PagedDoc>
  <PagedToC />
  {#each order as key (key)}
    <PagedSection id={key} title={key === 'a' ? 'Alpha' : 'Beta'}>
      {#if key === 'a'}
        <!-- a nested section numbers in the SAME sec group, in DOM order -->
        <PagedSection id="a-nested" title="Alpha nested" level={3}>
          <p>nested body — cites <PagedRef target="b" /> and <PagedRef target="fig-usage" /></p>
        </PagedSection>
      {/if}
      <p>body of {key}</p>
    </PagedSection>
  {/each}
  {#if extra}
    <PagedSection id="c" title="Gamma">
      <p>inserted late — still last in document order</p>
    </PagedSection>
  {/if}
  <PagedFigure id="fig-usage" caption="the usage figure">figure content</PagedFigure>
</PagedDoc>
