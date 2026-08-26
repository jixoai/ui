<!-- tabs blueprint: the selected trigger + its content panel. -->
<script lang="ts">
  import Tabs from '$lib/ui/tabs/tabs.svelte';
  import TabsList from '$lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '$lib/ui/tabs/tabs-trigger.svelte';
  import TabsContent from '$lib/ui/tabs/tabs-content.svelte';
</script>

<Tabs density="lg" value="deploy" class="flex h-full w-full flex-col gap-6 p-10">
  <TabsList>
    <TabsTrigger value="build">build</TabsTrigger>
    <TabsTrigger value="deploy">deploy</TabsTrigger>
    <TabsTrigger value="preview">preview</TabsTrigger>
  </TabsList>
  <TabsContent value="deploy">
    <p class="text-sm leading-6">
      Production deploy of the registry — 77 items published to ui.jixoai.com.
    </p>
  </TabsContent>
</Tabs>
