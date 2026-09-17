<!-- tabs blueprint: the indicator system — a line row and a pill row,
     a glass row staged on a gradient chip, the trigger anatomy (icon
     lane · icon-only · stack) and the vertical pill sidebar. One live
     value per strip; the panels are omitted to keep the card compact.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import Tabs from '$lib/ui/tabs/tabs.svelte';
  import TabsList from '$lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '$lib/ui/tabs/tabs-trigger.svelte';
  import Icon from '$lib/ui/icon';
  import { bpB } from '../../surface/blueprints-b.stylex';

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

<div class={cx(bpB.tabsStage)}>
  <div class={cx(bpB.tabsCol)}>
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
      class={cx(bpB.tabsGlassChip)}
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
          {#snippet icon()}<Icon name="braces" />{/snippet}
          code
        </TabsTrigger>
        <TabsTrigger value="watch" aria-label="watch">
          {#snippet icon()}<Icon name="eye" />{/snippet}
        </TabsTrigger>
        <TabsTrigger value="overview" stack>
          {#snippet icon()}<Icon name="monitor" />{/snippet}
          overview
        </TabsTrigger>
        <TabsTrigger value="logs">logs</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
  <div class={cx(bpB.tabsSidebar)}>
    <Tabs value="overview">
      <TabsList orientation="vertical" indicator="pill" class={cx(bpB.tabsSidebarList)}>
        <TabsTrigger value="overview">overview</TabsTrigger>
        <TabsTrigger value="activity">activity</TabsTrigger>
        <TabsTrigger value="keys">keys</TabsTrigger>
        <TabsTrigger value="audit">audit</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</div>
