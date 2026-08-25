<!--
  Docs page for the toc family (2026-08-25, composition-first-apis).
  Intents:
  1. Hero summary from the registry catalog (CATALOG lookup, fail-loud).
  2. The page rail is the LIVE manual-mode demo (composed TocList tree,
     scrollspy over the page's own sections).
  3. One ComponentCanvas: AUTO outline mode deriving from the workbench
     article's headings (zero handwritten ids) + the composed tree shape.
  4. Usage CodeBlock: both modes in one copyable sample.
  Constraint: docs only — the component family itself is untouchable.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { CATALOG } from '$lib/catalog';
  import Toc, { TocList, TocItem, TocLink } from '$lib/ui/toc/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tocSource from '$lib/ui/toc/toc.svelte?raw';
  import tocListSource from '$lib/ui/toc/toc-list.svelte?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'toc');
  if (!entry) {
    throw new Error('catalog miss: "toc" has no registry meta — fix registry.json');
  }

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import Toc, { TocList, TocItem, TocLink } from '@ui/toc/index';
${close}

<!-- AUTO: derive from the content's headings (SSR paints the rail
     shell; links arrive on hydrate — the declared exception) -->
<aside class="jx-toc-aside">
  <Toc outline={{ root: 'main' }} title="on this page" />
</aside>

<!-- MANUAL: the composed list tree — SSR-complete; nesting is a
     TocList inside a TocItem, anchors never nest -->
<Toc>
  <TocList>
    <TocItem>
      <TocLink href="#setup">Setup</TocLink>
      <TocList>
        <TocItem><TocLink href="#deps">deps</TocLink></TocItem>
      </TocList>
    </TocItem>
  </TocList>
</Toc>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/toc/toc.svelte', content: tocSource },
    { name: 'registry/files/ui/toc/toc-list.svelte', content: tocListSource },
    { name: 'src/lib/ui/toc-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>ToC · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toc family: the rule-tracker reading rail composed from TocList/TocItem/TocLink parts — auto outline mode derives the tree from headings (SSR rail shell, links on hydrate), manual mode is a composed list tree. IoM weights + line pick scrollspy stay root behavior."
  />
</svelte:head>

<div
  id="toc-demo-root"
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail — the LIVE manual-mode demo: a composed tree whose links
       target this page's sections; the root spies through the hrefs -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc title="on this page" scrollRoot=".jx-shell-body">
      <TocList>
        <TocItem>
          <TocLink href="#toc-what">what it tracks</TocLink>
          <TocList>
            <TocItem><TocLink href="#toc-weights">IoM weights</TocLink></TocItem>
            <TocItem><TocLink href="#toc-line">the line pick</TocLink></TocItem>
          </TocList>
        </TocItem>
        <TocItem><TocLink href="#toc-anatomy">two modes, one family</TocLink></TocItem>
        <TocItem><TocLink href="#toc-engine">the engine</TocLink></TocItem>
        <TocItem><TocLink href="#toc-usage">usage</TocLink></TocItem>
      </TocList>
    </Toc>
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · engine"
      title="toc — the rule tracker rail"
      summary={entry.summary}
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">IoM weights</span>
        <span class="pill">line pick</span>
        <span class="pill">TocList / TocItem / TocLink</span>
        <span class="pill">auto outline + composed tree</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: the tracked article lives on the stage; the canvas demo
       runs AUTO outline mode over its heading tree -->
  <div data-reveal="">
    <ComponentCanvas
      title="toc"
      description="Two live rails: the page rail on the right is the MANUAL composed tree (links target this page's sections); the one below runs AUTO outline mode — it derives its links from the article's headings on hydrate, zero handwritten ids. Scroll and watch both: nodes fill by IoM weight, the bold marker is the viewport-top line pick."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/toc/toc.svelte"
      stage="start"
      files={canvasFiles}    >
      <div class="grid w-full gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_14rem]">
        <article id="toc-workbench-article" class="flex w-full min-w-0 flex-col gap-8">
          <div id="toc-what" class="flex flex-col gap-4">
            <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">what it tracks</h2>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              Scroll this page and watch the rails: nodes fill proportionally to how much of their
              block occupies the viewport — a half-visible heading block reads ~50%, not a binary
              in-view flag. Both directions saturate: cover the viewport entirely and the weight
              is 100%.
            </p>
            <div id="toc-weights" class="flex flex-col gap-4">
              <h3 class="font-nav text-[0.95rem] tracking-tight">IoM weights</h3>
              <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground">
                Intersection-over-minimum: the intersection area divided by the smaller of the block
                and the viewport. Tall blocks don't dwarf small ones — a short block fully visible
                weighs the same 100% as a tall block filling the screen.
              </p>
            </div>
            <div id="toc-line" class="flex flex-col gap-4">
              <h3 class="font-nav text-[0.95rem] tracking-tight">the line pick</h3>
              <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground">
                The bold marker is the viewport-top LINE: whichever region contains it is the pick.
                Margins between blocks resolve downward to the next block — the line never floats in
                dead space. On mobile the line sits at the sticky rail's bottom edge.
              </p>
            </div>
          </div>
          <section id="toc-anatomy" class="flex flex-col gap-4">
            <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">two modes, one family</h2>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              MANUAL mode is a composed list tree — TocList (ul), TocItem (li), TocLink (a); nesting
              is a TocList inside a TocItem, and anchors never nest. AUTO mode (outline) derives the
              same tree from a content root's headings at runtime and renders through the same
              parts — the DECLARED SSR exception: the server paints the rail shell, links arrive on
              hydrate. The old sections[] prop is gone.
            </p>
          </section>
          <section id="toc-engine" class="flex flex-col gap-4">
            <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">the engine</h2>
            <p class="max-w-[64ch] text-pretty text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              toc-engine.ts is framework-free, and the family talks to it entirely through the DOM:
              the root re-queries its own subtree per update (no registration — keyed reorders and
              conditional links just work), derives each link's target from its href fragment, and
              synthesizes heading-to-heading extents for the engine. Scrollspy, aria-current, and
              the parent marker are root behavior in both modes.
            </p>
          </section>
          <section id="toc-usage" class="flex flex-col gap-4">
            <h2 class="font-nav text-[1.05rem] tracking-tight sm:text-[1.22rem]">usage</h2>
            <CodeBlock code={usage} lang="svelte" meta="usage" />
          </section>
        </article>
        <aside class="min-w-0" aria-label="Outline demo">
          <Toc outline={{ root: '#toc-workbench-article' }} title="auto mode" scrollRoot=".jx-shell-body" />
        </aside>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the right rail (manual tree) and the in-canvas rail (auto outline) run independent
            engines over their own links — desktop shows the spine, below 900px both collapse to the
            glass single-row bar. Click any entry: the anchor lands the heading exactly on the pick
            line. Resize across 900px to watch the surfaces swap.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>
