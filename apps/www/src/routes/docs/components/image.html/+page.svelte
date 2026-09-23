<!--
  Docs page for image (docs-eight-axes-mdn task 15, quill 2026-09-22;
  tier 2 over the W3-era page: the hero canvas, the types panels and
  the a11y table survive, the skeleton re-orders to the archetype and
  gains Install + Overview + the per-axis table + one real query()
  case + See Also; types/theming fold away). Order: hero → install →
  overview → usage → the image demo → the no-CLS contract → the
  failure postures → props → the eight axes → accessibility →
  see-also. Baseline skill: openspec/changes/docs-eight-axes-mdn/
  skills/mdn-doc-style.md §2.
  Table note: image has NO generated meta (docs-ambient-vocabulary's
  carriers bijection does not know the family yet — a fleet follow-up),
  so the props table is the HAND table with the `universal` directive
  (the same marker the universal gate counts); the eight axis rows
  render into the shared section from the schema.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Image from '$lib/ui/image/image.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import imageSource from '$lib/ui/image/image.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Image from '@ui/image.svelte';
${close}

<!-- width/height are REQUIRED — the no-CLS contract is not optional -->
<Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />

<!-- alt="" opts into decorative; a failed load swaps to the fallback frame -->
<Image src={maybeBroken} alt="" width={96} height={96} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/image/image.svelte', content: imageSource },
    { name: 'src/lib/ui/image-usage.svelte', content: usage, kind: 'usage' },
  ];

  const fallbackDemo = `<script lang="ts">
  import Image from '@ui/image.svelte';
${close}

<!-- composed fallback: keep the intrinsic dims in your slot markup —
     failure never shifts layout either. A changed src re-arms the load. -->
<Image src={flakyUrl} alt="build output" width={640} height={360}>
  {#snippet fallback()}
    <span style="width: 640px; height: 360px; display: grid; place-items: center;">
      retry later
    </span>
  {/snippet}
</Image>`;
  const fallbackFiles: TreeFile[] = [
    { name: 'image-fallback-demo.svelte', content: fallbackDemo, kind: 'usage' },
  ];

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- theme: the FROZEN pole — the broken panel's ground, ink,
     border and padding ride stylex defineVars aliases (declared, and
     therefore resolved, at the stylex :root scope), so a dark island
     re-substitutes NOTHING: the panel is byte-identical -->
<Image src="/definitely-missing.png" alt="dark island" width={96} height={96} theme="dark" />

<!-- size: the stamp lands on the img root and nothing follows — the
     box is the width/height attributes' own, the glyph is a fixed
     prop; pixels have no em voice -->
<Image src="/icon.svg" alt="stamped" width={96} height={96} size={14} />`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/image-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the failure surface.
  // Deliberately NO fallback snippet: the DEFAULT frame's broken panel
  // is what carries data-density (the composed-slot branch renders
  // consumer markup only — nothing stamps), so the demo shows the
  // family's own stamp flipping sm ↔ lg across the breakpoint. The
  // string lane needs both generics (the campaign's typing law).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'large');

  const queryUsage = `<script lang="ts">
  import Image from '@ui/image.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<!-- below 48rem the base (large rung) applies; at 48rem+ the md case
     wins and the DEFAULT fallback frame stamps sm — the data-density
     on the broken panel flips with the viewport. No fallback snippet
     here on purpose: the snippet branch renders YOUR markup only
     (nothing stamps it). -->
<Image
  src="/definitely-missing.png"
  alt="responsive failure"
  width={640}
  height={360}
  density={query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'large')}
/>`;
  const queryFiles: TreeFile[] = [{ name: 'image-query-demo.svelte', content: queryUsage, kind: 'usage' }];

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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the per-axis table (§2.5). Grep receipts: zero -effective
  // readers in ui/image/ (the atoms read typed tokens only), zero raw
  // sheet tokens (every voice is a stylex defineVars alias → the
  // :root-resolved frozen class), zero corner/shadow declarations.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY, MEASURED INERT ON THE PAINT — the §11 stamp lands on the img root (the computed font-size moves to exactly the stamped px) and NOTHING follows: the box is the width/height ATTRIBUTES' own (the no-CLS contract), the fallback glyph is a fixed 32px prop, and pixels have no em voice (the measured contrast to heading's em ladder). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero corner declarations in ui/image/). The img draws no corners; the fallback panel is square. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers), and a leaf has no composed children to feed the concentric anchor. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY ON SELF, SUPPLIED TO THE SLOT — data-density stamps the img root AND the broken panel, and the family reads none of the re-based channels (grep receipt: the panel's padding rides the kernel --space-24 step via the --jx-space-24 alias, not the density channels). What the breakpoint moves is the COMPOSED fallback slot's content, which inherits the re-based channels. The merge law keeps the stamp on the panel across failure. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers). The panel's ink is the muted alias, not the hue carrier. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE FROZEN POLE, MEASURED (the emission-form class) — the broken panel's ground/ink/border/padding ride tokens['--jx-muted'] / ['--jx-muted-foreground'] / ['--jx-border'] / ['--jx-space-24']: stylex defineVars aliases, declared (and therefore resolved) at the stylex :root theme scope. The panel inherits the already-substituted light values, so a scoped .dark re-substitutes NOTHING — probe receipt: --muted flips on the panel, --jx-muted does not, and the two panels compute byte-identical faces. The img itself paints pixels — nothing thematic at all. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero shadow declarations — the fallback frame is flat, no art-shadow recipe). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. Zero transitions: lazy loading and async decode are the platform's own, not the axis's. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: 'the intrinsic box', default: 'width/height — REQUIRED attributes', description: 'The no-CLS contract: the attributes carry the ratio, the rendered img stays max-width:100% / height:auto — the rendered box never overflows its container and never shifts layout.' },
    { name: 'the merge law', default: 'carriers + width/height literals', description: 'On failure the §11 carriers JOIN the intrinsic dimension literals on the broken panel\'s style attr — the axis surface survives a broken source.' },
    { name: 'the fallback face', default: 'dashed hairline · muted ground · muted-foreground ink', description: 'The default fallback frame — every voice a stylex defineVars alias (--jx-hairline/--jx-border/--jx-muted/--jx-muted-foreground), which is exactly why the theme pole freezes.' },
    { name: 'the panel padding', default: '--jx-space-24 (24px)', description: 'The kernel space step via the alias — kernel geometry, NOT a density-rebased channel.' },
    { name: 'the fallback glyph', default: '32px · strokeWidth 1.5', description: 'The lucide image glyph through the Icon component — component-owned box, fixed props.' },
    { name: 'the hooks', default: 'data-jx-image · data-jx-image-broken', description: 'The css-law keys (attribute-stamped, not classes) — which root you\'ve got, load or failure.' },
  ];

</script>

<svelte:head>
  <title>Image · jixoai-ui</title>
  <meta name="description" content="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in." />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="image — the no-CLS native picture" summary="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in.">
        <div class={cx(rt.wrap12)}>
          <span class="pill">no-CLS width/height</span>
          <span class="pill">lazy + async decode</span>
          <span class="pill">failure fallback · recovery</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="image" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A native img with three jobs the platform lacks: the no-CLS contract, alt semantics, and a failure posture that recovers."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Image renders one native <code>&lt;img&gt;</code>: <code>loading="lazy"</code>,
            <code>decoding="async"</code>, and REQUIRED intrinsic <code>width</code>/
            <code>height</code> — the attributes carry the ratio while the rendered box stays
            <code>max-width: 100%</code> / <code>height: auto</code>, so the layout reserves the
            box and never shifts. <code>alt</code> is the meaning; <code>alt=""</code> opts into
            decorative. No lightbox, zoom or galleries — the batch-2 ruling keeps those a dialog
            composition recipe.
          </p>
          <p class={cx(rt.measurePara)}>
            The component's one added job is the failure posture: an <code>onerror</code> swap to
            a fallback frame (dashed hairline, muted ground, the image glyph) that keeps the
            intrinsic dims — failure never shifts layout either — and recovers when <code>src</code>
            changes (avatar's proven law; the consumer's own <code>onerror</code> is composed,
            never replaced). A <code>fallback</code> snippet replaces the default frame wholesale;
            keep the intrinsic dims in your slot markup. The §11 carriers JOIN the dimension
            literals on the broken panel — the merge law — so the axis surface survives failure.
          </p>
          <p class={cx(rt.measurePara)}>
            A LEAF in the fleet (grep receipt both directions: only the blueprint scene mounts
            it, and the family imports nothing but the icon — "on avatar's proven laws" is a law
            kinship, not a composition). The eight axes resolve on the img root all no-own
            (census batch D): seven stamp-and-supply, and theme is the frozen pole — the
            fallback face rides stylex defineVars aliases that resolve at the :root scope, so a
            dark island re-substitutes nothing (measured below). Per-axis below; the shared
            grammar lives on the
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
        summary="width and height are REQUIRED — the no-CLS contract is not optional."
      >
        <CodeBlock code={usage} lang="svelte" meta="Image usage" />
      </SectionCard>
    </div>

    <div id="image-demo" data-region="image-demo" data-family="image-demo" data-reveal="">
      <ComponentCanvas
        title="image"
        stage="center"
        description="Left: a real load. Right: a broken source exercising the fallback — the dashed frame plus glyph; a later src change re-arms the load."
        sourceUrl="https://github.com/jixoai-ui/blob/main/registry/files/ui/image/image.svelte"
        files={canvasFiles}
      >
        <div class={cx(rt.wrapStart24)}>
          <Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />
          <Image src="/definitely-missing.png" alt="broken demo" width={96} height={96} />
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              the broken demo exercises the fallback (dashed frame plus glyph). alt empty-string
              opts into decorative; width and height are REQUIRED — the no-CLS contract is not
              optional.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="image-law" data-reveal="">
      <SectionCard
        family="image-law"
        headerRegion="image-law"
        eyebrow="law"
        title="The no-CLS contract"
        summary="The img element carries loading, decoding and alt semantics; the component's one job is the failure posture — an onerror swap to a fallback frame that recovers when src changes. Intrinsic width/height stay REQUIRED: reserve the box, never shift the layout."
      >
        <div class={cx(rt.col20)}>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
          <div class={cx(rt.mt20)}>
            <CodeBlock code={fallbackDemo} lang="svelte" meta="the composed fallback" />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="image · composed fallback" files={fallbackFiles} stage="fill">
              <div class={cx(rt.gridSm2, rt.wFull)}>
                <div class={cx(rt.panel)}>
                  <span class={cx(rt.note11)}>default fallback — the dashed frame keeps the dims</span>
                  <Image src="/definitely-missing.png" alt="broken demo" width={96} height={96} />
                </div>
                <div class={cx(rt.panel)}>
                  <span class={cx(rt.note11)}>composed fallback slot — your markup, your dims</span>
                  <Image src="/definitely-missing.png" alt="broken demo" width={96} height={96}>
                    {#snippet fallback()}
                      <span class={cx(rt.inlineFlex, rt.itemsCenter, rt.justifyCenter, rt.imFallbackFrame, rt.bgMuted, rt.inkMuted)} style="width: 96px; height: 96px;">retry later</span>
                    {/snippet}
                  </Image>
                </div>
              </div>
            </ComponentCanvas>
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
      summary="Props extend the native img attributes (Omit<'alt' | 'width' | 'height' | 'color'> — the required trio re-declared, the native color cleared for the axis); the eight axis rows render into the shared section beneath. 9 content rows here; no EXTRA lane — no family prop shares an axis name."
    >
      <PropsTable
        universal
        props={[
          { name: 'alt', type: 'string', default: '—', description: 'The picture\'s meaning; "" marks it decorative.', required: true },
          { name: 'width', type: 'number | string', default: '—', description: 'REQUIRED intrinsic width — the no-CLS contract. Never sees the size axis (the batch A native rule: the family owns only the axis names it destructures).', required: true },
          { name: 'height', type: 'number | string', default: '—', description: 'REQUIRED intrinsic height — the no-CLS contract.', required: true },
          { name: 'src', type: 'string', default: '—', description: 'Via the native spread; a CHANGED src re-arms the load after failure (avatar\'s proven law).' },
          { name: 'fallback', type: 'Snippet', default: 'default frame', description: 'Composed failure state — keep the intrinsic dims in your slot markup; the default frame carries them so failure never shifts layout either.' },
          { name: 'onerror', type: 'native handler', default: '—', description: 'COMPOSED, never replaced: your handler fires first, then the failure posture engages.' },
          { name: 'class', type: 'string', default: "''", description: 'Rendered width/height classes when different from intrinsic.' },
          { name: 'style', type: 'string', default: "''", description: 'Inline style passthrough — composed AFTER the family\'s carrier stamp (the #4 seam law).' },
          { name: '...rest', type: 'HTMLImgAttributes', default: 'spread', description: 'Every other native img attribute passes through (srcset, sizes, crossorigin…); Omit clears alt/width/height (re-declared required) and color (the §1 native-collision rule).' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on image"
      summary="An all-no-own first-time contract (census batch D, W3-D5) on a media leaf: the img paints pixels and the fallback frame is a fixed face, so nothing the axes know how to move exists here. Seven axes stamp-and-supply — and the supply matters only inside the COMPOSED fallback slot, whose content inherits the re-based channels. Theme is the frozen pole, and image is its purest case: every panel voice is a stylex defineVars alias, resolved at the :root scope before the panel ever inherits it. The carriers stamp the img root and JOIN the dimension literals on the broken panel (the merge law), greppable in the raw SSR."
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
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule:
          the interface is <code>Omit&lt;HTMLImgAttributes, 'alt' | 'width' | 'height' | 'color'&gt;</code>
          — the required trio re-declared on the family's terms, the native color cleared for
          the hue lane, and every axis name is the family's own destructured lane. Meta note:
          image carries no generated meta yet (the ambient-vocabulary carriers bijection doesn't
          know the family) — this table is the hand-table form; the universal section renders
          from the shared schema either way.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on image" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="image · the frozen pole and the inert stamp" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="img-light">
                <span class={cx(rt.note11)}>broken, light — the ambient profile</span>
                <Image src="/definitely-missing.png" alt="light fallback" width={96} height={96} />
              </div>
              <div class={cx(rt.panel)} data-probe="img-dark">
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps; the face is byte-identical (the frozen pole)</span>
                <Image src="/definitely-missing.png" alt="dark island fallback" width={96} height={96} theme="dark" />
              </div>
              <div class={cx(rt.panel)} data-probe="img-size-auto">
                <span class={cx(rt.note11)}>size auto — the box is the attributes' own</span>
                <Image src="/icon.svg" alt="auto size" width={96} height={96} />
              </div>
              <div class={cx(rt.panel)} data-probe="img-size-14">
                <span class={cx(rt.note11)}>size={"{14}"} — the stamp lands; the pixels don't follow (measured)</span>
                <Image src="/icon.svg" alt="stamped size" width={96} height={96} size={14} />
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The theme pair is the frozen pole, measured: both fallback panels compute the same
              ground, border and ink — the voices are defineVars aliases resolved at the stylex
              :root scope (--muted flips on the panel; --jx-muted does not — the same
              emission-form receipt as hero's lead, with no raw-var voice to flip). The size
              pair is the inertness probe: the stamped img's computed font-size is exactly 14px
              while the rendered box stays the attributes' 96×96 — pixels have no em voice.
              Disclosure: the demos' usage mirrors above are HAND-AUTHORED to match the stage
              markup (the same-source migration is the recorded follow-up) — the component
              source in each drawer is the registry's own.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="image · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Image
                src="/definitely-missing.png"
                alt="responsive failure"
                width={640}
                height={360}
                density={responsiveDensity}
              />
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the large rung; at
                48rem and wider the md case wins and the DEFAULT fallback frame stamps sm (the
                broken panel's data-density flips lg ↔ sm across the breakpoint — the family's
                own panel, measured). No fallback snippet here ON PURPOSE: the snippet branch
                renders your markup only — nothing stamps it — so the default frame is the
                honest demo surface. The string lane takes both generics.
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
      summary="A native img with real alt semantics; the fallback keeps the name and stays decorative when alt is empty."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not interactive — a picture with alt semantics' }]}
        aria={[
          { name: 'alt', value: 'string (required)', description: 'The picture\'s meaning; "" marks it decorative.' },
          { name: 'role / aria-label', value: 'img / "image unavailable"', description: 'On the default fallback frame — only when alt is non-empty.' },
          { name: 'aria-hidden', value: 'true', description: 'On the fallback when alt="" keeps the picture decorative through failure.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="image" />
  </div>
</div>
