<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Tabs from '$lib/ui/tabs/tabs.svelte';
  import TabsContent from '$lib/ui/tabs/tabs-content.svelte';
  import TabsList from '$lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '$lib/ui/tabs/tabs-trigger.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tabsSource from '$lib/ui/tabs/tabs.svelte?raw';
  import tabsListSource from '$lib/ui/tabs/tabs-list.svelte?raw';
  import tabsTriggerSource from '$lib/ui/tabs/tabs-trigger.svelte?raw';
  import tabsContentSource from '$lib/ui/tabs/tabs-content.svelte?raw';

  // ToC outline: the workbench band, the indicator gallery, trigger
  // anatomy, the layouts, the vertical pair, the snippet override — then
  // the house template sections, in page order.

  // Playground protocol: the page owns the snapshot + reset; the echo
  // footer replaces the hand-written "value / last change" caption (PAGE_STANDARDS
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

<!-- the indicator: one shared element, measured to the active trigger
     and animated between positions — five materials, or none -->
<TabsList indicator="pill">…</TabsList>
<TabsList indicator="glass" layout="grow">…</TabsList>

<!-- trigger anatomy: an icon lane replaces its side's padding;
     icon-only needs aria-label; stack is the Material column -->
<TabsTrigger value="code">
  {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>{/snippet}
  code
</TabsTrigger>
<TabsTrigger value="cli" aria-label="cli">
  {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>{/snippet}
</TabsTrigger>
<TabsTrigger value="overview" stack>
  {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 9v12h14V9"/></svg>{/snippet}
  overview
</TabsTrigger>

<!-- vertical: arrows switch axis, the bar moves to the right edge -->
<Tabs bind:value>
  <TabsList orientation="vertical" indicator="pill">…</TabsList>
  …
</Tabs>`;

  // the snippet override sample: the consumer owns the paint, the engine
  // owns the wrapper + the measured geometry (see #custom-indicator)
  const customIndicatorUsage = `<TabsList>
  {#snippet indicator(geo)}
    <!-- your paint, inside the engine-owned wrapper (x/y/w/h are px) -->
    <div
      class="h-full w-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
      style="opacity: {Math.min(1, 0.55 + geo.w / 480)}"
    ></div>
  {/snippet}
  <TabsTrigger value="nodes">nodes</TabsTrigger>
  <TabsTrigger value="edges">edges</TabsTrigger>
  <TabsTrigger value="paths">paths</TabsTrigger>
</TabsList>`;

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
    content="The jixoai tabs: the WAI-ARIA APG tabs pattern, composition-first — four family files sharing one context value — riding an indicator engine: one shared element measured to the active trigger and animated between positions, painted in five materials (line · pill · outline · glass · liquid) or your own snippet, with trigger anatomy (icon lanes, icon-only, stack) and inline/grow/scroll/wrap layouts — every horizontal strip degrading to a scroll run with on-demand chevrons when content outgrows the container. Keyboard surface unchanged: automatic activation, roving tabindex, deterministic id pairing, hidden background panels."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: aside precedes the content in the DOM — desktop sticky right
       column, mobile the glass single-row bar under the scaffold header -->

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · ARIA"
      title="tabs — one value, four files, any layout"
      summary="The WAI-ARIA tabs pattern, composition-first: the root owns only the selected value and hands it to the family through context — tablist, triggers and panels lay out anywhere in the subtree. Selection paint lives in the indicator engine: a single shared element measured to the active trigger and translated between positions, in five materials — line, pill, outline, glass, liquid — or replaced entirely by your own snippet paint. Triggers carry the Material grammar (icon lanes, icon-only, stacked columns) and the strip lays out inline, grow, scroll or wrap — every horizontal strip degrading to a hidden-scrollbar scroll run with on-demand ::scroll-button() chevrons when content outgrows the container. The keyboard contract is untouched: automatic activation (focus moves select), roving tabindex, deterministic trigger/panel ids, and hidden — attribute, not CSS — background panels."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">APG tablist contract</span>
        <span class="pill">sliding indicator · 5 materials</span>
        <span class="pill">icon lanes · icon-only · stack</span>
        <span class="pill">inline · grow · scroll · wrap</span>
      </div>
    </SectionCard>
  </div>

  <div id="tabs-demo" data-region="tabs-demo" data-family="tabs-demo" data-reveal="">
    <ComponentCanvas
      title="tabs"
      description="Tab across the strip: arrows walk and select, Home/End jump the ends, and the disabled trigger is skipped. The echo footer surfaces the bound value and the last change — onchange fires either way."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tabs.svelte"
      files={canvasFiles}
      stage="fill"
      onreset={resetCanvas}
      output={[
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
        <PlayFields>
          <PlayHelp>
            keyboard: ←/→ walk and select, Home/End jump the ends (RTL flips the axis reading). The
            selected tab is the only tabbable one (roving tabindex); Tab itself leaves the strip —
            focus is never trapped. For panels that fetch or render expensively, pass
            <code>activation="manual"</code> on the root: arrows move focus only,
            Enter/Space commit. Background panels are <code>hidden</code> — inert,
            not just invisible.
          </PlayHelp>
          <PlayHelp>
            empty value ('' = nothing selected) is a deliberate progressive-enhancement compromise:
            the SSR HTML renders every trigger tabbable so JS-off users can still reach the tabs, and
            hydration trims the tab stops to exactly the first enabled one.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="indicators" data-reveal="">
    <SectionCard
      family="indicators"
      headerRegion="indicators"
      eyebrow="indicator engine"
      title="The indicator is the point"
      summary="Selection paint lives in exactly one place: a single shared indicator element, measured to the active trigger and translated between positions — 240ms cubic-bezier(0.2, 0, 0, 1) travel, no travel at all under prefers-reduced-motion, and a ResizeObserver re-fit that lands without animation when triggers resize or the strip reflows. The triggers stay restrained (text-foreground emphasis only) while the material carries the paint: line is the 2px var(--primary) bar riding the list edge — the default, now sliding — pill a tonal translucent fill hugging the trigger, outline a 1px box for the segmented feel, glass a backdrop-filter blur + saturate frosted pill, and liquid glass plus an SVG feTurbulence/feDisplacementMap warp through the pill. Engines without url() backdrop-filters degrade liquid to glass — same geometry, honest paint."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">line</span>
          <Tabs value="preview">
            <TabsList>
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="raw">raw</TabsTrigger>
              <TabsTrigger value="diff">diff</TabsTrigger>
              <TabsTrigger value="audit">audit</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">the 2px var(--primary) bar riding the list edge — the default, now sliding.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">pill</span>
          <Tabs value="build">
            <TabsList indicator="pill">
              <TabsTrigger value="build">build</TabsTrigger>
              <TabsTrigger value="ship">ship</TabsTrigger>
              <TabsTrigger value="test">test</TabsTrigger>
              <TabsTrigger value="audit">audit</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">a tonal translucent fill hugging the active trigger.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">outline</span>
          <Tabs value="day">
            <TabsList indicator="outline">
              <TabsTrigger value="day">day</TabsTrigger>
              <TabsTrigger value="week">week</TabsTrigger>
              <TabsTrigger value="month">month</TabsTrigger>
              <TabsTrigger value="all">all</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">a 1px outline box — the segmented-control feel.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">glass</span>
          <div class="rounded-md bg-[linear-gradient(115deg,oklch(0.8_0.15_var(--brand-hue)),oklch(0.8_0.14_260),oklch(0.84_0.13_145))] p-3">
            <Tabs value="frost">
              <TabsList indicator="glass">
                <TabsTrigger value="frost">frost</TabsTrigger>
                <TabsTrigger value="ice">ice</TabsTrigger>
                <TabsTrigger value="mist">mist</TabsTrigger>
                <TabsTrigger value="vapor">vapor</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <span class="text-muted-foreground text-[12px]">a frosted pill — backdrop blur + saturate, staged here over three brand hues.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">liquid</span>
          <div class="rounded-md bg-[linear-gradient(115deg,oklch(0.8_0.14_260),oklch(0.8_0.15_var(--brand-hue)),oklch(0.84_0.13_145))] p-3">
            <Tabs value="flow">
              <TabsList indicator="liquid">
                <TabsTrigger value="flow">flow</TabsTrigger>
                <TabsTrigger value="drip">drip</TabsTrigger>
                <TabsTrigger value="wave">wave</TabsTrigger>
                <TabsTrigger value="pool">pool</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <span class="text-muted-foreground text-[12px]">glass + an SVG displacement warp through the pill — degrades to glass where url() backdrop-filters are unsupported.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">none</span>
          <Tabs value="plain">
            <TabsList indicator="none">
              <TabsTrigger value="plain">plain</TabsTrigger>
              <TabsTrigger value="bare">bare</TabsTrigger>
              <TabsTrigger value="calm">calm</TabsTrigger>
              <TabsTrigger value="still">still</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">no paint at all — the selected trigger's own emphasis carries the selection.</span>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="anatomy" data-reveal="">
    <SectionCard
      family="anatomy"
      headerRegion="anatomy"
      eyebrow="anatomy"
      title="Trigger anatomy — the Material grammar"
      summary="A trigger is a text label by default. icon adds the leading lane, iconEnd the trailing lane, stack flips to the Material icon-over-label column, and the icon-only form passes just the snippet plus aria-label. Icons ride the slot-vs-padding law: the lane replaces its side's padding, so an icon rides the edge at half the inset instead of widening the hit box — and the icon-only trigger demands aria-label, because an accessible name is never optional. The selected trigger keeps its text-foreground emphasis under every anatomy."
    >
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">text — default</span>
          <Tabs value="preview">
            <TabsList>
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="raw">raw</TabsTrigger>
              <TabsTrigger value="diff">diff</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">the bare micro-label — all a tab usually needs.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">leading icon</span>
          <Tabs value="code">
            <TabsList>
              <TabsTrigger value="code">
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>{/snippet}
                code
              </TabsTrigger>
              <TabsTrigger value="terminal">
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>{/snippet}
                terminal
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">the icon lane replaces the start padding — the glyph rides the edge.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">trailing icon</span>
          <Tabs value="open">
            <TabsList>
              <TabsTrigger value="open">
                open
                {#snippet iconEnd()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>{/snippet}
              </TabsTrigger>
              <TabsTrigger value="source">
                source
                {#snippet iconEnd()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>{/snippet}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">iconEnd mirrors the lane on the far side — disclosure glyphs live here.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">icon-only</span>
          <Tabs value="term">
            <TabsList>
              <TabsTrigger value="term" aria-label="terminal">
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></svg>{/snippet}
              </TabsTrigger>
              <TabsTrigger value="watch" aria-label="watch">
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>{/snippet}
              </TabsTrigger>
              <TabsTrigger value="src" aria-label="source">
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>{/snippet}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">the snippet is the glyph; aria-label is the name — never skip it.</span>
        </div>
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">stack</span>
          <Tabs value="overview">
            <TabsList>
              <TabsTrigger value="overview" stack>
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>{/snippet}
                overview
              </TabsTrigger>
              <TabsTrigger value="activity" stack>
                {#snippet icon()}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{/snippet}
                activity
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">the Material stacked tab — icon over label in a centered column.</span>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="layouts" data-reveal="">
    <SectionCard
      family="layouts"
      headerRegion="layouts"
      eyebrow="layouts"
      title="Layouts — inline, grow, scroll, wrap"
      summary="The strip's geometry is a prop, and it composes with every material. inline (the default) sizes the strip to its content. grow stretches every trigger to an equal share of the full width — the Material full-bleed top bar. scroll declares a horizontal overflow run; wrap flows multiple rows instead of scrolling. Overflow is a contract, not a memory: every horizontal strip degrades to a hidden-scrollbar scroll run the moment its content outgrows the container, and ::scroll-button() chevrons overlay the inline edges on demand — only toward the direction that can still travel, fading scroll-driven as the run approaches its boundary (the glyphs are css vars: override them per context). Travel is smooth and settles on triggers by proximity snap. Grow, scroll and wrap accept any indicator — the demos stage grow with pill and scroll with the default line on purpose; wrap rides the default line too, where each row underlines its own active tab."
    >
      <div class="flex w-full max-w-2xl flex-col gap-7">
        <div class="flex flex-col gap-2.5">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">inline — default</span>
          <Tabs value="preview">
            <TabsList>
              <TabsTrigger value="preview">preview</TabsTrigger>
              <TabsTrigger value="raw">raw</TabsTrigger>
              <TabsTrigger value="diff">diff</TabsTrigger>
              <TabsTrigger value="audit">audit</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">intrinsic widths — the strip is exactly its content.</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">grow</span>
          <Tabs value="editor">
            <TabsList layout="grow" indicator="pill" class="w-full max-w-md">
              <TabsTrigger value="editor">editor</TabsTrigger>
              <TabsTrigger value="review">review</TabsTrigger>
              <TabsTrigger value="ship">ship</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">equal-width stretched triggers — the Material full-bleed bar, staged with the pill material.</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">scroll</span>
          <Tabs value="gamma">
            <TabsList layout="scroll" class="max-w-md">
              <TabsTrigger value="alpha">alpha</TabsTrigger>
              <TabsTrigger value="beta">beta</TabsTrigger>
              <TabsTrigger value="gamma">gamma</TabsTrigger>
              <TabsTrigger value="delta">delta</TabsTrigger>
              <TabsTrigger value="epsilon">epsilon</TabsTrigger>
              <TabsTrigger value="zeta">zeta</TabsTrigger>
              <TabsTrigger value="eta">eta</TabsTrigger>
              <TabsTrigger value="theta">theta</TabsTrigger>
              <TabsTrigger value="iota">iota</TabsTrigger>
              <TabsTrigger value="kappa">kappa</TabsTrigger>
              <TabsTrigger value="lambda">lambda</TabsTrigger>
              <TabsTrigger value="mu">mu</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">twelve triggers in the overflow run — the scrollbar is hidden, the chevron fades scroll-driven toward the boundary it reaches, the walk is not.</span>
        </div>
        <div class="flex flex-col gap-2.5">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">wrap</span>
          <Tabs value="gamma">
            <TabsList layout="wrap" class="max-w-sm">
              <TabsTrigger value="alpha">alpha</TabsTrigger>
              <TabsTrigger value="beta">beta</TabsTrigger>
              <TabsTrigger value="gamma">gamma</TabsTrigger>
              <TabsTrigger value="delta">delta</TabsTrigger>
              <TabsTrigger value="epsilon">epsilon</TabsTrigger>
              <TabsTrigger value="zeta">zeta</TabsTrigger>
              <TabsTrigger value="eta">eta</TabsTrigger>
              <TabsTrigger value="theta">theta</TabsTrigger>
              <TabsTrigger value="iota">iota</TabsTrigger>
              <TabsTrigger value="kappa">kappa</TabsTrigger>
              <TabsTrigger value="lambda">lambda</TabsTrigger>
              <TabsTrigger value="mu">mu</TabsTrigger>
            </TabsList>
          </Tabs>
          <span class="text-muted-foreground text-[12px]">twelve triggers flowing rows — no scroll run, and the line material underlines each row's own active tab.</span>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="tabs-vertical" data-reveal="">
    <SectionCard
      family="tabs-vertical"
      headerRegion="tabs-vertical"
      eyebrow="demo"
      title="Vertical — the sidebar shape"
      summary="orientation=vertical swaps the arrow axis to ↑/↓ and moves the indicator to the right edge — line keeps the Material edge bar, pill hugs the active trigger instead. The panels are ordinary subtree — any layout receives them."
    >
      <div class="grid gap-6 md:grid-cols-2">
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">line — the bar rides the right edge</span>
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
        <div class="flex flex-col gap-3 border border-border/60 p-4">
          <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">pill — the fill hugs the trigger</span>
          <Tabs value="general">
            <div class="flex gap-6">
              <TabsList orientation="vertical" indicator="pill" class="min-w-36">
                <TabsTrigger value="general">general</TabsTrigger>
                <TabsTrigger value="members">members</TabsTrigger>
                <TabsTrigger value="billing">billing</TabsTrigger>
                <TabsTrigger value="danger" disabled>danger</TabsTrigger>
              </TabsList>
              <div class="min-w-0 flex-1 py-1">
                <TabsContent value="general">
                  <p class="text-[13px] leading-6">Workspace name, default branch, timezone.</p>
                </TabsContent>
                <TabsContent value="members">
                  <p class="text-[13px] leading-6">Six seats, two pending invitations.</p>
                </TabsContent>
                <TabsContent value="billing">
                  <p class="text-[13px] leading-6">Team plan, renews on the first.</p>
                </TabsContent>
                <TabsContent value="danger">
                  <p class="text-[13px] leading-6">Transfer or delete — gated behind a confirmation.</p>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
      <div class="mt-5">
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </div>
    </SectionCard>
  </div>

  <div id="custom-indicator" data-reveal="">
    <SectionCard
      family="custom-indicator"
      headerRegion="custom-indicator"
      eyebrow="snippet override"
      title="Own the paint, not the geometry"
      summary="indicator also accepts a snippet block: pass an indicator(geo) children block and you replace the PAINT while the engine keeps the absolutely-positioned wrapper, the measurement, the 240ms travel and the ResizeObserver re-fit. The snippet receives the live geometry — x, y, w, h and orientation, in list-local pixels — so the paint can react to where the indicator sits and how wide the active trigger is. Here a gradient bar whose opacity densifies as the active trigger narrows; the wrapper it fills is the engine's decision, never yours."
    >
      <div class="flex max-w-xl flex-col gap-4">
        <Tabs value="nodes">
          <TabsList>
            {#snippet indicator(geo)}
              <div
                class="h-full w-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
                style="opacity: {Math.min(1, 0.55 + geo.w / 480)}"
              ></div>
            {/snippet}
            <TabsTrigger value="nodes">nodes</TabsTrigger>
            <TabsTrigger value="edges">edges</TabsTrigger>
            <TabsTrigger value="paths">paths</TabsTrigger>
            <TabsTrigger value="clusters">clusters</TabsTrigger>
          </TabsList>
        </Tabs>
        <CodeBlock code={customIndicatorUsage} lang="svelte" meta="indicator snippet" />
      </div>
    </SectionCard>
  </div>

  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Activation and orientation" summary="Tabs use automatic activation by default; vertical lists change the navigation axis."><div class="grid gap-4 md:grid-cols-2"><Tabs value="one"><TabsList><TabsTrigger value="one">automatic</TabsTrigger></TabsList><TabsContent value="one">Focus selects this panel.</TabsContent></Tabs></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable keys={[{ key: 'Arrow keys', action: 'Move between enabled tabs.' }, { key: 'Home / End', action: 'Move to the first or last tab.' }, { key: 'Enter / Space', action: 'Select a focused tab in manual mode.' }]} aria={[{ name: 'role', value: 'tablist, tab, tabpanel', description: 'Exposes the APG tabs pattern.' }, { name: 'aria-selected', value: 'boolean', description: 'Marks the selected trigger.' }, { name: 'aria-controls', value: 'panel id', description: 'Pairs each trigger with its panel.' }, { name: 'aria-label', value: 'icon-only triggers', description: 'The accessible name when the snippet is the only content — the indicator materials stay decorative.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Tabs value="token"><TabsList><TabsTrigger value="token">tab</TabsTrigger></TabsList><TabsContent value="token">panel</TabsContent></Tabs></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-hit', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-tabs-liquid-bf', default: 'engine-composed', source: 'liquid material', description: 'The composed backdrop-filter behind the liquid pill — the per-instance SVG url() displacement over the frosted blur/saturate base; engines without url() backdrop-filters fall back to the glass paint.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="API" summary="Three halves of one family: the root owns the value, the list owns the keyboard walk and the indicator engine, the trigger owns the anatomy. The keyboard surface is unchanged by every row below."><div class="flex flex-col gap-6"><PropsTable title="Tabs props" props={[{ name: 'value', type: 'string', default: "''", description: 'Selected tab value.', bindable: true }, { name: 'activation', type: "'automatic' | 'manual'", default: "'automatic'", description: 'Selection behavior while moving focus.' }, { name: 'onchange', type: '(value: string) => void', description: 'Receives selection changes.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /><PropsTable title="TabsList props" props={[{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Axis of travel: horizontal ←/→, vertical ↑/↓ with the indicator on the right edge.' }, { name: 'indicator', type: "'line' | 'pill' | 'outline' | 'glass' | 'liquid' | 'none' | Snippet", default: "'line'", description: 'The selection paint — one shared element measured to the active trigger and animated between positions. A snippet block (indicator(geo), receiving x/y/w/h/orientation in list-local px) replaces the paint while the engine keeps the measured wrapper.' }, { name: 'layout', type: "'inline' | 'grow' | 'scroll' | 'wrap'", default: "'inline'", description: 'inline is content-sized; grow stretches triggers to equal widths (the Material full-bleed bar); scroll declares a horizontal overflow run; wrap flows rows instead of scrolling. Every horizontal strip degrades to a hidden-scrollbar scroll run when content outgrows the container, with on-demand ::scroll-button() chevrons overlaying the open direction. Composes with any material.' }, { name: 'class', type: 'string', default: "''", description: 'Appended to the composed classes.' }, { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the tablist element.' }]} /><PropsTable title="TabsTrigger props" props={[{ name: 'value', type: 'string', default: '—', description: 'The tab identity — pairs with the same value on a TabsContent.', required: true }, { name: 'disabled', type: 'boolean', default: 'false', description: 'Skipped by the arrow walk and the roving tab stop.' }, { name: 'icon', type: 'Snippet', default: '—', description: 'Leading icon lane — replaces the start padding (the slot-vs-padding law); with no label text this is the icon-only form.' }, { name: 'iconEnd', type: 'Snippet', default: '—', description: 'Trailing icon lane — replaces the end padding.' }, { name: 'stack', type: 'boolean', default: 'false', description: 'The Material stacked tab: icon over label in a centered column.' }, { name: 'class', type: 'string', default: "''", description: 'Appended to the composed classes.' }, { name: '...rest', type: 'HTMLButtonAttributes', default: 'spread', description: 'Every other button attribute rides through — aria-label lands here for icon-only triggers.' }]} /></div></SectionCard></div>
  </div>
</div>
