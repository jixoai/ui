<!--
  Docs page for the anchor family (MDN archetype, docs-eight-axes-mdn
  round 1, scribe 2026-09-22). Order: hero → install → overview →
  usage → the live demo canvas (THIS PAGE is the demo — the sections
  carry the fragment ids the rails spy on) → props → the eight axes
  on anchor (per-axis table + runnable demos + one real query() case)
  → accessibility → see-also. Structure follows the baseline skill
  (skills/mdn-doc-style.md §2); the component family is untouchable
  from here.
-->
<script lang="ts">
  import Anchor from '$lib/ui/anchor/anchor.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import AnchorItem from '$lib/ui/anchor/anchor-item.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
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

<!-- the spy reads its targets from the root's OWN DOM (child
     a[href^="#"]) — no registration; offset (default 96) drops the
     pick line below sticky headers -->`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/anchor/anchor.svelte', content: anchorSource },
    { name: 'registry/files/ui/anchor/anchor-item.svelte', content: anchorItemSource },
    { name: 'src/lib/ui/anchor-usage.svelte', content: usage, kind: 'usage' },
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

  // ---- the eight axes on anchor: the runnable demos -----------------------
  // code shown = code running: the panels below pass these exact lanes.
  const axesUsage = `<!-- density: named steps re-scope the rail's spacing channels -->
<Anchor label="ambient rail">…</Anchor>
<Anchor label="compact rail" density="small">…</Anchor>
<Anchor label="roomy rail" density="large">…</Anchor>

<!-- theme: supply-side here — a resolved dark stamps the .dark
     class bridge on the nav; the rail's ink follows the site theme -->
<Anchor label="dark rail" theme="dark">…</Anchor>

<!-- query(): below the lg viewport rung (64rem) the rail rides
     small; at ≥64rem it steps to large. Resize and watch. The
     explicit generics pin the case AND the base to the lane (the
     bare form infers QueryResult<string> — a type error). -->
<Anchor label="responsive rail" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}>…</Anchor>`;

  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/anchor-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the per-axis table (skill §2.5): mechanism names are the REAL
  // carriers/vars the family stamps or reads (anchor.stylex.ts +
  // defaults.svelte.ts stampCarriers); steps/units per
  // universal-props.schema.ts.
  const axisRows = [
    {
      name: 'density',
      type: 'data-density rung · --jx-density-coefficient',
      default: 'auto',
      description:
        'The one axis whose paint the rail itself consumes. Named steps small · medium · large stamp the rung on the nav and re-scope the channels the paint reads — --jx-stack (rail gap), --jx-hit (link min-height), --jx-inset (inline padding), --jx-text / --jx-line (label). A number is a coefficient: it multiplies the same channels and leaves the rung ambient. The five legacy rung spellings (xs · 2xs · sm · default · lg) also address lanes directly.',
    },
    {
      name: 'size',
      type: '--jx-size-effective → root font-size',
      default: 'auto',
      description:
        "Stamps the carrier on the nav. The labels do not follow — they read the density channels --jx-text / --jx-line, not em — so scale the rail with density. Size supplies downward to nested component consumers. Steps small · medium · large; a number is px.",
    },
    {
      name: 'shape',
      type: '--jx-shape-effective · --jx-radius-factor-effective',
      default: 'auto',
      description:
        'Carriers stamp on the nav, but the rail paints no corners — nothing consumes them on this family. Steps round · scoop · bevel · notch · square · squircle; no number lane.',
    },
    {
      name: 'radius',
      type: '--jx-radius-effective',
      default: 'auto',
      description:
        'Same absence: a left-spine rail has no corner geometry. Steps small · medium · large; a number is px.',
    },
    {
      name: 'color',
      type: '--jx-color-effective',
      default: 'auto',
      description:
        "The carrier stamps, but the rail's ink reads the semantic tokens directly — --jx-foreground, --jx-muted-foreground, --jx-primary for the active spine — so a hue lane retunes nothing here. Steps primary · secondary · error · warn · success · info; a number is hue degrees.",
    },
    {
      name: 'theme',
      type: 'the .dark class bridge',
      default: 'auto',
      description:
        "Stamp-side on this family: a resolved dark puts .dark on the nav and flips the raw token layer (--foreground, --muted-foreground) at that scope — but the rail's ink reads the root-anchored --jx-* aliases, declared only at :root and the stylex theme scopes, which a plain .dark never re-substitutes. The rail follows the site theme, not this lane. Steps light · dark · system; auto inherits the tree.",
    },
    {
      name: 'elevation',
      type: '--jx-elevation-effective',
      default: 'auto',
      description:
        'The carrier stamps; the rail paints no shadow. Steps level-1 · level0 · level1 · level2 · level3 · level4 · level5; a number is exact dp.',
    },
    {
      name: 'motion',
      type: '--jx-motion-effective',
      default: 'auto',
      description:
        "The carrier stamps; the rail's only transition is the fixed --motion-150 / --motion-ease-out color fade — no motion-kernel consumption. Steps reduced · subtle · normal · expressive; a number is a coefficient.",
    },
  ];

  // the density channels the rail's own paint reads (anchor.stylex.ts)
  const densityTokens = [
    { name: '--jx-stack', default: 'rung scale × coefficient', source: 'density' as const, description: 'Vertical gap between the rail links.' },
    { name: '--jx-hit', default: 'rung scale × coefficient', source: 'density' as const, description: 'Minimum fragment-link target height.' },
    { name: '--jx-inset', default: 'rung scale × coefficient', source: 'density' as const, description: 'AnchorItem inline padding.' },
    { name: '--jx-text', default: 'rung scale × coefficient', source: 'density' as const, description: 'AnchorItem label size.' },
    { name: '--jx-line', default: 'rung scale × coefficient', source: 'density' as const, description: 'AnchorItem label line height.' },
    { name: '--jx-hairline', default: '1px', source: 'structural' as const, description: 'The rail spine; the active item paints 2× over it.' },
  ];

</script>

<svelte:head>
  <title>Anchor · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai anchor family: a nav of real fragment links (AnchorItem parts) with native navigation and a DOM-delegated scrollspy that marks aria-current=location. JavaScript only reads the scroll position — it never navigates."
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
      eyebrow="registry:ui · General"
      title="anchor — real links, read-only spy"
      summary="A nav landmark (Anchor) of real fragment links (AnchorItem parts): navigation and smooth scrolling stay native, and JavaScript only reads the scroll position to mark aria-current=location."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">real fragment links</span>
        <span class="pill">aria-current=location</span>
        <span class="pill">DOM-delegated spy</span>
        <span class="pill">one shared pick engine</span>
      </div>
    </SectionCard>
  </div>

  <div id="install" data-reveal="">
    <DocsInstall name="anchor" />
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="Two composed parts, one read-only behavior: the nav landmark, the fragment links, and the active-link pick."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          Anchor is the heading-anchor rail (antd's Anchor) as a composed family. The Anchor root
          renders the nav landmark; each AnchorItem child renders one real fragment link. You
          compose the items — the family ships no link list and invents no targets.
        </p>
        <p class={cx(rt.measurePara)}>
          The root's one behavior beyond the landmark is the active-link pick: a rAF-throttled
          scrollspy marks the last target whose top sits at or past the viewport-top line
          (<code>offset</code>, default 96px — below sticky headers). Targets derive from the root's
          OWN DOM (every child <code>a[href^="#"]</code>) on every read: no registration, so keyed
          reorders and conditional items cannot corrupt the spy, and a childList MutationObserver
          re-derives them when items enter or leave.
        </p>
        <p class={cx(rt.measurePara)}>
          A click keeps native fragment navigation and adds two reversible leases:
          <code>scroll-margin-top = offset</code> lands the heading clear of sticky headers, and a
          temporary <code>tabindex="-1"</code> moves focus onto it (restored on blur). The pick runs
          the shared <code>@lib/scroll-spy</code> — anchor answers the simpler which-section
          question; the toc family runs the full reading-progress engine. For the axis grammar, see
          the <a href="/docs/universal-props.html">universal props</a> concept page.
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
      summary="Compose AnchorItem links inside Anchor and point each href at an existing page fragment."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>

  <div data-reveal="">
    <div class={cx(rt.anGrid)}>
      <div class={cx(rt.shellCol)}>
        <ComponentCanvas
          title="anchor"
          description="Scroll the band below — the anchor rail beside the workbench marks the section crossing the viewport-top line; the page rail in the site chrome tracks the same fragments."
          sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/anchor/anchor.svelte"
          files={canvasFiles}
          stage="fill"
        >
          <section id="anchor-what" data-region="anchor-what" class={cx(rt.col12)}>
            <h3 data-doc-demo-heading="" class={cx(rt.anHeading)}>what it does</h3>
            <p class={cx(rt.measurePara)}>
              A composed list of in-page anchors: clicking navigates the fragment natively (smooth
              scrolling rides the theme's scroll-behavior), and hovering and focusing behave like
              any link. The root owns ONE behavior beyond the landmark: the active-link pick.
            </p>
          </section>
          <section id="anchor-pick" data-region="anchor-pick" class={cx(rt.anMt32, rt.col12)}>
            <h3 data-doc-demo-heading="" class={cx(rt.anHeading)}>the line pick</h3>
            <p class={cx(rt.measurePara)}>
              The pick is the LAST target whose top sits at or past the viewport-top line
              (<code>offset</code>, default 96px for sticky headers). Targets come from the root's
              own DOM: every child <code>a[href^="#"]</code> joins the spy — no registration, no
              order dependence.
            </p>
          </section>
          <section id="anchor-vs-toc" data-region="anchor-vs-toc" class={cx(rt.anMt32, rt.col12)}>
            <h3 data-doc-demo-heading="" class={cx(rt.anHeading)}>anchor vs toc</h3>
            <p class={cx(rt.measurePara)}>
              toc measures how much of each block fills the viewport (IoM weights) and draws the
              rule tracker; anchor answers the simpler which-section question with the same shared
              pick engine — zero coupling beyond the target ids existing.
            </p>
            <!-- depth: every section must be able to cross the pick line -->
            {#each Array(14) as _, i (i)}
              <p class={cx(rt.text125, rt.lead6, rt.inkMuted70)}>
                filler depth {i + 1} — keeps the last section reachable past the offset line
              </p>
            {/each}
          </section>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the anchor is read-only — scroll and watch the in-workbench rail mark the section
              crossing the viewport-top line. <code>offset</code> (default 96px) moves the pick
              line below sticky headers.
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

  <div id="props" data-reveal="">
    <SectionCard
      eyebrow="api"
      title="Props"
      summary="The root carries the landmark and the pick line; each item is an ordinary composable anchor. The eight style axes resolve on the root and supply downward — the generated Universal props section below is the shared surface."
    >
      <div class={cx(rt.col24)}>
        <PropsTable universal title="Anchor" props={[
          { name: 'label', type: 'string', default: "'on this page'", description: 'Accessible name of the navigation landmark.' },
          { name: 'offset', type: 'number', default: '96', description: 'Viewport-top pick line in pixels; also the scroll-margin-top lease on landing.' },
          { name: 'children', type: 'Snippet', required: true, description: 'The AnchorItem links.' },
          { name: '...rest', type: 'HTMLAttributes', default: 'spread', description: 'Forwarded to the nav element; class joins the rail atoms.' },
        ]} />
        <PropsTable title="AnchorItem" props={[
          { name: 'href', type: 'string', required: true, description: 'Target fragment, #section-id.' },
          { name: 'child', type: 'Snippet', default: '—', description: 'Replacement-element escape; receives the merged anchor props — class with the active paint, href, aria-current, rest.' },
          { name: 'children', type: 'Snippet', default: '—', description: 'Visible link label.' },
          { name: '...rest', type: 'HTMLAnchorAttributes', default: 'spread', description: 'Forwarded to the anchor element.' },
        ]} />
      </div>
    </SectionCard>
  </div>

  <div id="anchor-axes" data-reveal="">
    <SectionCard
      eyebrow="axes"
      title="The eight axes on anchor"
      summary="anchor carries all eight lanes as a first-time no-own surface (migration census, W3 close D5): an explicit lane stamps its carrier on the nav and supplies downward — AnchorItem parts and nested components read the supply, the broadcast protocol (吃也供, supply-and-consume). Density is the one axis whose paint the rail itself consumes; the other seven stamp-and-supply carriers its paint does not read (theme's .dark bridge flips the raw token layer only — see the theme row)."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier it stamps on the nav
          here, Default is the lane default — the named steps, number unit, and consumption on
          this family are in each description.
        </p>
        <PropsTable title="" props={axisRows} />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the eight-axis adoption itself is the census row — anchor was one of
          the 13 sweep holes migrated in the W3 close (D5), which retired its declaration-only
          density posture (openspec/changes/explicit-props/research/migration-census.md). No §13
          renames apply: <code>offset</code> and <code>label</code> are family props, not axis
          names.
        </p>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={densityTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on anchor" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="anchor · the eight axes" stage="fill" files={axesFiles}>
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>auto — ambient scope, stamps nothing</span>
                <Anchor label="ambient rail">
                  <AnchorItem href="#anchor-what">what it does</AnchorItem>
                  <AnchorItem href="#anchor-pick">the line pick</AnchorItem>
                  <AnchorItem href="#anchor-vs-toc">anchor vs toc</AnchorItem>
                </Anchor>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="small"</span>
                <Anchor label="compact rail" density="small">
                  <AnchorItem href="#anchor-what">what it does</AnchorItem>
                  <AnchorItem href="#anchor-pick">the line pick</AnchorItem>
                  <AnchorItem href="#anchor-vs-toc">anchor vs toc</AnchorItem>
                </Anchor>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="large"</span>
                <Anchor label="roomy rail" density="large">
                  <AnchorItem href="#anchor-what">what it does</AnchorItem>
                  <AnchorItem href="#anchor-pick">the line pick</AnchorItem>
                  <AnchorItem href="#anchor-vs-toc">anchor vs toc</AnchorItem>
                </Anchor>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps the nav; the rail's ink stays site-themed</span>
                <Anchor label="dark rail" theme="dark">
                  <AnchorItem href="#props">props</AnchorItem>
                  <AnchorItem href="#anchor-axes">the eight axes</AnchorItem>
                  <AnchorItem href="#accessibility">accessibility</AnchorItem>
                </Anchor>
              </div>
            </div>
            <div class={cx(rt.col20, rt.wFull, rt.anMt32)}>
              <span class={cx(rt.note11)}>density={"{query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}"}</span>
              <Anchor label="responsive rail" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}>
                <AnchorItem href="#anchor-what">what it does</AnchorItem>
                <AnchorItem href="#anchor-pick">the line pick</AnchorItem>
                <AnchorItem href="#anchor-vs-toc">anchor vs toc</AnchorItem>
              </Anchor>
              <p class={cx(rt.mt4, rt.note12, rt.inkMuted70)}>
                SSR paints the base (small); at the lg viewport rung (≥64rem) the rail steps to
                large — resize across 64rem and watch.
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
      summary="Native links in a named navigation landmark; the scrollspy writes aria-current and never moves focus."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves through the fragment links in composed order; the spy never steals focus' },
          { key: 'Enter', action: 'Navigates to the target fragment; focus rides onto the heading (tabindex=-1, restored on blur)' },
        ]}
        aria={[
          { name: 'aria-label', value: "'on this page' by default", description: 'Names the navigation landmark.' },
          { name: 'aria-current', value: "'location' on the active item", description: 'Announces the section the scrollspy picked; scrolling alone never moves focus.' },
          { name: 'href', value: '#fragment', description: 'Real fragment hrefs keep native navigation, deep links, and middle-click.' },
        ]}
      />
      <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
        Density is also the hit-surface axis here: the link's minimum target height (--jx-hit)
        measures 32 / 40 / 48px at small / default / large — every rung clears the 24px
        WCAG 2.5.8 AA target floor.
      </p>
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="anchor" />
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
