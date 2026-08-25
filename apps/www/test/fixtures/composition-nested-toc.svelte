<!--
  composition regression fixture (Codex impl-r4 B): a NESTED Toc rail
  inside the outer rail's tree — the outer paint/click/collapse must
  never touch the inner rail's links (the own-rail law).
-->
<script lang="ts">
  import Toc from '../../src/lib/ui/toc/toc.svelte';
  import TocList from '../../src/lib/ui/toc/toc-list.svelte';
  import TocItem from '../../src/lib/ui/toc/toc-item.svelte';
  import TocLink from '../../src/lib/ui/toc/toc-link.svelte';
</script>

<Toc title="outer">
  <TocList>
    <TocItem>
      <TocLink href="#outer-a">outer a</TocLink>
    </TocItem>
    <TocItem>
      <TocLink href="#outer-b">outer b</TocLink>
      <!-- the nested rail: its own root element -->
      <Toc title="inner">
        <TocList>
          <TocItem><TocLink href="#inner-a">inner a</TocLink></TocItem>
        </TocList>
      </Toc>
    </TocItem>
  </TocList>
</Toc>
