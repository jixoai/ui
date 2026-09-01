<!-- tabs blueprint: the indicator system — a line row and a pill row,
     a glass row staged on a gradient chip, the trigger anatomy (icon
     lane · icon-only · stack) and the vertical pill sidebar. One live
     value per strip; the panels are omitted to keep the card compact. -->
<script lang="ts">
  import Tabs from '$lib/ui/tabs/tabs.svelte';
  import TabsList from '$lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '$lib/ui/tabs/tabs-trigger.svelte';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full items-center gap-20 p-10">
  <div class="flex min-w-0 flex-1 flex-col gap-10">
    <Tabs value="deploy">
      <TabsList>
        <TabsTrigger value="build">build</TabsTrigger>
        <TabsTrigger value="deploy">deploy</TabsTrigger>
        <TabsTrigger value="preview">preview</TabsTrigger>
      </TabsList>
    </Tabs>
    <Tabs value="editor">
      <TabsList indicator="pill">
        <TabsTrigger value="editor">editor</TabsTrigger>
        <TabsTrigger value="review">review</TabsTrigger>
        <TabsTrigger value="ship">ship</TabsTrigger>
      </TabsList>
    </Tabs>
    <div
      class="rounded-lg p-4"
      style="background: linear-gradient(115deg, oklch(0.8 0.15 260), oklch(0.8 0.15 300), oklch(0.84 0.13 145))"
    >
      <Tabs value="frost">
        <TabsList indicator="glass">
          <TabsTrigger value="frost">frost</TabsTrigger>
          <TabsTrigger value="ice">ice</TabsTrigger>
          <TabsTrigger value="mist">mist</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    <Tabs value="code">
      <TabsList>
        <TabsTrigger value="code">
          {#snippet icon()}{@html icons.braces}{/snippet}
          code
        </TabsTrigger>
        <TabsTrigger value="watch" aria-label="watch">
          {#snippet icon()}{@html icons.eye}{/snippet}
        </TabsTrigger>
        <TabsTrigger value="overview" stack>
          {#snippet icon()}{@html icons.monitor}{/snippet}
          overview
        </TabsTrigger>
        <TabsTrigger value="logs">logs</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
  <div class="flex-none">
    <Tabs value="overview">
      <TabsList orientation="vertical" indicator="pill" class="min-w-40">
        <TabsTrigger value="overview">overview</TabsTrigger>
        <TabsTrigger value="activity">activity</TabsTrigger>
        <TabsTrigger value="keys">keys</TabsTrigger>
        <TabsTrigger value="audit">audit</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</div>
