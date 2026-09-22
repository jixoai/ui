<!--
  Docs page for blockquote (markdown-coverage-components §1.1, Lane D).
  MDN-style refactor (docs-eight-axes-mdn round 1, quill): the page
  follows the baseline archetype (skills/mdn-doc-style.md §2) — hero,
  overview, live examples (rungs / rule / icon lane), API from the
  GENERATED meta + docs curation, the eight-axes section (per-axis
  table + grouped demos + one real query() case), accessibility,
  see-also. The rungs + rule canvas children stay byte-identical to
  the pre-refactor page (canvas-same-source.spec.ts pins their
  extractions and the drawer order).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Blockquote from '$lib/ui/blockquote/blockquote.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import { usageFile } from '$lib/canvas-usage';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import { meta as blockquoteMeta } from '$lib/meta/blockquote.meta';
  import { BLOCKQUOTE_DOCS } from '$lib/ui/props-table/docs/blockquote.docs';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import blockquoteSource from '$lib/ui/blockquote/blockquote.svelte?raw';

  // The canvas same-source lane (typography-context-and-parts §7): the
  // usage sample composes from THIS PAGE's own canvas markup — the
  // SectionCard CodeBlock and each canvas's usage TreeFile feed from
  // the same extracted string (one source, two surfaces).
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/blockquote.html/+page';

  const usage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('rungs'));
  const ruleUsage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('rule'));

  // per-canvas arrays (the shared one drifted: both drawers showed the
  // rungs sample while the rule canvas rendered its own matrix)
  const rungsFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-usage.svelte', content: usage, kind: 'usage' },
  ];
  const ruleFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-rule-usage.svelte', content: ruleUsage, kind: 'usage' },
  ];

  // the icon-lane demo rides the SAME same-source lane as rungs/rule
  // (this page's own law — the hand literal + `const close` dodge stay
  // gone)
  const iconLaneUsage = usageFile({ Blockquote: '@ui/blockquote' }, resolveRawCode('icon-lane'));
  const iconLaneFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-icon-usage.svelte', content: iconLaneUsage, kind: 'usage' },
  ];

  // the eight-axes canvas: the query() case pulls the runtime engine —
  // the composed usage file carries the import so the drawer stays
  // copy-paste-runnable
  const axesUsage = usageFile(
    { Blockquote: '@ui/blockquote', '{ query }': '$lib/universal-props-query.svelte' },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'registry/files/ui/blockquote/blockquote.svelte', content: blockquoteSource },
    { name: 'src/lib/ui/blockquote-axes-usage.svelte', content: axesUsage, kind: 'usage' },
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

  // ---- the per-axis table (docs-eight-axes-mdn §2.5) ----------------------
  // What each universal axis drives on THIS family — the carrier/var
  // names are the family's real ones (blockquote.stylex.ts,
  // blockquote.css, stampCarriers in defaults.svelte.ts); steps and
  // units per universal-props.schema.ts; the supply-only absences are
  // documented, never invented.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: "'auto'",
      description:
        "CONSUMED — stamps --jx-size-effective and the root font-size; the body's 0.875em voice (blockquote.css) rescales with it. The label/cite chrome rows stay fixed at var(--jx-text-base). Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: "'auto'",
      description:
        "SCOPE — stamps --jx-density-coefficient and the data-density rung attribute; kernel channels inside the quote (--jx-stack, --jx-gap) follow the rung. The quote's own paddings ride --jx-unit and --jx-space-12 — not density channels — and stay fixed. small/medium/large alias sm/default/lg; the five legacy spellings stay addressable. Number unit: coefficient.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: "'auto'",
      description:
        "CONSUMED — dark stamps the .dark class bridge on the root and the island's vars re-resolve the dark profile; light and system ride tree inheritance. No number lane.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: "'auto'",
      description:
        "SUPPLY ONLY — stamps --jx-radius-effective for descendants. The quote's one corner surface, the tonal box, keeps the theme radius var(--radius) (blockquote.stylex.ts tonalGround); a per-instance corner size does not repaint it. Documented absence. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: "'auto'",
      description:
        'SUPPLY ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no blockquote css reads them — a quote paints no corner-shape (the degrade table lives on the universal props page). Documented absence. No number lane.',
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: "'auto'",
      description:
        'SUPPLY ONLY — stamps --jx-color-effective; nothing in the family reads it. Hue here rides the jx-hue-* scope classes, which inject --jx-tonal and --jx-outline — the single hue source the tonal ground, the inks and the rule channel consume. Number unit: hue degrees; raw strings pass through (closed at build).',
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: "'auto'",
      description:
        "SUPPLY ONLY — stamps --jx-elevation-effective (level-1 = −1dp … level5 = 12dp); a static quote paints no shadow ladder — the only shadow is the rule channel's inset. Documented absence. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: "'auto'",
      description:
        'SUPPLY ONLY — stamps --jx-motion-effective; reading content carries no motion kernels. Documented absence. Number unit: coefficient.',
    },
  ];
</script>

<svelte:head>
  <title>Blockquote · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai blockquote: the reading-content quote and admonition surface — the native <blockquote> on the alert-shaped two-rung ladder (outline, the classic left-rule quote; tonal, the alert recipe verbatim), with the rule channel, label/icon/cite composition, and the eight universal axes."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="blockquote — the quote, on the banner's ladder"
        summary="The reading-content quote and admonition surface: the native <blockquote> on the alert-shaped two-rung ladder — outline, the classic left-rule quote; tonal, the alert recipe verbatim — with label, icon and cite composing over either rung."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;blockquote&gt;</span>
          <span class="pill">outline · tonal (frozen)</span>
          <span class="pill">rule shadow|border × 1|4|8</span>
          <span class="pill">label / icon / cite</span>
          <span class="pill">GitHub alerts land here</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="blockquote" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="One native element, two frozen postures, one rule channel — composed over by label, icon and cite."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Blockquote is the reading-content quote and admonition surface. The root is the native
            <code>&lt;blockquote&gt;</code> element — quoted-prose semantics come from the platform,
            and <code>cite</code> renders the MDN attribution posture (<code>footer &gt; cite</code>
            after the body), never an element swap.
          </p>
          <p class={cx(rt.measurePara)}>
            One surface, two postures, on the alert-shaped two-rung ladder: outline (the default) is
            the classic left-rule quote — transparent ground, an inset rule, a 0.875em muted body;
            tonal is the alert recipe verbatim (12% tinted ground, 45% border, rounded box), the
            callout posture. Availability is frozen at these two rungs: fill buries long-form copy,
            and ghost is interactive-chrome vocabulary a static quote misuses. Hue rides the
            <code>jx-hue-*</code> class injection — never a variant name; the markdown map's GitHub
            alerts land here as tonal + label + hue.
          </p>
          <p class={cx(rt.measurePara)}>
            The left rule is its own channel: <code>rule</code> (shadow | border) ×
            <code>ruleSize</code> (1 | 4 | 8 px) — the inset standard made a prop, paddings fixed
            across sizes (paint never moves geometry). <code>label</code> renders the alert
            title-row form, <code>icon</code> composes inline-start of it, and the body rides
            0.875em of the ambient scale. The eight universal axes resolve on the same root — the
            grammar (named steps, auto, numbers, <code>query()</code>) is documented once on the
            <Link href="/docs/universal-props.html" title="the universal props page">universal props page</Link>.
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
        summary="Import the component, choose the posture by prominence — outline for the plain quote, tonal for the admonition — and compose label, icon and cite over either rung."
      >
        <CodeBlock code={usage} lang="svelte" meta="Blockquote usage" />
      </SectionCard>
    </div>

    <div id="rungs" data-region="blockquote-rungs" data-family="blockquote-rungs" data-reveal="">
      <ComponentCanvas
        id="rungs"
        title="blockquote"
        description="The two frozen rungs side by side, the hue injections the admonition posture rides, and the label + cite composition. outline keeps the muted body (the manuscript posture); tonal tints both label and body like the alert rows."
        sourceUrl={registrySourceUrl('blockquote')}
        files={rungsFiles}
        stage="fill"
      >
        <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
          <div class={cx(rt.bqGrid640a)}>
            <Blockquote>
              outline (own) — transparent ground, a soft 4px left rule at a lightened mix, 0.875em muted body: the classic quote.
            </Blockquote>
            <Blockquote variant="tonal">
              tonal — the alert recipe verbatim: 12% tinted ground, 45% border, rounded box.
            </Blockquote>
          </div>
          <div class={cx(rt.bqGrid640a)}>
            <Blockquote variant="tonal" class="jx-hue-info" label="Note">
              The streaming prefix never remounts while chunks arrive.
            </Blockquote>
            <Blockquote variant="tonal" class="jx-hue-warning" label="Warning">
              The migration rewrites column names in place.
            </Blockquote>
          </div>
          <Blockquote label="Edsger W. Dijkstra" cite="EWD 648, 1978">
            The purpose of abstracting is not to be vague, but to create a new semantic level in
            which one can be absolutely precise.
          </Blockquote>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              Availability is frozen at <code>outline | tonal</code> — the alert-shaped row. fill
              buries long-form copy; ghost is interactive-chrome vocabulary a static quote misuses.
              Hue rides the <code>jx-hue-*</code> intent utilities on <code>class</code> (the tonal
              rung consumes them); <code>label</code> renders the alert title-row form and
              <code>cite</code> lands as <code>footer &gt; cite</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="rule" data-region="blockquote-rule" data-family="blockquote-rule" data-reveal="">
      <ComponentCanvas
        id="rule"
        title="blockquote"
        description="The rule channel — shadow (own) × border, each at the literal 1|4|8 px ladder. The rule's color rides the rung's OWN border-color declaration (one hue source: a jx-hue-* retune moves ground, box and rule together); ONE shadow utility per root; outline in shadow mode emits no border at all; the paddings stay FIXED across channels and sizes — border consumes geometry, shadow doesn't (paint never moves geometry)."
        sourceUrl={registrySourceUrl('blockquote')}
        files={ruleFiles}
        stage="fill"
        scroll="grow"
      >
        <div class={cx(rt.col24, rt.wFull, rt.maxW3xl)}>
          <div class={cx(rt.col12)}>
            <span class={cx(rt.note11)}>outline — shadow (own) × border, 1 | 4 | 8</span>
            <div class={cx(rt.bqGrid640b)}>
              <Blockquote rule="shadow" ruleSize={1}>shadow-4 — the default: a 1px inset rule painted over geometry.</Blockquote>
              <Blockquote rule="shadow" ruleSize={4}>shadow-4 — the emphasis quote, still 0.875rem of pad.</Blockquote>
              <Blockquote rule="shadow" ruleSize={8}>shadow-8 — the pull quote; ps stays fixed, the paint widens.</Blockquote>
              <Blockquote rule="border" ruleSize={1}>border-1 — the classic geometry-consuming rule.</Blockquote>
              <Blockquote rule="border" ruleSize={4}>border-4 — consumes 3px more of the box.</Blockquote>
              <Blockquote rule="border" ruleSize={8}>border-8 — the widest structural edge.</Blockquote>
            </div>
          </div>
          <div class={cx(rt.col12)}>
            <span class={cx(rt.note11)}>the resolved default — 4 won the browser review; 1 stays the xs2-scale hairline</span>
            <div class={cx(rt.bqGrid640a)}>
              <Blockquote rule="shadow" ruleSize={1}>shadow-1: the hairline — fits xs2-scale contexts only.</Blockquote>
              <Blockquote rule="shadow" ruleSize={4}>shadow-4: the default manuscript bar every quote now ships.</Blockquote>
            </div>
          </div>
          <div class={cx(rt.col12)}>
            <span class={cx(rt.note11)}>tonal — the box border stays; the shadow rule rides beside it</span>
            <div class={cx(rt.bqGrid640b)}>
              <Blockquote variant="tonal" rule="shadow" ruleSize={1}>tonal + shadow-1: a deliberate near-no-op — axis uniformity over special-casing.</Blockquote>
              <Blockquote variant="tonal" rule="shadow" ruleSize={4}>tonal + shadow-4: the rule starts to read through the tint.</Blockquote>
              <Blockquote variant="tonal" rule="shadow" ruleSize={8}>tonal + shadow-8: two edges, one hue source.</Blockquote>
            </div>
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The inset standard cited: command-item's
              <code>shadow-[inset_2px_0_0_var(--primary)]</code>, the elevation grammar's WELL
              tier, kbd's <code>--shadow-engrave</code> lineage. The 1/4/8 ladder is the Owner's
              explicit enumeration — recorded as the ruling over a derived scale. Forced colors:
              shadow modes re-materialize as an Npx CanvasText border
              (<code>forced-colors:shadow-none</code> + width + color — the entity law's "edge is
              structure" generalized); border modes keep the rung's existing degradation. Hook:
              <code>data-jx-blockquote-rule="{'{rule}-{size}'}"</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="composition" data-region="blockquote-composition" data-family="blockquote-composition" data-reveal="">
      <SectionCard
        family="composition"
        headerRegion="composition"
        eyebrow="demo"
        title="The icon lane — bring your own glyph"
        summary="icon is a snippet rendered inline-start of the label, exactly the alert precedent: the component ships no glyph vocabulary, so lucide marks, inline svgs and plain text all land the same way. The label row is the surface's one fixed chrome size (0.8125rem nav caps); the body inherits the ambient scale. The drawer carries the runnable source."
      >
        <ComponentCanvas id="icon-lane" title="blockquote · icon lane" stage="fill" files={iconLaneFiles}>
          <div class={cx(rt.maxWXl)}>
            {#snippet warningGlyph()}<span class={cx(rt.fontMono)} aria-hidden="true">▲</span>{/snippet}
            <Blockquote variant="tonal" class="jx-hue-warning" label="Warning" icon={warningGlyph}>
              The migration rewrites column names in place — snapshot before upgrading.
            </Blockquote>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="props" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="The table renders from the GENERATED meta; the eight universal axis rows split into the shared section beneath the family rows. ruleSize stays outside the eight — migration-census.md's §13 keep row (no collision with the universal size axis)."
    >
      <PropsTable meta={blockquoteMeta} docs={BLOCKQUOTE_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on this component"
      summary="What each axis drives HERE — the carrier names are the family's real vars (blockquote.stylex.ts, blockquote.css), steps and units per universal-props.schema.ts, every axis defaulting auto. Three axes are consumed on the quote itself (size, density, theme); five are supply-only — they stamp their carriers for descendants and no blockquote css reads them, recorded per axis instead of silently omitted. ruleSize is the family's own literal axis and stays outside the eight (the census keep row)."
    >
      <div class={cx(rt.col20, rt.wFull)}>
        <PropsTable props={axisRows} title="" />
        <ComponentCanvas
          id="axes"
          title="Blockquote · the consumed lanes, live"
          description="The lanes the quote itself paints: a px number and a named step on the size axis (the 0.875em body voice follows the root), the theme dark island, and one real query() case — the base 14px voice below the 48rem viewport, 16px at md and wider (resize the window). The supply-only axes stamp nothing visible on the quote; the table above records each absence."
          sourceUrl={registrySourceUrl('blockquote')}
          files={axesFiles}
          stage="fill"
        >
          <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
            <div class={cx(rt.gridSm2)}>
              <div class={cx(rt.panel)}>
                <Blockquote label="size 14" size={14}>A px number sets the root font-size — the body renders 0.875em of it: 12.25px here.</Blockquote>
              </div>
              <div class={cx(rt.panel)}>
                <Blockquote label="size large" size="large">The named step resolves through var(--jx-size-large); the body voice scales with it.</Blockquote>
              </div>
              <div class={cx(rt.panel)}>
                <Blockquote label="theme dark" theme="dark">The .dark class bridge re-resolves the island's vars — ground, border and rule inks follow the dark profile.</Blockquote>
              </div>
              <div class={cx(rt.panel)}>
                <Blockquote label="responsive" size={query({ md: 16 }, 14)}>Base 14px below the 48rem viewport, 16px at md and wider — resize and watch the body voice follow.</Blockquote>
              </div>
            </div>
          </div>
        </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="The native blockquote element announces quoted prose for free; the cite footer is real attribution markup, not decoration. Reading content, not a control — nothing to focus, nothing to operate."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — static reading content, not a control' }]}
        aria={[
          { name: 'blockquote', value: 'native element', description: 'Quoted prose semantics from the platform; no extra ARIA.' },
          { name: 'footer > cite', value: 'native elements', description: 'The MDN attribution posture — the cite marks the source title, announced with the quote.' },
          { name: 'data-jx-blockquote', value: 'variant', description: 'Hook attribute carrying the ladder variant (outline | tonal) for styling.' },
          { name: 'data-jx-blockquote-rule', value: '{rule}-{size}', description: 'The rule channel hook (e.g. shadow-1, border-4) — tests and tooling read the channel without reverse-engineering utility soup.' },
        ]}
      />
      <div class={cx(rt.col16)}>
        <p class={cx(rt.measurePara)}>
          Under forced colors the color-mix tints do not drop on their own: tonal degrades to
          Canvas ground with CanvasText ink, and the shadow rule re-materializes as an Npx
          CanvasText border — the edge survives as structure.
        </p>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="blockquote" />
  </div>
</div>
