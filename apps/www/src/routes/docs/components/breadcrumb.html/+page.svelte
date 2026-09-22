<!--
  Docs page for the breadcrumb family (MDN archetype, docs-eight-axes-mdn
  round 2, scribe 2026-09-22; consolidated fix round 10). Order: hero →
  install → overview → usage → the live examples (THIS PAGE carries the
  demos — trail, opt-in fold, sibling jump) → props → the eight axes on
  breadcrumb (per-axis table + runnable demos + one real query() case) →
  accessibility → see-also. Structure follows the baseline skill
  (skills/mdn-doc-style.md §2); the component family is untouchable
  from here.
  Same-source law (fix round 10): every canvas drawer composes from
  resolveRawCode — the shown source IS the running stage; the theme
  prose names the split per voice (stylex-frozen trail inks vs the
  raw-layer menu, steady-state probed).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
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

  // The canvas same-source lane (fix round 10): each canvas's usage
  // TreeFile composes from THIS PAGE's own stage markup via
  // resolveRawCode — one source, two surfaces; the hand-mirrored
  // drawer literals (and the query() sample that drifted from its
  // stage) are gone.
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/breadcrumb.html/+page';

  const TRAIL_IMPORTS = {
    Breadcrumb: '@ui/breadcrumb/index',
    BreadcrumbList: '@ui/breadcrumb/index',
    BreadcrumbItem: '@ui/breadcrumb/index',
    BreadcrumbLink: '@ui/breadcrumb/index',
    BreadcrumbPage: '@ui/breadcrumb/index',
    BreadcrumbSeparator: '@ui/breadcrumb/index',
    BreadcrumbCollapse: '@ui/breadcrumb/index',
  };

  const sourceFiles: TreeFile[] = [
    { name: 'registry/files/ui/breadcrumb/breadcrumb.svelte', content: breadcrumbSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb-collapse.svelte', content: breadcrumbCollapseSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb-dropdown.svelte', content: breadcrumbDropdownSource },
    { name: 'registry/files/ui/breadcrumb/breadcrumb.css', content: breadcrumbCssSource },
  ];

  const demoUsage = usageFile({ ...TRAIL_IMPORTS }, resolveRawCode('demo'));
  const demoFiles: TreeFile[] = [
    ...sourceFiles,
    { name: 'src/lib/ui/breadcrumb-usage.svelte', content: demoUsage, kind: 'usage' },
  ];

  const foldUsage = usageFile({ ...TRAIL_IMPORTS }, resolveRawCode('fold'));
  const foldFiles: TreeFile[] = [
    { name: 'breadcrumb-fold-demo.svelte', content: foldUsage, kind: 'usage' },
  ];

  const dropdownUsage = usageFile(
    {
      Breadcrumb: '@ui/breadcrumb/index',
      BreadcrumbList: '@ui/breadcrumb/index',
      BreadcrumbItem: '@ui/breadcrumb/index',
      BreadcrumbLink: '@ui/breadcrumb/index',
      BreadcrumbPage: '@ui/breadcrumb/index',
      BreadcrumbSeparator: '@ui/breadcrumb/index',
      BreadcrumbDropdown: '@ui/breadcrumb/index',
    },
    resolveRawCode('dropdown'),
  );
  const dropdownFiles: TreeFile[] = [
    { name: 'breadcrumb-dropdown-demo.svelte', content: dropdownUsage, kind: 'usage' },
  ];

  // the axes drawer composes from the stage AND carries the query()
  // imports, so the shown file stays copy-paste-runnable
  const axesUsage = usageFile(
    {
      ...TRAIL_IMPORTS,
      BreadcrumbDropdown: '@ui/breadcrumb/index',
      '{ query }': '@lib/universal-props-query.svelte',
      'type { DensityLane }': '@lib/defaults.svelte',
    },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/breadcrumb-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // single usage sample: the body CodeBlock's canonical composition
  const close = '</' + 'script>';
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

  // the per-axis table (skill §2.5): mechanism names are the REAL
  // carriers/vars the family stamps or reads (breadcrumb.svelte +
  // breadcrumb.stylex.ts + breadcrumb.css; the composed menu's reads
  // per dropdown-menu.css); steps/units per universal-props.schema.ts.
  const axisRows = [
    {
      name: 'density',
      type: 'data-density rung · --jx-density-coefficient',
      default: 'auto',
      description:
        'The axis this family supplies, not paints. The root is a structural provider: an explicit rung stamps data-density on the nav (small · medium · large normalize onto the rungs sm · default · lg) and re-declares the channel set on it — a named rung also resets the coefficient to 1 (explicit rung = exact rung, never double-scaled); a number stamps --jx-density-coefficient and leaves the rung ambient (the declaring-element law: nothing here re-declares AT a coefficient stamp, so the number lane moves nothing on this composition). The trail\'s own atoms pin fixed tokens (gap --jx-space-6, label --jx-text-label-lg), so the trail itself is density-immobile — the supply is the point: all 8 parts re-stamp the ambient rung (densityRungOf), and the composed menu consumes the FIVE channels (--jx-hit / --jx-line / --jx-inset / --jx-text / --jx-gap in dropdown-menu.css). Open the sibling-jump node and the menu rides the rung.',
    },
    {
      name: 'size',
      type: '--jx-size-effective → root font-size',
      default: 'auto',
      description:
        'Stamps the carrier plus the font-size declaration on the nav, but the list pins its own label token (--jx-text-label-lg) and nothing on this composition sizes in em — the trail does not scale. Steps small · medium · large; a number is px.',
    },
    {
      name: 'shape',
      type: '--jx-shape-effective · --jx-radius-factor-effective',
      default: 'auto',
      description:
        'Carriers stamp on the nav, but the trail paints no corners — the separator chevron is a rotated border square, not a corner. The supply is real: the composed menu panel composes corner-shape: var(--jx-shape-effective, round). Steps round · scoop · bevel · notch · square · squircle; no number lane.',
    },
    {
      name: 'radius',
      type: '--jx-radius-effective',
      default: 'auto',
      description:
        'Same split: the cornerless trail consumes nothing, while the composed menu panel composes the §3 concentric calc (radius-effective − inset-effective) × the shape factor — open the node and the panel takes the radius. Steps small · medium · large; a number is px.',
    },
    {
      name: 'color',
      type: '--jx-color-effective',
      default: 'auto',
      description:
        "The carrier stamps, but the trail's ink reads the semantic tokens directly — --jx-muted-foreground for links (warming to --jx-primary on hover), --jx-foreground for the current page — so a hue lane retunes nothing here. Steps primary · secondary · error · warn · success · info; a number is hue degrees.",
    },
    {
      name: 'theme',
      type: 'the .dark class bridge — a split on this family, measured',
      default: 'auto',
      description:
        "dark stamps the .dark class bridge on the nav, and WHICH voices follow splits by declaring layer (steady-state probe, both levels). The trail's own TEXT INKS stay frozen: link ink (--jx-muted-foreground, hover --jx-primary) and the current page's ink (--jx-foreground) ride the stylex layer — declared only on :root + the stylex theme classes, never plain .dark — so the trail text keeps the light values (the W-next semantic-ink gap). Everything RAW re-themes: the separator chevron (var(--muted-foreground) 0.32 → 0.85 lightness), the focus outline (--hairline / --ring), and the WHOLE composed menu — panel ground, border, item ink and the you-are-here paint (raw --foreground + the --muted mix) all flip, because the popover panel is a DOM descendant of the nav and inherits the island's tokens. Steps light · dark · system; auto inherits the tree.",
    },
    {
      name: 'elevation',
      type: '--jx-elevation-effective',
      default: 'auto',
      description:
        'The carrier stamps; the flat trail paints no shadow, and nothing on this family consumes it. Steps level-1 · level0 · level1 · level2 · level3 · level4 · level5; a number is exact dp.',
    },
    {
      name: 'motion',
      type: '--jx-motion-effective',
      default: 'auto',
      description:
        "The carrier stamps; the trail's only transition is the fixed 150ms color fade on the link ink (.jx-bc-link → --motion-150 / --motion-ease-out — motion literals, no kernel read). Steps reduced · subtle · normal · expressive; a number is a coefficient.",
    },
  ];

  // the tokens the family's own paint reads (breadcrumb.stylex.ts +
  // breadcrumb.css value receipts)
  const trailTokens = [
    { name: '--jx-font-nav', default: 'var(--font-nav)', source: 'structural' as const, description: 'The trail label face (uppercase).' },
    { name: '--jx-text-label-lg', default: '12px', source: 'structural' as const, description: 'The trail label size — pinned by the list atom; why the size axis cannot scale the trail.' },
    { name: '--jx-track-wide', default: '0.08em', source: 'structural' as const, description: 'The trail label tracking.' },
    { name: '--jx-space-6', default: 'unit × 1.5', source: 'structural' as const, description: 'The ol gap — the trail\'s whole rhythm; a fixed token, not a density channel.' },
    { name: '--jx-muted-foreground', default: 'theme · stylex-frozen', source: 'color' as const, description: 'Trail link ink at rest — stays light under a .dark island (the W-next gap).' },
    { name: '--muted-foreground (raw)', default: 'theme · raw layer', source: 'color' as const, description: 'The separator chevron\'s border (opacity 0.7) — re-themes with the island (0.32 → 0.85 lightness, measured).' },
    { name: '--jx-primary', default: 'theme', source: 'color' as const, description: 'Trail link ink on hover.' },
    { name: '--jx-foreground', default: 'theme', source: 'color' as const, description: 'The current page\'s ink — never underlined.' },
    { name: '--hairline + --ring', default: 'theme', source: 'color' as const, description: 'The link/trigger focus-visible outline (2px offset).' },
    { name: '--motion-150 + --motion-ease-out', default: '150ms · ease-out', source: 'component' as const, description: 'The .jx-bc-link color fade — the trail\'s only transition.' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
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

<svelte:head>
  <title>Breadcrumb · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai breadcrumb family: a nav landmark over an ordered list of real links — List/Item/Link/Page/Separator parts (separator glyph overridable through children), aria-current on the page, an opt-in BreadcrumbCollapse fold whose ellipsis keeps every page one click away, and BreadcrumbDropdown: the sibling-jump node that opens a menu of peer pages and navigates on selection."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="breadcrumb — the trail the platform already defines"
      summary="nav[aria-label] wrapping an ol of ordinary links, composed part by part: the list carries the order, Link is a real href, Page marks aria-current=page, Separator is pure decoration — no roles to maintain. Long trails fold by WRAPPING the middle items in BreadcrumbCollapse; one node can open a menu of peer pages (BreadcrumbDropdown) — every destination a real anchor."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">nav + ol + a</span>
        <span class="pill">aria-current=page</span>
        <span class="pill">opt-in fold</span>
        <span class="pill">real-anchor sibling jump</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="breadcrumb" />
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="The root owns nothing but the landmark; eight parts compose the trail, the fold, and the sibling jump."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          Breadcrumb is composition-first: the root renders the nav landmark and nothing else — the
          old closed <code>crumbs[]</code> data prop died. You author an ordered list directly: a
          BreadcrumbList (the ol — its document order IS the hierarchy) of BreadcrumbItem steps,
          each holding a BreadcrumbLink, the BreadcrumbPage, or a BreadcrumbSeparator.
        </p>
        <p class={cx(rt.measurePara)}>
          Two behaviors are opt-in parts, not props. BreadcrumbCollapse wraps the middle items of a
          long trail: they self-hide (the platform <code>hidden</code> attribute) and a single
          &quot;…&quot; link stands in, pointing at the first hidden page — never a dead ellipsis.
          BreadcrumbDropdown is one trail node that opens a menu of peer destinations; every entry
          is a real anchor, so middle-click, reload and crawlers stay honest.
        </p>
        <p class={cx(rt.measurePara)}>
          The semantics are the platform's: nav[aria-label] + ol + a[aria-current="page"] — no
          microdata obligations, no roles to maintain. For the axis grammar, see the
          <a href="/docs/universal-props.html">universal props</a> concept page.
        </p>
      </div>
    </SectionCard>
  </div>

  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Author the ordered list directly; the ol order is the hierarchy and the current page remains a real page part."
    >
      <CodeBlock code={usage} lang="svelte" meta="Breadcrumb usage" />
    </SectionCard>
  </div>

  <div id="breadcrumb-demo" data-reveal="">
    <ComponentCanvas
      id="demo"
      title="breadcrumb"
      stage="fill"
      description="A three-crumb trail, and an eight-page trail with the middle wrapped in BreadcrumbCollapse — the folded items self-hide and the ellipsis links to the first hidden page (never a dead span)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/breadcrumb/breadcrumb.svelte"
      files={demoFiles}
    >
      <div class={cx(rt.flex, rt.col, rt.itemsStart, rt.gap20)}>
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
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/breadcrumb.html?trail=2">page 2</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/breadcrumb.html?trail=3">page 3</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/breadcrumb.html?trail=4">page 4</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/breadcrumb.html?trail=5">page 5</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/breadcrumb.html?trail=6">page 6</BreadcrumbLink></BreadcrumbItem>
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

  <div id="breadcrumb-fold" data-reveal="">
    <SectionCard
      family="types"
      headerRegion="types"
      eyebrow="live example"
      title="Fold a long trail"
      summary="Use a complete trail for short paths, wrap the middle items for an opt-in fold, or swap the separator glyph through its children snippet (aria-hidden stays by construction)."
    >
      <ComponentCanvas id="fold" title="breadcrumb · fold and separator" stage="fill" files={foldFiles}>
        <div class={cx(rt.bcGrid)}>
          <div class={cx(rt.panel)}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div class={cx(rt.panel)}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                <BreadcrumbCollapse href="/docs">
                  <BreadcrumbItem><BreadcrumbLink href="/docs">docs</BreadcrumbLink></BreadcrumbItem>
                </BreadcrumbCollapse>
                <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div class={cx(rt.panel)}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/">home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbSeparator><span class={cx(rt.inkMuted)}>/</span></BreadcrumbSeparator>
                </BreadcrumbItem>
                <BreadcrumbItem><BreadcrumbPage>current</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="breadcrumb-dropdown" data-reveal="">
    <SectionCard
      family="dropdown"
      headerRegion="dropdown"
      eyebrow="live example"
      title="Jump between siblings"
      summary="BreadcrumbDropdown is one trail node that opens a menu of peer destinations: click — or the dropdown-menu keyboard contract (arrows, typeahead, Home/End) — opens the popover; every entry is a REAL anchor; the current peer carries the you-are-here paint; selecting dismisses the menu and navigates."
    >
      <ComponentCanvas id="dropdown" title="breadcrumb · dropdown" stage="fill" files={dropdownFiles}>
        <div class={cx(rt.maxWXl, rt.panel)}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={[
        { label: 'tabs', href: '/docs/components/tabs.html' },
        { label: 'toast', href: '/docs/components/toast.html' },
        { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
      ]} />
              </BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
              <BreadcrumbItem><BreadcrumbPage href="/docs/components/breadcrumb.html">breadcrumb</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="props" data-reveal="">
    <SectionCard
      eyebrow="api"
      title="Props"
      summary="The root carries the landmark label and forwards the eight-axis surface (the shared Universal props section below); the parts keep the trail structure explicit. The composed dropdown-menu inside BreadcrumbDropdown is documented on its own page."
    >
      <div class={cx(rt.col24)}>
        <PropsTable universal title="Breadcrumb" props={[
          { name: 'label', type: 'string', default: "'Breadcrumb'", description: 'Accessible name of the navigation landmark.' },
          { name: 'children', type: 'Snippet', required: true, description: 'The composed trail — a BreadcrumbList of Items.' },
          { name: '...rest', type: 'HTMLAttributes', default: 'spread', description: 'Forwarded to the nav element.' },
        ]} />
        <div class={cx(rt.mt20)}>
          <PropsTable title="BreadcrumbList / BreadcrumbItem" props={[
            { name: 'children', type: 'Snippet', required: true, description: 'List: the Items, Separators and folds, in order (renders the ol, role="list"). Item: one step\'s content (renders the li); self-hides inside a BreadcrumbCollapse.' },
            { name: '...rest', type: 'HTMLAttributes', default: 'spread', description: 'Forwarded to the ol / li element.' },
          ]} />
        </div>
        <div class={cx(rt.mt20)}>
          <PropsTable title="BreadcrumbLink / BreadcrumbPage" props={[
            { name: 'href', type: 'string', default: 'Link: required · Page: optional', description: 'Destination. Without one, Page renders the span form of the same semantics (aria-current stays).' },
            { name: 'child', type: 'Snippet', default: '—', description: 'Link only — replacement-element escape; receives the merged anchor props ({ class, href, ...rest }); the consumer owns the element.' },
            { name: 'children', type: 'Snippet', required: true, description: 'The visible label.' },
            { name: 'aria-current', type: '"page"', default: 'Page only', description: 'BreadcrumbPage marks the current destination; not overridable.' },
            { name: '...rest', type: 'HTMLAnchorAttributes', default: 'spread', description: 'Forwarded to the anchor element.' },
          ]} />
        </div>
        <div class={cx(rt.mt20)}>
          <PropsTable title="BreadcrumbSeparator / BreadcrumbEllipsis / BreadcrumbCollapse" props={[
            { name: 'children', type: 'Snippet', default: '—', description: 'Separator only — REPLACES the chevron glyph (data-glyph="custom", aria-hidden stays). Ellipsis renders its own "…"; Collapse renders the fold\'s ellipsis link.' },
            { name: 'href', type: 'string', default: 'Collapse only, optional', description: 'Where the fold\'s ellipsis points. Without one it derives the first hidden page\'s href from its own DOM on hydrate.' },
            { name: '...rest', type: 'HTMLAttributes', default: 'spread', description: 'Forwarded to the span / li element; all three are aria-hidden or wrap hidden content.' },
          ]} />
        </div>
        <div class={cx(rt.mt20)}>
          <PropsTable title="BreadcrumbDropdown" props={[
            { name: 'label', type: 'string', required: true, description: 'The trail label on the trigger — the section this node stands for.' },
            { name: 'items', type: '{ label, href }[]', required: true, description: 'Peer destinations offered in the menu — every entry a REAL anchor.' },
            { name: 'current', type: 'string', default: '—', description: 'href of the current page among the items: aria-current=page + the you-are-here paint.' },
            { name: 'density', type: 'Density', default: 'ambient scope', description: 'The part\'s own density opinion (the legacy local spelling), feeding the composed menu — explicit ?? inherited.' },
          ]} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="breadcrumb-axes" data-reveal="">
    <SectionCard
      eyebrow="axes"
      title="The eight axes on breadcrumb"
      summary="breadcrumb carries all eight lanes as a first-time no-own surface (migration census, W3 close D5): an explicit lane stamps its §10 carrier on the nav and supplies downward. The split on THIS family: density, shape and radius land in the composed menu (open the node), the theme island re-themes the menu wholesale while the trail's own text inks stay stylex-frozen, and size, color, elevation and motion stamp carriers nothing here consumes. The lane grammar (named · auto · number · query()) is the universal props page's."
    >
      <div class={cx(rt.col20)}>
        <PropsTable title="" props={axisRows} />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the eight-axis adoption itself is the census row — breadcrumb was one of
          the 13 sweep holes migrated in the W3 close (D5), the bridge keeping the legacy rung
          channel for the ~60 legacy consumers
          (openspec/changes/explicit-props/research/migration-census.md). The PROVIDER-SNAPSHOT
          kernel law rides this family: density does NOT ride the provideUniversalLanes literal —
          the reactive bridged provideDensity write carries the universal density supply, the
          literal carries the other seven, and all 8 parts stamp the ambient rung through the SAME
          densityRungOf contract. No §13 renames apply:
          <code>label</code> is a family prop, and BreadcrumbDropdown's <code>density</code> is the
          part's own opinion slot feeding the composed menu, not an axis rename.
        </p>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={trailTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="breadcrumb · the eight axes" stage="fill" files={axesFiles}>
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>auto — ambient scope, stamps nothing</span>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">registry</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="small" — open the node: the menu rides the rung</span>
                <Breadcrumb density="small">
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={[
        { label: 'tabs', href: '/docs/components/tabs.html' },
        { label: 'toast', href: '/docs/components/toast.html' },
        { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
      ]} />
                    </BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="large" — the same trail, the roomy rung</span>
                <Breadcrumb density="large">
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={[
        { label: 'tabs', href: '/docs/components/tabs.html' },
        { label: 'toast', href: '/docs/components/toast.html' },
        { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
      ]} />
                    </BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>radius="large" — the trail is cornerless; the menu panel takes it</span>
                <Breadcrumb radius="large">
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem>
                      <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={[
        { label: 'tabs', href: '/docs/components/tabs.html' },
        { label: 'toast', href: '/docs/components/toast.html' },
        { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
      ]} />
                    </BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — a split, measured: the trail text keeps the light stylex inks; the chevron, focus ring and the composed menu re-theme</span>
                <Breadcrumb theme="dark">
                  <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">registry</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                    <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div class={cx(rt.col20, rt.wFull, rt.anMt32)}>
              <span class={cx(rt.note11)}>density={"{query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}"}</span>
              <Breadcrumb density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="/docs/components/overview.html">docs</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                  <BreadcrumbItem>
                    <BreadcrumbDropdown label="components" current="/docs/components/breadcrumb.html" items={[
        { label: 'tabs', href: '/docs/components/tabs.html' },
        { label: 'toast', href: '/docs/components/toast.html' },
        { label: 'breadcrumb', href: '/docs/components/breadcrumb.html' },
      ]} />
                  </BreadcrumbItem>
                  <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
                  <BreadcrumbItem><BreadcrumbPage>breadcrumb</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <p class={cx(rt.mt4, rt.note12, rt.inkMuted70)}>
                SSR resolves the query's base (small) onto the root's rung stamp — inspect the
                markup: data-density="sm" on this nav, and the nav's scope block re-declares the
                five channels the composed menu reads. At the lg viewport rung (≥64rem) the engine
                re-resolves to large and the scope re-stamps; open the node on either side of 64rem
                and watch the menu rhythm step.
              </p>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      eyebrow="a11y"
      title="Accessibility"
      summary="Native navigation landmark, ordered list, links, and aria-current carry the full semantics. In the dropdown menu, the keyboard walk's highlight is a paint-only data attribute — aria-current on the current entry is never rewritten by the walk, so the you-are-here marker survives navigation with its semantics intact."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves through the trail links and the sibling-jump trigger in list order; the trail never steals focus' },
          { key: 'Enter / Space', action: 'Opens the sibling-jump menu from the trigger; Enter on a menu entry dismisses the panel, returns focus to the trail node, and navigates' },
          { key: 'Arrow keys', action: 'Inside the open menu: arrows move, typeahead jumps, Home/End bound the walk (the dropdown-menu contract)' },
        ]}
        aria={[
          { name: 'aria-label', value: "'Breadcrumb'", description: 'Names the navigation landmark — announced before the trail.' },
          { name: 'aria-current', value: "'page'", description: 'Marks the current trail destination — and the current entry inside the dropdown menu (never touched by the menu walk’s highlight).' },
          { name: 'aria-hidden', value: "'true'", description: 'Hides decorative separators and manual ellipses — screen readers hear the label and the links, not the gaps.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="breadcrumb" />
  </div>
  </div>
</div>
