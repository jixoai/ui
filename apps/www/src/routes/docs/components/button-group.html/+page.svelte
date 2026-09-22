<!--
  Docs page for the button-group family (docs-eight-axes-mdn task 12,
  vellum 2026-09-22 — tier 2 over the docs-demo-standard page: the lab,
  the W7 scroll-overflow canvas, the variant-scope zone, the nested
  clusters and the toggle-group boundary survive verbatim; the skeleton
  re-orders to the archetype and gains Overview + the generated-props
  lane stays HAND (the family has no meta yet — the accordion
  precedent) + the per-axis table + one real query() case; the theming
  DensityDemo folds into the axes demos).

  Order: hero → install → overview → usage → the live lab → the W7
  scroll overflow → variant-scope → nested clusters + boundary → API →
  the eight axes (per-axis table + the four-class theme split + one
  real query() case) → accessibility → see-also.

  Mechanism rows are measurement-first (probed against the served
  family): density is the provider axis (the named rung re-bases the
  JOINED buttons — measured xs 28/11 · sm 32/12 · lg 48/15 · default
  40/13); size/shape/radius/color stamp carriers the COMPOSED
  press-buttons consume (size supply-only for the button anatomy —
  measured: a 20px root font leaves the 13px button type unmoved;
  shape/radius reach the corners through the ambient chain — measured:
  a 16px carrier moves the corner; color re-points --jx-fill/--jx-tonal
  through the [data-jx-press-button] keying); theme splits FOUR ways
  (the slot-scoped --jx-outline border flips, the --jx-foreground alias
  stays frozen, the seam ghost paints no color, the raw --shadow-xs
  cluster shadow follows the theme — all measured); elevation and
  motion are supply-only (negative-grep receipts).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Icon from '$lib/ui/icon';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { PropEntry } from '$lib/ui/props-table/props-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import ButtonGroup, {
    progressBlur,
    ramp,
    shadow,
    type ButtonGroupScrollEffect,
  } from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import buttonGroupSource from '$lib/ui/button-group/button-group.svelte?raw';
  import buttonGroupDividerSource from '$lib/ui/button-group/button-group-divider.svelte?raw';

  // The canvas same-source lane: the eight-axes canvas composes its usage
  // file from THIS PAGE's own stage markup via resolveRawCode (one source,
  // two surfaces). The lab/scroll/nesting/zone/boundary/query canvases
  // stay hand files: the lab and scroll ride the playground's page state
  // and the query() canvas embeds the responsive query() call — the
  // extractor's documented rejection class (the avatar play-state lab
  // precedent).
  import { usageFile } from '$lib/canvas-usage';
  import { resolveRawCode } from 'virtual:jixoai-canvas/docs/components/button-group.html/+page';

  // A literal closing-script tag inside the code string would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  // ---- the scroll-overflow playground (the third mode, 2026-09-04) ------
  const effectOptions = [
    { value: 'ramp', label: 'ramp', build: () => ramp() },
    { value: 'ramp-blurless', label: 'ramp({ blur: false })', build: () => ramp({ blur: false }) },
    { value: 'shadow', label: 'shadow', build: () => shadow() },
    { value: 'progressBlur', label: 'progressBlur', build: () => progressBlur() },
  ] as const;
  const canvasInitial = { orientation: 'horizontal' as 'horizontal' | 'vertical', justify: 'start' as 'start' | 'center' | 'end', effect: 'ramp' };
  let orientation = $state(canvasInitial.orientation);
  let justify = $state(canvasInitial.justify);
  let effectChoice = $state<string>(canvasInitial.effect);
  const scrollEffect = $derived<ButtonGroupScrollEffect>(
    effectOptions.find((o) => o.value === effectChoice)?.build() ?? ramp(),
  );
  function resetCanvas(): void {
    orientation = canvasInitial.orientation;
    justify = canvasInitial.justify;
    effectChoice = canvasInitial.effect;
  }
  const usageLive = $derived(
    `<ButtonGroup label="export actions" orientation="${orientation}" justify="${justify}">
  <PressButton variant="outline">copy</PressButton>
  <PressButton variant="outline">move</PressButton>
  <ButtonGroupDivider />
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`,
  );
  // the scroll canvas's live sample: the effect choice tracks the
  // playground (slide() is the default — spelled out when chosen)
  const scrollUsageLive = $derived(
    `<ButtonGroup label="editor actions" overflow="scroll"${effectChoice === 'ramp' ? '' : ` scrollEffect={${effectChoice === 'ramp-blurless' ? "ramp({ blur: false })" : `${effectChoice}()`}}`}>
  <!-- enough members to overflow the constrained stage -->
  <PressButton variant="outline">format</PressButton>
  <PressButton variant="outline">rename</PressButton>
  <PressButton variant="outline">copy link</PressButton>
  <PressButton variant="outline">duplicate</PressButton>
  <PressButton variant="outline">archive</PressButton>
  <PressButton variant="outline">move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`,
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('button-group-scroll-usage.svelte')
      ? scrollUsageLive
      : file.name.endsWith('usage.svelte')
        ? usageLive
        : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/button-group/button-group.svelte', content: buttonGroupSource },
    { name: 'registry/files/ui/button-group/button-group-divider.svelte', content: buttonGroupDividerSource },
    { name: 'src/lib/ui/button-group-usage.svelte', content: usageLive, kind: 'usage' },
    { name: 'src/lib/ui/button-group-scroll-usage.svelte', content: scrollUsageLive, kind: 'usage' },
  ];

  // ---- the ONE usage sample (drawer + body CodeBlock share it) ----------
  const usage = `<script lang="ts">
  import ButtonGroup, { ButtonGroupDivider } from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<ButtonGroup label="export actions">
  <PressButton variant="outline">copy</PressButton>
  <ButtonGroupDivider />
  <PressButton variant="outline">move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`;

  // the zone half (variant-scope section), swept through a canvas: the
  // scope changes the default variant only — no seams, no group (the
  // group cell shows the same zone plus the join)
  const buttonGroupZoneDemo = `<script lang="ts">
  import ButtonGroup, { ButtonVariantScope } from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<!-- the zone, layout-free — nothing renders but the buttons -->
<PressButton>lone — outline</PressButton>
<ButtonVariantScope variant="ghost">
  <PressButton>adopts ghost</PressButton>
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonVariantScope>

<!-- the group — zone + join -->
<ButtonGroup variant="ghost" label="row actions">
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonGroup>`;

  const buttonGroupZoneFiles: TreeFile[] = [
    { name: 'button-group-zone-demo.svelte', content: buttonGroupZoneDemo, kind: 'usage' },
  ];

  // the boundary demo (btngroup-boundary section), swept through a
  // canvas: actions stay with button-group; selection is toggle-group
  const buttonGroupBoundaryDemo = `<script lang="ts">
  import ButtonGroup from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
${close}

<!-- actions → button-group: each press performs, nothing stays active -->
<ButtonGroup label="export actions">
  <PressButton variant="outline">copy</PressButton>
  <PressButton variant="outline">move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`;

  const buttonGroupBoundaryFiles: TreeFile[] = [
    { name: 'button-group-boundary-demo.svelte', content: buttonGroupBoundaryDemo, kind: 'usage' },
  ];

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the eight-axes canvas (per-axis demos, code shown = code running,
  // composed from the extracted stage markup) ------------------------------
  const axesUsage = usageFile(
    {
      ButtonGroup: '@ui/button-group/index',
      PressButton: '@ui/press-button/press-button.svelte',
    },
    resolveRawCode('axes'),
  );
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/button-group-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive density on the joined row — the
  // base (small: the pointer-lane row) applies below the 40rem viewport;
  // at ≥40rem the lg case wins and the row steps to the touch tier.
  // BOTH generics are the §6 typing law: with an explicit type-argument
  // list TS disables inference for the base parameter, so the single-arg
  // form pins B to undefined and ships a real svelte-check error.
  const queryUsage = `<script lang="ts">
  import ButtonGroup from '@ui/button-group/index';
  import PressButton from '@ui/press-button/press-button.svelte';
  import { query } from '@lib/universal-props-query.svelte';
  import type { DensityLane } from '@lib/defaults.svelte';
${close}

<ButtonGroup label="responsive row" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}>
  <PressButton variant="outline">copy</PressButton>
  <PressButton variant="outline">move</PressButton>
  <PressButton variant="outline">delete</PressButton>
</ButtonGroup>`;

  // ---- the per-axis table (§2.5) — measurement-first, receipts in the
  // house form. The family is a PROVIDER: the root stamps the carriers,
  // the COMPOSED press-buttons are the consumers (their own anatomy
  // rides the ambient chain), and the group's own chrome is one shadow
  // plus color-free seams.
  const axisRows: PropEntry[] = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY for the button anatomy — the root stamps --jx-size-effective and an inline font-size, and the joined buttons' type is density-channel-anchored (--jx-text), so the stamp reaches only unstyled flow under the group (measured: a 20px root font leaves the 13px button type unmoved). The §1 collision applies: the native size attribute is never received. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: 'ambient scope',
      description:
        "CONSUMED BY THE COMPOSED BUTTONS — the root stamps --jx-shape-effective and the joined press-buttons' corner-shape reads it through the ambient chain (press-button.css). The group's own chrome has no corners to re-shape: a joined row is a rectangular strip. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "CONSUMED BY THE COMPOSED BUTTONS — the §3 concentric anchor with the group as the supplying root: the carrier lands on the group and every joined button that resolves auto computes R − seam against it (measured: a stamped 16px carrier moves the button corner). The group's own strip has no corner of its own. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'xs' | '2xs' | 'sm' | 'default' | 'lg' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "CONSUMED — the PROVIDER axis (the reactive bridged provider, the provider-snapshot kernel law). The named rung stamps data-density on the group root and the scope block re-bases the lanes the joined buttons read (--jx-hit, --jx-text): measured 28/11px at xs, 32/12 at sm, 40/13 at default, 48/15 at lg — the whole joined row re-tiers through one prop. The NUMBER lane is inert (the declaring-element law: the coefficient composes at :root, the wrapper never re-declares). Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: 'ambient scope',
      description:
        "CONSUMED BY THE COMPOSED BUTTONS — the root stamps --jx-color-effective and the joined press-buttons' --jx-fill/--jx-tonal re-derive from it through the [data-jx-press-button] keying; the group's own chrome (seams, cluster shadow) reads none of it (grep receipt: zero carrier reads in ui/button-group/). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: 'ambient scope',
      description:
        "PARTIAL re-theme — measured, FOUR voice classes. FLIPS: the joined buttons' variant borders (the theme-scoped --jx-outline slot re-declares in scope — measured black→white under the island). STAYS FROZEN: the buttons' label ink (the --jx-foreground stylex alias, substituted at :root). THEME-NEUTRAL: the seams (the contrast-ghost ink paints no color — the backdrop's own contrast is the paint). FOLLOWS THE THEME: the cluster shadow (raw --shadow-xs — the docs theme re-declares the offset per scope, black↔white measured). light and system stamp nothing — tree inheritance. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — the cluster shadow is `raised`'s own physics (--shadow-xs on the root, the press law's rest pose), deliberately OUTSIDE this lane: the carrier stamps --jx-elevation-effective and nothing in the family css consumes it (grep receipt: zero readers; the shadow stays --shadow-xs regardless of the stamped level). Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: 'ambient scope',
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; no family css reads it (grep receipt: zero readers). The scroll run's smooth travel and proximity snap are behavior, the scrollEffect ramps are builders — the axis has no family-local kernel to step. Number unit: coefficient.",
    },
  ];
</script>

<svelte:head>
  <title>Button group · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai button-group: an orientation/justify container that joins press-buttons edge-to-edge over the hairline seam law — adjacent borders collapse into one 1px seam (never a double border), the ButtonGroupDivider replaces the seam between clusters. role=group by law (a named action grouping, NOT a toolbar); selection is toggle-group's law, not this component's."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · General"
        title="button-group — joined actions, one hairline"
        summary="The shadcn Button Group counterpart, native to this registry's laws: a layout container that joins press-buttons edge-to-edge. The group paints NO bezel of its own — adjacent children collapse their 1px borders into ONE hairline seam (a joined row of outline buttons reads as one control, never a 2px double border), and the ButtonGroupDivider replaces the seam wherever clusters need an explicit boundary. The buttons keep their paint ladder and density tier; PHYSICS is the one takeover (2026-09-04): the joined row is ONE control, so it casts ONE convex shadow from the ROOT — per-button convex shadows overlap at the seams, so the subtree rides raised=false by default through the texture context (an explicit raised on any child still wins; icon-buttons follow the same context for free). ROLE LAW: the root is role=group — a named grouping of related actions, NOT a toolbar; and when the children express SELECTION (a pressed state, an active value), the component is wrong: segmented selection is toggle-group's law."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">orientation · justify</span>
          <span class="pill">1px hairline seams</span>
          <span class="pill">one cluster shadow · flat buttons</span>
          <span class="pill">ButtonGroupDivider</span>
          <span class="pill">role=group law</span>
          <span class="pill">zero deps · Svelte 5 runes</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="button-group" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="A layout container that paints almost nothing of its own: the join, the seams, and one cluster shadow — its eight axes land in the COMPOSED press-buttons through the ambient chain."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The group owns the join: adjacent children collapse their borders into one hairline
            seam (a −1px margin over a grid of content-sized tracks — the seam is geometry, never
            a second border), <code>ButtonGroupDivider</code> is the announced boundary between
            clusters, and the variant zone re-points the joined buttons' default paint
            (<code>ButtonVariantScope</code> is the zone alone, layout-free). The cluster shadow is
            the one takeover: the joined row is ONE control, so the ROOT casts the single convex
            shadow while the subtree rides flat.
          </p>
          <p class={cx(rt.measurePara)}>
            The overflow policy handles the row outgrowing its inline space — wrap (measured rows),
            collapse (the tail folds into a DropdownMenu behind a ⋯ trigger — the composed consumer:
            menu entries click the hidden real buttons, which keep their listeners), or the W7
            scroll run (the root becomes the scroller — hidden scrollbar, smooth, proximity snap —
            and the scrollEffect chrome rides the stamped scroll verdict).
          </p>
          <p class={cx(rt.measurePara)}>
            Because the group paints almost nothing itself, its eight axes land in the COMPOSED
            press-buttons: density re-tiers the whole row through the provided scope, radius makes
            the group the concentric anchor the buttons compute against, shape and color re-skin the
            buttons' corners and hue through the ambient chain — while size, elevation and motion
            stamp carriers nothing here reads (per-axis below, with receipts). The axis grammar
            lives on the <a class="pill" href="/docs/universal-props.html">universal props</a> page.
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
        summary="Author the buttons in your tree — the group owns the join, the divider owns explicit boundaries. Name the group; the platform owns the rest."
      >
        <CodeBlock code={usage} lang="svelte" meta="Button group usage" />
      </SectionCard>
    </div>

    <div id="btngroup-demo" data-region="btngroup-demo" data-family="btngroup-demo" data-reveal="">
      <ComponentCanvas
        title="button-group"
        description="Joined press-buttons with a divider between the clusters — the playground flips orientation and justify; the usage file in the drawer tracks both."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group.svelte"
        files={canvasFiles}
        stage="center"
        onreset={resetCanvas}
        output={[
          { label: 'orientation', value: orientation },
          { label: 'justify', value: justify },
        ]}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(rt.flex, rt.minW0, rt.col, rt.itemsStart, rt.gap20)}>
          <ButtonGroup label="export actions" {orientation} {justify}>
            <PressButton variant="outline">copy</PressButton>
            <PressButton variant="outline">move</PressButton>
            <ButtonGroupDivider />
            <PressButton variant="outline">delete</PressButton>
          </ButtonGroup>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="orientation">
              <PlaySegmented
                bind:value={orientation}
                options={[
                  { value: 'horizontal', label: 'horizontal' },
                  { value: 'vertical', label: 'vertical' },
                ]}
              />
            </PlayRow>
            <PlayRow label="justify">
              <PlaySegmented
                bind:value={justify}
                options={[
                  { value: 'start', label: 'start' },
                  { value: 'center', label: 'center' },
                  { value: 'end', label: 'end' },
                ]}
              />
            </PlayRow>
            <PlayHelp>
              every button keeps its own tab stop and press physics — the group only joins their
              edges. The divider is the seam between clusters, never a fifth border.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="btngroup-scroll" data-region="btngroup-scroll" data-family="btngroup-scroll" data-reveal="">
    <ComponentCanvas
      title="with scroll overflow"
      description="The third overflow mode (2026-09-04, the tabs contract): the joined line rides a scroll run — hidden scrollbar, smooth travel, proximity snap — and the scrollEffect edge treatments follow the scroll. The chevrons and the shadow veil key on the run's scroll-state verdict: nothing paints when the line fits."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
      output={[
        { label: 'overflow', value: 'scroll' },
        { label: 'scrollEffect', value: effectChoice },
      ]}
      resolveFileContent={resolveUsage}
    >
      <div class={cx(rt.flex, rt.minW0, rt.col, rt.itemsStart, rt.gap20)}>
        <div class={cx(rt.wFull, rt.buMaxW360)}>
          <ButtonGroup label="editor actions" overflow="scroll" {scrollEffect}>
            <PressButton variant="outline">format</PressButton>
            <PressButton variant="outline">rename</PressButton>
            <PressButton variant="outline">copy link</PressButton>
            <PressButton variant="outline">duplicate</PressButton>
            <PressButton variant="outline">archive</PressButton>
            <PressButton variant="outline">move</PressButton>
            <PressButton variant="outline">delete</PressButton>
          </ButtonGroup>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="scrollEffect">
            <PlaySegmented
              bind:value={effectChoice}
              options={[...effectOptions.map((o) => ({ value: o.value, label: o.label }))]}
            />
          </PlayRow>
          <PlayHelp>
            slide/blur/blurSlide ramp each member as it clips an edge; shadow/progressBlur veil the
            run's edges (the separator ink law — contrast subtracts color, never adds black). Drag or
            wheel the row; the chevrons step one page per click.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="variant-scope" data-reveal="">
    <SectionCard
      family="variant-scope"
      headerRegion="variant-scope"
      eyebrow="the zone half"
      title="ButtonVariantScope — change the default, not the layout"
      summary="The family's second face: a zero-DOM context boundary. ButtonGroup is layout + zone (the join, the seams); ButtonVariantScope is the zone alone — what Dialog wraps around its head and foot content so every PressButton and IconButton inside, joined or free-floating, defaults to the scope's variant while keeping its own placement. A button's explicit variant still wins (explicit ?? ambient ?? own), and a ButtonGroup inside inherits the scope's variant when it sets none of its own (inherit-then-provide). Renders its children and nothing else — no element, no paint, no seams."
    >
      <div class={cx(rt.flex, rt.col, rt.gap20)}>
        <div class={cx(rt.buGrid)}>
          <ComponentCanvas title="button-group · variant scope" stage="fill" files={buttonGroupZoneFiles}>
            <div class={cx(rt.col12)}>
              <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.buTrack20, rt.inkMuted)}>the scope — zone only</p>
              <div class={cx(rt.wrapRow12)}>
                <PressButton>lone — outline</PressButton>
                <ButtonVariantScope variant="ghost">
                  <div class={cx(rt.wrapRow12)}>
                    <PressButton>adopts ghost</PressButton>
                    <PressButton>adopts ghost</PressButton>
                    <PressButton variant="fill">keeps fill</PressButton>
                  </div>
                </ButtonVariantScope>
              </div>
              <span class={cx(rt.text125, rt.inkMuted)}>free-floating: no seams, no group — only the default changed; the lone button outside never saw the zone.</span>
              <p class={cx(rt.m0, rt.fontNav, rt.text12, rt.upper, rt.buTrack20, rt.inkMuted)}>the group — zone + join</p>
              <ButtonGroup variant="ghost" label="row actions">
                <PressButton>adopts ghost</PressButton>
                <PressButton variant="fill">keeps fill</PressButton>
              </ButtonGroup>
              <span class={cx(rt.text125, rt.inkMuted)}>same zone, plus the hairline join — one component when both are wanted.</span>
            </div>
          </ComponentCanvas>
          <div class={cx(rt.col12)}>
            <CodeBlock
              code={`<script lang="ts">
  import PressButton from '@ui/press-button/press-button.svelte';
  import { ButtonVariantScope } from '@ui/button-group/index';
\${close}

<!-- the zone, layout-free — nothing renders but the buttons. Every
     PressButton / IconButton inside that passes no variant adopts
     ghost; an explicit variant always wins. Dialog's head and foot
     zones use exactly this scope (dialog.svelte, real source). -->
<ButtonVariantScope variant="ghost">
  <PressButton>adopts ghost</PressButton>
  <PressButton variant="fill">keeps fill</PressButton>
</ButtonVariantScope>`}
              lang="svelte"
              meta="the scope — copy-paste"
            />
            <span class={cx(rt.text125, rt.inkMuted)}>link is NOT a zone value — <code>variant="link"</code> is a compile error; the interaction exception keeps its only route through PressButton's own explicit prop.</span>
          </div>
        </div>
        <PropsTable universal
          props={[
            { name: 'ButtonVariantScope · variant', type: "'fill' | 'tonal' | 'outline' | 'ghost'", default: '—', description: 'The variant buttons in this subtree adopt when they set none (ZonePaintVariant — link excluded by the union itself).' },
            { name: 'ButtonVariantScope · children', type: 'Snippet', default: 'required', description: 'The scoped subtree — rendered as-is; the scope adds NO element, no paint, no seams.', required: true },
          ]}
        />
      </div>
    </SectionCard>
  </div>

  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named demos — one phrase, one capability — plus the recorded boundary against the selection family."
    >
      <p class={cx(rt.m0, rt.bodyMuted)}>
        Nested clusters first, then the boundary note — when the children express SELECTION, the
        law leaves this page for toggle-group.
      </p>
    </SectionCard>
  </div>

  <div id="btngroup-nesting" data-region="btngroup-nesting" data-family="btngroup-nesting" data-reveal="">
    <ComponentCanvas
      title="with nested clusters"
      description="A nested ButtonGroup is ONE child for the outer seam — the inner seams never leak outward; fill and outline rungs join on the same hairline. The divider is a COMPOSED Separator (2026-09-04): the boundary line rides the same contrast-ghost ink engine as the internal seams — its extra weight is GEOMETRY (flush border·line·border junction against the collapsed 1px intra-cluster seam), never a heavier paint."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/button-group/button-group-divider.svelte"
      files={[
        { name: 'registry/files/ui/button-group/button-group-divider.svelte', content: buttonGroupDividerSource },
      ]}
      stage="center"
      output={[{ label: 'clusters', value: '2 · joined by a divider' }]}
    >
      <div class={cx(rt.flex, rt.minW0, rt.col, rt.itemsStart, rt.gap20)}>
        <ButtonGroup label="editor actions">
          <PressButton variant="fill">save</PressButton>
          <ButtonGroupDivider />
          <ButtonGroup label="view switches">
            <PressButton variant="outline" square ariaLabel="undo"><Icon name="arrowLeft" /></PressButton>
            <PressButton variant="outline" square ariaLabel="redo"><Icon name="arrowRight" /></PressButton>
          </ButtonGroup>
          <PressButton variant="ghost">discard</PressButton>
        </ButtonGroup>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the seam rule is child-scoped: the nested group joins internally, and the outer
            collapse treats the whole cluster as one neighbor. Mixed rungs (fill / outline /
            ghost) share the hairline because every rung paints a 1px edge.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="btngroup-boundary" data-region="btngroup-boundary" data-family="btngroup-boundary" data-reveal="">
    <SectionCard
      family="btngroup-boundary"
      headerRegion="btngroup-boundary"
      eyebrow="boundary"
      title="the toggle-group boundary — selection is not this component"
      summary="A button group is ACTION-ONLY: press, effect, navigate — no pressed state, no active value, no form payload. The moment the children express SELECTION, the segmented-selection law applies and the component is toggle-group (native radios/checkboxes under one name — native exclusivity, arrow-walk, FormData). The two may look similar when joined; the difference is semantic, not paint: aria-pressed (or a pressed style) on these buttons is the recorded divergence trap."
    >
      <div class={cx(rt.buGrid)}>
        <ComponentCanvas title="button-group · boundary" stage="fill" files={buttonGroupBoundaryFiles}>
          <div class={cx(rt.col12)}>
            <p class={cx(rt.fontNav, rt.text12, rt.upper, rt.buTrack20, rt.inkMuted)}>actions → button-group</p>
            <ButtonGroup label="export actions">
              <PressButton variant="outline">copy</PressButton>
              <PressButton variant="outline">move</PressButton>
              <PressButton variant="outline">delete</PressButton>
            </ButtonGroup>
            <span class={cx(rt.text125, rt.inkMuted)}>each press performs; nothing stays active.</span>
          </div>
        </ComponentCanvas>
        <div class={cx(rt.col12)}>
          <p class={cx(rt.fontNav, rt.text12, rt.upper, rt.buTrack20, rt.inkMuted)}>selection → toggle-group</p>
          <CodeBlock
            code={`<ToggleGroup name="align" type="single" label="alignment">
  <ToggleGroupItem value="left">left</ToggleGroupItem>
  <ToggleGroupItem value="center">center</ToggleGroupItem>
</ToggleGroup>`}
            lang="svelte"
            meta="the selection law"
          />
          <span class={cx(rt.text125, rt.inkMuted)}>one active value, submitted as a form field.</span>
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
      summary="Two parts: the container owns orientation/justify, the overflow policy and the seam; the divider owns explicit boundaries. The eight universal axis props resolve on the group root (the provider) — their per-family story is the axes table below."
    >
      <PropsTable
        props={[
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'The join axis; carries the valued data-jx-btngroup hook.' },
          { name: 'justify', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Cluster placement on the main axis.' },
          { name: 'label', type: 'string', default: '—', description: 'Accessible group name (aria-label); an explicit rest aria-label wins.' },
          { name: 'variant', type: "'fill' | 'tonal' | 'outline' | 'ghost'", default: 'ambient zone', description: 'The GROUP rung adopted by every child button that passes none of its own (explicit always wins; no rung is minted — context selects). Omitted → the enclosing scope’s variant (inherit-then-provide, r14-10); link is not a zone value — it stays reachable only through PressButton’s own explicit prop.' },
          { name: 'raised', type: 'boolean', default: 'ambient zone ?? true', description: 'The CLUSTER shadow (2026-09-04): the root carries the joined row’s ONE convex shadow — --shadow-xs, the press law’s rest pose alone (no hover growth, no active engrave; the root never presses). Explicit ?? the enclosing texture zone (a flat card/dialog foot carries through) ?? the top-level convex default; a NESTED group defaults OFF (one member of the outer cluster — one control, one shadow). false removes the root shadow and nothing else; the inner buttons’ flat default stands regardless (an explicit raised on a child still wins).' },
          { name: 'separator', type: 'boolean', default: 'ghost ⇒ true', description: 'The seam policy: a 1px contrast-ghost separator in every collapsed seam slot. DEFAULT on when the group’s EFFECTIVE variant (own prop, else the inherited scope) is ghost — the borderless row has no other seam.' },
          { name: 'leadingSeam', type: 'boolean', default: 'false', description: 'The cluster’s opening bracket (r14-13): paint the seam in the leading slot too — the first button’s own flush ::before, never a sibling element a parent gap could detach. Only paints under an active seam policy (the dialog footer’s actions region is the canonical consumer).' },
          { name: 'overflow', type: "'wrap' | 'collapse' | 'scroll'", default: "'wrap'", description: 'The overflow policy when the joined row outgrows its inline space: wrap breaks measured rows (per-item grid cells, row leads reset the seam); collapse folds the tail into a DropdownMenu behind the ⋯ trigger; scroll (2026-09-04) rides a scroll run — the root becomes the scroller (hidden scrollbar, smooth, proximity snap), the line never breaks, and NO measurement runs (the chevrons/veil key on the JS-stamped scroll-state instead). Scroll’s effect chrome is the horizontal contract — a vertical group declaring scroll gets the bare block-axis scroller.' },
          { name: 'scrollEffect', type: 'ramp() | shadow() | progressBlur()', default: 'ramp()', description: 'The edge treatment while overflow=scroll scrolls (the tabs scrollEffect convention; inert elsewhere), axis-aware: a vertical scroll group rides the same chrome against its block edges. ramp({ opacity, blur, translate, distance, radius }) is the ONE member-ramp builder — every toggle defaults ON, a toggle off never pays its property; shadow/progressBlur veil the edges from the non-scrolling host — shadow is the separator ink law’s contrast ghost (no color channel), progressBlur mounts the ProgressiveBlur ladder (inline axis; vertical substitutes shadow). width overrides the band.' },
          { name: 'density', type: 'DensityLane | QueryResult<DensityLane>', default: 'ambient scope', description: 'Density tier, provided to the subtree so joined buttons adopt it: explicit ?? the ambient scope (no opinion stamps nothing).' },
          { name: 'role', type: 'string', default: "'group'", description: 'The group role — a labeled toolbar is the consumer’s explicit override.' },
          { name: 'class', type: 'string', default: "''", description: 'Merged into the root (cn()).' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'The joined controls — authored in your tree.', required: true },
          { name: '...rest', type: 'HTMLAttributes', default: '—', description: 'aria-labelledby, data-*, handlers — land on the root verbatim.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on button-group"
      summary="The group is a PROVIDER: the root stamps every carrier and the COMPOSED press-buttons are the consumers (their own anatomy rides the ambient chain — press-button.css reads shape/radius/color; the hit/text lanes ride density). The group's own chrome is one shadow plus color-free seams. Measured: density re-tiers the whole row through one prop; the theme split runs four voice classes (slot borders flip, alias ink frozen, seam ghost color-free, raw shadow follows the theme); size, elevation and motion stamp carriers nothing here reads. Census: batch A (migration-census.md)."
    >
      <div class={cx(rt.col20)}>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the adoption is the census batch A row (explicit-props W3-D5 — the
          first-time no-own surface, the provider duties riding the reshaped reads;
          openspec/changes/explicit-props/research/migration-census.md). The §1 collision rule: the
          root extends HTMLAttributes Omit&lt;'color'&gt;, the native elements never receive an
          axis name. The elevation carve-out is the cluster-shadow law: `raised` owns the root's
          shadow, the elevation lane supplies and nothing consumes.
        </p>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on button-group" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas id="axes" title="button-group · the provider lanes" files={axesFiles} stage="fill">
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density default — the pointer-lane row (40px hits, 13px type)</span>
                <ButtonGroup label="density default row">
                  <PressButton variant="outline">copy</PressButton>
                  <PressButton variant="outline">move</PressButton>
                  <PressButton variant="outline">delete</PressButton>
                </ButtonGroup>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="lg" — the touch tier steps the whole row (48px, 15px)</span>
                <ButtonGroup label="density touch row" density="lg">
                  <PressButton variant="outline">copy</PressButton>
                  <PressButton variant="outline">move</PressButton>
                  <PressButton variant="outline">delete</PressButton>
                </ButtonGroup>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>radius="medium" — the group anchors; the joined buttons compute R − seam</span>
                <ButtonGroup label="radius row" radius="medium">
                  <PressButton variant="outline">copy</PressButton>
                  <PressButton variant="outline">move</PressButton>
                  <PressButton variant="outline">delete</PressButton>
                </ButtonGroup>
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — the variant borders flip; the label ink stays frozen; the seams stay color-free; the cluster shadow follows the theme</span>
                <ButtonGroup label="dark row" theme="dark">
                  <PressButton variant="outline">copy</PressButton>
                  <PressButton variant="outline">move</PressButton>
                  <PressButton variant="outline">delete</PressButton>
                </ButtonGroup>
              </div>
            </div>
            <p class={cx(rt.mt8, rt.note12, rt.inkMuted70)}>
              The number lane (a coefficient) stamps and re-bases nothing here — the declaring
              element for every channel this family reads is outside the wrapper. Measure the hit
              ladder, not the coefficient: 28 / 32 / 40 / 48px across xs / sm / default / lg.
            </p>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas title="button-group · query()" files={[{ name: 'button-group-query-demo.svelte', content: queryUsage, kind: 'usage' }]}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
              <ButtonGroup
                label="responsive row"
                density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}
              >
                <PressButton variant="outline">copy</PressButton>
                <PressButton variant="outline">move</PressButton>
                <PressButton variant="outline">delete</PressButton>
              </ButtonGroup>
              <p class={cx(rt.para)}>
                Media keys are min-width: below 40rem the base applies — the small rung, the
                pointer-lane row; at 40rem and wider the lg case wins and the row steps to the touch
                tier (32px hits below, 48px above — measured). Resize across 40rem.
              </p>
            </div>
          </ComponentCanvas>
        </div>

        <div class={cx(rt.mt20)}>
          <TokenTable tokens={[
            { name: '--jx-hit', default: '28 / 32 / 40 / 48px across xs / sm / default / lg', source: 'density', description: 'The joined buttons\' hit floor — the lane the named rung re-bases (measured; 2xs sits at 24px).' },
            { name: '--jx-text', default: '11 / 12 / 13 / 15px across xs / sm / default / lg', source: 'density', description: 'The joined buttons\' type voice — re-based with the hit lane.' },
            { name: '--shadow-xs', default: 'theme', source: 'structural', description: 'The cluster shadow (the raised physics) — a raw read that follows the theme\'s own re-declaration.' },
            { name: '--border', default: 'theme', source: 'structural', description: 'Joined button borders (via --jx-outline); the divider and seams paint no color.' },
          ]} />
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
      summary="role=group named by label — a grouping of related actions over plain buttons; never a toolbar unless you explicitly relabel it (and then you own the roving-tabindex contract)."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Each button keeps its own tab stop — a group is NOT a roving-tabindex collection' },
          { key: 'Space / Enter', action: 'Activates the focused button (native)' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'The law. Override through the rest props only with an explicit labeled toolbar contract' },
          { name: 'aria-label', value: 'label', description: 'The group accessible name — or aria-labelledby through the rest props; a nameless group is announced as nothing' },
          { name: 'role="separator"', value: 'divider', description: 'ButtonGroupDivider announces the boundary between clusters; aria-orientation describes the LINE (vertical inside a horizontal flow)' },
          { name: 'no aria-pressed', value: 'law', description: 'No button carries a pressed state here — that is toggle-group’s contract' },
        ]}
      />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="button-group" />
  </div>
</div>
