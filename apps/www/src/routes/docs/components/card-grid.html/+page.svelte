<!--
  Docs page for card-grid (docs-eight-axes-mdn task 19, vellum
  2026-09-22 — tier 2 over the docs-demo-standard page: the interactive
  min/opt-out canvas, the subgrid-law section, the types trio, the a11y
  and theming sections survive; the skeleton gains Overview + the
  per-axis table + one real query() case, and the universal-props demo
  folds into the axes section).

  Order: hero → install → overview → usage → the demo canvas → the
  subgrid law → types → accessibility → theming → the eight axes
  (per-axis table + the forwarded-lanes demo + one query() case) → api
  → see-also.

  Mechanism rows are measurement-first (probed against the served
  family): density is SUPPLY-ONLY ON SELF (the grid's own 20px gap is
  inert at every rung — the space ladder hangs off the :root
  --jx-unit, which no rung scope re-bases) and CONSUMED BY COMPOSITION
  (the rung scope re-bases --jx-inset/--jx-stack/--jx-text for the
  tenants — measured: a section-card header steps 12 / 16 / 20px
  padding at xs–sm / default / lg). size stamps the §11 echo and
  nothing follows (the heading-contrast case). theme is BRIDGE-ONLY:
  the .dark class lands, the grid paints nothing theme-able, and the
  tenants decide through their own emission forms (measured: Card
  tenants hold their light paint — the typed-layer pole). shape,
  radius, color, elevation, motion stamp-and-supply (grep receipts).
  Motion: the entrance cascade is the family's OWN law (IO-armed,
  70ms × index capped at 8, fill-mode backwards, reduced-motion kill,
  html.js no-JS visibility) — deliberately NOT the §8 axis.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import CardGrid from '$lib/ui/card-grid/card-grid.svelte';
  import Card from '$lib/ui/card/card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { meta as cardGridMeta } from '$lib/meta/card-grid.meta';
  import { CARD_GRID_DOCS } from '$lib/ui/props-table/docs/card-grid.docs';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayToggle, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';

  // Same-source law: the file tree shows the exact installed copy this site
  // consumes — ?raw imports the bytes, never a retyped duplicate.
  import gridSource from '$lib/ui/card-grid/card-grid.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // single usage sample, assembled: the static const is the initial-state
  // assembly, the $derived is the live one — same parts, no copied body
  const usageHead = `<script lang="ts">
  import CardGrid from '@ui/card-grid.svelte';
  import SectionCard from '@ui/section-card.svelte';
${close}

`;
  const usageCards = `  <SectionCard eyebrow="alpha" title="Short header" summary="One summary line.">
    <p>Body.</p>
  </SectionCard>
  <SectionCard
    eyebrow="beta"
    title="A deliberately much longer header that wraps"
    summary="A longer summary pushing the shared header row taller — every header aligns to it."
  >
    <ul class="flex flex-col gap-2">
      <li>body fills to the tallest row</li>
      <li>…</li>
    </ul>
  </SectionCard>`;
  const usageOptOut = `

  <!-- not a two-block card? opt the child out of the shared rows -->
  <div data-no-subgrid><!-- anything --></div>`;

  const assembleUsage = (min: number, withOptOut: boolean): string =>
    `${usageHead}<CardGrid min={${min}}>
${usageCards}${withOptOut ? usageOptOut : ''}
</CardGrid>`;

  const usage = assembleUsage(260, true);

  const files: TreeFile[] = [
    { name: 'registry/files/ui/card-grid.svelte', content: gridSource },
    { name: 'src/lib/ui/card-grid-usage.svelte', content: usage },
  ];

  // playground protocol (P1): the page owns the state; the canvas only
  // calls back — snapshot + reset + echo projection + live usage
  const canvasInitial = { minPx: 260, optOut: false };
  let minPx = $state(canvasInitial.minPx);
  let optOut = $state(canvasInitial.optOut);
  function resetCanvas(): void {
    minPx = canvasInitial.minPx;
    optOut = canvasInitial.optOut;
  }
  const usageLive = $derived(assembleUsage(minPx, optOut));
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
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
  // ---- the eight axes demos: code shown = code running -------------------
  const axesUsage = `<!-- density: SUPPLY-ONLY on self (the 20px gap holds at
     every rung — the space ladder hangs off the :root --jx-unit);
     CONSUMED BY COMPOSITION (the rung scope re-bases the tenants'
     --jx-inset/--jx-stack channels — visible on section-card tenants) -->
<CardGrid density="small">
  <SectionCard eyebrow="tenant one" title="the guests re-base">
    the grid holds; the tenant steps
  </SectionCard>
</CardGrid>

<!-- size: the §11 echo stamps the root's font-size — the tenants'
     own --text-* voices give it nothing to scale -->
<CardGrid size={14}>…</CardGrid>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/card-grid-universal.svelte', content: axesUsage },
  ];

  // the theme-bridge specimen: the drawer shows the stage it runs — the
  // bridge-only mechanism (the axes drawer above carries the density/size
  // specimen instead; canvas-id swap law: code shown = code running)
  const themeUsage = `<!-- theme: BRIDGE-ONLY — the resolved scope lands .dark on the
     grid's root; the landlord's own paint is structural (transparent
     ground, the 20px gap unmoved — measured identical in both scopes).
     What answers is each tenant, through its own emission form: raw
     var() reads flip at the consumer, typed emissions freeze at :root. -->
<CardGrid theme="dark" min="220px">
  <SectionCard eyebrow="tenant one" title="the bridge lands, the landlord holds">
    its own emission form decides what flips
  </SectionCard>
</CardGrid>`;
  const themeFiles: TreeFile[] = [
    { name: 'src/lib/ui/card-grid-theme-bridge.svelte', content: themeUsage },
  ];

  // the ONE query() case: responsive density through the landlord —
  // compact guests below 48rem, the default rung at 48rem+. The STRING
  // lane needs BOTH generics (the §6 typing law; the heading page's
  // number lane is the bare counterpart).
  const responsiveDensity = query<{ md: DensityLane }, DensityLane>(
    { md: 'default' },
    'small',
  );

  const queryUsage = `<script lang="ts">
  import CardGrid from '@ui/card-grid.svelte';
  import SectionCard from '@ui/section-card.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<!-- below 48rem the base (small) applies — the guests breathe tight;
     at 48rem+ the md case wins and they step to the default rung.
     The tenants are SECTION-CARDS: their header padding carries the
     rung (measured 8px 12px ↔ 12px 16px block/inline across the key) -->
<CardGrid density={query<{ md: DensityLane }, DensityLane>({ md: 'default' }, 'small')}>
  <SectionCard eyebrow="tenant one" title="the rung rides the viewport">…</SectionCard>
  <SectionCard eyebrow="tenant two" title="compact below, roomy above">…</SectionCard>
</CardGrid>`;
  const queryFiles: TreeFile[] = [{ name: 'card-grid-query-demo.svelte', content: queryUsage, kind: 'usage' }];

  // ---- the per-axis table (§2.5) — measurement-first, receipts in the
  // house form. The family is a LAYOUT LANDLORD: its own paint is one
  // fixed 20px gap plus structural geometry; the axis story is the
  // supply chain to the composed tenants.
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY, the stamp lands and nothing follows (the heading-contrast case) — the §11 echo stamps the root's font-size inline (measured: exactly 14px at size={14}), and every hero voice in the grid's own paint is structural: the columns template, the fixed 20px gap, the subgrid rows — none is em-of-parent. The tenants hold their own fixed --text-* voices; only consumer-authored em typography would scale. The §11 echo measured verbatim on the root style attr. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-shape-effective and --jx-radius-factor-effective; no family css reads them (grep receipt: zero readers, zero corner declarations in ui/card-grid/ — the grid draws no boxes; the tenants' corners are their own law). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; no family css reads it (grep receipt: zero readers, zero border-radius in the family css). The concentric broadcast reaches the tenants through the §11 supply, and each tenant's own radius law answers. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY ON SELF, CONSUMED BY COMPOSITION — measured both halves. ON SELF: the grid's own 20px gap is INERT at every rung (measured 20px at xs/sm/default/lg) — the space ladder hangs off --space-20 = calc(var(--jx-unit) × 5) and --jx-unit is declared at :root only, which no rung scope re-bases (the declaring-element law). ON THE TENANTS: the named rung stamps data-density on the section root — the scope block IS the tenants' home — and the re-based --jx-inset/--jx-stack/--jx-text channels step the composed cards: measured SECTION-CARD header padding 8px 12px (xs) · 8px 12px (sm) · 12px 16px (default) · 12px 20px (lg), block/inline. Card tenants' chrome is frozen (the card family's own law) — the moving tenant on this page is the section-card. The NUMBER lane is inert (the coefficient stamps, nothing re-declares). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; no family css reads it (grep receipt: zero readers — the grid paints no hue; the transparent-ground + contrast-filter fusion belongs to inline-code, not here). Tenant hue is each card's own paint. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "BRIDGE-ONLY — measured: a resolved dark lands the .dark class on the section root, and the GRID'S OWN PAINT has nothing theme-able to move (transparent ground, one structural gap) — the section holds at every scope. The pole is the TENANTS', decided through their own emission forms: measured, a Card tenant under the grid's bridge holds its light paint (the typed-layer frozen pole); a raw-var tenant would flip through the same bridge. The grid supplies the island; the guests speak for themselves. light and system stamp nothing — tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; no family css reads it (grep receipt: zero readers, zero box-shadow in the family css — the grid casts nothing; tenant shadows are tenant law). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY ON THE AXIS — the carrier --jx-motion-effective is unread (grep receipt: zero readers). The entrance cascade is the family's OWN law, deliberately outside the axis: an internal IntersectionObserver arms .is-entered when the grid scrolls into view, then cards rise on the TIME axis with per-index delays (70ms × index, capped at the 8th child; 320/420ms opacity/transform legs; fill-mode backwards — plays at first paint, no hydration wait), html.js keeps no-JS and pre-hydration fully visible, and prefers-reduced-motion kills the cascade entirely. Animation, not transition-on-the-axis. Number unit: coefficient.",
    },
  ];

  // the family's fixed paint (the fixed-paint TokenTable pattern —
  // no source column: every row is the component's own constant or
  // seam, and the facts live in the Default cells)
  const paintTokens = [
    { name: '--jx-grid-min', default: '320px (the min prop)', source: 'component' as const, description: 'The column collapse width — auto-fit minmax(min(100%, var(--jx-grid-min)), 1fr); consumer-tunable inline, the one var the family owns.' },
    { name: '--jx-card-i', default: '0–7', source: 'component' as const, description: 'Per-child stagger index — nth-child 2…8 stamp it; the entrance delay is calc(var(--jx-card-i) × 70ms).' },
    { name: 'the stagger step', default: '70ms (capped at the 8th child)', source: 'structural' as const, description: 'The entrance cascade\'s per-index delay; opacity 320ms ease-out, transform 420ms cubic-bezier(0.22, 1, 0.36, 1), fill-mode backwards.' },
    { name: 'gap', default: '20px at every density rung (measured)', source: 'structural' as const, description: '--space-20 = calc(var(--jx-unit) × 5) and --jx-unit is :root-anchored — the landlord\'s own rhythm is density-inert; the tenants re-base instead.' },
    { name: '--jx-gap / --jx-inset', default: 'rung scale (xs/sm 8 · default 12 · lg 16px)', source: 'density' as const, description: 'The kernel channels the TENANTS read — re-based inside the rung scope the grid stamps; the grid\'s own atoms read none of them.' },
    { name: 'the lone-card cap', default: 'max-width: 46rem', source: 'structural' as const, description: 'auto-fit collapses empty tracks, so a single card would stretch banner-wide — the lone child caps at the editorial measure.' },
    { name: 'the subgrid rows', default: 'auto 1fr (foot mode: auto 1fr auto)', source: 'structural' as const, description: 'The shared header/body(/foot) contract — every child spans and subgrids them; data-no-subgrid restores a child\'s own rows.' },
  ];

</script>

<svelte:head>
  <title>Card grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai card-grid component: a grid + subgrid layout that equalizes cards — every child spans two shared rows (header / body), so headers align to one height and bodies fill to the tallest. Columns are auto-fit minmax; the min prop controls the collapse width. An IO-armed entrance stagger, reduced-motion safe."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="card-grid — the subgrid equalizer"
        summary="Shared header and body rows keep card tops aligned and bodies filled to the tallest: grid + subgrid, works with any two-block card. A layout LANDLORD: it stamps the universal lanes and forwards them to the tenants it hosts — its own paint stays structural."
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install card-grid">
          <TerminalCard
            barTitle="install — card-grid"
            command="npx jixoai-ui add card-grid"
            outputs={['https://ui.jixoai.com/r/card-grid.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">subgrid rows</span>
          <span class="pill">any two-block card</span>
          <span class="pill">min prop</span>
          <span class="pill">lanes forwarded to tenants</span>
        </div>
      </SectionCard>
    </div>

    <!-- the demo-standard skeleton (2026-08-30): Install then Usage sit
         ABOVE the demos — Intro → Install → Usage → Examples → API →
         See Also is the page law; the sections between stay page-local. -->

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A layout landlord: structural geometry on itself, the universal lanes forwarded to whoever it hosts."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            CardGrid renders one auto-fit grid —
            <code>repeat(auto-fit, minmax(min(100%, var(--jx-grid-min)), 1fr))</code> — plus the
            subgrid equalization law: the grid defines two shared rows (header / body), every
            direct child spans both and opts into <code>grid-template-rows: subgrid</code>, so
            headers align to the tallest header and bodies fill to the tallest body at any column
            count. The cards come from YOUR children snippet — the grid never asks what a child
            is; any two-block card qualifies, and <code>data-no-subgrid</code> opts a child out.
            A lone child is capped at the 46rem editorial measure instead of stretching
            banner-wide.
          </p>
          <p class={cx(rt.measurePara)}>
            The eight axes resolve on the section as a landlord: the grid's OWN paint is one
            fixed 20px gap plus structural geometry — density-inert by construction, because the
            space ladder hangs off the :root-anchored <code>--jx-unit</code> that no rung scope
            re-bases. What the axes move is the SUPPLY: the named density rung stamps the scope
            the tenants live in, and their <code>--jx-inset</code>/<code>--jx-stack</code>
            channels re-base (measured 12 / 16 / 20px tenant padding across the rungs). Kinship,
            named precisely: <code>grid</code> and <code>stack</code> are the sibling layout
            primitives riding the same fixed space ladder — layout families are
            supply-only-on-self by construction. The grid is a LEAF that composes nothing and is
            composed by nothing in the fleet (grep receipt: only the blueprint scenes mount it).
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Feed it any two-block cards; the grid never asks what a child is — section-card qualifies unchanged."><CodeBlock code={usage} lang="svelte" meta="CardGrid usage" /></SectionCard></div>

    <div data-reveal="">
      <ComponentCanvas
        title="card-grid"
        description="Grid + subgrid equalizer: cards span the grid's two shared rows (header / body), so every header aligns to the tallest header and every body fills to the tallest body — no ragged tops, no unequal bottoms. The slider drives the collapse width; the checkbox opts card 03 out."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/card-grid.svelte"
        {files}
        stage="fill"
        onreset={resetCanvas}
        output={[
          { label: 'min', value: `${minPx}px` },
          { label: 'card 03', value: optOut ? 'data-no-subgrid' : 'shared rows' },
        ]}
        resolveFileContent={resolveUsage}
      >
        {#snippet children()}
          <!-- data-doc-demo-scope: the demo's subject IS the shared header
               row — SectionCard headings are the functional data being
               aligned, so this subtree opts out of the no-headings rule -->
          <div data-doc-demo-scope="headings-ok">
            <CardGrid min={`${minPx}px`} class={cx(rt.wFull)}>
            <SectionCard
              eyebrow="card 01"
              title="Short header"
              summary="One summary line — this header is short, yet it reserves the same shared row height as card 02's taller block."
            >
              <div class={cx(rt.flex, rt.hFull, rt.col, rt.justifyBetween, rt.gap12)}>
                <p class={cx(rt.body13)}>A short body. The subgrid row still stretches it to the tallest card's extent.</p>
                <p class="jx-grid-hint">body row: shared</p>
              </div>
            </SectionCard>
            <SectionCard
              eyebrow="card 02"
              title="A deliberately much longer header that wraps to two lines"
              summary="The tallest header block sets the shared header row for every card in the grid — resize the stage with the Playground slider and watch the alignment hold at every column count."
            >
              <div class={cx(rt.flex, rt.hFull, rt.col, rt.justifyBetween, rt.gap12)}>
                <ul class={cx(rt.flex, rt.col, rt.gap6, rt.body13)}>
                  <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span><span>headers align to the tallest header</span></li>
                  <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span><span>bodies fill to the tallest body</span></li>
                  <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span><span>rows live on the GRID, not on each card</span></li>
                </ul>
                <p class="jx-grid-hint">body row: shared</p>
              </div>
            </SectionCard>
            {#if optOut}
              <div data-no-subgrid>
                <SectionCard
                  eyebrow="card 03"
                  title="Opted out — data-no-subgrid"
                  summary="This child wraps itself in data-no-subgrid: it keeps its grid cell but leaves the shared rows, so its body stops stretching."
                >
                  <p class={cx(rt.body13)}>A plain auto row — shorter, by choice.</p>
                </SectionCard>
              </div>
            {:else}
              <SectionCard
                eyebrow="card 03"
                title="Opted out — data-no-subgrid"
                summary="This card is the same two-block card as the others while the Playground checkbox is off; flip it to watch the opt-out collapse the shared-row contract."
              >
                <div class={cx(rt.flex, rt.hFull, rt.col, rt.justifyBetween, rt.gap12)}>
                  <p class={cx(rt.body13)}>Same law as cards 01 and 02 — spanning and subgridding the shared rows.</p>
                  <p class="jx-grid-hint">body row: shared</p>
                </div>
              </SectionCard>
            {/if}
            </CardGrid>
          </div>
        {/snippet}
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="min" hint="column collapse width">
              <PlayRange bind:value={minPx} min={180} max={480} step={20} />
            </PlayRow>
            <PlayRow label="opt card 03 out" hint="data-no-subgrid">
              <PlayToggle bind:value={optOut} />
            </PlayRow>
            <PlayHelp>
              columns are <code>auto-fit, minmax(min(100%, min), 1fr)</code> —
              raising the collapse width drops columns; the shared-row alignment holds at every
              count. The toggle wraps card 03 in <code>data-no-subgrid</code>
              so it leaves the shared rows while keeping its cell.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="subgrid-law" data-reveal="">
      <SectionCard
        family="subgrid-law"
        headerRegion="subgrid-law"
        eyebrow="law"
        title="Rows live on the grid"
        summary="The grid defines the two shared rows and every child subgrids into them; a card never measures its siblings. That is why the alignment survives any column count, any card content, and any resize — and why opting out is a single attribute instead of a prop."
      >
        <div class={cx(rt.col20)}>
          <ul class={cx(rt.col8, rt.body13)}>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the GRID owns <code class={cx(rt.inkAccent)}>grid-template-rows: auto 1fr</code>;
                each child <code class={cx(rt.inkAccent)}>grid-row: span 2</code> +
                <code class={cx(rt.inkAccent)}>grid-template-rows: subgrid</code> — no JS, no
                measurement, no ResizeObserver</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>works with any two-block card: the grid never asks what the child is —
                section-card qualifies unchanged</span></li>
            <li class={cx(rt.row8)}><span class={cx(rt.inkPrimary)} aria-hidden="true">&gt;</span>
              <span>the opt-out is an attribute, not a prop: <code class={cx(rt.inkAccent)}>data-no-subgrid</code>
                on a wrapper keeps the cell but restores the child's own rows</span></li>
          </ul>
          <CodeBlock code={usage} lang="svelte" meta="usage" />
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Card grid variants" summary="One layout, three postures: the shared-row grid, the opted-out cell, and the lone-child cap.">
    <div class={cx(rt.cgGridMd3)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>shared rows (default)</p>
        <p class={cx(rt.body13)}>Every child spans <code class={cx(rt.inkAccent)}>auto 1fr</code> and subgrids — headers align, bodies fill.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>data-no-subgrid opt-out</p>
        <p class={cx(rt.body13)}>A wrapper attribute keeps the cell but restores the child's own rows — not a prop.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>lone child</p>
        <p class={cx(rt.body13)}>auto-fit would stretch a lone card into a banner; it is capped at an editorial measure.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Pure layout — no semantics added or removed; the entrance stagger respects reduced motion."><A11yTable keys={[{ key: '—', action: 'Not interactive — a layout container; children keep their own semantics' }]} aria={[{ name: '(none)', value: '—', description: 'The grid adds no roles or labels; DOM order is the reading order.' }, { name: 'prefers-reduced-motion', value: 'reduce', description: 'The internal entrance cascade is skipped — cards render fully visible.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The landlord's own rhythm is density-inert — the 20px gap holds at every rung (the space ladder hangs off the :root --jx-unit); what density moves is the tenants, through the re-based inset/stack channels."><div class={cx(rt.col20)}><DensityDemo><CardGrid min="220px" class={cx(rt.wFull)}><SectionCard eyebrow="card 01" title="Shared header" summary="Header row shared across the grid."><p class={cx(rt.body13)}>Body fills to the tallest row.</p></SectionCard><SectionCard eyebrow="card 02" title="Another header" summary="Second card in the density demo."><p class={cx(rt.body13)}>The gap and rows are fixed; density does not rescale the grid.</p></SectionCard></CardGrid></DensityDemo><TokenTable tokens={[{ name: '--jx-grid-min', default: '320px (min prop)', source: 'component', description: 'Column collapse width — auto-fit minmax floor.' }, { name: '--jx-card-i', default: '0–7', source: 'component', description: 'Per-child stagger index driving the entrance delay.' }, { name: 'stagger step', default: '70ms (capped at 8th child)', source: 'structural' }, { name: 'gap', default: '20px at every rung (measured)', source: 'structural' }, { name: '--jx-gap', default: '8 / 8 / 12 / 16px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on card-grid"
      summary="A FIRST-TIME all-no-own contract (census batch B): the landlord stamps every carrier and reads none — its own paint is one fixed gap plus structural geometry. The axis story is the SUPPLY CHAIN: the named density rung stamps the scope the tenants live in and their inset/stack channels re-base (measured section-card header padding 8px 12px at xs/sm, 12px 16px at default, 12px 20px at lg — block/inline); size stamps the §11 echo nothing follows (the fixed-voice contrast case); theme is BRIDGE-ONLY (the .dark lands, the grid paints nothing, the tenants speak through their own emission forms). The carriers stamp the section root (the promoted root is self-carried), greppable in the raw SSR."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier or consumption it
          drives on THIS family, Default is the lane default — the named steps, number unit, and
          consumption are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch B row (explicit-props W3-B —
          openspec/changes/explicit-props/research/migration-census.md); the carriers set is
          pinned by test/docs-ambient-vocabulary.spec.ts (card-grid in expectedCarriers). The
          §1 collision rule: the root is a &lt;div&gt; — no native attribute names at stake; every
          axis name is the family's own destructured lane. The density row's two halves are
          measured, not inferred: gap inert at every rung; the section-card tenant stepping
          8px 12px → 12px 16px → 12px 20px (block/inline) across the rungs.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on card-grid" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="card-grid · the supply chain" files={universalFiles} stage="fill">
            <div class={cx(rt.col16, rt.wFull)}>
              <CardGrid density="small" size={14}>
                <SectionCard eyebrow="tenant one" title="the rung steps the guests">
                  <p class={cx(rt.pb8, rt.textVar2)}>the grid supplied density small · size 14</p>
                </SectionCard>
                <SectionCard eyebrow="tenant two" title="every axis forwards the same way">
                  <p class={cx(rt.pb8, rt.textVar2)}>header padding at the small rung: 8px 12px (measured)</p>
                </SectionCard>
              </CardGrid>
              <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
                Measured: the section's own 20px gap and structural geometry hold; the SECTION-CARD
                tenants' header padding steps to the small rung (8px 12px block/inline) through the
                stamped scope — the supply chain is the point. A Card tenant would hold still (its
                chrome is frozen by its own law).
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="card-grid · theme bridge" files={themeFiles} stage="fill">
            <div class={cx(rt.col16, rt.wFull)}>
              <CardGrid theme="dark" min="220px">
                <SectionCard eyebrow="tenant one" title="the bridge lands, the landlord holds">
                  <p class={cx(rt.pb8, rt.textVar2)}>theme="dark" — .dark on the section root</p>
                </SectionCard>
                <SectionCard eyebrow="tenant two" title="the tenant speaks for itself">
                  <p class={cx(rt.pb8, rt.textVar2)}>its own emission form decides what flips</p>
                </SectionCard>
              </CardGrid>
              <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
                The bridge-only specimen: the resolved dark lands the .dark class on the grid's
                root — and the GRID'S OWN PAINT has nothing to move (transparent ground, one
                structural gap). What answers is each tenant, through its own emission form.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="card-grid · query()" files={queryFiles}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <CardGrid density={responsiveDensity}>
                <SectionCard eyebrow="tenant one" title="the rung rides the viewport">
                  <p class={cx(rt.pb8)}>watch the header padding breathe</p>
                </SectionCard>
                <SectionCard eyebrow="tenant two" title="compact below 48rem, roomy above">
                  <p class={cx(rt.pb8)}>measured 8px 12px ↔ 12px 16px (block/inline)</p>
                </SectionCard>
              </CardGrid>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 48rem the base applies — the small rung, tight
                tenants; at 48rem and wider the md case wins — the default rung, roomy tenants
                (measured section-card tenant header padding 8px 12px ↔ 12px 16px block/inline
                across the key). The density lane is a STRING
                lane: both generics are load-bearing. Resize across 48rem.
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

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="The table renders from the GENERATED meta + curation; the eight axis rows split into the shared section beneath. 12 meta rows − 8 ambient axes = 4 family rows (min, foot, class, children) — no rest row (the family spreads nothing: the children snippet and the two structural props are the whole surface); no EXTRA lane."><PropsTable meta={cardGridMeta} docs={CARD_GRID_DOCS} /></SectionCard></div>

  <!-- the skeleton's closing section: related components, derived from
       the docs reading chain (data, not a hand list) -->
  <div id="see-also" data-reveal="">
    <DocsSeeAlso name="card-grid" />
  </div>
</div>
