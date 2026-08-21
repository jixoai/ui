<!--
  Test host for the tabs family contract: three tabs (one disabled),
  bound value, onchange surfaced as a data attribute so tests read the
  change history through the DOM.
-->
<script lang="ts">
  import Tabs from '../../src/lib/ui/tabs.svelte';
  import TabsList from '../../src/lib/ui/tabs-list.svelte';
  import TabsTrigger from '../../src/lib/ui/tabs-trigger.svelte';
  import TabsContent from '../../src/lib/ui/tabs-content.svelte';

  let value = $state('alpha');
  let lastChange = $state('');
</script>

<div data-value={value} data-last-change={lastChange}>
  <Tabs bind:value onchange={(next) => (lastChange = next)}>
    <TabsList>
      <TabsTrigger value="alpha">Alpha</TabsTrigger>
      <TabsTrigger value="beta">Beta</TabsTrigger>
      <TabsTrigger value="gamma" disabled>Gamma</TabsTrigger>
    </TabsList>
    <TabsContent value="alpha">Alpha panel</TabsContent>
    <TabsContent value="beta">Beta panel</TabsContent>
    <TabsContent value="gamma">Gamma panel</TabsContent>
  </Tabs>
</div>
