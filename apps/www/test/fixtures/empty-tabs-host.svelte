<!--
  Test host for the empty-state tabs contract: NO initial value — the
  tablist must still expose exactly one tab stop (the first enabled
  trigger) with nothing selected.
-->
<script lang="ts">
  import Tabs from '../../src/lib/ui/tabs.svelte';
  import TabsList from '../../src/lib/ui/tabs-list.svelte';
  import TabsTrigger from '../../src/lib/ui/tabs-trigger.svelte';
  import TabsContent from '../../src/lib/ui/tabs-content.svelte';
</script>

<Tabs>
  <TabsList>
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma" disabled>Gamma</TabsTrigger>
  </TabsList>
  <TabsContent value="alpha">Alpha panel</TabsContent>
  <TabsContent value="beta">Beta panel</TabsContent>
</Tabs>
