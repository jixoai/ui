<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import PrototypeWaterfall from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp, PlayRow, PlaySelect, PlayNumber } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import waterfallSource from '$lib/ui/prototype-waterfall/prototype-waterfall.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<PrototypeWaterfall columns={3} gap={16}>
  {#each cards as card (card.id)}
    <figure style="break-inside: avoid;">…</figure>
  {/each}
</PrototypeWaterfall>

<!-- the auto-width form: a column LENGTH floors the width, count follows -->
<PrototypeWaterfall columns="14rem" gap={16}>…</PrototypeWaterfall>`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/prototype-waterfall/prototype-waterfall.svelte', content: waterfallSource },
    { name: 'src/lib/ui/prototype-waterfall-usage.svelte', content: usage, kind: 'usage' },
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

  // ── THE RIG (controls in the STAGE BODY — the task-35 laziness bank):
  // the columns shorthand edited through both forms — count vs the
  // auto-width FLOOR — plus gap. Resolved column geometry is measured
  // against the served container in the task-37 probe. ──
  type ColumnsForm = '3' | '4' | 'floor';
  let rigColumns = $state<ColumnsForm>('3');
  let rigGap = $state(16);

  const columnsValue = $derived(rigColumns === 'floor' ? '14rem' : Number(rigColumns));
  const columnsOptions: readonly { value: ColumnsForm; label: string }[] = [
    { value: '3', label: '3 (count form)' },
    { value: '4', label: '4 (count form)' },
    { value: 'floor', label: '"14rem" (auto-width floor)' },
  ];

  // the rig's cards — LAW #18: keys are uniqueness-guaranteed (stable ids)
  const rigCards = [
    { id: 'w1', h: 64 }, { id: 'w2', h: 116 }, { id: 'w3', h: 88 },
    { id: 'w4', h: 140 }, { id: 'w5', h: 72 }, { id: 'w6', h: 104 },
    { id: 'w7', h: 96 }, { id: 'w8', h: 128 }, { id: 'w9', h: 60 },
  ];

  const rigUsageLive = $derived(`<PrototypeWaterfall
  columns=${rigColumns === 'floor' ? '"14rem"' : `{${rigColumns}}`}
  gap={${rigGap}}
  strategy="balanced"
>
  <!-- nine variable-height cards; break-inside is yours -->
</PrototypeWaterfall>`);
  const resolveRigUsage = (file: TreeFile): string =>
    file.name.endsWith('prototype-waterfall-usage.svelte') ? rigUsageLive : file.content;

  // ---- the universal props demo (explicit-props W3-D2) --------------------
  const universalUsage = `<PrototypeWaterfall columns={3} size={18} density="small">…</PrototypeWaterfall>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/prototype-waterfall-universal.svelte', content: universalUsage },
  ];

  // ── the measured per-axis table (task 37) — forwarders, as on the
  // trio's first two members. ──
  const axisRows = [
    {
      name: 'density',
      type: `'2xs' | 'xs' | 'sm' | 'default' | 'lg' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "FORWARDER — the resolved rung stamps data-density on the waterfall root (measured data-density=lg explicit; null ambient), opening the kernel channels for DESCENDANTS; the column geometry consumes none. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDER, ECHO MEASURED — the §11 stamp lands inline as font-size: var(--jx-size-effective, 1rem) (measured in the style attr; computed 18px at size={18}); the stamp is ELEMENT-LEVEL — column floors do NOT follow it ('14rem' reads the document root: stamp 18px keeps the 224px floor; document root 16→20px moves it to 280px — both forms stamp-scale-blind, two-direction probe). Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description: "FORWARDER — carrier stamp only; zero family readers. Number unit: none.",
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
      description: "FORWARDER — carrier stamp only; zero family readers. Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        'FORWARDER — dark rides the .dark class bridge on the waterfall root (measured with theme="dark"), re-scoping token chains for the subtree; the column geometry is theme-blind. No number lane.',
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
        "FORWARDER — carrier stamp only; multicol reflow is the engine's own (grep receipt: zero transition declarations in the family — no authored reflow to time). Number unit: coefficient.",
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key). Lanes
  // take query(); the columns/gap/strategy passthroughs don't (the
  // task-35 boundary, typecheck-proven).
  const responsiveSize = query({ md: 18 }, 13);

  const queryUsage = `<script lang="ts">
  import PrototypeWaterfall from '@ui/prototype-waterfall.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13px root) applies; at 48rem+ the md case
     (18px) wins — element-level: the rem floor does NOT follow the stamp -->
<PrototypeWaterfall columns="14rem" size={query({ md: 18 }, 13)}>…</PrototypeWaterfall>`;

  const queryFiles: TreeFile[] = [
    { name: 'prototype-waterfall-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

</script>

<svelte:head>
  <title>Prototype waterfall · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai prototype-waterfall: the alpha-track layout family's masonry primitive on the CSS multicol engine — the columns shorthand verbatim (count or auto-width floor), balanced fill, inline style only, zero dependencies."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout · alpha"
        title="prototype-waterfall — the standardized masonry"
        summary="The layout family, alpha track, on the CSS multicol engine: the columns shorthand passes through verbatim — a number is the count form, a length string is the auto-width floor — with column-fill: balance (browser-equalized heights) and column-gap. The tradeoffs are declared, not hidden: children flow in column (newspaper) order, and break-inside stays the consumer's call."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">alpha track</span>
          <span class="pill">CSS multicol engine</span>
          <span class="pill">columns: count or auto-width floor</span>
          <span class="pill">balanced fill</span>
          <span class="pill">inline style only</span>
        </div>
      </SectionCard>
    </div>

    <!-- install (chrome — out of the toc) -->
    <div id="install" data-reveal="">
      <DocsInstall name="prototype-waterfall" />
    </div>

    <!-- overview -->
    <div id="overview" data-reveal="">
      <SectionCard
        family="overview"
        headerRegion="overview"
        eyebrow="overview"
        title="Overview"
        summary="The trio's third member: masonry on the multicol engine — two columns forms, one strategy seam, and the tradeoffs said out loud."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            The three alpha laws carry over unchanged: SINGLE ROOT + REST SPREAD (one div;
            consumer attributes first, family stamps after), ZERO TRANSLATION (the
            <code class={cx(rt.inkPrimary)}>columns</code> shorthand IS the CSS — a number is the
            count form, a length string ('14rem') is the auto-width FLOOR where the count follows
            the viewport; one property covers both shapes with no branching), and INLINE STYLE
            ONLY (no utilities, no theme tokens, no css file). There is NO JavaScript in the
            family — no resize observation, no absolute positioning, no layout-settling timer:
            the browser's column balancer is the engine, so reflow on any control change is
            immediate and native (measured in the task-37 probe: each rig change settles by
            the first animation frame — the same-task read is stale at Svelte's flush boundary).
          </p>
          <p class={cx(rt.para)}>
            The declared tradeoffs (honest, not hidden): children flow in COLUMN order — down
            column one, then column two, newspaper order, not shortest-column-first masonry —
            and <code class={cx(rt.inkPrimary)}>break-inside</code> stays the consumer's call (the
            component never overrides it; pass style="break-inside: avoid" on cards you refuse to
            split). The <code class={cx(rt.inkPrimary)}>strategy</code> prop ships with a single
            member — 'balanced' → column-fill: balance, the browser equalizing column heights —
            as the seam for a future 'ordered' (JS-measured shortest-column placement) to join
            the union non-breakingly.
          </p>
          <p class={cx(rt.para)}>
            The eight axes are forwarders as on the trio's first two members: all no-own, carriers
            in the consumer style attr, density stamping its rung for descendants, theme riding
            the .dark bridge. A waterfall-specific nuance measured below: BOTH column forms
            are §11-stamp-scale-blind — the rem floor reads the DOCUMENT root, not the
            element stamp (stamp 18px → the 224px floor unchanged; document root 16→20px →
            280px; two-direction probe). Reading order is coherent — the browser fills column one
            first, so announced order matches the visual column sequence — but content is
            segmented: a card straddling a column break is split unless you forbid it.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- live demo: THE RIG (toc section; own drawer) -->
    <div id="live-demo" data-reveal="">
      <ComponentCanvas
        title="prototype-waterfall · the rig"
        description="The property panel, live: the columns shorthand in both forms plus gap — measured end-to-end in task 37 against the container's resolved column geometry (computed column-count / column-width, and the laid-out count from where the cards land)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/prototype-waterfall/prototype-waterfall.svelte"
        {files}
        resolveFileContent={resolveRigUsage}
      >
        <div class={cx(rt.col16, rt.wFull)}>
          <div class={cx(rt.panel)}>
            <PrototypeWaterfall
              data-testid="rig"
              columns={columnsValue}
              gap={rigGap}
              strategy="balanced"
            >
              {#each rigCards as card (card.id)}
                <span
                  class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)}
                  style="display:block; break-inside: avoid; min-height: {card.h}px;"
                >
                  {card.id} · {card.h}px
                </span>
              {/each}
            </PrototypeWaterfall>
          </div>
          <div class={cx(rt.mt20)}>
            <PlayFields>
              <PlayRow label="columns form">
                <PlaySelect bind:value={rigColumns} options={columnsOptions} />
              </PlayRow>
              <PlayRow label="gap (px)">
                <PlayNumber bind:value={rigGap} min={0} max={40} />
              </PlayRow>
              <PlayHelp>
                the count form fixes the columns; the "14rem" form fixes the WIDTH and lets the
                count follow the viewport (the masonry floor — measured 3 columns at 1400px, fewer
                as it narrows). Cards carry break-inside: avoid — a card never splits across a
                column break.
              </PlayHelp>
            </PlayFields>
          </div>
          {#snippet playground()}
            <PlayFields>
              <PlayHelp>
                the rig's usage file mirrors the live control state (same-source law). Resolved
                column geometry — computed column-count / column-width and the laid-out count —
                was measured in the task-37 probe.
              </PlayHelp>
            </PlayFields>
          {/snippet}
        </div>
      </ComponentCanvas>
    </div>

    <!-- law-notes: the alpha contract + the multicol tradeoffs (trio loop) -->
    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The alpha contract + the multicol tradeoffs"
        summary="The three trio laws hold verbatim; the waterfall adds the columns-shorthand duality and says its tradeoffs out loud — column order and the consumer's break-inside."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.para)}>
            1 · SINGLE ROOT + REST SPREAD — one div, consumer attributes first, family stamps
            after. 2 · ZERO TRANSLATION — columns is the CSS columns shorthand (count form and
            auto-width form in one property, no branching); gap is column-gap; strategy is
            column-fill. 3 · INLINE STYLE ONLY — zero tokens, any host. The declared tradeoffs:
            children flow in column order (newspaper order — announced order matches the visual
            column sequence), and break-inside is never overridden by the component. The
            'ordered' strategy (JS-measured shortest-column placement) is the recorded future
            seam — the prop ships now so the union can grow without breaking v0 consumers.
          </p>
          <p class={cx(rt.para)}>
            The layout trio, cross-referenced:
            <a class="pill" href="/docs/components/prototype-flex.html">prototype-flex — the row</a>
            <a class="pill" href="/docs/components/prototype-grid.html">prototype-grid — the tracks</a>
            <span class="pill">prototype-waterfall — the columns</span>
            — one contract, three engines.
          </p>
        </div>
      </SectionCard>
    </div>

    <!-- types: the columns forms, rendered -->
    <div id="types" data-reveal="">
      <SectionCard
        family="types"
        headerRegion="types"
        eyebrow="types"
        title="Types — the columns forms, rendered"
        summary="The shorthand's two shapes on identical card decks: the count form fixes the columns; the auto-width form fixes the width and lets the count follow — the masonry floor."
      >
        <ComponentCanvas title="prototype-waterfall · columns forms" stage="fill" files={files}>
          <div class={cx(rt.col16, rt.wFull)}>
            <div class={cx(rt.panel)}>
              <span class={cx(rt.inkMuted, rt.text12)}>count form: columns={'{'}4{'}'}</span>
              <PrototypeWaterfall columns={4} gap={12} class={cx(rt.mt8)}>
                {#each rigCards as card (card.id)}
                  <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)} style="display:block; break-inside: avoid;">{card.id}</span>
                {/each}
              </PrototypeWaterfall>
            </div>
            <div class={cx(rt.panel, rt.mt16)}>
              <span class={cx(rt.inkMuted, rt.text12)}>auto-width floor: columns="10rem"</span>
              <PrototypeWaterfall columns="10rem" gap={12} class={cx(rt.mt8)}>
                {#each rigCards as card (card.id)}
                  <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)} style="display:block; break-inside: avoid;">{card.id}</span>
                {/each}
              </PrototypeWaterfall>
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
        summary="Pass a count or a length; add break-inside: avoid to the cards you refuse to split."
      >
        <CodeBlock code={usage} lang="svelte" meta="PrototypeWaterfall usage" />
      </SectionCard>
    </div>

    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="One shorthand, one gap, one strategy seam — everything else rides through as native div attributes."
      >
        <PropsTable universal
          props={[
            { name: 'columns', type: 'number | string', default: '—', description: 'The CSS columns shorthand, verbatim: number = the count form; a length string ("14rem") = the auto-width floor — the count follows the viewport.' },
            { name: 'gap', type: 'number | string', default: '—', description: 'column-gap: number → px, string verbatim.' },
            { name: 'strategy', type: "'balanced'", default: '—', description: "v0's single member → column-fill: balance (browser-equalized heights). 'ordered' (JS-measured shortest-column placement) is the recorded future seam — the prop ships now for it." },
            { name: 'class', type: 'string', default: '—', description: 'Passed through verbatim — the component owns no class of its own.' },
            { name: '...rest', type: 'HTMLAttributes<HTMLDivElement>', default: 'spread', description: 'Every other attribute lands on the single root (stamped data-jx-prototype-waterfall after the spread — replace, never merge).' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="universal-props" data-reveal="">
      <SectionCard
        family="universal-props"
        headerRegion="universal-props"
        eyebrow="axes"
        title="The eight axes on prototype-waterfall"
        summary="The zero-translation posture extends to paint: the first-time contract is ALL NO-OWN, and the family paints nothing for any axis — carriers join the consumer style attr, density stamps its rung for descendants, theme rides the .dark bridge. One measured nuance: both column forms are stamp-scale-blind — the rem floor reads the document root (stamp 18px keeps the 224px floor; root 16→20px moves it to 280px)."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
            Receipts: the rig's two controls measured end-to-end (columns 3 → 4 → the "14rem"
            floor; gap 24 → 24px column-gap) against the container's resolved geometry — computed
            column-count/column-width AND the laid-out count from where the cards land (distinct
            offsetLeft columns): the count form held 3 columns at every width; the "14rem" floor
            form laid 3 columns at 1400px and 2 at 760px as the viewport narrowed past the floors;
            the reflow settled by the first animation frame (the same-task read is stale at
            Svelte's flush boundary; no JS reflow to wait for) — task 37; the density
            rung stamp (data-density=lg explicit, null ambient), the size carrier
            (font-size: var(--jx-size-effective, 1rem), computed 18px at size={'{'}18{'}'}) and the
            dark class bridge were measured on this page's served DOM; the zero-reader rows carry
            grep receipts over ui/prototype-waterfall/ (an inline-style-only family — no css file,
            no tokens). The query() seat below rides the md viewport key (48rem) on the size LANE
            — the lanes-vs-passthroughs boundary applies: columns/gap/strategy reject query().
          </p>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="prototype-waterfall · query()" files={queryFiles}>
              <div class={cx(rt.col16, rt.wFull)}>
                <PrototypeWaterfall columns="14rem" gap={12} size={responsiveSize} class={cx(rt.frame, rt.p16)}>
                  {#each rigCards.slice(0, 5) as card (card.id)}
                    <span class={cx(rt.frame, rt.bgCard, rt.px12, rt.py6, rt.fontMono, rt.text13)} style="display:block; break-inside: avoid;">{card.id}</span>
                  {/each}
                </PrototypeWaterfall>
                <p class={cx(rt.para)}>
                  Media keys are min-width: below 48rem the base (13px root) applies; at 48rem and
                  wider the md case wins (18px) — and the column floor does NOT follow that stamp:
                  the §11 stamp is element-level, the '14rem' floor reads the DOCUMENT root
                  (two-direction probe: stamp 18px → the 224px floor unchanged; document root
                  16→20px → 280px). The number lane goes bare. Resize across 48rem and watch the
                  TYPE move while the tracks hold.
                </p>
              </div>
            </ComponentCanvas>
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas title="PrototypeWaterfall · universal props" stage="fill" files={universalFiles}>
              <div class={cx(rt.gridSm2)}>
                <div class={cx(rt.panel)}><PrototypeWaterfall columns={3} gap={12} size={18} density="small"><span>one</span><span>two</span><span>three</span></PrototypeWaterfall></div>
                <div class={cx(rt.panel)}><PrototypeWaterfall columns={2} gap={12} size="medium" radius="large"><span>named</span><span>steps</span></PrototypeWaterfall></div>
                <div class={cx(rt.panel)}><PrototypeWaterfall columns={2} gap={12} density="large" theme="dark"><span>dark</span><span>lg rung</span></PrototypeWaterfall></div>
                <div class={cx(rt.panel)}><PrototypeWaterfall columns="10rem" gap={12}><span>floor</span><span>form</span></PrototypeWaterfall></div>
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
        summary="A layout primitive: no role, no keys, no announcements of its own — the multicol story is reading order (column flow preserves DOM sequence) and the split-card hazard."
      >
        <A11yTable
          keys={[{ key: '—', action: 'Not a focus stop and no keys of its own — a plain div wrapper' }]}
          aria={[
            { name: 'column reading order', value: 'DOM order preserved', description: 'The browser fills column one first, then column two — announced order matches the visual column sequence (newspaper order); narrower viewports reflow to fewer columns linearly.' },
            { name: 'break-inside', value: 'the consumer\u2019s call', description: 'A card without break-inside: avoid can SPLIT across a column break mid-sentence — pass it on every card (the usage sample shows the idiom).' },
            { name: 'rest-spread ARIA', value: 'verbatim', description: 'aria-label, role, data-* — anything in the rest lane lands on the single root after the spread, so consumer semantics compose with the layout stamps.' },
            { name: 'role', value: 'none authored', description: 'The container is a plain div; give it a role only when its children need grouping semantics.' },
            { name: 'theme / density stamps', value: 'subtree-scoped', description: 'The .dark bridge and data-density rung re-scope token chains for descendants — visible only to children that read them.' },
          ]}
        />
      </SectionCard>
    </div>

    <!-- see-also (chrome — out of the toc) -->
    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="prototype-waterfall" />
    </div>
  </div>
</div>
