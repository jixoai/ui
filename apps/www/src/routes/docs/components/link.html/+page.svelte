<!--
  Docs page for link (markdown-coverage-components §1.4, Lane D). The
  typographic link: pattern-based external detection (ANY absolute
  http(s) href — no window.location in SSR), external pair landed after
  the spread (the separator law).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Link from '$lib/ui/link/link.svelte';
  import { usageFile } from '$lib/canvas-usage';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { meta as linkMeta } from '$lib/meta/link.meta';
  import { LINK_DOCS } from '$lib/ui/props-table/docs/link.docs';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import linkSource from '$lib/ui/link/link.svelte?raw';

  // The canvas same-source lane (typography-context-and-parts §7): the
  // usage sample composes from THIS PAGE's own canvas markup — one
  // source, two surfaces (the SectionCard CodeBlock + the drawer's
  // usage TreeFile). The hand template literal + `const close` dodge
  // (and the drifted, never-rendered iconUsage const) are gone.
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/link.html/+page';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = usageFile({ '{ Link }': '@ui/link' }, resolveRawCode('lanes'));
  const iconUsage = usageFile({ '{ Link }': '@ui/link' }, resolveRawCode('icon'));

  const detectionUsage = `// the whole external contract, as source:
const external = /^https?:\\/\\//i.test(href);

<a
  href={href}
  target={external ? '_blank' : undefined}
  rel={external ? 'noreferrer' : undefined}
  data-jx-link={external ? 'external' : 'internal'}
/>`;

  // per-canvas arrays (the shared one drifted: both drawers showed the
  // lanes sample while the icon canvas rendered its own tri-state rows)
  const lanesFiles: TreeFile[] = [
    { name: 'registry/files/ui/link/link.svelte', content: linkSource },
    { name: 'src/lib/ui/link-usage.svelte', content: usage, kind: 'usage' },
  ];
  const iconFiles: TreeFile[] = [
    { name: 'registry/files/ui/link/link.svelte', content: linkSource },
    { name: 'src/lib/ui/link-icon-usage.svelte', content: iconUsage, kind: 'usage' },
  ];

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

  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- size: CONSUMED through the em voices — the stamp sets the
     anchor's font-size, the label text inherits it, and the 0.8em
     suffix glyph rescales with it -->
<Link href="https://github.com/jixoai/ui" size={14}>14px label · 0.8em glyph</Link>

<!-- theme: the FROZEN pole (the pure-alias case) — the ink is
     tokens['--jx-primary'], resolved at the stylex :root scope, so a
     dark island re-substitutes nothing: byte-identical ink -->
<Link href="/docs.html" theme="dark">dark island, same ink</Link>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/link-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive size — the number lane goes bare
  // (results infer); string lanes need both generics. md = 48rem
  // (the registered VIEWPORT_SCALE — cite the key, not a guess).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import Link from '@ui/link';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case (18px)
     wins — label text and the 0.8em glyph step together -->
<Link href="/docs.html" size={query({ md: 18 }, 14)}>responsive label</Link>`;

  const queryFiles: TreeFile[] = [{ name: 'link-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5). Grep receipts: zero -effective
  // readers in ui/link/; the only color voice is the defineVars alias
  // --jx-primary (tokens['--jx-primary']) — the pure-alias frozen pole.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED through the em voices — the §11 stamp sets the anchor's font-size and BOTH em-voiced surfaces follow: the label text (inherited — the anchor atom declares no font-size of its own) and the 0.8em suffix glyph (measured: 14px stamp → 14px anchor, 11.2px glyph; auto → the ambient scale). The underline offset is fixed 4px optical geometry and does NOT scale. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; no family css reads them (grep receipt: zero carrier reads in ui/link/). The anchor draws no box. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers). Nothing rounds. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the named rung stamps data-density on the anchor; the family reads none of the re-based channels (grep receipt: zero --jx-text/--jx-hit/--jx-inset reads — the icon lane's gap is the em-relative --link-icon-gap promotion seam, not a rung channel). The stamp supplies composed/guest content. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — the instrument's ink is already --jx-primary (the alias), so the hue carrier adds nothing: --jx-color-effective stamps and zero family css reads it (grep receipt). Hue injection goes through the jx-hue-* utilities on the surrounding tree. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "THE FROZEN POLE, the pure-alias case — measured: the ink is tokens['--jx-primary'], a stylex defineVars member declared (and therefore resolved) at the stylex :root theme scope; the anchor inherits the already-substituted light value, so a scoped .dark re-substitutes NOTHING (receipt: --primary flips on the anchor, --jx-primary does not; the computed color is byte-identical). A dark island keeps the light-profile accent — consumers compose dark links inside their own dark ground. The one platform exception is forced-colors: active, which swaps the ink to the LinkText system keyword by media query, not by the axis. light and system stamp nothing — tree inheritance.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero shadow declarations). Text casts no shadow. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it. The hover underline is instant (no transition declared); nothing animates. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: 'the B2 non-nav lane', default: '--jx-primary ink · underline on hover', description: 'The prose face\'s non-nav lane as the component\'s own utilities — standalone outside any jx-pure scope; inside one, the values coincide (same property, same token, deterministic no-op).' },
    { name: 'the offset', default: 'text-underline-offset: 4px', description: 'Fixed optical calibration — keeps the underline off the descenders; does NOT scale with the size axis (the measured contrast to the 0.8em glyph).' },
    { name: '--link-icon-gap', default: '0.2em (promotion seam)', description: 'The icon lane\'s inline-start gap — em-relative so it scales with the ambient scale (the no-font-size kinship: no sheet step can express it); the lane\'s own atom owns the whole label-to-glyph distance (no intervening text node).' },
    { name: 'the optical baseline', default: 'vertical-align: -0.125em', description: 'The glyph\'s shift — fixed optical geometry, like the offset.' },
    { name: 'forced-colors ink', default: 'LinkText', description: 'The fleet convention (press-button\'s link rung) inside @media (forced-colors: active) — the platform exception to the frozen alias, gated by media query, not by the axis.' },
    { name: 'the hooks', default: 'data-jx-link={external|internal} · data-jx-link-icon', description: 'The valued hook names which lane rendered; the icon span is aria-hidden (the target/rel pair carries the departure semantics).' },
  ];

</script>

<svelte:head>
  <title>Link · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai link: the typographic link as a native anchor carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it stands alone outside any jx-pure scope. External detection is pattern-based (any absolute http(s) href): external links open a new tab with rel=noreferrer, app routes keep same-tab navigation."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="link — the typographic lane, standing alone"
        summary="A native <a> carrying the prose face's non-nav lane as its own utilities — primary ink, 4px underline offset, hover underline — so it works with no jx-pure scope in sight; inside one, the values coincide with the face's own channels (same property, same token, deterministic no-op). External detection is PATTERN-based, not origin-based: any absolute http(s) href is external — no window.location semantics dragged into SSR — and externals open a new tab with rel=noreferrer (the fleet convention; doc-link and PressButton both ship bare noreferrer, and modern browsers imply noopener from it). href, title and the external pair land AFTER the spread (the separator law): the contract is the component's, not overridable through rest props."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;a&gt;</span>
          <span class="pill">http(s) = external · new tab</span>
          <span class="pill">rel=noreferrer (noopener implied)</span>
          <span class="pill">icon tri-state · undefined ≠ off</span>
          <span class="pill">app routes stay same-tab</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="link" />
    </div>

    <!-- overview (docs-eight-axes-mdn task 20, tier 2: the skeleton had
         Install/lanes/icon/detection already — this section + the
         measured per-axis table complete the archetype; the W3-era
         universal demo's movement-implying panels retire) -->
    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A native anchor carrying the prose face's non-nav lane as its own utilities; the href alone decides the external contract; the axes stamp a component whose paint is one ink, one offset, one hover."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            Link renders one native <code>&lt;a&gt;</code> carrying the face B2 non-nav lane as
            its OWN utilities — <code>--jx-primary</code> ink, a 4px underline offset, underline
            on hover — so it stands alone outside any jx-pure scope; inside one, the values
            coincide (same property, same token — a deterministic no-op, and the face never
            declared a different value anyway). The external contract is PATTERN-based: any
            absolute http(s) href is external — <code>target="_blank"</code> +
            <code>rel="noreferrer"</code>, landed after the spread (the separator law) — because
            window.location has no place in an SSR-safe registry component.
          </p>
          <p class={cx(rt.measurePara)}>
            The suffix-icon lane is the tri-state input semantic-glyph law verbatim:
            undefined paints the default externalLink glyph IFF external (SSR-painted,
            hydration-matched), null is the explicit OFF, a snippet renders custom content —
            and internal links never carry the lane. The glyph is em-sized (0.8em) with the
            0.2em gap owning the whole label-to-glyph distance, so the lane rides any ambient
            scale — which is exactly how the size axis reaches it.
          </p>
          <p class={cx(rt.measurePara)}>
            A composed leaf, precisely: the markdown family maps prose links to it (grep
            receipt: markdown-node is the one component edge), and it composes nothing but the
            icon. The eight axes resolve all no-own on the anchor — size is the one CONSUMED
            voice (the em lanes), theme is the frozen pole (the pure-alias case: a dark island
            re-substitutes nothing), and six stamp-and-supply. Per-axis below; the shared
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
        summary="Hand it an href — that alone decides the external contract. Everything else is the advisory and attribute passthrough."
      >
        <CodeBlock code={usage} lang="svelte" meta="Link usage" />
      </SectionCard>
    </div>

    <div id="lanes" data-region="link-lanes" data-family="link-lanes" data-reveal="">
      <ComponentCanvas
        id="lanes"
        title="link"
        description="The two lanes: app routes keep same-tab default navigation (a route change, not a departure), absolute http(s) hrefs open in a new tab with rel=noreferrer. Same component, same ink, one pattern deciding the contract."
        sourceUrl={registrySourceUrl('link')}
        files={lanesFiles}
        stage="fill"
      >
        <div class={cx(rt.flex, rt.wFull, rt.maxWXl, rt.col, rt.gap12, rt.lkBody)}>
          <p class={cx(rt.m0)}>
            Same document, different lanes: read
            <Link href="/docs/components/markdown.html" title="the markdown page">the markdown page</Link>
            here, or leave for
            <Link href="https://github.com/jixoai/ui" title="the repository">the repository</Link>
            in a new tab.
          </p>
          <p class={cx(rt.m0, rt.inkMuted)}>
            Prose composition — the offset keeps the underline off the descenders:
            <Link href="https://commonmark.org" title="the CommonMark spec">CommonMark</Link>,
            <Link href="https://tailwindcss.com/docs/typography-plugin" title="the Typography plugin">Tailwind Typography</Link>,
            and quiet reference ink inside a muted paragraph.
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              Detection is <code>/^https?:\/\//i</code> — a pure function of the href, so SSR and
              hydration agree with zero environment reads. The hook stamps the result:
              <code>data-jx-link="external" | "internal"</code>. The underline is hover-only; the
              4px offset is the face's own calibration.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="icon" data-region="link-icon" data-family="link-icon" data-reveal="">
      <ComponentCanvas
        id="icon"
        title="link"
        description="The suffix-icon lane — tri-state icon, the input semantic-glyph law verbatim: undefined is NOT off. Omitted paints the default externalLink glyph IFF external (an inline-core name answering getIcon synchronously — SSR paints it, hydration matches, no flash); null turns the lane OFF; a snippet renders custom content in the lane. Internal links never carry the lane at any setting."
        sourceUrl={registrySourceUrl('link')}
        files={iconFiles}
        stage="fill"
      >
        <div class={cx(rt.flex, rt.wFull, rt.maxWXl, rt.col, rt.gap12, rt.lkBody)}>
          {#snippet arrowGlyph()}<span aria-hidden="true" class={cx(rt.fontMono)}>→</span>{/snippet}
          <p class={cx(rt.m0)}>
            undefined (omitted) — the default glyph on an external:
            <Link href="https://github.com/jixoai/ui">the repository</Link>
          </p>
          <p class={cx(rt.m0)}>
            null — the lane explicitly off:
            <Link href="https://github.com/jixoai/ui" icon={null}>a quiet external</Link>
            (still target=_blank; only the glyph is gone)
          </p>
          <p class={cx(rt.m0)}>
            snippet — custom content in the lane:
            <Link href="https://github.com/jixoai/ui" icon={arrowGlyph}>leaving the document</Link>
          </p>
          <p class={cx(rt.m0, rt.inkMuted)}>
            internal — the lane never ships:
            <Link href="/docs/components/markdown.html">staying in the document</Link>
          </p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              The lane is a <code>data-jx-link-icon</code> span INSIDE the anchor after the
              children — <code>aria-hidden</code> (decorative: the target/rel pair already carries
              the semantics), em-sized (0.8em rides any ambient scale), with
              <code>ms-[0.2em]</code> owning the whole gap (no intervening text node — a stray
              space would stack a second font-dependent gap). registry edge: link depends on
              <code>@jixoai/icon</code> — import the component, never the generated set.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="detection" data-region="link-detection" data-family="link-detection" data-reveal="">
      <SectionCard
        family="detection"
        headerRegion="detection"
        eyebrow="law"
        title="Why pattern, not origin"
        summary="Origin comparison (href.origin !== window.location.origin) is the familiar heuristic — and it drags window.location into a server render, couples the component to the host it mounts in, and misfires on preview hosts and subpath deployments. The pattern reading is stricter by design: ANY absolute http(s) href is a departure from the document, which is exactly what the new-tab contract means. Relative routes, anchors and non-http schemes keep default navigation."
      >
        <CodeBlock code={detectionUsage} lang="ts" meta="the external contract" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Native anchor semantics; the accessible name is the link text (write the departure into the words, not a glyph)."
    >
      <A11yTable
        keys={[{ key: 'Enter', action: 'Activates the anchor — native behavior, untouched' }]}
        aria={[
          { name: 'a', value: 'native element', description: 'The platform announces the link role and its href; no extra ARIA.' },
          { name: 'target / rel', value: 'external pair', description: 'target=_blank + rel=noreferrer land only on detected externals; the implied noopener is the fleet convention.' },
          { name: 'data-jx-link', value: "'external' | 'internal'", description: 'Hook attribute naming which lane rendered — styling and tests read it without reverse-engineering the href.' },
          { name: 'data-jx-link-icon', value: 'aria-hidden lane', description: 'The suffix-icon span is decorative: the accessible name is the link text alone, and the target/rel pair — never a glyph — carries the departure semantics.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on link"
      summary="The prose link is one ink, one offset, one hover — so six axes stamp-and-supply with zero family readers (grep receipt). The exceptions: size is CONSUMED through the em voices (the label inherits the stamp; the 0.8em glyph rescales with it), and theme is the frozen pole's pure-alias case (the ink is defineVars-resolved at the stylex :root scope — a dark island re-substitutes nothing; forced-colors is the platform exception, media-gated). The carriers stamp the anchor root, greppable in the raw SSR."
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
          the interface is <code>Omit&lt;HTMLAnchorAttributes, 'color'&gt;</code> — the native
          color attribute cleared for the hue lane; href, title, target and rel land after the
          spread as the component's contract. A composed leaf, precisely: markdown-node maps
          prose links here (the one component edge), and it composes nothing but the icon.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on link" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="link · the em voices and the frozen pole" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="link-auto">
                <span class={cx(rt.note11)}>size auto — the ambient scale</span>
                <Link href="https://github.com/jixoai/ui">ambient label ↗</Link>
              </div>
              <div class={cx(rt.panel)} data-probe="link-size-14">
                <span class={cx(rt.note11)}>size={"{14}"} — label 14px, glyph 0.8em → 11.2px (measured)</span>
                <Link href="https://github.com/jixoai/ui" size={14}>stamped label ↗</Link>
              </div>
              <div class={cx(rt.panel)} data-probe="link-light">
                <span class={cx(rt.note11)}>light — the ambient accent</span>
                <Link href="/docs.html">light ink</Link>
              </div>
              <div class={cx(rt.panel)} data-probe="link-dark">
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps; the ink is byte-identical (the frozen pole)</span>
                <Link href="/docs.html" theme="dark">dark island, same ink</Link>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The size pair is the consumed lane, measured: the stamped anchor computes exactly
              14px and the external glyph scales to 0.8 × 14 = 11.2px with it — while the
              underline offset stays the fixed 4px optical calibration. The theme pair is the
              pure-alias frozen pole: both anchors compute the same ink (the :root-resolved
              --jx-primary) even though --primary itself flips on the element — the
              substitution site decides, and here nothing rides the flipping var.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="link · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Link href="/docs.html" size={responsiveSize}>responsive label</Link>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — 14px; at 48rem and
                wider the md case wins — 18px, label and glyph together. The number lane goes
                bare (results infer); string lanes take both generics. Resize across 48rem.
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

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
        summary="Props extend the native HTMLAnchorAttributes minus color (the §1 collision rule) — href alone decides the external contract, icon decides only the decorative suffix lane; 15 meta props − 8 ambient axes = 7 rows, all curated."
    >
      <PropsTable meta={linkMeta} docs={LINK_DOCS} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="link" />
  </div>
</div>
