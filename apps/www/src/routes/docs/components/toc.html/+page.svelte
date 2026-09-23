<!--
  Docs page for the toc family (2026-08-25, composition-first-apis;
  rebuilt to the eight-axes archetype, docs-eight-axes-mdn task 69).

  THE SELF-REFERENCE SPINE, named on both sides: toc is the fleet's own
  navigation component, so this page carries TWO toc channels and every
  claim names its own —
  · the PAGE-toc channel: +page.ts load data (TocSection[]) that the
    ROOT LAYOUT renders in the scaffold rail. This route deliberately
    exports no load (see +page.ts) — the layout rail is absent here.
  · the COMPONENT channel: the toc family itself (Toc + the
    TocList/TocItem/TocLink parts + the toc-outline/toc-engine libs).
    The aside rail on this page IS the component in manual mode.

  The workbench article + its AUTO-outline rail live OUTSIDE any
  component canvas: the canvas root stamps data-toc-skip (the outline
  law — demo headings must never leak into page outlines), and an
  outline root inside it derives ZERO. Placement is part of the API.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
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
     shell; links arrive on hydrate — the declared exception).
     PLACEMENT LAW: the content root cannot live inside a component
     canvas — the canvas stamps data-toc-skip, and a skipped root
     derives zero. -->
<aside class="jx-toc-aside">
  <Toc outline={{ root: 'main' }} title="on this page" />
</aside>

<!-- MANUAL: the composed list tree — SSR-complete; nesting is a
     TocList inside a TocItem, anchors never nest -->
<aside class="jx-toc-aside">
  <Toc title="on this page">
    <TocList>
      <TocItem><TocLink href="#setup">Setup</TocLink></TocItem>
      <TocItem>
        <TocLink href="#usage">Usage</TocLink>
        <TocList>
          <TocItem><TocLink href="#theming">Theming</TocLink></TocItem>
        </TocList>
      </TocItem>
    </TocList>
  </Toc>
</aside>`;

  // the page-toc CHANNEL sample (the other side of the spine): the
  // +page.ts data shape the root layout consumes — shown, not loaded
  // (this route opts out; see +page.ts)
  const pageChannelSample = `<!-- +page.ts — the PAGE-toc channel (the layout rail's data):
      the ROOT LAYOUT owns one rail, rendered from page data. This
      route exports no load — its rail is the component itself. -->
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'live-demo', label: 'Live demo' },
  { id: 'api', label: 'API' },
];

export const load = () => ({ toc });`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/toc/toc.svelte', content: tocSource },
    { name: 'registry/files/ui/toc/toc-list.svelte', content: tocListSource },
    { name: 'src/lib/ui/toc-usage.svelte', content: usage },
  ];

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  const universalUsage = `<Toc title="on this page" size={18} density="small">…</Toc>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/toc-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 69) — every cell measured on the
  // served DOM (probe) or negative-grepped over ui/toc/ ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        'MANAGED STAMP, AMBIENT PAINT — the rung attr stamps the rail root (data-density; measured on the explicit rungs, absent at auto), and the rail\u2019s own paint follows the ambient density scope through the consumed tokens rather than a family own. Zero --jx-density-effective readers (grep receipt). Number unit: coefficient.',
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'ROOT ECHO — the §1 stamp scales the rail root and the List/Item/Link parts ride the ambient chain (吃也供; measured an 18px stamp reading 18px on the root). Zero --jx-size-effective readers (grep receipt). Number unit: px.',
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero shape-channel readers (grep receipt: no corner-shape or factor consumer in ui/toc/); the rail is square chrome. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero radius-effective readers (grep receipt); the desktop spine is a hairline and the mobile bar is a full-bleed glass row (measured 0px corners on the root). Number unit: px.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — the pick marker and the spine fill paint the brand chain directly (the engine writes --jx-cur/--jx-progress flags; the css maps them to the brand inks), with zero --jx-color-effective readers (grep receipt). Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'DECLARATIVE STAMP, AND THE HOST DECIDES — theme="dark" stamps the .dark class on the rail root; the page bridge re-derives the rail inks page-wide (measured the rail title oklch(0.3211 0 0) → oklch(0.8452 0 0) under prefers-dark, task-69-era digits — the direction holds, re-measure at citation), and a canvas data-theme="light" island would pin a rail placed inside it (the host layer, measured on sibling lanes). system/auto = tree inheritance. No number lane.',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero elevation-carrier readers (grep receipt); the mobile bar\u2019s depth rides the glass-effect stamp (data-jx-effect="blur"), not a shadow tier. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'SUPPLY-ONLY — zero --jx-motion-effective readers (grep receipt); the rail\u2019s transitions (the mobile height transition, the spine fill) ride the consumed toc.css laws, and scrollspy itself is not animated — the pick jumps with the line. Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import Toc from '@ui/toc/index';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case (18px)
     wins — the rail voice scales, the spy behavior is unchanged -->
<Toc title="on this page" size={query({ md: 18 }, 13)}>
  <TocList><TocItem><TocLink href="#setup">Setup</TocLink></TocItem></TocList>
</Toc>`;

  const queryFiles: TreeFile[] = [
    { name: 'toc-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain strings
  // pass through whole; stylex objects contribute their string members
  // ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined)[]
  ): string =>
    styles
      .filter((style): style is { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        Object.entries(style ?? {}).flatMap(([key, value]) =>
          key !== '$$css' && typeof value === 'string' ? [value] : [],
        ).join(' '),
      )
      .join(' ');

</script>

<svelte:head>
  <title>Toc · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai toc: the rule tracker rail — IoM weights, the line pick, and two modes over one family of parts (AUTO outline derivation or the composed TocList tree)."
  />
</svelte:head>

<div
  id="toc-demo-root"
  class={cx(rt.shell)}
>
  <!-- ToC rail — the SELF-REFERENCE EXHIBIT: this aside is the COMPONENT
       itself in manual mode (the page-toc channel is deliberately absent —
       no load export in +page.ts). The rail reads its own composed tree;
       the layout renders nothing here. -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc title="on this page" scrollRoot=".jx-shell-body">
      <TocList>
        <TocItem>
          <TocLink href="#overview">what it tracks</TocLink>
          <TocList>
            <TocItem><TocLink href="#live-demo">IoM weights</TocLink></TocItem>
            <TocItem><TocLink href="#toc-base">the line pick</TocLink></TocItem>
          </TocList>
        </TocItem>
        <TocItem><TocLink href="#types">two modes, one family</TocLink></TocItem>
        <TocItem><TocLink href="#usage">usage</TocLink></TocItem>
        <TocItem><TocLink href="#theming">Theming</TocLink></TocItem>
        <TocItem><TocLink href="#api">API</TocLink></TocItem>
        <TocItem><TocLink href="#universal-props">The eight axes</TocLink></TocItem>
        <TocItem><TocLink href="#accessibility">Accessibility</TocLink></TocItem>
      </TocList>
    </Toc>
  </aside>

  <div class={cx(rt.shellCol)}>
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · engine"
      title="toc — the rule tracker rail"
      summary={entry.summary}
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">IoM weights</span>
        <span class="pill">line pick</span>
        <span class="pill">TocList / TocItem / TocLink</span>
        <span class="pill">auto outline + composed tree</span>
        <span class="pill">this page's rail is the component</span>
      </div>
    </SectionCard>
  </div>

  <!-- install (the archetype's install anchor; chrome — out of the toc) -->
  <div id="install" data-reveal="">
    <DocsInstall name="toc" />
  </div>

  <!-- overview -->
  <div id="overview" data-reveal="">
    <SectionCard
      family="overview"
      headerRegion="overview"
      eyebrow="overview"
      title="Overview — and a named self-reference"
      summary="toc tracks its own page, so every claim on this page names its channel: the PAGE-toc channel (+page.ts data the root layout renders) or the COMPONENT channel (the family itself — which is the rail on the right side of this very page)."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.para)}>
          Two toc channels exist on every docs route, and they are easy to confuse. The PAGE-toc
          channel: a page's <code class={cx(rt.inkPrimary)}>+page.ts</code> exports
          <code class={cx(rt.inkPrimary)}>load</code> data shaped
          <code class={cx(rt.inkPrimary)}>TocSection[]</code> — an interface this family exports —
          and the ROOT LAYOUT renders one rail from it in the scaffold's chrome cell. The
          COMPONENT channel: the toc family itself — the
          <code class={cx(rt.inkPrimary)}>Toc</code> root plus
          <code class={cx(rt.inkPrimary)}>TocList / TocItem / TocLink</code> parts. THIS route
          exports no load: its aside rail is the component in manual mode, demoing the real thing.
          A load may also return <code class={cx(rt.inkPrimary)}>{`{ toc: 'outline' }`}</code> — the
          layout rail then self-derives from #main; that third form is the layout seat's
          capability, not yet any route's practice (the fleet's authored rails are all arrays — 107 at the task-79 read, 120 today; the digit drifts with the campaign).
          When you read "the rail" below, it means the component; when you read "the layout rail",
          it means the page-data channel.
        </p>
        <p class={cx(rt.para)}>
          The rail tracks by IoM weight and picks by line. Weights: intersection-over-minimum —
          the intersection area divided by the smaller of the block and the viewport, so a short
          block fully visible weighs the same 100% as a tall one; both directions saturate. The
          pick: whichever region contains the viewport-top LINE (margins resolve downward to the
          next block — the line never floats in dead space), painted as the bold marker plus
          <code class={cx(rt.inkPrimary)}>aria-current</code>, with the pick's parent inheriting
          the marker. The engine is DOM-delegated: no registration exists — the root re-queries
          its own subtree per update, so keyed reorders and conditional links just work, and a
          nested rail's links never leak in (the own-rail law: a link belongs to the rail whose
          root is its closest <code class={cx(rt.inkPrimary)}>data-jx-toc-root</code>).
        </p>
        <p class={cx(rt.para)}>
          Two modes over one family of parts. AUTO:
          <code class={cx(rt.inkPrimary)}>outline={'{ root }'}</code> derives the link tree from a
          content root's headings at runtime (toc-outline lib: DOM in, plain data out, zero
          listeners) — the DECLARED SSR exception: the server paints the rail shell, links arrive
          on hydrate. MANUAL: the composed list tree, SSR-complete. The axes are a FIRST-TIME
          all-no-own contract (the rail is placement chrome; size echoes on the root); theme is a
          declarative stamp over the page bridge; motion/elevation/color supply unread. Placement
          law, learned on this very page: an outline root cannot live inside a component canvas —
          the canvas stamps <code class={cx(rt.inkPrimary)}>data-toc-skip</code> (demo headings
          must never leak into page outlines), and a skipped root derives zero. The workbench
          below therefore runs as plain page markup, not a canvas demo. Kinship:
          <code class={cx(rt.inkPrimary)}>website-scaffold</code> (the shell whose chrome cell
          hosts the layout rail).
        </p>
      </div>
    </SectionCard>
  </div>

  <!-- live demo: the workbench is PLAIN PAGE MARKUP on purpose — an
       outline root inside a component canvas derives zero (the canvas
       stamps data-toc-skip). Placement is part of the API. -->
  <div id="live-demo" data-reveal="">
    <SectionCard
      family="live-demo"
      headerRegion="live-demo"
      eyebrow="live demo"
      title="The workbench — two live rails, zero handwritten ids"
      summary="The article below is tracked twice: the page rail on the right is the MANUAL composed tree; the rail beside the article runs AUTO outline mode — it derived its links from these very headings on hydrate (they carry runtime-stamped ids — inspect them). Scroll and watch both: nodes fill by IoM weight, the bold marker is the viewport-top line pick."
    >
      <div class={cx(rt.tcGrid)}>
        <article id="toc-workbench-article" class={cx(rt.wFull, rt.shellCol)}>
          <div id="toc-what" class={cx(rt.flex, rt.col, rt.gap16)}>
            <h2 data-doc-demo-heading="" class={cx(rt.fontNav, rt.tcHeading, rt.trackTight)}>what it tracks</h2>
            <p class={cx(rt.tcPara)}>
              Scroll this page and watch the rails: nodes fill proportionally to how much of their
              block occupies the viewport — a half-visible heading block reads ~50%, not a binary
              in-view flag. Both directions saturate: cover the viewport entirely and the weight
              is 100%.
            </p>
            <div id="toc-weights" class={cx(rt.flex, rt.col, rt.gap16)}>
              <h3 data-doc-demo-heading="" class={cx(rt.fontNav, rt.text95, rt.trackTight)}>IoM weights</h3>
              <p class={cx(rt.maxW64ch, rt.pretty, rt.bodyMuted)}>
                Intersection-over-minimum: the intersection area divided by the smaller of the block
                and the viewport. Tall blocks don't dwarf small ones — a short block fully visible
                weighs the same 100% as a tall block filling the screen.
              </p>
            </div>
            <div id="toc-line" class={cx(rt.flex, rt.col, rt.gap16)}>
              <h3 data-doc-demo-heading="" class={cx(rt.fontNav, rt.text95, rt.trackTight)}>the line pick</h3>
              <p class={cx(rt.maxW64ch, rt.pretty, rt.bodyMuted)}>
                The bold marker is the viewport-top LINE: whichever region contains it is the pick.
                Margins between blocks resolve downward to the next block — the line never floats in
                dead space. On mobile the line sits at the sticky rail's bottom edge.
              </p>
            </div>
          </div>
          <section id="toc-anatomy" class={cx(rt.flex, rt.col, rt.gap16)}>
            <h2 data-doc-demo-heading="" class={cx(rt.fontNav, rt.tcHeading, rt.trackTight)}>two modes, one family</h2>
            <p class={cx(rt.tcPara)}>
              MANUAL composes TocList (ul) / TocItem (li) / TocLink (a) — SSR-complete, nesting is
              a TocList inside a TocItem, anchors never nest. AUTO hands the rail a content root
              and the outline lib derives the same tree from the headings at runtime and renders
              through the same parts — the DECLARED SSR exception: the server paints the rail
              shell, links arrive on hydrate. The old sections[] prop is gone.
            </p>
          </section>
          <section id="toc-engine" class={cx(rt.flex, rt.col, rt.gap16)}>
            <h2 data-doc-demo-heading="" class={cx(rt.fontNav, rt.tcHeading, rt.trackTight)}>the engine</h2>
            <p class={cx(rt.tcPara)}>
              toc-engine.ts is framework-free (no framework imports — the engine owns the scroll/resize
              listener pair; the derivation lib toc-outline.ts is the listener-free half: DOM in,
              plain data out), and the family talks to it entirely through the DOM:
              the root re-queries its own subtree per update (no registration — keyed reorders and
              conditional links just work), derives each link's target from its href fragment, and
              synthesizes heading-to-heading extents for the engine. Scrollspy, aria-current, and
              the parent marker are root behavior in both modes.
            </p>
            <CodeBlock code={usage} lang="svelte" meta="usage" />
          </section>
        </article>
        <aside class={cx(rt.minW0)} aria-label="Outline demo">
          <Toc outline={{ root: '#toc-workbench-article' }} title="auto mode" scrollRoot=".jx-shell-body" />
        </aside>
      </div>
      <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
        Why this workbench is not a canvas demo: the component canvas stamps
        <code>data-toc-skip</code> on its root (demo headings must never leak into page outlines —
        the outline law), and an outline root inside it derives ZERO. The measured receipts below
        include the before/after: the same AUTO rail inside the canvas rendered its empty shell
        forever. Placement is part of the API.
      </p>
    </SectionCard>
  </div>

  <div id="toc-base" data-reveal="">
    <SectionCard
      family="toc-base"
      headerRegion="toc-base"
      eyebrow="W3C foundation"
      title="What the platform gives"
      summary="The rail is a labeled nav of real anchors: fragment links the browser crawls, focus the platform manages, and heading ids the anchor lands exactly. Scrollspy writes aria-current — it never steals focus or moves the scroll position under you."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two modes over one family of parts: AUTO derives the tree from headings; MANUAL is the composed list tree.">
    <div class={cx(rt.grid760b)}>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>AUTO · outline mode</span><p class={cx(rt.mt8, rt.bodyMuted)}><code class={cx(rt.inkAccent)}>outline={'{ root }'}</code> derives the same tree from a content root's headings at runtime — zero handwritten ids; the declared SSR exception (rail shell paints, links arrive on hydrate). Placement law: the root cannot live inside a component canvas (data-toc-skip derives zero).</p></div>
      <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>MANUAL · composed tree</span><p class={cx(rt.mt8, rt.bodyMuted)}>TocList (ul) / TocItem (li) / TocLink (a) — SSR-complete; nesting is a TocList inside a TocItem, anchors never nest.</p></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Both modes in one copyable sample; the rail needs an aside shell and (overlay shells) the scrollRoot."><CodeBlock code={usage} lang="svelte" meta="Toc usage" /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Chrome sizing and the scrollspy paint are token-driven custom properties the engine writes at runtime; the mobile bar's depth rides the glass-effect stamp."><div class={cx(rt.col24)}><DensityDemo><Toc title="density sample"><TocList><TocItem><TocLink href="#types">Types</TocLink></TocItem><TocItem><TocLink href="#api">API</TocLink></TocItem></TocList></Toc></DensityDemo><TokenTable tokens={[{ name: '--jx-toc-line', default: '76px', source: 'component', description: 'The line-pick offset — derives from the measured header height + toc bar' }, { name: '--jx-cur', default: '0 | 1', source: 'component', description: 'The pick marker flag the engine writes per link' }, { name: '--jx-progress', default: '0 → 1', source: 'component', description: 'Spine fill scale (IoM weights)' }, { name: '--jx-chrome-bar', default: '44px', source: 'component', description: 'Mobile glass bar height' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Toc and TocList Props interfaces; TocItem/TocLink are the same shape passthrough. The root is ATTRIBUTE-TRANSPARENT: the rest spread (HTMLAttributes minus color) lands on the rail root — id, data-*, aria-* and handlers included."><PropsTable universal props={[{ name: 'outline', type: 'TocOutlineConfig', default: '—', description: 'AUTO mode: derive the outline from a content root headings ({ root, levels? }). Placement law: the root cannot live inside a component canvas (data-toc-skip derives zero).' }, { name: 'title', type: 'string', default: "'reading progress'", description: 'The desktop rail label.' }, { name: 'scrollRoot', type: 'string | HTMLElement | null', default: 'document', description: 'Scroll root for overlay-shell layouts (selector or element).' }, { name: 'children', type: 'Snippet', default: '—', description: 'MANUAL mode: the composed TocList tree.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough (root / list).' }, { name: 'TocList: children', type: 'Snippet', default: '—', description: 'TocItem children; nesting is a TocList inside a TocItem.', required: true }, { name: '...rest', type: 'HTMLAttributes', default: 'spread', description: 'TocList spreads onto the ul; TocLink is a plain anchor with your href.' }]} /></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="The eight axes on toc"
      summary="The FIRST-TIME all-no-own contract (the rail is placement chrome): density stamps the root and the ambient scope paints; size echoes on the rail root; theme is a declarative stamp over the page bridge; shape/radius/color/elevation/motion supply unread (zero carrier readers — the spy paint maps engine-written flags to the brand chain directly)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Receipts: the channel census (six authored instances → nine served roots on this page —
          the DensityDemo multiplies the density sample across its scope wrappers; every demo
          specimen is a
          Toc root; the aside rail's composed tree renders twice by design, desktop spine + mobile
          viewport) and the scrollspy (weights 0 → 1 per link as --w, the pick's aria-current
          following the shell scroller, the spine fill --jx-progress live) were measured on this
          page's served DOM (probe, task 69); the outline lib's slug stamp, wrapper-twin adoption,
          duplicate -2 suffix, data-toc-skip, CJK positional fallback, two-tier collapse,
          idempotent re-derivation and heading-to-heading extents were exercised in-browser against
          a fixture; the theme strata (rail title oklch(0.3211 0 0) → oklch(0.8452 0 0) under the
          page bridge — task-69-era digits, re-measure at citation) the same way; the unread rows carry grep receipts over ui/toc/. The query()
          seat below rides the md viewport key (48rem) on the size lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="toc · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
              <Toc title="on this page" size={responsiveSize}>
                <TocList><TocItem><TocLink href="#overview">Overview</TocLink></TocItem></TocList>
              </Toc>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                wider the md case wins (18px) — the rail voice scales while the spy behavior is
                unchanged. The number lane goes bare. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="Toc · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Toc title="axes" size={18} density="small"><TocList><TocItem><TocLink href="#overview">what it tracks</TocLink></TocItem><TocItem><TocLink href="#types">two modes</TocLink></TocItem></TocList></Toc></div>
<div class={cx(rt.panel)}><Toc title="named steps" size="medium" radius="large"><TocList><TocItem><TocLink href="#overview">what it tracks</TocLink></TocItem></TocList></Toc></div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A labeled nav of real anchors; scrollspy writes aria-current, never focus."><A11yTable keys={[{ key: 'Tab', action: 'Reaches the rail links in tree order; focus is never stolen by scrollspy' }, { key: 'Enter', action: 'Follows the anchor — the heading lands exactly on the pick line' }]} aria={[{ name: 'aria-label', value: '"Table of contents"', description: 'On the desktop nav landmark (plus your aside label)' }, { name: 'aria-current', value: '"true"', description: 'Written on the active link(s) by the engine each update' }, { name: 'aria-expanded', value: 'boolean', description: 'On the mobile bar disclosure toggle ("Expand table of contents")' }]} /></SectionCard></div>

  <!-- see-also (chrome — out of the toc) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="toc" />
  </div>
</div>
