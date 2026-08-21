<!--
  Test host for the tabs family contract: three tabs (one disabled),
  bound value, onchange surfaced as a data attribute so tests read the
  change history through the DOM. Below: a MANUAL-activation variant
  (roving tabindex must follow focus, not selection) and an RTL host
  (direction inherited from an ancestor, not the list itself).
-->
<script lang="ts">
  import Tabs from '../../src/lib/ui/tabs.svelte';
  import TabsList from '../../src/lib/ui/tabs-list.svelte';
  import TabsTrigger from '../../src/lib/ui/tabs-trigger.svelte';
  import TabsContent from '../../src/lib/ui/tabs-content.svelte';

  let value = $state('alpha');
  let lastChange = $state('');
  let manualValue = $state('alpha');
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

<div data-manual-value={manualValue}>
  <Tabs bind:value={manualValue} activation="manual">
    <TabsList data-manual-list>
      <TabsTrigger value="alpha">Alpha</TabsTrigger>
      <TabsTrigger value="beta">Beta</TabsTrigger>
      <TabsTrigger value="gamma">Gamma</TabsTrigger>
    </TabsList>
    <TabsContent value="alpha">Alpha panel</TabsContent>
    <TabsContent value="beta">Beta panel</TabsContent>
    <TabsContent value="gamma">Gamma panel</TabsContent>
  </Tabs>
</div>

<div dir="rtl">
  <Tabs value="alpha">
    <TabsList data-rtl-list>
      <TabsTrigger value="alpha">Alpha</TabsTrigger>
      <TabsTrigger value="beta">Beta</TabsTrigger>
    </TabsList>
    <TabsContent value="alpha">Alpha panel</TabsContent>
    <TabsContent value="beta">Beta panel</TabsContent>
  </Tabs>
</div>
