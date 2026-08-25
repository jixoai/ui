<!--
  Docs page for the breadcrumb family (composition-first, 2026-08-25).
  Intents: hero summary, one ComponentCanvas over the composed trail
  (three-crumb + the eight-page opt-in fold), usage sample. Structure
  follows the list-item exemplar; the component family is untouchable
  from here.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import Breadcrumb from '$lib/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/ui/breadcrumb/breadcrumb-separator.svelte';
  import BreadcrumbCollapse from '$lib/ui/breadcrumb/breadcrumb-collapse.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import breadcrumbSource from '$lib/ui/breadcrumb/breadcrumb.svelte?raw';
  import breadcrumbCollapseSource from '$lib/ui/breadcrumb/breadcrumb-collapse.svelte?raw';
  import breadcrumbCssSource from '$lib/ui/breadcrumb/breadcrumb.css?raw';

  const close = '</' + 'script>';

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<script lang="ts">
  import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbCollapse,
  } from '@ui/breadcrumb/index';
${close}

<!-- the trail is authored, not passed as data; the ol's order IS the hierarchy -->
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">registry</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
    <BreadcrumbItem>
      <BreadcrumbPage href="/docs/components/breadcrumb.html">breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

<!-- long trails: wrap the middle in BreadcrumbCollapse — the folded
     items self-hide and the ellipsis links to the first hidden page -->
<BreadcrumbCollapse>
  <BreadcrumbItem><BreadcrumbLink href="/2">page 2</BreadcrumbLink></BreadcrumbItem>
</BreadcrumbCollapse>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/breadcrumb/breadcrumb.svelte', content: breadcrumbSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb-collapse.svelte', content: breadcrumbCollapseSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb.css', content: breadcrumbCssSource },
    { name: 'src/lib/ui/breadcrumb-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the eight-page trail: first + fold(p2..p6) + last two — the same
  // shape the closed collapse=4 produced
  const folded = [2, 3, 4, 5, 6].map((n) => `/docs/components/breadcrumb.html?trail=${n}`);
</script>

<svelte:head>
  <title>Breadcrumb · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai breadcrumb family: a nav landmark over an ordered list of real links — List/Item/Link/Page/Separator parts, aria-current on the page, and an opt-in BreadcrumbCollapse fold whose ellipsis keeps every page one click away."
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
      eyebrow="registry:ui · NativeHTML"
      title="breadcrumb — the trail the platform already defines"
      summary="nav[aria-label] wrapping an ol of ordinary links, composed part by part: the list carries the order, Link is a real href, Page marks aria-current=page, Separator is pure decoration — the entire semantics in native elements, no roles to maintain. Long trails fold by WRAPPING the middle items in BreadcrumbCollapse: the nesting is the opt-in, no width magic, and the ellipsis stays a live link to the first hidden page."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">nav + ol + a</span>
        <span class="pill">aria-current</span>
        <span class="pill">BreadcrumbCollapse = opt-in fold</span>
        <span class="pill">Link child() escape</span>
      </div>
    </SectionCard>
  </div>

  <div id="breadcrumb-demo" data-region="breadcrumb-demo" data-family="breadcrumb-demo" data-reveal="">
    <ComponentCanvas
      title="breadcrumb"
      stage="fill"
      description="A three-crumb trail, and an eight-page trail with the middle wrapped in BreadcrumbCollapse — the folded items self-hide and the ellipsis links to the first hidden page (never a dead span)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/breadcrumb/breadcrumb.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-col items-start gap-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/">registry</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components.html">components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage href="/docs/components/breadcrumb.html">breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components/breadcrumb.html?trail=1">page 1</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbCollapse>
              {#each folded as href, i (href)}
                <BreadcrumbItem>
                  <BreadcrumbLink {href}>page {i + 2}</BreadcrumbLink>
                </BreadcrumbItem>
              {/each}
            </BreadcrumbCollapse>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs/components/breadcrumb.html?trail=7">page 7</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage href="/docs/components/breadcrumb.html?trail=8">page 8</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the current page stays a real link — deep links and reloads remain honest. Hover the
            ellipsis: it derives its destination from the wrapped items (the first hidden page,
            one click restores the path). BreadcrumbEllipsis exists too — the manual,
            non-interactive gap glyph.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="breadcrumb-base" data-reveal="">
    <SectionCard
      family="breadcrumb-base"
      headerRegion="breadcrumb-base"
      eyebrow="NativeHTML 基座"
      title="Usage"
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
