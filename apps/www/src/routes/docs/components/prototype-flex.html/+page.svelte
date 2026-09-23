<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import PrototypeFlex from '$lib/ui/prototype-flex/prototype-flex.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect, PlayToggle, PlayNumber } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import flexSource from '$lib/ui/prototype-flex/prototype-flex.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<PrototypeFlex gap={12} align="center">
  <span>first</span>
  <span>second</span>
  <span>third</span>
</PrototypeFlex>

<!-- every prop is a native CSS token, passed through 1:1 -->
<PrototypeFlex direction="column" justify="space-between" wrap="wrap" gap="0.75rem" />`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-flex/prototype-flex.svelte', content: flexSource },
    { name: 'src/lib/ui/prototype-flex-usage.svelte', content: usage, kind: 'usage' },
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

  // ── THE RIG: the prop vocabulary edited through real props. Every
  // control binds a prop 1:1 — measured end-to-end in the task-35 probe
  // (each control's change lands in the container's computed style). ──
  type Direction = 'row' | 'row-reverse' | 'column' | 'column-reverse';
  type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';
  type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  type Justify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  let rigDirection = $state<Direction>('row');
  let rigWrap = $state<Wrap>('nowrap');
  let rigAlign = $state<Align>('stretch');
  let rigJustify = $state<Justify>('space-between');
  let rigGap = $state(12);

  const directionOptions: readonly { value: Direction; label: string }[] = [
    { value: 'row', label: 'row' },
    { value: 'row-reverse', label: 'row-reverse' },
    { value: 'column', label: 'column' },
    { value: 'column-reverse', label: 'column-reverse' },
  ];
  const wrapOptions: readonly { value: Wrap; label: string }[] = [
    { value: 'nowrap', label: 'nowrap' },
    { value: 'wrap', label: 'wrap' },
  ];
  const alignOptions: readonly { value: Align; label: string }[] = [
    { value: 'start', label: 'start' },
    { value: 'center', label: 'center' },
    { value: 'end', label: 'end' },
    { value: 'stretch', label: 'stretch' },
    { value: 'baseline', label: 'baseline' },
  ];
  const justifyOptions: readonly { value: Justify; label: string }[] = [
    { value: 'start', label: 'start' },
    { value: 'center', label: 'center' },
    { value: 'end', label: 'end' },
    { value: 'space-between', label: 'space-between' },
    { value: 'space-around', label: 'space-around' },
    { value: 'space-evenly', label: 'space-evenly' },
  ];

  const rigUsageLive = $derived(`<PrototypeFlex
  direction=${JSON.stringify(rigDirection)}
  wrap=${JSON.stringify(rigWrap)}
  align=${JSON.stringify(rigAlign)}
  justify=${JSON.stringify(rigJustify)}
  gap={${rigGap}}
>
  <span>alpha</span><span>beta</span><span>gamma</span>
</PrototypeFlex>`);
  const resolveRigUsage = (file: TreeFile): string =>
    file.name.endsWith('rig.svelte') ? rigUsageLive : file.content;

  // ── types: the rendered union gallery (justify ladder) ──
  const justifyGallery = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const;

  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<PrototypeFlex size={18} density="small">…</PrototypeFlex>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/prototype-flex-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 35) — the zero-translation
  // family, so the axes are FORWARDERS: measured stamps, zero family
  // paint. Every cell measured on the served DOM or grepped. ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "FORWARDER — the resolved rung stamps data-density on the flex root (measured data-density=lg with an explicit lane; null ambient), opening the kernel channels for DESCENDANTS that read them; the flex layout itself consumes none. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER, ECHO MEASURED — the §11 stamp lands inline on the root as font-size: var(--jx-size-effective, 1rem) (the carrier chain, measured in the style attr), so em-inheriting children reflow around it; the flex geometry (direction/wrap/gap) is untouched. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "FORWARDER — the carrier joins the style attr; zero family readers (the alpha lane paints nothing). Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER — carrier stamp only; zero family readers. Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "FORWARDER — carrier stamp only; children re-tint through the ambient chain if they read it. Zero family readers. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "FORWARDER — dark rides the .dark class bridge on the flex root (class:dark measured with theme=\"dark\"), re-scoping the token chains for the subtree; the layout itself is theme-blind. No number lane.",
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
  // axis is an eight-axis lane, so it accepts the QueryResult (the gap
  // layout prop does not — it is a native CSS passthrough, number |
  // string only).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import PrototypeFlex from '@ui/prototype-flex.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case
     (18px) wins — the §11 stamp scales the root, children reflow -->
<PrototypeFlex size={query({ md: 18 }, 13)} gap={12}>…</PrototypeFlex>`;

  const queryFiles: TreeFile[] = [
    { name: 'prototype-flex-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Prototype flex · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-flex: the alpha-track layout family's standardized flex primitive — direction/wrap/align/justify/gap map to CSS 1:1, inline style only, zero dependencies, single root with full attribute passthrough."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-flex — the standardized flex row"
        summary="The layout family, alpha track: the design studio's property panel edits these exact props. Every value is a native CSS token passed through 1:1 (no vocabulary mapping layer), styling is inline-style only — zero Tailwind, zero theme tokens, zero dependencies — so the item renders in any host. Single root + rest spread: the stamp mechanism's family precondition, proven here first."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">alpha track</span>
          <span class="pill">inline style only</span>
          <span class="pill">single root + rest spread</span>
          <span class="pill">zero translation</span>
          <span class="pill">zero dependencies</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (chrome — out of the toc) -->
    <div id="install" data-reveal="">
      <DocsInstall name="prototype-flex" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="Three laws define the alpha lane: single root + rest spread, zero translation, inline style only — and the eight axes forward without opinion."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            <strong>SINGLE ROOT + REST SPREAD</strong> — the whole component is one div; the
            consumer's attributes spread first and the family's stamps land after (replace, never
            merge): <code class={cx(rt.inkPrimary)}>data-jx-prototype-flex</code>,
            <code class={cx(rt.inkPrimary)}>data-density</code> and the dark class. This is the
            stamp mechanism's family precondition, proven here first — a studio edit or a consumer
            testid lands on the same node the layout styles.
          </p>
          <p class={cx(rt.para)}>
            <strong>ZERO TRANSLATION</strong> — direction, wrap, align and justify ARE the CSS Box
            Alignment tokens, passed through verbatim (measured live in the rig below: every
            control's change lands in the container's computed style byte-identical). There is no
            "between" → "space-between" mapping layer to learn or fight; the one type coercion is
            gap number → px (a bare number is not a CSS length). <strong>INLINE STYLE
            ONLY</strong> — no Tailwind, no theme tokens, no css file: the alpha lane's reason to
            exist apart from utility-first Tier-1 is that it installs and renders in any host. The
            dispatch expectation that gap might ride the space tokens is deliberately FALSE here —
            the family law is zero tokens.
          </p>
          <p class={cx(rt.para)}>
            The eight axes are FORWARDERS, not opinions — the first-time contract declares all
            no-own, and the family paints nothing for them: the carriers join the consumer style
            attr (measured), density stamps its rung for descendants that read the kernel
            channels, theme rides the .dark bridge, and size echoes on the root so em-inheriting
            children reflow. One accessibility truth to hold: direction="row-reverse" and
            "column-reverse" flip the VISUAL order against the DOM order — screen readers follow
            the DOM, so reserve the reversed rungs for genuinely reversed contexts.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- live demo: THE RIG (toc section; own drawer) -->
    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="prototype-flex · the rig"
        description="The property panel, live: every control below binds a real prop 1:1 — measured end-to-end in task 35, each change lands in the container's computed style (flex-direction / flex-wrap / align-items / justify-content / gap)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-flex/prototype-flex.svelte"
        {files}
        resolveFileContent={resolveRigUsage}
      >
        <div class={cx(rt.col16, rt.wFull)}>
          <div class={cx(rt.panel)}>
            <PrototypeFlex
              data-testid="rig"
              direction={rigDirection}
              wrap={rigWrap}
              align={rigAlign}
              justify={rigJustify}
              gap={rigGap}
            >
              {#each ['alpha', 'beta', 'gamma'] as word}
                <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)}>{word}</span>
              {/each}
            </PrototypeFlex>
          </div>
          <div class={cx(rt.mt20)}>
            <PlayFields>
              <PlayRow label="direction">
                <PlaySelect bind:value={rigDirection} options={directionOptions} />
              </PlayRow>
              <PlayRow label="wrap">
                <PlaySelect bind:value={rigWrap} options={wrapOptions} />
              </PlayRow>
              <PlayRow label="align">
                <PlaySelect bind:value={rigAlign} options={alignOptions} />
              </PlayRow>
              <PlayRow label="justify">
                <PlaySelect bind:value={rigJustify} options={justifyOptions} />
              </PlayRow>
              <PlayRow label="gap (px)">
                <PlayNumber bind:value={rigGap} min={0} max={48} />
              </PlayRow>
            </PlayFields>
          </div>
          {#snippet playground()}
            <PlayFields>
              <PlayHelp>
                five controls, five props, zero translation — what you pick is what the style
                reads (each control's change lands in the container's computed style, measured
                end-to-end in task 35). Flip direction to column-reverse and watch the visual
                order flip against the DOM order (the a11y note in the overview).
              </PlayHelp>
            </PlayFields>
          {/snippet}
        </div>
      </ComponentCanvas>
    </div>

    <!-- law-notes: the alpha contract -->
    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The alpha contract"
        summary="Three laws make the primitive studio-editable and host-agnostic — they are also why this family deliberately has no tokens."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            1 · SINGLE ROOT + REST SPREAD — one div, consumer attributes first, family stamps
            after; the studio's edits and the layout's stamps can never fight over separate nodes.
            2 · ZERO TRANSLATION — the props are the CSS: no alias vocabulary, no mapping layer to
            drift; the property panel edits CSS truth. 3 · INLINE STYLE ONLY — no utility classes
            and no theme tokens, so the item renders identically in any host and the gap value you
            pass is the gap that renders (there are no space tokens to inherit or collide with).
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- types: the rendered union gallery -->
    <div id="types" data-reveal="">
      <SectionCard
        family="types"
        headerRegion="types"
        eyebrow="types"
        title="Types — the justify ladder, rendered"
        summary="The control inventory rendered: all six justify-content union members on identical rows (three fixed-width chips, 1px frames, gap 12). align and wrap ride the rig above."
      >
        <ComponentCanvas title="prototype-flex · justify ladder" stage="fill" files={files}>
          <div class={cx(rt.col16, rt.wFull)}>
            {#each justifyGallery as j (j)}
              <div class={cx(rt.flex, rt.itemsCenter, rt.gap12)}>
                <span class={cx(rt.inkMuted, rt.text12)} style="width: 7rem; flex: none;">{j}</span>
                <PrototypeFlex justify={j} gap={12} class={cx(rt.wFull, rt.frame)}>
                  <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)}>a</span>
                  <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)}>b</span>
                  <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)}>c</span>
                </PrototypeFlex>
              </div>
            {/each}
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
        summary="One element, five optional props — omitted props inject no declaration; the CSS initial value serves."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeFlex usage" />
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Props map to CSS 1:1 — the one type coercion: gap number → px. Everything else rides through as native div attributes."
      >
        <PropsTable universal
          props={[
            { name: 'direction', type: "'row' | 'row-reverse' | 'column' | 'column-reverse'", default: '—', description: 'flex-direction, verbatim. Omitted → no declaration (the CSS initial: row).' },
            { name: 'wrap', type: "'nowrap' | 'wrap' | 'wrap-reverse'", default: '—', description: 'flex-wrap, verbatim.' },
            { name: 'align', type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'", default: '—', description: 'align-items, verbatim (logical-axis Box Alignment spellings).' },
            { name: 'justify', type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'", default: '—', description: 'justify-content, verbatim.' },
            { name: 'gap', type: 'number | string', default: '—', description: 'gap: number → px, string verbatim (the one type coercion).' },
            { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
            { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-flex after the spread — replace, never merge).' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="universal-props" data-reveal="">
      <SectionCard
        family="universal-props"
        headerRegion="universal-props"
        eyebrow="axes"
        title="The eight axes on prototype-flex"
        summary="The zero-translation posture extends to paint: the first-time contract is ALL NO-OWN, and the family paints nothing for any axis — carriers join the consumer style attr, density stamps its rung for descendants, theme rides the .dark bridge, size echoes on the root. Every row below is a forwarder, measured by stamp receipts rather than paint (there is no family paint to measure)."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
            Receipts: the rig's five controls each measured end-to-end (select/number change →
            computed flex-direction / flex-wrap / align-items / justify-content / gap update on
            the container, task 35); the density rung stamp (data-density=lg explicit, null
            ambient), the size echo (font-size 18px inline at size={18}) and the dark class bridge
            were measured on this page's served DOM; the zero-reader rows carry grep receipts over
            ui/prototype-flex/ (an inline-style-only family — no css file, no tokens). The query()
            seat below rides the md viewport key (48rem) through the gap number→px coercion.
          </p>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="prototype-flex · query()" files={queryFiles}>
              <div class={cx(rt.col16, rt.wFull)}>
                <PrototypeFlex size={responsiveSize} gap={12} justify="space-between" class={cx(rt.frame, rt.p16)}>
                  <span class={cx(rt.fontMono, rt.text13)}>13px → 18px at 48rem</span>
                  <span class={cx(rt.fontMono, rt.text13)}>size</span>
                </PrototypeFlex>
                <p class={cx(rt.para)}>
                  Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                  wider the md case wins (18px) — the §11 stamp scales the root and em-inheriting
                  children reflow. The number lane goes bare. Note the boundary this exposes: the
                  AXES accept query() (they are lanes), the LAYOUT props (gap, direction…) do not
                  — they are native CSS passthroughs, number | string only. Resize across 48rem.
                </p>
              </div>
            </ComponentCanvas>
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="PrototypeFlex · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}><PrototypeFlex gap={12} size={18} density="small"><span>one</span><span>two</span><span>three</span></PrototypeFlex></div>
                <div class={cx(rt.panel)}><PrototypeFlex gap={12} size="medium" radius="large"><span>named</span><span>steps</span></PrototypeFlex></div>
                <div class={cx(rt.panel)}><PrototypeFlex gap={12} density="large" theme="dark"><span>dark</span><span>lg rung</span></PrototypeFlex></div>
                <div class={cx(rt.panel)}><PrototypeFlex gap="0.75rem" direction="column" align="end"><span>string gap</span><span>column</span></PrototypeFlex></div>
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
        summary="A layout primitive: no role, no keys, no announcements of its own — its a11y story is ORDER and what consumers land on the root."
      >
        <A11yTable
          keys={[{ key: '—', action: 'Not a focus stop and no keys of its own — a plain div wrapper' }]}
          aria={[
            { name: 'visual vs DOM order', value: 'the row-reverse trade', description: 'direction="row-reverse" / "column-reverse" flip the VISUAL order against the DOM order — screen readers follow the DOM (WCAG 1.3.2: meaningful sequence); reserve the reversed rungs for genuinely reversed reading contexts.' },
            { name: 'rest-spread ARIA', value: 'verbatim', description: 'aria-label, role, data-* — anything in the rest lane lands on the single root after the spread, so consumer semantics compose with the layout stamps.' },
            { name: 'role', value: 'none authored', description: 'The container is a plain div; give it a role only when its children need grouping semantics (e.g. role="list" with role="listitem" children).' },
            { name: 'theme / density stamps', value: 'subtree-scoped', description: 'The .dark bridge and data-density rung re-scope token chains for descendants — visible only to children that read them.' },
          ]}
        />
      </SectionCard>
    </div>

    <!-- see-also (chrome — out of the toc) -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="prototype-flex" />
    </div>
  </div>
</div>
