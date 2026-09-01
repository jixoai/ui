<!--
  Docs page for the breadcrumb family (composition-first, 2026-08-25).
  Intents: hero summary, one ComponentCanvas over the composed trail
  (three-crumb + the eight-page opt-in fold), usage sample. Structure
  follows the list-item exemplar; the component family is untouchable
  from here.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import Breadcrumb from '$lib/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '$lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '$lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '$lib/ui/breadcrumb/breadcrumb-link.svelte';
  import BreadcrumbPage from '$lib/ui/breadcrumb/breadcrumb-page.svelte';
  import BreadcrumbSeparator from '$lib/ui/breadcrumb/breadcrumb-separator.svelte';
  import BreadcrumbCollapse from '$lib/ui/breadcrumb/breadcrumb-collapse.svelte';
  import BreadcrumbDropdown from '$lib/ui/breadcrumb/breadcrumb-dropdown.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import breadcrumbSource from '$lib/ui/breadcrumb/breadcrumb.svelte?raw';
  import breadcrumbCollapseSource from '$lib/ui/breadcrumb/breadcrumb-collapse.svelte?raw';
  import breadcrumbDropdownSource from '$lib/ui/breadcrumb/breadcrumb-dropdown.svelte?raw';
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
    BreadcrumbDropdown,
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
</BreadcrumbCollapse>

<!-- sibling jump: one node opens a menu of peer pages — REAL anchors,
     the current one marked, selection dismisses and navigates -->
<BreadcrumbItem>
  <BreadcrumbDropdown
    label="components"
    current="/docs/components/breadcrumb.html"
    items={[
      { label: 'tabs', href: '/docs/components/tabs.html' },
      { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
    ]}
  />
</BreadcrumbItem>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/breadcrumb/breadcrumb.svelte', content: breadcrumbSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb-collapse.svelte', content: breadcrumbCollapseSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb-dropdown.svelte', content: breadcrumbDropdownSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb.css', content: breadcrumbCssSource },
    { name: 'src/lib/ui/breadcrumb-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the eight-page trail: first + fold(p2..p6) + last two — the same
  // shape the closed collapse=4 produced
  const folded = [2, 3, 4, 5, 6].map((n) => `/docs/components/breadcrumb.html?trail=${n}`);

  // peer docs pages for the sibling-jump demo (REAL hrefs — the menu
  // entries navigate exactly like trail links do)
  const peerPages = [
    { label: 'tabs', href: '/docs/components/tabs.html' },
    { label: 'toast', href: '/docs/components/toast.html' },
    { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
  ];
</script>

<svelte:head>
  <title>Breadcrumb · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai breadcrumb family: a nav landmark over an ordered list of real links — List/Item/Link/Page/Separator parts (separator glyph overridable through children), aria-current on the page, an opt-in BreadcrumbCollapse fold whose ellipsis keeps every page one click away, and BreadcrumbDropdown: the sibling-jump node that opens a menu of peer pages and navigates on selection."
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

  
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Breadcrumb variants" summary="Use a complete trail for short paths, wrap the middle items for an opt-in fold, or swap the separator glyph through its children snippet (aria-hidden stays by construction)."><div class="grid gap-4 sm:grid-cols-3"><div class="border border-border p-4"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem><BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem><BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div><div class="border border-border p-4"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem><BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem><BreadcrumbCollapse href="/docs"><BreadcrumbItem><BreadcrumbLink href="/docs">docs</BreadcrumbLink></BreadcrumbItem></BreadcrumbCollapse><BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem><BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div><div class="border border-border p-4"><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem><BreadcrumbItem><BreadcrumbSeparator><span class="text-muted-foreground">/</span></BreadcrumbSeparator></BreadcrumbItem><BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></div></div></SectionCard></div>

  <div id="dropdown" data-reveal="">
    <SectionCard
      family="dropdown"
      headerRegion="dropdown"
      eyebrow="demo"
      title="Dropdown — the sibling jump"
      summary="BreadcrumbDropdown is one trail node that opens a menu of peer destinations: click — or the dropdown-menu keyboard contract (arrows, typeahead, Home/End) — opens the popover; every entry is a REAL anchor, so middle-click, reload and crawlers stay honest; the current page among the peers carries the you-are-here paint; selecting dismisses the menu and navigates."
    >
      <div class="max-w-xl border border-border p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={peerPages} />
            </BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
            <BreadcrumbItem><BreadcrumbPage href="/docs/components/breadcrumb.html">breadcrumb</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </SectionCard>
  </div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Author the ordered list directly; the ol order is the hierarchy and the current page remains a real page part."><CodeBlock code={usage} lang="svelte" meta="Breadcrumb usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Native navigation landmark, ordered list, links, and aria-current carry the full semantics. In the dropdown menu, the keyboard walk's highlight is a paint-only data attribute — aria-current on the current entry is never rewritten by the walk, so the you-are-here marker survives navigation with its semantics intact."><A11yTable aria={[{ name: 'aria-label', value: 'Breadcrumb', description: 'Names the navigation landmark.' }, { name: 'aria-current', value: 'page', description: 'Marks the current trail destination — and the current entry inside the dropdown menu (never touched by the menu walk’s highlight).' }, { name: 'aria-hidden', value: 'true', description: 'Hides decorative separators and manual ellipses.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Breadcrumb has no component-specific --jx tokens; parts inherit the shared density context."><div class="flex flex-col gap-5"><DensityDemo scopes={['xs', 'default', 'lg']}><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></DensityDemo><TokenTable tokens={[]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The root and composition parts keep the trail structure explicit."><PropsTable title="Breadcrumb" props={[{ name: 'label', type: 'string', default: "'Breadcrumb'", description: 'Accessible navigation landmark label.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /><div class="mt-5"><PropsTable title="BreadcrumbLink / Page / Collapse / Separator" props={[{ name: 'href', type: 'string', description: 'Destination for a link or collapse target.' }, { name: 'aria-current', type: '"page"', default: 'Page only', description: 'BreadcrumbPage marks the current destination.' }, { name: 'children', type: 'Snippet', required: true, description: 'Composed trail content; on Separator it REPLACES the chevron glyph (data-glyph=custom, aria-hidden stays).' }]} /></div><div class="mt-5"><PropsTable title="BreadcrumbDropdown" props={[{ name: 'label', type: 'string', required: true, description: 'The trail label on the trigger — the section this node stands for.' }, { name: 'items', type: '{ label, href }[]', required: true, description: 'Peer destinations offered in the menu — every entry a REAL anchor.' }, { name: 'current', type: 'string', description: 'href of the current page among the items: aria-current=page + the you-are-here paint.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /></div></SectionCard></div>
</div>
