<script lang="ts">
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import anchorSource from '$lib/ui/anchor/anchor.svelte?raw';

  const close = '</' + 'script>';

  // ToC outline: the page-level rail tracks the three demo sections living
  // inside the canvas stage — the same fragments the Anchor demo rail spies
  // on (THIS PAGE is the demo, twice over).

  const usage = `<script lang="ts">
  import Anchor from '@ui/anchor.svelte';
${close}

<Anchor label="on this page" items={[
  { href: '#what', label: 'what it does' },
  { href: '#pick', label: 'the line pick' },
]} />

<!-- offset moves the pick line down past sticky headers (default 96);
     targets just need fragment ids — no data attributes, no registration -->`;

  // THIS PAGE is the demo: the sections below carry the fragment ids both
  // rails watch — the anchor tracks the very content you are reading
  const items = [
    { href: '#anchor-what', label: 'what it does' },
    { href: '#anchor-pick', label: 'the line pick' },
    { href: '#anchor-vs-toc', label: 'anchor vs toc' },
  ];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/anchor.svelte', content: anchorSource },
    { name: 'src/lib/ui/anchor-usage.svelte', content: usage },
  ];
</script>

<svelte:head>
  <title>Anchor · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai anchor: the heading-anchor link list — real fragment links, native smooth scrolling, JS only reading the scroll position to mark aria-current. The light sibling of toc."
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
      eyebrow="registry:ui · antd 裁决"
      title="anchor — real links, read-only spy"
      summary="The heading-anchor link list (antd's Anchor) as the LIGHT sibling of toc.svelte: nav > ol of REAL fragment links — native navigation, native smooth scrolling through the theme's scroll-behavior — with JS only READING the scroll position (rAF-throttled) to mark aria-current=location. This page is the live demo twice over: the page rail on the right is a toc, while the anchor inside the workbench tracks the very sections you are reading."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">real fragment links</span>
        <span class="pill">aria-current=location</span>
        <span class="pill">read-only spy</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <div class="grid gap-8 min-[1024px]:grid-cols-[1fr_200px]">
      <div class="flex min-w-0 flex-col gap-8">
        <ComponentCanvas
          title="anchor"
          description="Scroll the band below — the anchor rail (right on desktop, above on mobile) marks the section containing the viewport-top line, and the page ToC tracks the same fragments."
          sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/anchor.svelte"
          files={canvasFiles}
        >
          <section id="anchor-what" data-region="anchor-what" class="flex flex-col gap-3">
            <h3 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">what it does</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              A plain list of in-page anchors: clicking navigates the fragment natively (smooth via
              scroll-behavior), hovering and focusing behave like any link. The component owns ONE
              behavior beyond markup: the active-link pick.
            </p>
          </section>
          <section id="anchor-pick" data-region="anchor-pick" class="mt-8 flex flex-col gap-3">
            <h3 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">the line pick</h3>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              The pick is the LAST target whose top sits at or past the viewport-top line (offset
              prop, default 96px for sticky headers) — the toc engine's downward-resolution rule,
              simplified. Before the first target, nothing is current.
            </p>
          </section>
          <section id="anchor-vs-toc" data-region="anchor-vs-toc" class="mt-8 flex flex-col gap-3">
            <h3 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.15rem]">anchor vs toc</h3>
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
            <div class="jx-play-fields">
              <p class="jx-play-help">
                the anchor is read-only — no controls to wire. Scroll and watch the in-workbench
                rail mark the section crossing the viewport-top line; the page ToC on the right
                tracks the same fragments with the full engine. <code class="text-accent">offset</code>
                (default 96px) moves the pick line below sticky headers.
              </p>
            </div>
          {/snippet}
        </ComponentCanvas>
      </div>
      <aside class="jx-anchor-demo-aside">
        <Anchor {items} label="on this page" />
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
