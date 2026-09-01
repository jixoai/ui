<!--
  Test host for the tabs shared-indicator variant system (2026-09-01;
  2026-09-02 fix wave added the RTL scenario): one Tabs root per
  scenario, each list addressable through a data-list hook so the
  spec never depends on DOM order. Scenarios:

  - materials: line (the default, nothing passed), pill, outline,
    glass, liquid, none — plus a vertical list wearing pill
  - layouts: grow, scroll and wrap (data-layout wiring)
  - an RTL run (dir="rtl" wrapper around a scroll list) for the
    normalized-stamp contract — the spec pins the computed direction
    on the run itself (jsdom's cascade never maps the dir attribute)
  - trigger anatomy: a leading icon, a trailing iconEnd, an icon-only
    trigger named by aria-label (its content is the empty expression so
    the host still mounts against a trigger without the rest spread),
    and a stacked one
  - a snippet-override indicator that echoes the measured geometry back
    through data attributes — jsdom offsets are all 0; the numbers are
    the engine's, the echo just surfaces them for the spec
  - the empty-value state: the indicator must render hidden — and its
    trimmed tab stop feeds the disabled-flip re-trim regression
-->
<script lang="ts">
  import Tabs from '../../src/lib/ui/tabs/tabs.svelte';
  import TabsList, { blurSlide, progressBlur, shadow } from '../../src/lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '../../src/lib/ui/tabs/tabs-trigger.svelte';
</script>

<Tabs value="alpha">
  <TabsList data-list="line">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="pill" indicator="pill">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="outline" indicator="outline">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="glass" indicator="glass">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="liquid" indicator="liquid">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="none" indicator="none">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="grow" layout="grow">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="scroll" layout="scroll">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <div dir="rtl">
    <TabsList data-list="rtl" layout="scroll">
      <TabsTrigger value="alpha">Alpha</TabsTrigger>
      <TabsTrigger value="beta">Beta</TabsTrigger>
      <TabsTrigger value="gamma">Gamma</TabsTrigger>
    </TabsList>
  </div>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="wrap" layout="wrap">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
    <TabsTrigger value="delta">Delta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="effect-blur" layout="scroll" scrollEffect={blurSlide()}>
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="effect-veil" layout="scroll" scrollEffect={progressBlur()}>
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="effect-shadow" layout="scroll" scrollEffect={shadow()}>
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="effect-narrow" layout="scroll" scrollEffect={shadow({ width: '120px' })}>
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
    <TabsTrigger value="gamma">Gamma</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="vertical-pill" orientation="vertical" indicator="pill">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="anatomy">
    <TabsTrigger value="alpha">
      {#snippet icon()}<i data-glyph="alpha"></i>{/snippet}
      Alpha
    </TabsTrigger>
    <TabsTrigger value="beta">
      {#snippet iconEnd()}<i data-glyph="beta"></i>{/snippet}
      Beta
    </TabsTrigger>
    <TabsTrigger value="settings" aria-label="Settings">
      {#snippet icon()}<i data-glyph="settings"></i>{/snippet}
    </TabsTrigger>
    <TabsTrigger value="stacked" stack>
      {#snippet icon()}<i data-glyph="stack"></i>{/snippet}
      Stacked
    </TabsTrigger>
  </TabsList>
</Tabs>

<Tabs value="alpha">
  <TabsList data-list="snippet">
    {#snippet indicator(geo)}
      <span
        data-geo-echo=""
        data-x={geo.x}
        data-y={geo.y}
        data-w={geo.w}
        data-h={geo.h}
        data-axis={geo.orientation}
      ></span>
    {/snippet}
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>

<Tabs>
  <TabsList data-list="empty">
    <TabsTrigger value="alpha">Alpha</TabsTrigger>
    <TabsTrigger value="beta">Beta</TabsTrigger>
  </TabsList>
</Tabs>
