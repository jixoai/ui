<!--
  Docs page for the cascader family (MDN archetype, docs-eight-axes-mdn
  task 6, quill 2026-09-22). Order: hero → install → overview → usage →
  the live demo canvas → props (GENERATED meta + docs curation) → the
  eight axes on cascader (per-axis table + runnable stamps + one real
  query() case) → accessibility → see-also. Structure follows the
  baseline skill (openspec/changes/docs-eight-axes-mdn/skills/
  mdn-doc-style.md §2); the component family is untouchable from here.
  Original ask: bring the batch-A native-collision family's W3-era page
  to the campaign archetype (tier 3); the old page's path-value law,
  playground wiring and a11y facts survive.
-->
<script lang="ts">
  import Cascader from '$lib/ui/cascader/cascader.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import { query } from '$lib/universal-props-query.svelte';
  import type { DensityLane } from '$lib/defaults.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { meta as cascaderMeta } from '$lib/meta/cascader.meta';
  import { CASCADER_DOCS } from '$lib/ui/props-table/docs/cascader.docs';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import cascaderSource from '$lib/ui/cascader/cascader.svelte?raw';

  const options = [
    {
      value: 'asia',
      label: 'Asia',
      children: [
        { value: 'japan', label: 'Japan' },
        { value: 'korea', label: 'Korea' },
      ],
    },
    {
      value: 'eu',
      label: 'Europe',
      children: [{ value: 'fr', label: 'France' }],
    },
  ];

  // Playground protocol: the page owns the snapshot + reset; echo projects
  // the joined path; the drawer's usage file tracks it live.
  const canvasInitial = { value: [] as string[] };
  let value = $state<string[]>(canvasInitial.value);
  function resetCanvas(): void {
    value = canvasInitial.value;
  }
  const usageLive = $derived(`<Cascader
  label="region"
  options={options}
  bind:value={[${value.map((v) => JSON.stringify(v)).join(', ')}]}
/>`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Cascader from '@ui/cascader.svelte';
${close}

const options = [
  { value: 'asia', label: 'Asia', children: [
    { value: 'japan', label: 'Japan' },
    { value: 'korea', label: 'Korea' },
  ] },
];

<Cascader {options} label="region" bind:value />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/cascader.svelte', content: cascaderSource },
    { name: 'src/lib/ui/cascader-usage.svelte', content: usage, kind: 'usage' },
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

  // ---- the eight axes on cascader: the runnable demos ---------------------
  // code shown = code running: the panels below pass these exact lanes.
  // Every lane stamps its carrier on the root; the shells' paint is FIXED
  // (the table's supply-only rows), so the demos read the stamps, and the
  // captions say exactly what the SSR markup greps.
  const axesUsage = `<!-- every lane resolves on the root and broadcasts downward;
     the shells' paint is fixed — the table names each axis's honesty -->
<Cascader {options} label="ambient chain" />
<Cascader {options} label="compact chain" density="small" />
<Cascader {options} label="px size stamp" size={24} />

<!-- theme: .dark stamps the root; focus a select — the ring follows
     dark's primary, the shell face stays site-themed -->
<Cascader {options} label="dark island" theme="dark" />

<!-- query(): SSR paints the base rung (data-density="sm"); at the lg
     viewport rung (≥64rem) the root's rung attribute steps to lg.
     The explicit generics pin the case AND the base to the lane (the
     bare form infers QueryResult<string> — a type error). -->
<Cascader {options} label="responsive chain" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')} />`;

  const axesFiles: TreeFile[] = [
    { name: 'src/lib/ui/cascader-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the per-axis table (skill §2.5): mechanism names are the REAL
  // carriers/vars the family stamps or reads (cascader.svelte +
  // cascader.stylex.ts + cascader.css); steps/units per
  // universal-props.schema.ts.
  const axisRows = [
    {
      name: 'density',
      type: 'data-density rung · --jx-density-coefficient',
      default: 'auto',
      description:
        "Scope-only here. Named steps resolve through the frozen alias table (small→sm · medium→default · large→lg; the five legacy spellings xs · 2xs · sm · default · lg pass verbatim) and stamp the rung on the root; a number is a coefficient re-scaling the kernel channels while the rung stays ambient. Nothing on this family repaints: the chain gap (--space-6), the select rhythm (calc(var(--jx-unit) × 1.75) block padding, --space-10 inline, 13px --jx-text-base) and the 12px label are fixed constants no rung re-bases. The rung re-bases the kernel channels for content composed INSIDE the root — a bare chain reads none of them.",
    },
    {
      name: 'size',
      type: '--jx-size-effective → root font-size',
      default: 'auto',
      description:
        "Stamps the carrier and an inline font-size on the root, but nothing here inherits it: the label reads --text-label-lg (12px) and each select reads --jx-text-base (the ruler's fixed 13px body voice), so size={24} moves the stamp, not the paint (measured below). Supply-only: nested component consumers read the carrier through the broadcast protocol. Steps small · medium · large; a number is px.",
    },
    {
      name: 'shape',
      type: '--jx-shape-effective · --jx-radius-factor-effective',
      default: 'auto',
      description:
        'Both carriers stamp on the root; no cascader css reads them. Steps round · scoop · bevel · notch · square · squircle; no number lane.',
    },
    {
      name: 'radius',
      type: '--jx-radius-effective',
      default: 'auto',
      description:
        "The carrier stamps, but the select corner reads --jx-radius — the theme token (var(--radius)) — not the effective carrier, so an explicit lane leaves the corners at the site radius. Supply-only: the concentric consumers are elsewhere (card, press-button). Steps small · medium · large; a number is px.",
    },
    {
      name: 'color',
      type: '--jx-color-effective',
      default: 'auto',
      description:
        'The carrier stamps; the shell ink reads the semantic core directly (--jx-border, --jx-background, --jx-foreground) and nothing consumes the hue lane on this family. Steps primary · secondary · error · warn · success · info; a number is hue degrees; a raw string passes through verbatim.',
    },
    {
      name: 'theme',
      type: 'the .dark class bridge',
      default: 'auto',
      description:
        "A resolved dark stamps .dark on the root and the island re-declares the raw token layer. The one family paint reading a raw token directly is the :focus outline — var(--ring), dark's hue-drifted primary (−4°) — so the focused ring follows the island while the shell face (background, foreground, border through the :root-anchored --jx-* aliases) stays site-themed. Partial re-theme, measured: ring flips, face doesn't. Steps light · dark · system; auto inherits the tree.",
    },
    {
      name: 'elevation',
      type: '--jx-elevation-effective',
      default: 'auto',
      description:
        'The carrier stamps; the family paints no shadow — a chain of native selects sits in the page plane. Steps level-1 · level0 · level1 · level2 · level3 · level4 · level5; a number is exact dp.',
    },
    {
      name: 'motion',
      type: '--jx-motion-effective',
      default: 'auto',
      description:
        'The carrier stamps; the family runs no transitions — the disabled dim (opacity 0.5) snaps instantly, and a native popup list is platform UI. Steps reduced · subtle · normal · expressive; a number is a coefficient.',
    },
  ];

  // the fixed paint: the constants the shells actually read (the receipts
  // behind the supply-only rows). None is rung- or axis-scoped.
  const fixedTokens = [
    { name: '--jx-unit', default: '0.25rem (4px)', source: 'structural' as const, description: 'The ruler unit — the select\'s block padding is calc(var(--jx-unit) × 1.75), fixed at every density rung.' },
    { name: '--space-6', default: 'calc(var(--jx-unit) × 1.5)', source: 'structural' as const, description: 'The group column gap and the chain\'s wrapping gap.' },
    { name: '--space-10', default: 'calc(var(--jx-unit) × 2.5)', source: 'structural' as const, description: 'The select\'s inline padding.' },
    { name: '--jx-text-base', default: '0.8125rem (13px)', source: 'structural' as const, description: 'The select\'s mono body voice — the ruler\'s T_base constant, NOT the density channel --jx-text; no rung rescales it.' },
    { name: '--text-label-lg', default: '0.75rem (12px)', source: 'structural' as const, description: 'The label\'s uppercase eyebrow voice, with --track-10 letter spacing.' },
    { name: '--jx-hairline', default: '1px', source: 'structural' as const, description: 'The select border weight, on the border role.' },
    { name: '--jx-radius', default: 'var(--radius)', source: 'structural' as const, description: 'The select corner — the theme token, not the radius axis carrier.' },
  ];

</script>

<svelte:head>
  <title>Cascader · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai cascader: the cascade selector as a chain of N plain select elements — native keyboard and mobile pickers, zero custom panels; the joined leaf path is the form value, a partial path submits empty."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: the page sections ship as PAGE DATA (+page.ts); the
       scaffold chrome owns the rail -->
  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · General"
      title="cascader — a chain of selects, natively"
      summary="The cascade selector the ruled way: N plain select elements, each listing the children of the previous pick — native keyboard, native mobile pickers, zero custom panels to keep honest. The joined leaf path submits through the bridge; a partial path submits empty."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">chain of native selects</span>
        <span class="pill">path value · partial submits empty</span>
        <span class="pill">native keyboard + mobile pickers</span>
        <span class="pill">zero custom panels</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsInstall name="cascader" />
  </div>

  <div id="overview" data-reveal="">
    <SectionCard
      eyebrow="overview"
      title="Overview"
      summary="A hidden form bridge, a labelled group, and a chain of native selects that grows one level at a time — the value is the picked path."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.measurePara)}>
          Cascader is the cascade selector as a chain-of-selects: level 0 lists
          <code>options</code>, each further level lists the children of the previous pick, and the
          chain stops growing at the first leaf-less pick. The parts are one hidden
          <code>jx-form-field</code> bridge (a joined path is not a single native control's value,
          so the payload rides the bridge), a labelled <code>role="group"</code> root, and the
          wrapping chain of native <code>&lt;select&gt;</code> elements.
        </p>
        <p class={cx(rt.measurePara)}>
          The value law is the honest-path law: a <strong>complete</strong> path — every level
          picked and the last pick a leaf — joins with <code>separator</code> (default
          <code>'/'</code>) and submits under <code>name</code>; a <strong>partial</strong> path
          submits <code>''</code>, never a half-truth in FormData (the input-otp law). Picking at
          level N truncates everything deeper, then appends. <code>disabled</code> blocks the whole
          chain; an option may disable itself at any level; form reset clears the path.
        </p>
        <p class={cx(rt.measurePara)}>
          All eight universal axes resolve on the root and broadcast downward — the shells' fixed
          paint reads none of the carriers directly (the axis table below names each one's
          honesty). For the axis grammar itself, see the
          <a href="/docs/universal-props.html">universal props</a> concept page.
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
      summary="Feed the tree; bind the path; picking a parent grows the chain, re-picking truncates deeper levels."
    >
      <CodeBlock code={usage} lang="svelte" meta="Cascader usage" />
    </SectionCard>
  </div>

  <div id="cascader-demo" data-region="cascader-demo" data-family="cascader-demo" data-reveal="">
    <ComponentCanvas
      title="cascader"
      stage="center"
      description="Pick Asia, then Japan — the chain grows one select at a time; re-picking an earlier level truncates the deeper ones. The echo footer shows the joined path."
      sourceUrl={registrySourceUrl('cascader')}
      files={canvasFiles}
      onreset={resetCanvas}
      output={[{ label: 'path', value: value.length ? value.join(' / ') : '—' }]}
      resolveFileContent={resolveUsage}
    >
      <div class={cx(rt.wFull, rt.maxWMd)}>
        <Cascader {options} label="region" bind:value />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            picking a parent grows the chain by one select; re-picking an earlier level truncates
            everything deeper. The complete leaf path is the form value; a partial path submits
            empty.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="Props"
      summary="The table renders from the GENERATED meta; the eight universal axis rows split into the shared section beneath the family rows. The value is the picked path; the submission is the joined string."
    >
      <PropsTable meta={cascaderMeta} docs={CASCADER_DOCS} />
    </SectionCard>
  </div>

  <div id="axes" data-reveal="">
    <SectionCard
      family="axes"
      headerRegion="axes"
      eyebrow="axes"
      title="The eight axes on cascader"
      summary="Every axis carries a first-time no-own slot (the census batch A wiring) and resolves explicit ?? ambient ?? 'auto' on the root — an explicit lane stamps its carrier and joins the broadcast protocol (吃也供, supply-and-consume). None of the eight repaints the shells — the chain's paint is fixed constants (the token table below) — except theme's one consumed voice: the :focus outline rides var(--ring) and follows a dark island. The per-axis rows record each stamp-and-supply honestly instead of inventing paint."
    >
      <div class={cx(rt.col20)}>
        <p class={cx(rt.note12, rt.inkMuted70)}>
          Reading the table: Property is the axis, Type is the real carrier it stamps on the root
          here, Default is the lane default — the named steps, number unit, and consumption on
          this family are in each description.
        </p>
        <PropsTable props={axisRows} title="" />
        <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
          Deviations, cited: the eight-axis adoption itself is the census row — cascader is one of
          the 16 native-collision families of batch A (LANDED 6bb88ae0), which gave it its
          first-ever <code>CascaderDefaults.resolve</code> wiring: all eight lanes declare the
          no-own slot contract, and the root stamps carriers for every resolved lane
          (openspec/changes/explicit-props/research/migration-census.md). The §1 native-collision
          rule: the family destructures all eight axis names, so the native
          <code>&lt;select&gt;</code> elements never receive them as attributes — HTML's own
          select <code>size</code> attribute (multiple-rows count) has no passthrough to collide
          with; the family renders no multi-select and spreads no rest. No §13 renames apply —
          <code>options</code>, <code>value</code>, <code>separator</code>, <code>label</code> are
          family props, not axis names — and no family-local prop shadows an axis name, so the
          generated table needs no extra lane.
        </p>
        <div class={cx(rt.mt20)}>
          <TokenTable tokens={fixedTokens} />
        </div>
        <div class={cx(rt.mt20)}>
          <CodeBlock code={axesUsage} lang="svelte" meta="the eight axes on cascader" />
        </div>
        <div class={cx(rt.mt20)}>
          <ComponentCanvas
            id="axes"
            title="cascader · the eight axes"
            stage="fill"
            description="The stamps, live. The shells' paint is fixed, so the demos read the root's carriers — each caption names what the SSR markup greps."
            sourceUrl={registrySourceUrl('cascader')}
            files={axesFiles}
          >
            <div class={cx(rt.gridSm2, rt.wFull)}>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>auto — ambient scope, stamps nothing (no data-density, no style attr)</span>
                <Cascader {options} label="ambient chain" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>density="small" — data-density="sm" + --jx-density-coefficient: 1 on the root; the shells' paint is fixed</span>
                <Cascader {options} label="compact chain" density="small" />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>size=24 — the carrier lands in the root's style attr; the select face stays 13px</span>
                <Cascader {options} label="px size stamp" size={24} />
              </div>
              <div class={cx(rt.panel)}>
                <span class={cx(rt.note11)}>theme="dark" — .dark stamps the root; focus a select: the ring re-inks to dark's primary, the face stays site-themed</span>
                <Cascader {options} label="dark island" theme="dark" />
              </div>
            </div>
            <div class={cx(rt.col20, rt.wFull, rt.anMt32)}>
              <span class={cx(rt.note11)}>density={"{query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')}"}</span>
              <Cascader {options} label="responsive chain" density={query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')} />
              <p class={cx(rt.mt4, rt.note12, rt.inkMuted70)}>
                SSR paints the base rung (<code>data-density="sm"</code>); at the lg viewport rung
                (≥64rem) the root's attribute steps to <code>"lg"</code> — a DOM fact, not a pixel
                fact: the shells keep their fixed paint. Resize across 64rem and watch the root.
              </p>
            </div>
          </ComponentCanvas>
        </div>
      </div>
    </SectionCard>
  </div>

  <div id="accessibility" data-reveal="">
    <SectionCard
      eyebrow="a11y"
      title="Accessibility"
      summary="Every level is a real native select — the platform's keyboard and mobile pickers come free."
    >
      <A11yTable
        keys={[
          { key: 'Tab', action: 'Moves focus through the chain, level by level' },
          { key: '↑ / ↓', action: 'Move within the focused select’s options (native)' },
          { key: 'Enter / Space', action: 'Open the focused select and commit a pick (native)' },
        ]}
        aria={[
          { name: 'role', value: 'group', description: 'On the root; aria-label defaults to the label prop (“cascade” if omitted).' },
          { name: 'aria-label', value: 'level n', description: 'Per select — each level is independently named.' },
          { name: 'aria-labelledby', value: '{id}-label', description: 'The chain is labelled by the visible label when present.' },
        ]}
      />
      <p class={cx(rt.mt20, rt.note12, rt.inkMuted70)}>
        The chain's hit surface is density-invariant: the native select measures 35px tall at
        every rung — the shell rhythm is fixed — clearing the 24px WCAG 2.5.8 AA target floor
        (measured ambient, sm and lg). The focus law is the family's own: a 1px inset ring on the
        focused select, unlayered so it always paints; its ink follows the theme island when one
        resolves (the axis table's theme row).
      </p>
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="cascader" />
  </div>
  </div>
</div>
