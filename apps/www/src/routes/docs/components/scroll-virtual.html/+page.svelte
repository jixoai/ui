<!--
  scroll-virtual page (docs-eight-axes-mdn task 30, MDN archetype; tier 2
  优化重构 — the workbench canvas, types, usage, a11y and api rows carried;
  the archetype gains install/overview/law/axes/see-also + a ToC file.
  Family untouched — the engine-wrapper dialect forwards every lane; the
  family itself owns no paint surface).
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import TerminalCard from '$lib/ui/terminal-card/terminal-card.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import ScrollVirtual from '$lib/ui/scroll-virtual/scroll-virtual.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlaySegmented, PlayNumber, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import scrollVirtualSource from '$lib/ui/scroll-virtual/scroll-virtual.svelte?raw';

  const summary =
    CATALOG.find((entry) => entry.name === 'scroll-virtual')?.summary ?? '';

  const close = '</' + 'script>';

  // ---- virtual demo state (page-owned, canvas playground protocol) ----
  const COUNTS = [1_000, 10_000, 100_000];
  let rowCount = $state(10_000);
  // the segmented control speaks strings; the page state stays numeric
  // (initialised literally — a $state(String(rowCount)) capture trips
  // state_referenced_locally)
  let rowCountKey = $state('10000');
  $effect(() => {
    const n = Number(rowCountKey);
    if (Number.isFinite(n) && n !== rowCount) rowCount = n;
  });
  let windowSize = $state(0);
  let jumpIndex = $state(4_999);
  let virtualInstance = $state<{
    scrollToIndex(index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }): void;
    getVirtualizer(): { getVirtualItems(): unknown[] } | undefined;
  } | null>(null);

  const rowItem = (index: number): string =>
    `row ${String(index + 1).padStart(6, '0')} — the window renders only what you see plus overscan`;

  const readWindow = (): void => {
    const v = virtualInstance?.getVirtualizer?.();
    const items = v?.getVirtualItems();
    if (items) windowSize = items.length;
  };
  $effect(readWindow);

  const virtualUsage = `<script lang="ts">
  import ScrollVirtual from '@ui/scroll-virtual.svelte';
${close}

<!-- strong TanStack association, thin coupling: read TanStack Virtual's
     docs for the semantics; virtualOptions speaks VirtualizerOptions -->
<ScrollVirtual count={rows.length} estimateSize={44} overscan={6} bind:this={list}>
  {#snippet children(item)}
    <div class="row" data-index={item.index}>{rows[item.index].name}</div>
  {/snippet}
</ScrollVirtual>

<!-- imperative surface: TanStack passthroughs -->
<button onclick={() => list.scrollToIndex(999, { align: 'center' })}>jump</button>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/scroll-virtual/scroll-virtual.svelte', content: scrollVirtualSource },
    { name: 'src/lib/ui/scroll-virtual-usage.svelte', content: virtualUsage },
  ];
  // the page's local join (the separator serialize law + the cx
  // predicate: the type guard zeroes the standing svelte-check
  // diagnostic — plain strings pass through whole; stylex objects
  // contribute their string members ($$css dropped)).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter((style): style is string | { readonly [key: string]: string | object } => Boolean(style))
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the universal props demo (explicit-props W3-D3) --------------------
  const uniRows = Array.from({ length: 60 }, (_, i) => ({ name: `row-${String(i + 1).padStart(2, '0')}` }));
  const universalUsage = `<ScrollVirtual count={60} estimateSize={44} size={18} density="small">…</ScrollVirtual>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/scroll-virtual-universal.svelte', content: universalUsage },
  ];

  // ── the law table: the thin-coupling contract ──
  const lawTable = [
    { posture: 'the spacer', input: 'positioning context', renders: 'one relative div whose block-size (or inline-size) is TanStack\u2019s totalSize — the scroll height of N rows you never render', announces: 'the scrollbar tells the truth about all of them' },
    { posture: 'the rows', input: 'getVirtualItems() × the children snippet', renders: 'absolutely-positioned wrappers at item.start — only the window plus overscan exists', announces: 'rows you scrolled past cease to exist; keep no state in them' },
    { posture: 'the measurement', input: 'the {@attach measureItem(item)} factory', renders: 'TanStack measureElement on every row wrapper — dynamic heights correct the estimate automatically', announces: 'the retired use: bound the curried call dead (measured in the lane-B spike) — attachments are the only mount that ran' },
    { posture: 'the passthrough', input: 'virtualOptions', renders: 'VirtualizerOptions verbatim — scrollMargin, lanes, getItemKey, onChange…; the reserved keys (count/estimateSize/overscan/horizontal/getScrollElement) land LAST and win', announces: 'TanStack\u0027s docs are the docs' },
    { posture: 'the escape hatch', input: 'bind:this', renders: 'scrollToIndex / scrollToOffset / measure / getVirtualizer — or skip this component and use @tanstack/svelte-virtual directly', announces: 'the wrapper adds wiring, never semantics' },
  ];

  // ── the measured per-axis table (task 30) — the ENGINE-WRAPPER dialect:
  // every lane FORWARDS to the composed ScrollArea region, which stamps
  // the carriers, supplies downward and anchors query() at ITS root; the
  // spacer and the absolutely-positioned rows are TanStack engine
  // internals, documented outside the supply set. ──
  const axisRows = [
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "FORWARDED — the resolved lane lands on the composed ScrollArea, which stamps the §4 legacy rung on the region root (measured: density=\"small\" → data-density=\"sm\" — today's CSS keys on the rungs), and the hand-drawn scrollbar and chrome follow the scroll-area family's own density story; the windowed rows inherit whatever the region's scope re-bases. The wrapper owns no geometry of its own. Number unit: coefficient.",
    },
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDED, INHERITED BY THE ROWS — the §11 stamp lands on the region root (measured on the query() demo below) and the windowed rows inherit it through plain cascade: row paint is the children snippet's, so your rows scale unless they pin their own voice. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        'FORWARDED — resolves on the composed ScrollArea (whose own shape story applies); the wrapper carries no corner. Number unit: none.',
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "FORWARDED AS THUMB CHROME, NUMBER LANE ONLY — the seam passes typeof d.radius === 'number' ? d.radius : undefined, so named steps and 'auto' are dropped at the forward seam; a landed number is the composed ScrollArea's W3-D2 chrome param (--jx-scroll-thumb-radius — the scrollbar thumb's corner), not a §3 corner stamp (source receipt: scroll-area.svelte, \"NOT the radius axis\"). Number unit: px.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        'FORWARDED — resolves on the composed ScrollArea; the wrapper reads no hue. Number unit: hue degrees.',
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "FORWARDED — the resolved lane lands on the composed ScrollArea, whose hand-drawn capsule follows the scroll-area family's own theme story (the platform path remains native-scroll-area). The wrapper stamps no class of its own. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        'FORWARDED — resolves on the composed ScrollArea (its elevation="number" lane is wired); the spacer and rows are flush by construction. Number unit: dp.',
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        'FORWARDED — resolves on the composed ScrollArea; zero readers in the wrapper (grep receipt: no --jx-motion-effective anywhere in ui/scroll-virtual/). The window re-render is data flow, not choreography. Number unit: coefficient.',
    },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 14);

  const queryUsage = `<script lang="ts">
  import ScrollVirtual from '@ui/scroll-virtual.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (14px) applies; at 48rem+ the md case (18px)
     wins — the lane forwards to the region and the rows inherit it -->
<ScrollVirtual count={rows.length} estimateSize={44} size={query({ md: 18 }, 14)}>…</ScrollVirtual>`;

  const queryFiles: TreeFile[] = [
    { name: 'scroll-virtual-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // the TokenTable: the wrapper owns almost nothing — the rows list the
  // seams and the forwarding edges.
  const axisTokens = [
    { name: 'the spacer', default: 'position: relative + totalSize', source: 'component' as const, description: 'The rows\u0029 positioning context — its block-size is TanStack\u0029s totalSize, the scroll height of every row you never render.' },
    { name: 'data-jx-sv-row / data-index', default: 'absolute wrappers at item.start', source: 'component' as const, description: 'The window\u0029s rows — TanStack positions them; the {@attach measureItem} factory feeds dynamic measurement back.' },
    { name: 'virtualOptions', default: 'VirtualizerOptions verbatim', source: 'component' as const, description: 'scrollMargin / lanes / getItemKey / onChange / rangeExtractor — reserved keys (count, estimateSize, overscan, horizontal, getScrollElement) land LAST and win.' },
    { name: 'getVirtualizer()', default: 'the raw instance', source: 'component' as const, description: 'The escape hatch — anything TanStack\u0029s docs describe is reachable without forking the wrapper.' },
    { name: 'the composed ScrollArea', default: 'region + scrollbar law', source: 'structural' as const, description: 'The region renders role=region + tabindex + the hand-drawn scrollbar capsule; the wrapper owns no DOM root of its own.' },
    { name: 'kernel channels', default: 'UNREAD by the wrapper', source: 'density' as const, description: 'The density/size lanes FORWARD to the region — the wrapper is em-free and channel-free; the rows inherit what the region\u0027s scope re-bases.' },
  ];
</script>

<svelte:head>
  <title>Scroll virtual · jixoai-ui</title>
  <meta name="description" content={summary} />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="scroll-virtual — the windowed list"
        summary={summary}
      >
      {#snippet headerAside()}
        <div data-doc-install="" aria-label="install scroll-virtual">
          <TerminalCard
            barTitle="install — scroll-virtual"
            command="npx jixoai-ui add scroll-virtual"
            outputs={['https://ui.jixoai.com/r/scroll-virtual.json']}
          />
        </div>
      {/snippet}

        <div class={cx(rt.wrap12)}>
          <span class="pill">@tanstack/svelte-virtual</span>
          <span class="pill">window + overscan only</span>
          <span class="pill">sibling: <a class={cx(rt.inkPrimary, rt.svOffset4, rt.svHover)} href="/docs/components/scroll-area.html">scroll-area</a></span>
        </div>
      </SectionCard>
    </div>


    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="Strong TanStack association, thin coupling: the windowing semantics are TanStack's, the DOM wiring is ours, the paint is yours."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            scroll-virtual is the scroll-area family's windowed-list sibling: a thin DOM-wiring
            layer over <code>@tanstack/svelte-virtual</code> (the official Svelte 5 adapter over
            virtual-core). The component adds exactly three things to TanStack: the ScrollArea
            composition (label and class passthrough — the region carries the WAI
            scrollable-region pattern and the hand-drawn scrollbar law), the positioning layer
            (a spacer sized to TanStack's <code>totalSize</code> plus absolutely-positioned rows
            with automatic <code>measureElement</code> — dynamic heights work with one less step
            than raw TanStack), and the escape hatch
            (<code>getVirtualizer()</code> hands back the raw instance). On-demand install: the
            scroll-area family has zero TanStack dependencies; adding this component is what
            installs it.
          </p>
          <p class={cx(rt.measurePara)}>
            The delivery shape is the fleet's ENGINE-WRAPPER dialect: scroll-virtual owns no DOM
            root of its own — the composed ScrollArea renders the region, stamps the §11
            carriers, supplies downward and anchors query() at its root. The resolved lanes
            FORWARD: density, size, shape, radius, color, theme, elevation and motion all land
            on the composed region (the hand-drawn capsule follows the scroll-area family's own
            stories), and the windowed rows inherit what the region's scope re-bases. The
            spacer and the absolutely-positioned rows are TanStack engine internals, documented
            outside the supply set.
          </p>
          <p class={cx(rt.measurePara)}>
            The laws worth knowing before you compose: virtualization runs along one axis
            (<code>horizontal</code> switches x for y); row spacing is expressed as inline row
            margins (TanStack has no gap concept); the ring padding of the ScrollArea's pad
            must not be combined with a horizontal virtual list (the inline start offsets the
            <code>scrollMargin</code>); and the reserved option keys land LAST — the
            component's own wiring always wins over the passthrough object. Per-axis below;
            the shared grammar lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="virtual-demo" data-reveal="">
      <ComponentCanvas
        title="scroll-virtual"
        description="TanStack Virtual through a thin DOM-wiring layer: this demo renders up to 100,000 rows — only the visible window plus overscan exists in the DOM. Row heights measure automatically (the component calls measureElement on its own wrappers)."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/scroll-virtual/scroll-virtual.svelte"
        files={canvasFiles}
        stage="fill"
        output={[
          { label: 'count', value: rowCount.toLocaleString() },
          { label: 'dom window', value: `${windowSize} rows` },
        ]}
        onreset={() => {
          rowCount = 10_000;
          jumpIndex = 4_999;
          virtualInstance?.scrollToIndex(0);
        }}
      >
        <ScrollVirtual
          bind:this={virtualInstance}
          count={rowCount}
          estimateSize={40}
          overscan={6}
          label="virtual list demo"
          class={cx(rt.svSpacer72)}
          onscroll={() => readWindow()}
        >
          {#snippet children(item)}
            <div class="jx-vrow" class:odd={item.index % 2 === 1}>
              {rowItem(item.index)}
            </div>
          {/snippet}
        </ScrollVirtual>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="count">
              <PlaySegmented
                bind:value={rowCountKey}
                options={COUNTS.map((c) => ({ value: String(c), label: c.toLocaleString() }))}
              />
            </PlayRow>
            <PlayRow label="scroll to index">
              <PlayNumber bind:value={jumpIndex} min={0} max={rowCount - 1} />
              <button
                type="button"
                class={cx('jx-press', rt.svJumpBtn)}
                onclick={() => virtualInstance?.scrollToIndex(Math.min(Math.max(jumpIndex, 0), rowCount - 1), { align: 'start' })}
              >
                jump
              </button>
            </PlayRow>
            <PlayHelp>
              semantics are TanStack's — <code>estimateSize</code>,
              <code>overscan</code>, and everything in
              <code>virtualOptions</code> speak VirtualizerOptions; read the
              TanStack Virtual docs directly. The instance passthroughs
              (<code>scrollToIndex / scrollToOffset / measure / getVirtualizer</code>)
              are the escape hatch.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The thin-coupling contract"
        summary="Everything windowing-related is TanStack's; the wrapper owns the positioning layer, the reserved-key precedence, and the escape hatch — never semantics."
      >
        <div class={cx(rt.col20)}>
          <PropsTable
            props={lawTable.map((row) => ({
              name: row.posture,
              type: row.input,
              default: row.renders,
              description: `announces: ${row.announces}`,
            }))}
            title=""
          />
        </div>
      </SectionCard>
    </div>
  </div>

  <div class={cx(rt.shellFlush)}>
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="One windowed list, two scroll axes; the composed ScrollArea is always hand-drawn (the variant prop retired, 2026-09-15).">
      <div class={cx(rt.grid760b)}>
        <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>vertical (default)</span><p class={cx(rt.bodyMuted, rt.mt8)}>TanStack's default y-axis windowing — only the visible window plus overscan exists in the DOM.</p></div>
        <div class={cx(rt.panel)}><span class={cx(rt.eyebrowPrimary)}>horizontal</span><p class={cx(rt.bodyMuted, rt.mt8)}>horizontal={true} virtualizes along x — the same options, the same thin DOM wiring.</p></div>
      </div>
    </SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Strong TanStack association, thin coupling: the props speak VirtualizerOptions; rows render through the children snippet."><CodeBlock code={virtualUsage} lang="svelte" meta="ScrollVirtual usage" /></SectionCard></div>

    <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the ScrollVirtual Props interface; bind:this exposes the TanStack passthroughs."><PropsTable universal props={[{ name: 'count', type: 'number', default: '—', description: 'Total item count (TanStack count).', required: true }, { name: 'estimateSize', type: 'number | ((index: number) => number)', default: '48', description: 'Estimated row size in px; dynamic measurement corrects it per row.' }, { name: 'overscan', type: 'number', default: '—', description: 'Items rendered beyond the visible window.' }, { name: 'horizontal', type: 'boolean', default: 'false', description: 'Virtualize along x instead of y.' }, { name: 'virtualOptions', type: 'Partial<VirtualizerOptions>', default: '{}', description: 'TanStack passthrough — scrollMargin / lanes / getItemKey / initialOffset / onChange / rangeExtractor; reserved keys are overridden.' }, { name: 'label', type: 'string', default: "'virtual list'", description: 'a11y name for the scrollable region.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough.' }, { name: 'onscroll', type: '(event: ViewportScrollEvent) => void', default: '—', description: 'The composed ScrollArea viewport scroll event.' }, { name: 'children', type: 'Snippet<[VirtualItem]>', default: '—', description: 'Rendered per virtual item — receives TanStack VirtualItem (index/start/size/key/lane).', required: true }, { name: 'bind:this', type: 'scrollToIndex / scrollToOffset / measure / getVirtualizer', default: 'export', description: 'The imperative TanStack surface.' }]} /></SectionCard></div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on scroll-virtual"
        summary="The ENGINE-WRAPPER dialect, all no-own (the first-time W3-D3 contract): every resolved lane FORWARDS to the composed ScrollArea region — the region stamps the carriers, supplies downward and anchors query() at its root — and the windowed rows inherit what the region's scope re-bases. The spacer and the absolutely-positioned rows are TanStack engine internals, documented outside the supply set."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
            <ComponentCanvas title="scroll-virtual · forwarding stamps + query()" files={queryFiles}>
              <div data-probe="sv-forward" class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
                <ScrollVirtual count={30} estimateSize={44} density="small" theme="dark" radius={8} label="forwarding stamps">{#snippet children(item)}<div style="padding: .25rem .5rem">{uniRows[item.index].name}</div>{/snippet}</ScrollVirtual>
                <p class={cx(rt.para)}>
                  density="small" + theme="dark" + radius={'{8}'} — the evidence lands on the
                  composed region (the wrapper owns no root): data-density="sm" (the §4 legacy
                  rung), the dark class, and the thumb-corner chrome
                  --jx-scroll-thumb-radius: 8px. The spacer and rows carry none of it.
                </p>
              </div>
              <div data-probe="sv-query" class={cx(rt.col16, rt.wFull, rt.maxWXl)}>
                <ScrollVirtual count={uniRows.length} estimateSize={44} size={responsiveSize} label="query size demo">{#snippet children(item)}<div style="padding: .25rem .5rem">{uniRows[item.index].name}</div>{/snippet}</ScrollVirtual>
                <p class={cx(rt.para)}>
                  Media keys are min-width: below 48rem the base (14px) applies — the region
                  stamps 14px and the rows inherit; at 48rem and wider the md case wins — 18px.
                  The number lane goes bare (results infer). Resize across 48rem.
                </p>
              </div>
            </ComponentCanvas>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The composed ScrollArea carries the WAI scrollable-region pattern; rows are your content's semantics."><A11yTable keys={[{ key: 'Tab', action: 'Focuses the scrollable region (role=region + tabindex=0 from the composed ScrollArea)' }, { key: '↑ ↓ ← → / Home / End / PgUp / PgDn', action: 'Native scrollport scrolling; the window re-renders as rows enter and leave' }]} aria={[{ name: 'aria-label', value: 'label prop', description: 'Accessible name for the region (default "virtual list")' }, { name: 'role', value: 'region', description: 'From the composed ScrollArea wrapper' }]} /></SectionCard></div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="scroll-virtual" />
    </div>
  </div>
</div>
