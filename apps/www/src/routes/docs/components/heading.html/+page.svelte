<!--
  Docs page for heading (docs-eight-axes-mdn task 12, quill 2026-09-22;
  tier 2 over the W3-era page: the ladder canvas, standalone demo and
  a11y table survive, the skeleton re-orders to the archetype and gains
  Overview + the per-axis table + the generated props table + one real
  query() case). Order: hero → install → overview → usage → the ladder
  demo → the standalone demo → props → the eight axes → accessibility
  → see-also. Baseline skill: openspec/changes/docs-eight-axes-mdn/
  skills/mdn-doc-style.md §2.
  Demo law: the component MINTS headings, so every demo mounts inside
  data-doc-demo-scope="headings-ok" (the lint's sanctioned opt-out) and
  no demo mints an h1 (the page owns exactly one — the hero); the
  ladder demo spans levels 2–6.
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
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Heading from '$lib/ui/heading/heading.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { meta as headingMeta } from '$lib/meta/heading.meta';
  import { HEADING_DOCS } from '$lib/ui/props-table/docs/heading.docs';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import headingSource from '$lib/ui/heading/heading.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { Heading } from '@ui/heading';
${close}

<!-- the ladder: level sets the element AND the em-scaled size -->
<Heading level={2}>The section title</Heading>
<Heading level={3}>A subsection</Heading>

<!-- standalone: the hierarchy scales with the ambient font-size preset
     (em, never rem) and carries no margins of its own -->
<div class="flex flex-col">
  <Heading level={4}>Tight composition</Heading>
  <p>The container rhythm owns the spacing.</p>
</div>`;

  const ladderUsage = `<!-- the six levels (level 1 clamps in; h1 is the page's
     one-per-page title — components default to 2) -->
<Heading level={1}>1.875em — document title</Heading>
<Heading level={2}>1.5em — section</Heading>
<Heading level={3}>1.25em — subsection</Heading>
<Heading level={4}>1.125em — minor</Heading>
<Heading level={5}>1em — quiet label</Heading>
<Heading level={6}>1em — quietest</Heading>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/heading/heading.svelte', content: headingSource },
    { name: 'src/lib/ui/heading-usage.svelte', content: usage, kind: 'usage' },
  ];

  // the demo ladder deliberately spans 2–6: a demo-minted h1 would
  // compete with the page's single hero h1 (the one-h1 law)
  const levels = [2, 3, 4, 5, 6] as const;
  const sizes: Record<number, string> = {
    1: '1.875em',
    2: '1.5em',
    3: '1.25em',
    4: '1.125em',
    5: '1em',
    6: '1em',
  };

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- size: an explicit lane RESOLVES the em rung — the §11
     carrier stamps the root's font-size itself (inline wins the
     cascade); auto keeps the ladder scaling with the ambient preset -->
<Heading level={3}>1.25 × the ambient preset</Heading>
<Heading level={3} size={14}>14px — the number is verbatim</Heading>
<Heading level={3} size="large">18px — named steps resolve --jx-size-*</Heading>

<!-- theme: the PARTIAL pole — a dark island re-inks through the
     seam's --foreground fallback; the em ladder is theme-free -->
<Heading level={3} theme="dark">dark ink, same rung</Heading>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/heading-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive size on the root font-size. The
  // NUMBER lane goes bare (number results infer) — it's the STRING
  // lanes that need both generics (query<{ md: DensityLane },
  // DensityLane>({ md: 'small' }, 'large') — the campaign's typing law).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import Heading from '@ui/heading.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case
     (18px) wins and the h3 steps up -->
<Heading level={3} size={query({ md: 18 }, 14)}>responsive voice</Heading>`;

  const queryFiles: TreeFile[] = [{ name: 'heading-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(
        (style): style is string | { readonly [key: string]: string | object } =>
          Boolean(style),
      )
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the per-axis table (§2.5). Grep receipts: the heading family
  // reads ZERO effective carriers and ZERO kernel channels in its css
  // (rg '-effective' and 'var(--jx-text|--jx-line|--jx-inset)' over
  // ui/heading/ — zero hits). The one axis that repaints does it
  // through the §11 STAMP, not family css.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED VIA THE STAMP — the one axis that repaints. The §11 carrier emits BOTH --jx-size-effective AND the root's font-size (font-size: var(--jx-size-effective, 1rem)) inline on the h root, and inline wins the cascade — an explicit lane REPLACES the em rung (size={14} on an h3 renders exactly 14px; named steps resolve --jx-size-small/medium/large = 14/16/18px). auto stamps NOTHING and the em ladder rules: font-size = the level's rung × the ambient preset. Zero family css reads the var (grep receipt) — the stamp is the whole consumption. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero readers). Text has no corners. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers) — the heading draws no boxes. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the named rung stamps data-density and the lane resets --jx-density-coefficient; neither moves paint (grep receipt: zero --jx-density-* reads, and the --jx-text/--jx-line channels the rung scope re-bases are unread too — zero hits in ui/heading/). The heading's type voice is em-of-font-size, NOT the --jx-text channel: the density axis has no lever here, and a wrapper-level coefficient cannot re-base the rung (the declaring-element law). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers — zero hue-carrier and zero oklch-formula reads). The ink rides the seam: var(--jx-ty-ink, var(--foreground)) — the theme's foreground, never the hue carrier. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE PARTIAL POLE — one raw-token voice flips. A resolved dark stamps .dark on the h root, and the root's OWN ink reads the raw token: color: var(--jx-ty-ink, var(--foreground)) re-substitutes against the .dark slot block and the heading re-inks (measured below). Everything else is theme-free and frozen: the weight, the leading and the em ladder carry no raw reads (grep receipt: the only raw token in ui/heading/ is --foreground). Inside a prose face with data-jx-ty-ink='gradient' the seam pins to --jx-ty-ink instead — the prose scope owns the ink and the island can't take it. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero readers). Text casts no shadow. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. Zero transitions in the family — nothing animates, so the axis has nothing to step. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: 'the em ladder', default: '1.875 / 1.5 / 1.25 / 1.125 / 1em', description: 'Per-level font-size rungs (h1→h4; h5 and h6 share 1em). em, never rem — the no-font-size kinship: the ladder scales with the ambient preset, so no rem step can express it.' },
    { name: '--jx-weight-bold', default: '700', description: 'The one weight, every level — the face\'s B1 channel.' },
    { name: '--jx-leading-tight', default: '1.25', description: 'The leading, every level — heading-appropriate at every preset (the leading-tight step IS 1.25).' },
    { name: 'var(--jx-ty-ink, var(--foreground))', default: '--foreground fallback', description: 'The ink seam, verbatim from the face: standalone (no prose region) the fallback applies and the ink flips under .dark; inside a gradient prose face --jx-ty-ink is declared and pins the ink (print/forced-colors restore in prose.css).' },
    { name: '--heading-size-1 … --heading-size-5', default: 'unset (fallbacks = own values)', description: 'The em rungs\' promotion seams — reported for serial promotion; the component\'s own ladder values are the var fallbacks today.' },
    { name: '--jx-size-effective', default: 'stamped on explicit size', description: 'The §11 size carrier — the stamp emits the var AND the root\'s font-size (inline), which is what replaces the em rung when the lane is explicit.' },
  ];

</script>

<svelte:head>
  <title>Heading · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai heading: a native h1–h6 by level on the em-scaled size ladder (1.875em h1 down to 1em h5/6) — migrated out of the markdown prose face so the hierarchy scales with the ambient typography preset and the component stands alone. Level IS the structural axis (no paint ladder); no block margins; the rendered truth is what data-jx-heading stamps."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="heading — the ladder emigrated from the face"
        summary="A native h1–h6 by level (1–6, rounded then clamped), carrying the em size ladder that used to live in the markdown prose face: 1.875em at h1 down through 1em at h5/6. em, never rem — the hierarchy scales with the ambient font-size preset and survives the escape from any face. What it owns: bold, leading 1.25, the foreground ink, the size. What it refuses: a paint ladder (level IS the structural axis), block margins, and a Defaults file (level is not a style prop)."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native h1–h6</span>
          <span class="pill">em ladder · preset-scaled</span>
          <span class="pill">level = the structural axis</span>
          <span class="pill">no margins of its own</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="heading" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="One clamped value derives everything: the native element, the em rung and the hook never disagree."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Heading renders one native element — <code>h1</code> through <code>h6</code> via
            <code>svelte:element</code> — from a single clamped <code>level</code>: round to the
            nearest integer, bound to 1–6, then derive the tag, the em-scaled size rung and the
            <code>data-jx-heading</code> hook from that ONE value, so an out-of-range prop never
            desyncs the rendered truth from anything. Default 2 — h1 is the page's one-per-page
            title, and a component defaulting to it would mint competing titles; the markdown map
            always passes <code>level</code> explicitly.
          </p>
          <p class={cx(rt.measurePara)}>
            The em ladder is <strong>em, never rem</strong>: h1 1.875em → h2 1.5em → h3 1.25em →
            h4 1.125em → h5/h6 1em, of the <em>ambient</em> font-size (the typography trio
            presets bump it; the whole hierarchy rescales). No block margins — preflight zeroes
            them and the component stamps none back; the container rhythm owns spacing. No
            Defaults file: level is structural, not a style prop (the separator literal-axis
            precedent). Kept outside the eight axes per migration-census §13.
          </p>
          <p class={cx(rt.measurePara)}>
            The paint is exactly the face's B1 heading channels — bold, leading 1.25, and the ink
            seam <code>var(--jx-ty-ink, var(--foreground))</code> — so the component works
            standalone AND rejoins the prose face by hook: inside a
            <code>data-jx-ty-ink='gradient'</code> region the face fills the glyphs through
            <code>data-jx-heading</code>; the component owns no gradient knowledge. A leaf in the
            fleet (grep receipt: only the blueprint scenes mount it) — composition is
            consumer-side. The eight axes resolve on the h root: size is the one axis that
            repaints (via its stamp), theme is the partial pole (ink flips, ladder frozen), and
            six stamp-and-supply. Per-axis below; the shared grammar lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page.
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
        summary="Hand it a level; the element, the size and the hook all derive from the one clamped value — the tag and data-jx-heading never disagree."
      >
        <CodeBlock code={usage} lang="svelte" meta="Heading usage" />
      </SectionCard>
    </div>

    <div id="ladder" data-region="heading-ladder" data-family="heading-ladder" data-reveal="">
      <ComponentCanvas
        title="heading"
        description="The level ladder, rendered: each level is the native element at its em-scaled size with the same bold 1.25 leading and foreground ink. The demo spans levels 2–6 — a demo-minted h1 would compete with the page's single hero title (the one-h1 law); level 1 renders at 1.875em."
        sourceUrl={registrySourceUrl('heading')}
        files={canvasFiles}
        stage="fill"
      >
        <div class={cx(rt.wFull, rt.maxWXl)} data-doc-demo-scope="headings-ok">
          <div class={cx(rt.col12)}>
            {#each levels as lv (lv)}
              <div class={cx(rt.flex, rt.itemsBaseline, rt.gap16)}>
                <code class={cx(rt.w24, rt.flexNone, rt.fontMono, rt.text11, rt.inkMuted)}>h{lv} · {sizes[lv]}</code>
                <Heading level={lv}>The level {lv} rung</Heading>
              </div>
            {/each}
          </div>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The size ladder is <code>em</code>-scaled: bump the ambient font-size (the markdown
              typography presets do exactly this) and the whole hierarchy rescales with it. Level
              values clamp — round to the nearest integer, then bound to 1–6 — and the hook stamps
              the clamped truth, so an out-of-range prop never desyncs tag from
              <code>data-jx-heading</code>.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="standalone" data-region="heading-standalone" data-family="heading-standalone" data-reveal="">
      <SectionCard
        family="standalone"
        headerRegion="standalone"
        eyebrow="demo"
        title="Standalone — outside any prose face"
        summary="The component owns its channels outright, so it works with no jx-pure scope in sight: same ink, same weight, same ladder. It carries no margins — the container rhythm owns the spacing, GitHub's container-tight posture — and the markdown map escapes it (no-jx-pure) so the face stops double-painting it."
      >
        <div class={cx(rt.col20)}>
          <CodeBlock code={ladderUsage} lang="svelte" meta="the six levels" />
          <div class={cx(rt.maxWXl, rt.radius0, rt.frame, rt.p20)} data-doc-demo-scope="headings-ok">
            <div class={cx(rt.flex, rt.col)}>
              <Heading level={3}>No face, no problem</Heading>
              <p class={cx(rt.bodyMuted)}>
                The heading above rendered with zero prose-face context — the em ladder, weight
                and ink are the component's own. The gap you see is this container's rhythm, not
                the heading's margin.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="Props"
      summary="The table renders from the GENERATED meta + curation; the eight axis rows split into the shared section beneath. 14 meta props − 8 ambient axes = 6 rows; no EXTRA lane — level is the §13-kept structural prop."
    >
      <PropsTable meta={headingMeta} docs={HEADING_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on heading"
      summary="heading is a typography primitive (census batch D): the paint is three fixed voices — weight, leading, the ink seam — and the em ladder, so six of the eight axes stamp-and-supply without a reader. The exceptions: size REPLACES the em rung through its carrier stamp (the only axis that repaints), and theme is the partial pole — the seam's --foreground fallback flips under a dark island while the ladder stays frozen. The carriers stamp the h root itself (the promoted root is self-carried), greppable in the raw SSR."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch D row (the long tail —
          openspec/changes/explicit-props/research/migration-census.md); level is KEPT outside
          the axes per the §13 row (component-specific, no collision with the size axis — the
          family's local em ladder even renamed from <code>size</code> to <code>sizeLadder</code>
          in the same ruling). The §1 collision rule: the native element never receives a size or
          color attribute — <code>Omit&lt;HTMLAttributes&lt;HTMLHeadingElement&gt;, 'color'&gt;</code>
          clears the one native name at stake, and every axis name is the family's own
          destructured lane.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on heading" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="heading · the consumed lane and the partial pole" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)} data-doc-demo-scope="headings-ok">
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>auto — the em rung: 1.25 × the ambient preset</span>
                <Heading level={3}>1.25 × the ambient preset</Heading>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>size={"{14}"} — the rung replaced: exactly 14px</span>
                <Heading level={3} size={14}>14px — the number is verbatim</Heading>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>size="large" — --jx-size-large = 18px</span>
                <Heading level={3} size="large">18px — the named step</Heading>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the ink flips; the rung is byte-identical</span>
                <Heading level={3} theme="dark">dark ink, same rung</Heading>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The top pair is the disagreement probe: same level, same tag — the unstamped h3
              computes 1.25 × the inherited font-size while the stamped one computes exactly
              14px (inline wins the cascade). The dark panel re-inks through the seam's
              --foreground fallback; its font-size, weight and leading are byte-identical to the
              light panels — the theme row's partial flip, not a full repaint.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="heading · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)} data-doc-demo-scope="headings-ok">
              <Heading level={3} size={responsiveSize}>responsive voice</Heading>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — 14px; at 48rem and
                wider the md case wins — 18px. The number lane goes bare (results infer); it's
                the STRING lanes that need both generics. Resize across 48rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={paintTokens} />
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Native heading semantics — the document outline is real. The id prop is the addressing surface anchor links and aria-labelledby point at."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — document structure, not a control' }]}
        aria={[
          { name: 'h1–h6', value: 'native elements', description: 'The platform announces the level and builds the outline; skipping levels is the caller\'s outline decision, never silently repaired.' },
          { name: 'id', value: 'passthrough', description: 'Optional explicit address — the document addressing surface (anchor navigation, aria-labelledby).' },
          { name: 'data-jx-heading', value: 'clamped level', description: 'Hook attribute carrying the rendered level (1–6) — the clamped truth, never the raw prop.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="heading" />
  </div>
</div>
