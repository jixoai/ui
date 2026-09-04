<!--
  Docs page for the anchor family (composition-first, 2026-08-25).
  Intents: hero summary, one ComponentCanvas whose sections carry the
  fragment ids the composed rail spies on (THIS PAGE is the demo),
  usage sample. Structure follows the list-item exemplar; the
  component family is untouchable from here.
-->
<script lang="ts">
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import AnchorItem from '$lib/ui/anchor/anchor-item.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import anchorSource from '$lib/ui/anchor/anchor.svelte?raw';
  import anchorItemSource from '$lib/ui/anchor/anchor-item.svelte?raw';

  const close = '</' + 'script>';

  // THIS PAGE is the demo: the sections below carry the fragment ids both
  // rails watch — the anchor tracks the very content you are reading
  const usage = `<script lang="ts">
  import Anchor from '@ui/anchor/anchor.svelte';
  import AnchorItem from '@ui/anchor/anchor-item.svelte';
${close}

<Anchor label="on this page">
  <AnchorItem href="#what">what it does</AnchorItem>
  <AnchorItem href="#pick">the line pick</AnchorItem>
</Anchor>

<!-- the spy derives its targets from the root's OWN DOM (child
     a[href^="#"]) — no registration; offset (default 96) moves the
     pick line below sticky headers -->`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/anchor/anchor.svelte', content: anchorSource },
    { name: 'registry/files/ui/anchor/anchor-item.svelte', content: anchorItemSource },
    { name: 'src/lib/ui/anchor-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Anchor · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai anchor family: a nav of real fragment links composed as AnchorItem parts — native navigation, native smooth scrolling, and a DOM-delegated scrollspy that derives its targets from the root's own DOM and marks aria-current=location."
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
      eyebrow="registry:ui · General"
      title="anchor — real links, read-only spy"
      summary="The heading-anchor rail (antd's Anchor) as a composed family: a nav of REAL fragment links (AnchorItem parts), native navigation, native smooth scrolling through the theme's scroll-behavior — with JS only READING the scroll position (rAF-throttled) to mark aria-current=location. The spy is DOM-delegated: targets derive from the root's own child a[href^='#'] on every read, so keyed reorders and conditional items cannot corrupt it. This page is the live demo twice over: the page rail on the right is a toc, while the anchor beside the workbench tracks the very sections you are reading."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">real fragment links</span>
        <span class="pill">aria-current=location</span>
        <span class="pill">DOM-delegated spy</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <div class="grid gap-8 min-[1024px]:grid-cols-[1fr_200px]">
      <div class="flex min-w-0 flex-col gap-8">
        <ComponentCanvas
          title="anchor"
          description="Scroll the band below — the anchor rail (right on desktop, above on mobile) marks the section containing the viewport-top line, and the page ToC tracks the same fragments."
          sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/anchor/anchor.svelte"
          files={canvasFiles}
          stage="fill"
        >
          <section id="anchor-what" data-region="anchor-what" class="flex flex-col gap-3">
            <h3 data-doc-demo-heading="" class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">what it does</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              A composed list of in-page anchors: clicking navigates the fragment natively (smooth via
              scroll-behavior), hovering and focusing behave like any link. The root owns ONE
              behavior beyond the landmark: the active-link pick.
            </p>
          </section>
          <section id="anchor-pick" data-region="anchor-pick" class="mt-8 flex flex-col gap-3">
            <h3 data-doc-demo-heading="" class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">the line pick</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              The pick is the LAST target whose top sits at or past the viewport-top line (offset
              prop, default 96px for sticky headers) — the toc engine's downward-resolution rule,
              simplified. Targets come from the root's own DOM: every child a[href^="#"] joins the
              spy, no registration, no order dependence.
            </p>
          </section>
          <section id="anchor-vs-toc" data-region="anchor-vs-toc" class="mt-8 flex flex-col gap-3">
            <h3 data-doc-demo-heading="" class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">anchor vs toc</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              Where the ToC measures IoM weights and draws the rule tracker, anchor answers the
              simpler which-section question with zero coupling beyond target ids existing.
            </p>
            <!-- depth: every section must be able to cross the pick line -->
            {#each Array(14) as _, i (i)}
              <p class="text-[12.5px] leading-6 text-muted-foreground/70">
                filler depth {i + 1} — keeps the last section reachable past the offset line
              </p>
            {/each}
          </section>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the anchor is read-only — no controls to wire. Scroll and watch the in-workbench
              rail mark the section crossing the viewport-top line; the page ToC on the right
              tracks the same fragments with the full engine. <code>offset</code>
              (default 96px) moves the pick line below sticky headers.
            </PlayHelp>
          </PlayFields>
        {/snippet}
        </ComponentCanvas>
      </div>
      <aside class="jx-anchor-demo-aside">
        <Anchor label="on this page">
          <AnchorItem href="#anchor-what">what it does</AnchorItem>
          <AnchorItem href="#anchor-pick">the line pick</AnchorItem>
          <AnchorItem href="#anchor-vs-toc">anchor vs toc</AnchorItem>
        </Anchor>
      </aside>
    </div>
  </div>

  <div id="anchor-usage" data-reveal="">
    <SectionCard
      family="anchor-usage"
      headerRegion="anchor-usage"
      eyebrow="composition"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="Composed navigation family" summary="Anchor owns the navigation landmark and read-only scroll spy; AnchorItem owns each real fragment link.">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="border border-border/60 p-3"><p class="font-nav text-sm">Anchor</p><p class="mt-1 text-xs text-muted-foreground">Landmark, density scope, label, and viewport pick line.</p></div>
        <div class="border border-border/60 p-3"><p class="font-nav text-sm">AnchorItem</p><p class="mt-1 text-xs text-muted-foreground">Fragment link with active location styling.</p></div>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard eyebrow="usage" title="Compose fragment links" summary="Place AnchorItem elements in Anchor and point each href at an existing page fragment.">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard eyebrow="a11y" title="Navigation landmarks" summary="Anchor uses native links and keeps the active section visible to assistive technology without replacing browser navigation.">
      <A11yTable
        keys={[{ key: 'Tab', action: 'Move through the fragment links' }, { key: 'Enter', action: 'Navigate to the target fragment' }]}
        aria={[{ name: 'aria-label', value: "'on this page' by default", description: 'Names the navigation landmark.' }, { name: 'aria-current', value: "'location' on active item", description: 'Announces the section selected by the scroll spy.' }, { name: 'href', value: '#fragment', description: 'Preserves native fragment navigation.' }]}
      />
    </SectionCard>
  </div>

  <div id="theming" data-reveal="">
    <SectionCard eyebrow="theming" title="Density-aware rail" summary="Both root spacing and link geometry consume inherited density tokens, preserving the pick rail across scopes.">
      <div class="flex flex-col gap-5">
        <DensityDemo>
          <div class="border-l border-border"><a class="flex min-h-[var(--jx-hit)] items-center border-l-2 border-l-primary px-[var(--jx-inset)] font-nav text-[length:var(--jx-text)] leading-[var(--jx-line)]" href="#types">types</a></div>
        </DensityDemo>
        <TokenTable tokens={[
          { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Minimum fragment-link target height.' },
          { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density', description: 'AnchorItem inline padding.' },
          { name: '--jx-stack', default: '4 / 4 / 8 / 8px', source: 'density', description: 'Vertical rail spacing.' },
          { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density', description: 'AnchorItem label size.' },
          { name: '--jx-line', default: '16 / 18 / 20 / 24px', source: 'density', description: 'AnchorItem label line height.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard eyebrow="api" title="Props" summary="The root carries landmark and pick-line configuration; each item is an ordinary composable anchor.">
      <div class="flex flex-col gap-6">
        <PropsTable title="Anchor" props={[
          { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' },
          { name: 'label', type: 'string', default: "'on this page'", description: 'Accessible navigation landmark name.' },
          { name: 'offset', type: 'number', default: '96', description: 'Viewport-top pick line in pixels.' },
          { name: 'children', type: 'Snippet', required: true, description: 'AnchorItem content.' },
        ]} />
        <PropsTable title="AnchorItem" props={[
          { name: 'href', type: 'string', required: true, description: 'Target fragment such as #section-id.' },
          { name: 'child', type: 'Snippet', default: '—', description: 'Optional replacement anchor element.' },
          { name: 'children', type: 'Snippet', default: '—', description: 'Visible link label.' },
        ]} />
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<style>
  .jx-anchor-demo-aside {
    position: sticky;
    top: 6.5rem;
    align-self: start;
  }
  @media (max-width: 1023px) {
    .jx-anchor-demo-aside {
      position: static;
    }
  }
</style>
