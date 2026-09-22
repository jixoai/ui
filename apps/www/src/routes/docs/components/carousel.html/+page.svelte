<!--
  Docs page for the carousel family (docs-eight-axes-mdn task 23,
  marginalia 2026-09-22 — tier 2 over the W3-era page: the lab canvas
  survives into the same-source lane (static stage — extractable), the
  types panels fold into the usage/lab, the skeleton re-orders to the
  archetype and gains Overview + the generated-props lane (the family
  HAS meta — the hand API table retires, taking the falsified density
  token rows with it: --jx-icon/--jx-hit were documented as family
  tokens and ui/carousel/ reads neither — the avatar precedent) + the
  per-axis table + one real query() case + See Also.

  Order: hero → install → overview → usage → the live lab → API → the
  eight axes (per-axis table + the frozen pole + one real query() case)
  → accessibility → see-also.

  Mechanism rows are measurement-first (probed against the served
  family, 2026-09-22): the carousel is the W3C-first scroller — CSS
  scroll-snap pages, the platform animates, JS only READS the position
  (rAF-throttled) to keep the dots honest — so the family's own paint
  is fixed micro-geometry: the density channels it re-bases for its
  slides are read by NOTHING in ui/carousel/ (grep receipt: the chrome
  rides fixed space steps --jx-space-12/8/4 and the fixed base-type
  equation; the slide law sizes children with the --jx-slide-w the
  slideWidth prop sets). Theme is the frozen pole, measured: every
  painted voice is the stylex :root emission (--jx-border/--jx-popover/
  --jx-foreground/--jx-primary/--jx-muted/--jx-ring/--jx-shadow-xs) plus
  kernel space channels — a resolved dark stamps .dark and NOTHING flips
  (byte-identical arrows and dots, measured). LAW #14 note: adjacent
  paging rides scrollTo({ behavior: 'smooth' }) — slide-position reads
  settle >600ms or they lie.
-->

<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import Carousel from '$lib/ui/carousel/carousel.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { meta as carouselMeta } from '$lib/meta/carousel.meta';
  import { CAROUSEL_DOCS } from '$lib/ui/props-table/docs/carousel.docs';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // The canvas same-source lane: the lab and axes canvases are STATIC
  // stages (no page state) — their drawers compose from the extracted
  // stage markup (one source, two surfaces). The query() canvas embeds
  // the responsive call — the extractor's documented rejection class
  // (the avatar play-state lab precedent).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/carousel.html/+page';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Carousel from '@ui/carousel.svelte';
${close}

<!-- width/height of each slide: slideWidth is the one geometry decision -->
<Carousel label="release stages" slideWidth="100%">
  <figure>01 deploy</figure>
  <figure>02 audit</figure>
  <figure>03 ship</figure>
</Carousel>

<!-- any CSS length < 100% peeks the neighbors -->
<Carousel label="gallery" slideWidth="60%">…</Carousel>`;

  // ---- the canvases are STATIC stages: their drawers compose from the
  // extracted stage markup (code shown = code running, one source,
  // two surfaces) --------------------------------------------------------------
  const labUsage = usageFile(
    { Carousel: '@ui/carousel.svelte' },
    resolveRawCode('carousel-demo'),
  );
  const labFiles: TreeFile[] = [
    { name: 'src/lib/ui/carousel-lab.svelte', content: labUsage, kind: 'usage' },
  ];

  const axesUsage = usageFile(
    { Carousel: '@ui/carousel.svelte' },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/carousel-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the root — the base
  // (small: the pointer-lane rung) applies below the 40rem viewport; at
  // ≥40rem the lg case wins. BOTH generics are the §6 typing law: with
  // an explicit type-argument list TS disables inference for the base
  // parameter, so the single-arg form pins B to undefined and ships a
  // real svelte-check error.
  const queryUsage = `<script lang="ts">
  import Carousel from '@ui/carousel.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<Carousel label="responsive row" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}>…</Carousel>`;

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

  // ---- the per-axis table (§2.5). Grep receipts: zero -effective
  // readers and zero density-channel reads in ui/carousel/ — the chrome
  // rides FIXED space steps and the fixed base-type equation; theme is
  // the frozen pole (every voice the stylex :root emission).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY, MEASURED INERT ON THE CHROME — the §11 stamp lands on the root (the computed font-size moves to exactly the stamped px) and nothing follows: the arrows are fixed 2rem boxes over the base-type equation, the dots are 0.5rem, and the track gap is a fixed space step (measured: a stamped root leaves arrows, dots and track unmoved). The slides inherit the echo only when their own markup asks for em. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective + --jx-radius-factor-effective; zero readers (grep receipt: zero corner declarations in ui/carousel/). The track is a rectangular strip and the controls are circles-by-geometry, not corners. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (grep receipt), and the slides are the consumer's own markup — the §3 broadcast reaches whatever THEY compute against. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY ON SELF, SUPPLIED TO THE SLIDES — data-density stamps the root and the family's own chrome reads NONE of the re-based channels (grep receipt: the track gap is the fixed --jx-space-12 step, the dots' gap --jx-space-8, the arrows' type the fixed base-type equation — measured: a stamped lg rung leaves arrows, dots and track unmoved). What density moves is the SLIDES: composed slot content inherits the re-based channels through the supply. The number lane is inert (the coefficient composes at the :root rung scopes; the wrapper never re-declares). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; zero readers (grep receipt). The chrome is deliberately hue-neutral geometry; hue that paints goes through the jx-hue-* utilities on the surrounding tree, exactly as on chip. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: 'ambient scope',
      description:
        "THE FROZEN POLE, MEASURED — every painted voice is the stylex :root emission (--jx-border/--jx-popover/--jx-foreground/--jx-primary/--jx-muted/--jx-ring/--jx-shadow-xs, plus kernel space channels): zero raw reads (grep receipt), so a resolved dark stamps .dark and NOTHING flips — measured byte-identical arrows and dots across the island. light and system stamp nothing — tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — the arrows' one shadow rides the typed --jx-shadow-xs intermediate (fixed micro-geometry, resolved at :root like every voice), and zero family css consumes the carrier (grep receipt: zero --jx-elevation reads). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; zero readers (grep receipt). The paging motion is the PLATFORM'S OWN: CSS scroll-snap pages, native momentum animates, adjacent scrollTo rides behavior:'smooth' (long hops go instant — mandatory snap fights mid-flight smooth scrolling), and the reduced-motion kill is the site's own. The component never re-maps the platform. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: 'the slide law', default: '--jx-slide-w on every direct child', description: 'flex: 0 0 var(--jx-slide-w) + scroll-snap-align: start — the child boundary the css residue owns (carousel.css).' },
    { name: 'the track gap', default: '--jx-space-12 (12px)', description: 'The fixed space step between slides — a kernel channel, NOT a density-rebased gap.' },
    { name: 'the paging arrows', default: '2rem box · --jx-popover ground', description: 'Grid items of the window\'s one cell, hung 1rem outside over the negated space-16 token; hover re-points border + ink at --jx-primary.' },
    { name: 'the arrow shadow', default: '--jx-shadow-xs (typed alias)', description: 'Resolved at the stylex :root scope — frozen under a dark island, unlike a raw shadow read.' },
    { name: 'the dots', default: '0.5rem · --jx-muted ground', description: 'Real buttons (role=group, aria-label "slides"); the on-dot flips ground + border to --jx-primary; mounts only with more than one slide.' },
    { name: 'the hooks', default: 'data-jx-carousel · -window · -track · -arrow · -dot', description: 'The attribute-stamped css-law keys — which root you\'ve got, region or track or control.' },
  ];

</script>

<svelte:head>
  <title>Carousel · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai carousel: CSS scroll-snap does the paging, native scrolling does the motion — no cloning, no virtual window, no transition emulation. JS only reads the position (rAF-throttled) to keep the dots honest."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · NativeHTML"
        title="carousel — the browser is the animator"
        summary="A carousel IS a horizontally scrolled region: CSS scroll-snap pages it, native scrolling animates it (momentum, keyboard when focused), and JS only READS the position (rAF-throttled) to keep the dots honest. No slide cloning, no virtual window, no transition emulation — slides are ordinary direct children."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">scroll-snap</span>
          <span class="pill">no cloning</span>
          <span class="pill">dots page, track focuses</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="carousel" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A scrolled region with three owned jobs — the snap, the join, the honest dots — and nothing else: the browser is the animator."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The track is a real scroller: <code>overflow-x: auto</code> over
            <code>scroll-snap-type: x mandatory</code>, one cell of a grid whose other cell hosts
            the paging arrows (hung outside by a negative margin over the space token). Every
            direct child is sized to <code>--jx-slide-w</code> and snapped to the start edge — the
            slide law — so slides are ordinary content (figures, cards, sections) and a peeking
            carousel is one CSS length away.
          </p>
          <p class={cx(rt.measurePara)}>
            The component adds the parts the platform lacks: labelled prev/next arrows, a dot row
            that commands the scroller, and the honesty rule — the active dot is whichever slide's
            snap position is nearest the scroll offset, read rAF-throttled off the scroll event.
            Adjacent paging rides <code>scrollTo</code> smooth; longer hops go instant, because
            mandatory snap fights a mid-flight smooth scroll.
          </p>
          <p class={cx(rt.measurePara)}>
            All eight axes resolve no-own on the root (census batch D1 — the supply chain is the
            point): the chrome is fixed micro-geometry over kernel space steps, so seven axes
            stamp-and-supply to the SLIDES, and theme is the frozen pole — every voice is the
            stylex :root emission, measured byte-identical across a dark island. Per-axis below;
            the shared grammar lives on the
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
        summary="Slides are any direct children — figures, cards, sections; slideWidth is the one geometry decision."
      >
        <CodeBlock code={usage} lang="svelte" meta="Carousel usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="carousel-demo" data-region="carousel-demo" data-family="carousel-demo" data-reveal="">
    <ComponentCanvas
      id="carousel-demo"
      title="carousel"
      description="Drag/scroll the track (or focus it and use arrow keys), page with the dots or arrows — the active dot follows the nearest snap slide."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/carousel/carousel.svelte"
      files={labFiles}
      stage="fill"
    >
      <div class={cx(rt.wFull, rt.maxWXl)}>
        <Carousel>
          <figure class={cx(rt.panel)} style="display: flex; align-items: center; justify-content: center; gap: 1rem; min-height: 9rem; margin: 0;">
            <span class={cx(rt.inkAccent)}>01</span> deploy
          </figure>
          <figure class={cx(rt.panel)} style="display: flex; align-items: center; justify-content: center; gap: 1rem; min-height: 9rem; margin: 0;">
            <span class={cx(rt.inkAccent)}>02</span> audit
          </figure>
          <figure class={cx(rt.panel)} style="display: flex; align-items: center; justify-content: center; gap: 1rem; min-height: 9rem; margin: 0;">
            <span class={cx(rt.inkAccent)}>03</span> ship
          </figure>
        </Carousel>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            slideWidth='100%' pages one-at-a-time; '60%' peeks the neighbors. slides are ANY elements
            — figures, cards, sections. The track is the keyboard surface; dots and arrows page
            explicitly.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

<div class={cx(rt.shellCol)}>
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="props"
      title="Props"
      summary="The table renders from the GENERATED meta; the eight axis rows render into the shared section beneath. EXTRA chain: 15 meta entries, zero duplicate keys − 8 axis-named = 7 family rows; no hidden lane, no extra lane (slideWidth is the family's own geometry literal — the native size attribute is never received, the §1 collision rule)."
    >
      <PropsTable meta={carouselMeta} docs={CAROUSEL_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on carousel"
      summary="All no-own, census batch D1 — the supply chain is the point. The chrome is fixed micro-geometry over kernel space steps, so seven axes stamp-and-supply to the SLIDES (grep receipts: zero -effective readers, zero density-channel reads in ui/carousel/), and theme is the frozen pole, measured: every painted voice is the stylex :root emission, byte-identical across a dark island. The paging motion is the platform's own — never re-mapped."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch D1 row (explicit-props W3 — the
          FIRST-TIME no-own contract, the scroller being native chrome;
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule: the
          native size attribute is never received — slideWidth owns the geometry under its own
          name. The falsified density token rows (--jx-icon / --jx-hit, documented by the W3-era
          page, read by nothing) retired with the hand table.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on carousel" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="carousel · the supply and the frozen pole" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)} data-probe="row-default">
                <span class={cx(rt.note11)}>density ambient — the chrome's fixed micro-geometry</span>
                <Carousel label="density ambient row">
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">one</figure>
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">two</figure>
                </Carousel>
              </div>
              <div class={cx(rt.panel)} data-probe="row-lg">
                <span class={cx(rt.note11)}>density="lg" — the chrome unmoved; the supply flows to the slides</span>
                <Carousel label="density lg row" density="lg">
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">one</figure>
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">two</figure>
                </Carousel>
              </div>
              <div class={cx(rt.panel)} data-probe="row-dark">
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps; nothing flips (the frozen pole)</span>
                <Carousel label="dark row" theme="dark">
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">one</figure>
                  <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">two</figure>
                </Carousel>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              Measured: the lg rung's data-density lands on the root while arrows, dots and track
              stay unmoved — the chrome rides fixed space steps, and the slides inherit the
              re-based channels through the supply. The dark island flips nothing: every painted
              voice is the stylex :root emission (byte-identical arrows and dots).
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="carousel · query()" files={[{ name: 'carousel-query-demo.svelte', content: queryUsage, kind: 'usage' }]}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <Carousel
                label="responsive row"
                density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}
              >
                <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">one</figure>
                <figure class={cx(rt.panel)} style="min-height: 6rem; display: grid; place-items: center; margin: 0;">two</figure>
              </Carousel>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the small rung; at 40rem
                and wider the lg case wins. What moves is the root's data-density in the live DOM
                (lg ↔ sm, greppable) and the re-based channels the SLIDES inherit through the
                supply — the chrome itself stays fixed micro-geometry. Resize across 40rem.
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
      summary="The region names itself; the track is the keyboard surface (mandatory snap eats the native arrow scroll, so the track pages); every control is a real button — and nothing carries a pressed state, because selection is toggle-group's law."
    >
      <A11yTable
        keys={[
          { key: '← / → (track focused)', action: 'Page one slide back/forward — the track\'s own keydown pages, because mandatory snap eats the native ~40px arrow scroll' },
          { key: 'Tab', action: 'Moves focus through arrows, track, and dots — all real buttons with their own tab stops' },
          { key: 'Enter / Space', action: 'Activate the focused arrow or dot button' },
        ]}
        aria={[
          { name: 'role', value: 'region + aria-roledescription="carousel"', description: 'On the root; aria-label comes from the label prop.' },
          { name: 'aria-label', value: 'previous slide / next slide / go to slide n', description: 'On the arrows and each dot — they command the scroller, they never navigate.' },
          { name: 'aria-current', value: '"true"', description: 'On the active dot — the one whose snap position is nearest the scroll offset (rAF-throttled read).' },
          { name: 'tabindex', value: '0', description: 'On the track — the scroll region itself is the keyboard surface.' },
          { name: 'no aria-pressed', value: 'law', description: 'No control carries a pressed state — a carousel is action + position; selection is toggle-group\'s contract.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="carousel" />
  </div>
</div>
