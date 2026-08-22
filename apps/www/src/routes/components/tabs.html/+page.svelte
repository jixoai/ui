<script lang="ts">
  import Badge from '$lib/ui/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Tabs from '$lib/ui/tabs.svelte';
  import TabsContent from '$lib/ui/tabs-content.svelte';
  import TabsList from '$lib/ui/tabs-list.svelte';
  import TabsTrigger from '$lib/ui/tabs-trigger.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tabsSource from '$lib/ui/tabs.svelte?raw';
  import tabsListSource from '$lib/ui/tabs-list.svelte?raw';
  import tabsTriggerSource from '$lib/ui/tabs-trigger.svelte?raw';
  import tabsContentSource from '$lib/ui/tabs-content.svelte?raw';

  // ToC outline: the workbench band + the vertical variant section.
  const tocSections = [
    { id: 'tabs-demo', label: 'live demo' },
    { id: 'tabs-vertical', label: 'vertical — the sidebar shape' },
  ];

  // Playground protocol: the page owns the snapshot + reset; the echo footer
  // replaces the hand-written "value / last change" caption (PAGE_STANDARDS
  // anti-pattern list); the drawer's usage file tracks the pick live.
  const canvasInitial = { tab: 'preview', lastChange: '' };
  let tab = $state(canvasInitial.tab);
  let lastChange = $state(canvasInitial.lastChange);
  function resetCanvas(): void {
    tab = canvasInitial.tab;
    lastChange = canvasInitial.lastChange;
  }
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<Tabs value=${q(tab)}>
  <TabsList>
    <TabsTrigger value="preview">preview</TabsTrigger>
    <TabsTrigger value="raw">raw</TabsTrigger>
    <TabsTrigger value="diff">diff</TabsTrigger>
    <TabsTrigger value="audit" disabled>audit</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">…</TabsContent>
</Tabs>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Tabs from '@ui/tabs.svelte';
  import TabsList from '@ui/tabs-list.svelte';
  import TabsTrigger from '@ui/tabs-trigger.svelte';
  import TabsContent from '@ui/tabs-content.svelte';
${close}

<Tabs bind:value>
  <TabsList>
    <TabsTrigger value="preview">preview</TabsTrigger>
    <TabsTrigger value="raw">raw</TabsTrigger>
  </TabsList>
  <TabsContent value="preview">…</TabsContent>
  <TabsContent value="raw">…</TabsContent>
</Tabs>

<!-- vertical: arrows switch axis, the bar moves to the right edge -->
<Tabs bind:value>
  <TabsList orientation="vertical">…</TabsList>
  …
</Tabs>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/tabs.svelte', content: tabsSource },
    { name: 'registry/files/ui/tabs-list.svelte', content: tabsListSource },
    { name: 'registry/files/ui/tabs-trigger.svelte', content: tabsTriggerSource },
    { name: 'registry/files/ui/tabs-content.svelte', content: tabsContentSource },
    { name: 'src/lib/ui/tabs-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Tabs · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tabs: the WAI-ARIA APG tabs pattern, composition-first — four family files sharing one context value. Automatic activation, roving tabindex, deterministic id pairing, hidden background panels."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="tabs — one value, four files, any layout"
      summary="The WAI-ARIA tabs pattern, composition-first: the root owns only the selected value and hands it to the family through context — tablist, triggers and panels lay out anywhere in the subtree. Automatic activation (focus moves select), roving tabindex, deterministic trigger/panel ids, and hidden — attribute, not CSS — background panels."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">APG tablist contract</span>
        <span class="pill">automatic activation</span>
        <span class="pill">roving tabindex</span>
        <span class="pill">horizontal + vertical</span>
      </div>
    </SectionCard>
  </div>

  <div id="tabs-demo" data-region="tabs-demo" data-family="tabs-demo" data-reveal="" use:reveal>
    <ComponentCanvas
      title="tabs"
      description="Tab across the strip: arrows walk and select, Home/End jump the ends, and the disabled trigger is skipped. The echo footer surfaces the bound value and the last change — onchange fires either way."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tabs.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[
        { label: 'value', value: tab },
        { label: 'last change', value: lastChange || '—' },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class="flex w-full max-w-xl flex-col gap-4">
        <Tabs bind:value={tab} onchange={(v) => (lastChange = v)}>
          <TabsList>
            <TabsTrigger value="preview">preview</TabsTrigger>
            <TabsTrigger value="raw">raw</TabsTrigger>
            <TabsTrigger value="diff">diff</TabsTrigger>
            <TabsTrigger value="audit" disabled>audit</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <p class="text-[13px] leading-6">The rendered surface — what reviewers see by default.</p>
          </TabsContent>
          <TabsContent value="raw">
            <p class="text-[13px] leading-6">The exact bytes, escaping untouched.</p>
          </TabsContent>
          <TabsContent value="diff">
            <p class="text-[13px] leading-6">Against the previous revision, word-granular.</p>
          </TabsContent>
          <TabsContent value="audit">
            <p class="text-[13px] leading-6">Disabled until the audit run completes.</p>
          </TabsContent>
        </Tabs>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          keyboard: ←/→ walk and select, Home/End jump the ends (RTL flips the axis reading). The
          selected tab is the only tabbable one (roving tabindex); Tab itself leaves the strip —
          focus is never trapped. For panels that fetch or render expensively, pass
          <code class="text-accent">activation="manual"</code> on the root: arrows move focus only,
          Enter/Space commit. Background panels are <code class="text-accent">hidden</code> — inert,
          not just invisible.
        </p>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          empty value ('' = nothing selected) is a deliberate progressive-enhancement compromise:
          the SSR HTML renders every trigger tabbable so JS-off users can still reach the tabs, and
          hydration trims the tab stops to exactly the first enabled one.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tabs-vertical" data-reveal="" use:reveal>
    <SectionCard
      family="tabs-vertical"
      headerRegion="tabs-vertical"
      eyebrow="demo"
      title="Vertical — the sidebar shape"
      summary="orientation=vertical moves the bar to the right edge and swaps the arrow axis to ↑/↓. The panels are ordinary subtree — any layout receives them."
    >
      <div class="max-w-xl">
        <Tabs value="overview">
          <div class="flex gap-6">
            <TabsList orientation="vertical" class="min-w-36">
              <TabsTrigger value="overview">overview</TabsTrigger>
              <TabsTrigger value="activity">activity <Badge class="ml-1">3</Badge></TabsTrigger>
              <TabsTrigger value="keys">keys</TabsTrigger>
            </TabsList>
            <div class="min-w-0 flex-1 py-1">
              <TabsContent value="overview">
                <p class="text-[13px] leading-6">The project front page: what it is, where it lives.</p>
              </TabsContent>
              <TabsContent value="activity">
                <p class="text-[13px] leading-6">Three events this week — pushes, releases, audits.</p>
              </TabsContent>
              <TabsContent value="keys">
                <p class="text-[13px] leading-6">Deploy keys, rotated quarterly.</p>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      <div class="mt-5">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>
  </div>
</div>
