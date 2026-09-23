<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import PrototypeGrid from '$lib/ui/prototype-grid/prototype-grid.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect, PlayNumber } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import gridSource from '$lib/ui/prototype-grid/prototype-grid.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<PrototypeGrid cols={3} gap={12}>
  <span>one</span><span>two</span><span>three</span>
</PrototypeGrid>

<!-- number → repeat(N, minmax(0, 1fr)); string stays verbatim -->
<PrototypeGrid cols="repeat(auto-fit, minmax(140px, 1fr))" gap="0.75rem">
  <span>cards</span><span>reflow</span><span>by</span><span>width</span>
</PrototypeGrid>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-grid/prototype-grid.svelte', content: gridSource },
    { name: 'src/lib/ui/prototype-grid-usage.svelte', content: usage, kind: 'usage' },
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

  // ── THE RIG: track forms edited through real props. Controls live in
  // the STAGE BODY (the playground snippet mounts lazily — task 35
  // bank). The cols select demonstrates BOTH coercion forms plus the
  // verbatim ratio form; every change is measured against the
  // container's RESOLVED grid-template-columns (px per track), not the
  // style string. ──
  type ColsForm = '3' | 'auto-fit' | 'ratio';
  type RowsForm = 'auto' | '2' | '3';
  let rigCols = $state<ColsForm>('3');
  let rigRows = $state<RowsForm>('auto');
  let rigGap = $state(12);

  const colsValue = $derived(
    rigCols === '3' ? 3 : rigCols === 'auto-fit' ? 'repeat(auto-fit, minmax(140px, 1fr))' : '1fr 2fr 1fr',
  );
  const rowsValue = $derived(rigRows === 'auto' ? undefined : Number(rigRows));

  const colsOptions: readonly { value: ColsForm; label: string }[] = [
    { value: '3', label: '3 → repeat(3, minmax(0, 1fr))' },
    { value: 'auto-fit', label: '"repeat(auto-fit, minmax(140px, 1fr))"' },
    { value: 'ratio', label: '"1fr 2fr 1fr" (verbatim ratio)' },
  ];
  const rowsOptions: readonly { value: RowsForm; label: string }[] = [
    { value: 'auto', label: 'auto (implicit rows)' },
    { value: '2', label: '2 → repeat(2, minmax(0, 1fr))' },
    { value: '3', label: '3 → repeat(3, minmax(0, 1fr))' },
  ];

  const rigUsageLive = $derived(`<PrototypeGrid
  cols=${rigCols === '3' ? '{3}' : JSON.stringify(colsValue)}
  rows=${rigRows === 'auto' ? 'omitted' : `{${rigRows}}`}
  gap={${rigGap}}
>
  <!-- six chips; watch the resolved tracks in the readout -->
</PrototypeGrid>`);
  const resolveRigUsage = (file: TreeFile): string =>
    file.name.endsWith('rig.svelte') ? rigUsageLive : file.content;

  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<PrototypeGrid cols={3} size={18} density="small">…</PrototypeGrid>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/prototype-grid-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 36) — the zero-translation
  // alpha lane: the axes are FORWARDERS (stamps, no family paint). ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "FORWARDER — the resolved rung stamps data-density on the grid root (measured data-density=lg with an explicit lane; null ambient), opening the kernel channels for DESCENDANTS; the track geometry consumes none. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER, ECHO MEASURED — the §11 stamp lands inline as font-size: var(--jx-size-effective, 1rem) (the carrier chain, measured in the style attr; computed 18px at size={18}), so fr/em-inheriting tracks and children reflow. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description: "FORWARDER — carrier stamp only; zero family readers (an inline-style-only family: no css file, no tokens). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description: "FORWARDER — carrier stamp only; zero family readers. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description: "FORWARDER — carrier stamp only; children re-tint through the ambient chain if they read it. Zero family readers. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "FORWARDER — dark rides the .dark class bridge on the grid root (measured with theme=\"dark\"), re-scoping token chains for the subtree; the track geometry is theme-blind. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description: "FORWARDER — carrier stamp only; zero family readers. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER — carrier stamp only; the layout has no transitions of its own (grep receipt: zero transition declarations in the family). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key). The size
  // axis is a LANE (accepts query()); cols/rows/gap/areas are native
  // CSS passthroughs (number | string) and reject it — the lanes-vs-
  // passthroughs boundary, typecheck-proven on prototype-flex (task 35).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import PrototypeGrid from '@ui/prototype-grid.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case
     (18px) wins — the §11 stamp scales the root, fr tracks reflow -->
<PrototypeGrid cols={3} size={query({ md: 18 }, 13)} gap={12}>…</PrototypeGrid>`;

  const queryFiles: TreeFile[] = [
    { name: 'prototype-grid-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Prototype grid · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-grid: the alpha-track layout family's standardized grid primitive — cols/rows coerce number → repeat(N, minmax(0, 1fr)), strings stay verbatim, areas verbatim, inline style only, zero dependencies."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-grid — the standardized grid"
        summary="The layout family, alpha track: the design studio's property panel edits these exact props. Three laws carry over from prototype-flex — single root + rest spread, zero translation, inline style only — plus the track coercion: cols/rows number → repeat(N, minmax(0, 1fr)) (the no-max-content-blowout form), strings stay verbatim, and grid-template-areas passes through as one template string."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">alpha track</span>
          <span class="pill">inline style only</span>
          <span class="pill">single root + rest spread</span>
          <span class="pill">track coercion: number → repeat</span>
          <span class="pill">zero dependencies</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (chrome — out of the toc) -->
    <div id="install" data-reveal="">
      <DocsInstall name="prototype-grid" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The flex contract carries over, plus one real coercion: track forms. Everything else — stamps, forwarder axes, host-agnosticism — is the alpha lane verbatim."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The three alpha laws hold unchanged from
            <code class={cx(rt.inkPrimary)}>prototype-flex</code>: SINGLE ROOT + REST SPREAD (one
            div; consumer attributes first, family stamps after — replace, never merge), ZERO
            TRANSLATION (the props are CSS: cols/rows/gap/areas pass through as
            grid-template-columns / -rows / gap / grid-template-areas verbatim), and INLINE STYLE
            ONLY (no utilities, no theme tokens, no css file — the item renders in any host).
          </p>
          <p class={cx(rt.para)}>
            The one real coercion is the TRACK FORM: a number N becomes
            <code class={cx(rt.inkPrimary)}>repeat(N, minmax(0, 1fr))</code> — the
            no-max-content-blowout form (min(0, 1fr) floors each track at zero so a wide chip can
            never stretch the column past its fr share); a string stays verbatim for named and
            hybrid tracks. Measured in the rig below, against the container's RESOLVED track
            geometry (px per track from computed grid-template-columns), not the style string:
            three equal tracks at cols={'{'}3{'}'}, the auto-fit form reflowing its track count
            with the viewport, and a verbatim 1fr 2fr 1fr ratio resolving to a 1:2:1 px split.
          </p>
          <p class={cx(rt.para)}>
            The eight axes are forwarders exactly as on prototype-flex — all no-own, carriers in
            the consumer style attr, density stamping its rung for descendants, theme riding the
            .dark bridge, size echoing on the root. The grid-specific accessibility truth:
            auto-placement follows the DOM in BOTH dimensions, so plain grids keep source order —
            but the AREAS form lets you place items anywhere, and a template that visually
            reorders meaningful content breaks the source-order contract the same way
            row-reverse does on flex.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- live demo: THE RIG (toc section; own drawer) -->
    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="prototype-grid · the rig"
        description="The property panel, live: cols form, rows and gap are real props — measured end-to-end in task 36 against the container's RESOLVED grid-template-columns (px per track), not the style string."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-grid/prototype-grid.svelte"
        {files}
        resolveFileContent={resolveRigUsage}
      >
        <div class={cx(rt.col16, rt.wFull)}>
          <div class={cx(rt.panel)}>
            <PrototypeGrid data-testid="rig" cols={colsValue} rows={rowsValue} gap={rigGap}>
              {#each ['α', 'β', 'γ', 'δ', 'ε', 'ζ'] as g, i (g)}
                <span class={cx(rt.frame, rt.bgCard, rt.py12, rt.fontMono, rt.text13)} style="display:flex; align-items:center; justify-content:center; min-height:44px;">{g} {i + 1}</span>
              {/each}
            </PrototypeGrid>
          </div>
          <div class={cx(rt.mt20)}>
            <PlayFields>
              <PlayRow label="cols form">
                <PlaySelect bind:value={rigCols} options={colsOptions} />
              </PlayRow>
              <PlayRow label="rows">
                <PlaySelect bind:value={rigRows} options={rowsOptions} />
              </PlayRow>
              <PlayRow label="gap (px)">
                <PlayNumber bind:value={rigGap} min={0} max={40} />
              </PlayRow>
              <PlayHelp>
                the cols select demonstrates BOTH coercion forms and the verbatim ratio: watch the
                resolved tracks in the readout below the container — auto-fit re-counts its tracks
                as the viewport changes. rows=2 floors the container at two explicit
                minmax(0, 1fr) rows.
              </PlayHelp>
            </PlayFields>
          </div>
          {#snippet playground()}
            <PlayFields>
              <PlayHelp>
                the rig's usage file mirrors the live control state (same-source law). The
                resolved-track readout sits under the container — px per track, from the computed
                grid-template-columns.
              </PlayHelp>
            </PlayFields>
          {/snippet}
        </div>
      </ComponentCanvas>
      <div class={cx(rt.mt20)} data-rig-readout="">
        <p class={cx(rt.note12, rt.inkMuted70)}>
          resolved tracks, measured live against this served container (probe, task 36): cols=3 →
          three equal tracks (240px each at 1400px viewport, style declaration
          repeat(3, minmax(0px, 1fr))); the auto-fit form shrinks its tracks to the 140px floor
          (measured 145px at a 760px viewport) and re-counts past it; "1fr 2fr 1fr" resolves a
          1:2:1 px ratio (180/361/180); rows=2 pins two equal row tracks; gap 30 → 30px
          column-gap (the tracks absorb it, 240 → 228px).
        </p>
      </div>
    </div>

    <!-- law-notes: the alpha contract + the track coercion -->
    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The alpha contract + the track coercion"
        summary="The three flex laws carry over verbatim; the one grid addition is the track form — number → repeat(N, minmax(0, 1fr)), string verbatim, areas as one template string."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            1 · SINGLE ROOT + REST SPREAD — one div, consumer attributes first, family stamps
            after. 2 · ZERO TRANSLATION — cols/rows/gap/areas are the CSS grid properties;
            the sole vocabulary event is the NUMBER form of cols/rows, a coercion to
            <code class={cx(rt.inkPrimary)}>repeat(N, minmax(0, 1fr))</code> chosen for the
            no-max-content-blowout guarantee (a track can never grow past its fr share because a
            chip is wide — the css-architecture grid law's vocabulary). 3 · INLINE STYLE ONLY —
            zero tokens: a grid track you pass is a track that renders, in any host. The areas
            form is deliberately a single verbatim string in v0 (an array-join convenience is a
            recorded future enhancement, not guessed).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- types: the track forms, rendered -->
    <div id="types" data-reveal="">
      <SectionCard
        family="types"
        headerRegion="types"
        eyebrow="types"
        title="Types — the track forms, rendered"
        summary="The coercion inventory: the number form (repeat(N, minmax(0, 1fr))), the verbatim string form (named/hybrid tracks), and the areas form with placed children — one element, three ways to say where things go."
      >
        <ComponentCanvas title="prototype-grid · track forms" stage="fill" files={files}>
          <div class={cx(rt.col16, rt.wFull)}>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.inkMuted, rt.text12)}>number: cols={'{'}4{'}'} → repeat(4, minmax(0, 1fr))</span>
              <PrototypeGrid cols={4} gap={8} class={cx(rt.mt8)}>
                {#each ['1', '2', '3', '4'] as n (n)}<span class={cx(rt.frame, rt.bgCard, rt.py6, rt.fontMono, rt.text13)} style="display:flex; justify-content:center;">{n}</span>{/each}
              </PrototypeGrid>
            </div>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.inkMuted, rt.text12)}>verbatim string: "1fr 2fr 1fr"</span>
              <PrototypeGrid cols="1fr 2fr 1fr" gap={8} class={cx(rt.mt8)}>
                {#each ['1fr', '2fr', '1fr'] as n, i (i)}<span class={cx(rt.frame, rt.bgCard, rt.py6, rt.fontMono, rt.text13)} style="display:flex; justify-content:center;">{n}</span>{/each}
              </PrototypeGrid>
            </div>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.inkMuted, rt.text12)}>areas: "head head" "side main"</span>
              <PrototypeGrid
                cols="2fr 1fr"
                areas='"head head" "side main"'
                gap={8}
                class={cx(rt.mt8)}
              >
                <span style="grid-area: head;" class={cx(rt.frame, rt.bgCard, rt.py6, rt.fontMono, rt.text13)}>head</span>
                <span style="grid-area: side;" class={cx(rt.frame, rt.bgCard, rt.py6, rt.fontMono, rt.text13)}>side</span>
                <span style="grid-area: main;" class={cx(rt.frame, rt.bgCard, rt.py6, rt.fontMono, rt.text13)}>main</span>
              </PrototypeGrid>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="Pass a number for the even-lanes form, a string for named/hybrid tracks — or omit and let the implicit grid serve."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeGrid usage" />
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="The one vocabulary coercion: number → repeat(N, minmax(0, 1fr)) — strings stay verbatim. Everything else rides through as native div attributes."
      >
        <PropsTable universal
          props={[
            { name: 'cols', type: 'number | string', default: '—', description: 'grid-template-columns: number → repeat(N, minmax(0, 1fr)) (the no-max-content-blowout form); string verbatim (named/hybrid tracks).' },
            { name: 'rows', type: 'number | string', default: '—', description: 'grid-template-rows, same two forms as cols. Omitted → implicit content-sized rows.' },
            { name: 'gap', type: 'number | string', default: '—', description: 'gap: number → px, string verbatim.' },
            { name: 'areas', type: 'string', default: '—', description: 'grid-template-areas, verbatim — a single template string. A template that visually reorders meaningful content breaks source-order reading (the a11y note).' },
            { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
            { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-grid after the spread — replace, never merge).' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="universal-props" data-reveal="">
      <SectionCard
        family="universal-props"
        headerRegion="universal-props"
        eyebrow="axes"
        title="The eight axes on prototype-grid"
        summary="The zero-translation posture extends to paint: the first-time contract is ALL NO-OWN, and the family paints nothing for any axis — carriers join the consumer style attr, density stamps its rung for descendants, theme rides the .dark bridge, size echoes on the root (fr and em tracks reflow with it). Every row below is a forwarder, measured by stamp receipts rather than paint (there is no family paint to measure)."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
            Receipts: the rig's three controls measured end-to-end against the container's
            RESOLVED track geometry (computed grid-template-columns in px per track: three equal
            240px tracks at cols=3; the auto-fit form shrinking to its 140px floor (145px
            measured) before re-counting; the verbatim 1fr 2fr 1fr ratio resolving 180/361/180;
            rows=2 pinning two equal row tracks; gap 30 → 30px column-gap with the tracks
            absorbing it) — task 36; the density rung stamp
            (data-density=lg explicit, null ambient), the size carrier
            (font-size: var(--jx-size-effective, 1rem), computed 18px at size={'{'}18{'}'}) and
            the dark class bridge were measured on this page's served DOM; the zero-reader rows
            carry grep receipts over ui/prototype-grid/ (an inline-style-only family). The
            query() seat below rides the md viewport key (48rem) on the size LANE — the lanes-vs-
            passthroughs boundary (task 35) applies: cols/rows/gap/areas reject query().
          </p>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="prototype-grid · query()" files={queryFiles}>
              <div class={cx(rt.col16, rt.wFull)}>
                <PrototypeGrid cols={3} gap={12} size={responsiveSize} class={cx(rt.frame, rt.p16)}>
                  {#each ['13px → 18px', 'at', '48rem'] as t (t)}
                    <span class={cx(rt.fontMono, rt.text13)}>{t}</span>
                  {/each}
                </PrototypeGrid>
                <p class={cx(rt.para)}>
                  Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                  wider the md case wins (18px) — the §11 stamp scales the root and the fr tracks
                  reflow around it. The number lane goes bare. Resize across 48rem.
                </p>
              </div>
            </ComponentCanvas>
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="PrototypeGrid · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}><PrototypeGrid cols={3} gap={12} size={18} density="small"><span>one</span><span>two</span><span>three</span></PrototypeGrid></div>
                <div class={cx(rt.panel)}><PrototypeGrid cols={2} gap={12} size="medium" radius="large"><span>named</span><span>steps</span></PrototypeGrid></div>
                <div class={cx(rt.panel)}><PrototypeGrid cols={2} gap={12} density="large" theme="dark"><span>dark</span><span>lg rung</span></PrototypeGrid></div>
                <div class={cx(rt.panel)}><PrototypeGrid cols="repeat(auto-fit, minmax(120px, 1fr))" gap={12}><span>auto</span><span>fit</span><span>reflows</span></PrototypeGrid></div>
              </div>
            </ComponentCanvas>
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
        summary="A layout primitive: no role, no keys, no announcements of its own — its a11y story is PLACEMENT: auto-placement keeps source order, the areas form can break it."
      >
        <A11yTable
          keys={[{ key: '—', action: 'Not a focus stop and no keys of its own — a plain div wrapper' }]}
          aria={[
            { name: 'auto-placement', value: 'source order', description: 'Without areas/explicit placement the grid places children in DOM order across the tracks — reading order and visual order agree (WCAG 1.3.2).' },
            { name: 'the areas trade', value: 'placement vs sequence', description: 'grid-template-areas can place any item anywhere; a template that visually reorders meaningful content breaks source-order reading — keep the template a rearrangement of regions, not of reading order.' },
            { name: 'rest-spread ARIA', value: 'verbatim', description: 'aria-label, role, data-* — anything in the rest lane lands on the single root after the spread, so consumer semantics compose with the layout stamps.' },
            { name: 'role', value: 'none authored', description: 'The container is a plain div; give it a role only when its children need grouping semantics.' },
            { name: 'theme / density stamps', value: 'subtree-scoped', description: 'The .dark bridge and data-density rung re-scope token chains for descendants — visible only to children that read them.' },
          ]}
        />
      </SectionCard>
    </div>

    <!-- see-also (chrome — out of the toc) -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="prototype-grid" />
    </div>
  </div>
</div>
