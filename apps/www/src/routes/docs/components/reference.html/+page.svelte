<!--
  Docs page for reference (docs-eight-axes-mdn task 28, MDN archetype;
  tier 2 优化重构 — the skeleton's resolution-matrix demo and a11y table
  carried; the archetype gains install/overview/law/types-postures/the
  measured axes layer/see-also + a ToC. Family untouched — the reference
  ships no paint surface at all: no atoms file, no css file, the anchor
  is cascade-passive by contract).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import { query } from '$lib/universal-props-query.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import NumberingProvider from '$lib/ui/figure/numbering-provider.svelte';
  import Reference from '$lib/ui/reference/reference.svelte';
  import Figure from '$lib/ui/figure/figure.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import referenceSource from '$lib/ui/reference/reference.svelte?raw';

  // 模板字符串里的字面 script 闭合标签会终止本组件自身的 script 扫描 —— 拼接它
  const close = '</' + 'script>';

  const usage = `see <Reference to="eq-1" /> and <Reference to="methods" />
<Reference to="eq-1">上式</Reference> — the children escape hatch`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/reference/reference.svelte', content: referenceSource },
    { name: 'src/lib/reference-usage.svelte', content: usage },
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
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // ---- the law table: the edge-emission state machine --------------------
  const lawTable = [
    { posture: 'resolved', input: 'the target is registered', renders: 'a native <a href="#to"> reading the target\u0027s self-description', announces: 'Eq (4.5) · § 3.2.1 · the bare title' },
    { posture: 'forward claim', input: 'the target is not registered YET (pre-settle, and all of SSR)', renders: 'the FALLBACK ANCHOR — ??(to) text still carrying href + data-ref-to', announces: 'the edge claim survives for the static harvester\u0027s two-pass pre-scan' },
    { posture: 'settled missing', input: 'hydration + two rAFs, target still absent', renders: 'a loud <span>??(to)</span> — navigable status dropped, data-ref-to released', announces: 'one console.warn per missing episode (not dev-gated — prerendered artifacts must surface bad references)' },
    { posture: 'provider escape', input: 'no registry in context', renders: 'the missing-state render outright', announces: 'one dev-gated warn at init — never double-diagnosed with the settle warn' },
    { posture: 'eviction', input: 'a live target is evicted', renders: 'degrades back to missing and re-warns — a fresh episode (design §1.2\u0027s re-trigger law)', announces: 'the registry is the truth, reactively' },
  ];

  // ---- the postures demo (the resolution matrix's lanes, separated) -----
  const posturesDemo = `<See <Reference to="fig-eq" /> · <Reference to="sec-num" /> · <Reference to="sec-plain" />
<Reference to="fig-eq">上式</Reference> — the children escape hatch`;

  // ---- the axes section: per-axis rows + probe-tagged demos --------------
  // Grep receipts: the family ships NO atoms file and NO css file — the
  // stylex-free anchor reads no carrier at all; the preflight's
  // `a { color: inherit }` makes the reference a pure inheritance
  // surface (the kbd contrast: that glyph pins its own voice, this one
  // inherits everything).
  const axisRows = [
    {
      name: 'size',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "CONSUMED THROUGH INHERITANCE — the §11 stamp lands on the root and the label simply inherits it: the family declares no fontSize anywhere (no atoms, no css — grep receipt), so the anchor is the kbd contrast's other pole. Measured in two contexts: a 13.5px prose reference computes 13.5px, the size={18} demo computes 18px, and a 12.5px table instance would inherit 12.5px the same way. Number unit: px.",
    },
    {
      name: 'shape',
      type: `'round' | 'scoop' | 'bevel' | 'notch' | 'square' | 'squircle' | 'auto'`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps the carriers; the family reads nothing (grep receipt: no css surface exists). An inline anchor paints no silhouette. Number unit: none.",
    },
    {
      name: 'radius',
      type: `'small' | 'medium' | 'large' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-radius-effective; zero readers (no corner is painted). The supply is for composed descendants through the children escape hatch. Number unit: px.",
    },
    {
      name: 'density',
      type: `'small' | 'medium' | 'large' | 'auto' | number (+ the five legacy spellings)`,
      default: `'auto'`,
      description:
        "STAMP-ONLY, scope-carrier — the rung lands data-density on the root (measured), and the anchor itself reads no kernel channel: its ink and size are inherited from the context. The stamp matters for what the children escape hatch carries — a density-reading descendant re-bases inside the root's scope. No opinion stamps nothing. Number unit: coefficient.",
    },
    {
      name: 'color',
      type: `'primary' | 'secondary' | 'error' | 'warn' | 'success' | 'info' | 'auto' | number | string`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-color-effective; zero readers. The anchor's ink is the preflight's `a { color: inherit }` law: the context's ink IS the reference's ink (measured: the served references compute their prose context's color). Number unit: hue degrees.",
    },
    {
      name: 'theme',
      type: `'light' | 'dark' | 'system' | 'auto'`,
      default: `'auto'`,
      description:
        "BRIDGE-ONLY — the class:dark bridge lands on the root and NOTHING reads it: the family paints no color, and the preflight's color: inherit chains from OUTSIDE the scope, so a scoped dark island moves neither the ink nor the ground (measured: computed color unchanged inside an injected .dark). A citation is deliberately cascade-passive — whichever theme owns the surrounding prose owns the reference. No number lane.",
    },
    {
      name: 'elevation',
      type: `'level-1' | 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-elevation-effective; zero readers (no shadow anywhere in the family). An inline citation is flush with the plane. Number unit: dp.",
    },
    {
      name: 'motion',
      type: `'reduced' | 'subtle' | 'normal' | 'expressive' | 'auto' | number`,
      default: `'auto'`,
      description:
        "SUPPLY-ONLY — stamps --jx-motion-effective; zero readers and zero transition declarations (grep receipt: the resolution is reactive registry flow, not choreography). Number unit: coefficient.",
    },
  ];

  const axesUsage = `<Reference to="eq-1" size={18}>the scaled citation</Reference>
<!-- density: the rung stamps the root — a scope for what the children
     escape hatch carries, not a paint dial -->
<Reference to="eq-1" density="small">…</Reference>`;
  const axesFiles: TreeFile[] = [
    { name: 'src/lib/reference-axes.svelte', content: axesUsage, kind: 'usage' },
  ];

  // the ONE query() case: responsive size — the number lane goes bare;
  // md = 48rem (the registered VIEWPORT_SCALE — cite the key).
  const responsiveSize = query({ md: 18 }, 13.5);

  const queryUsage = `<script lang="ts">
  import Reference from '@ui/reference.svelte';
  import { query } from '@lib/universal-props-query.svelte';
${close}

<!-- below 48rem the base (13.5px, the prose context) applies; at 48rem+
     the md case (18px) wins through the root stamp + plain inheritance -->
<Reference to="eq-1" size={query({ md: 18 }, 13.5)} />`;

  const queryFiles: TreeFile[] = [
    { name: 'reference-query-demo.svelte', content: queryUsage, kind: 'usage' },
  ];

  // the kernel channels are the CONTRAST cell here: every other family
  // consumes them; the reference reads none — its whole voice is
  // inherited.
  const axisTokens = [
    { name: 'a { color: inherit }', default: 'the preflight law', source: 'structural' as const, description: 'The anchor\u0027s ink and decoration chain from the context — the citation reads no paint token of its own; theme is a bridge to nothing.' },
    { name: 'kernel channels (--jx-text / --jx-hit / --jx-gap)', default: 'UNREAD by this family', source: 'density' as const, description: 'The contrast cell: the density rung stamps the root and re-scopes what the children escape hatch carries — the anchor\u0027s own voice stays inherited.' },
    { name: 'data-ref-to', default: 'the edge claim', source: 'component' as const, description: 'The forward-edge attribute the static harvester\u0027s two-pass pre-scan reads; claimed on anchors, released only on settled-missing.' },
    { name: 'FIGURE_LABELS', default: 'the figure registry\u0027s single source', source: 'structural' as const, description: 'Display words come from figure/numbering — never copied here (the reference → figure registryDependency edge).' },
  ];
</script>

<svelte:head>
  <title>Reference · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai Reference: the typed cross-link that resolves its own display grammar from the target — a native fragment anchor with zero grammar knowledge of its own."
  />
</svelte:head>

<div class={cx(rt.shell)}>
  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · layout"
        title="reference — the 引 primitive"
        summary="A native <a href> that says what the target says: an equation Figure renders Eq (4.5), a numbered Section renders § 3.2.1, an unnumbered one renders its title. Change the target — kind, chapter, order — and every reference follows. Forward references prerender their ?? fallback carrying the edge claim and resolve on hydration."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native anchor · zero grammar knowledge</span>
          <span class="pill">target-owned display</span>
          <span class="pill">loud fallback — never a throw</span>
        </div>
      </SectionCard>
    </div>

    <div id="install" data-reveal="">
      <DocsInstall name="reference" />
    </div>

    <div id="overview" data-reveal="">
      <SectionCard
        eyebrow="overview"
        title="Overview"
        summary="A reference resolves itself from what the target says about itself — and paints nothing of its own."
      >
        <div class={cx(rt.col20)}>
          <p class={cx(rt.measurePara)}>
            The resolution grammar is the target's, never the reference's: a Figure renders its
            kind's display word from the figure registry's single source plus the number string
            the registrant owns — <code>Eq (4.5)</code>; a numbered Section renders
            <code>§ 3.2.1</code>; an unnumbered Section falls back to its bare title with no
            connective word (connectives are author copy — the <code>children</code> escape
            hatch exists for them, replacing the anchor's label while
            <code>href</code> + <code>data-ref-to</code> remain). The reference never formats
            numbers and never copies display words; the registryDependency edge to the figure
            family is the law.
          </p>
          <p class={cx(rt.measurePara)}>
            The DOM is a TWO-STATE machine over one rule: "not yet registered" is not
            "nonexistent". Before the settle criterion holds (hydration + two rAFs — which
            means the whole SSR pass), an unresolved reference renders the FALLBACK ANCHOR:
            <code>??(to)</code> text still carrying <code>href</code> + the
            <code>data-ref-to</code> edge claim, because the static harvester's two-pass
            pre-scan needs the forward edge. Only when settle proves the target dead does it
            degrade to the loud <code>??(to)</code> span — not navigable, the edge released,
            one console.warn per missing episode (not dev-gated: prerendered artifacts must
            surface bad references). A live target that registers late resolves without ever
            warning; a winner's eviction degrades the reference back and re-arms the warn.
          </p>
          <p class={cx(rt.measurePara)}>
            The axes story is the fleet's other pole: the citation is a PURE INHERITANCE
            surface. The family ships no atoms file and no css file — the anchor declares no
            fontSize, no color, no corner, no shadow — so the preflight's
            <code>a {'{'} color: inherit {'}'}</code> law makes ink and size chain from the
            context, and the §11 size stamp consumes exactly through that inheritance (the
            <a class="pill" href="/docs/components/kbd.html">kbd</a> contrast: that glyph pins
            its own kernel voice; this one inherits everything). Density is the one stamp with
            scope semantics — a rung re-scopes whatever the children escape hatch carries.
            All eight lanes are no-own (the first-time W3-D2 contract). Per-axis below; the
            shared grammar lives on the
            <a class="pill" href="/docs/universal-props.html">universal props</a> page.
          </p>
        </div>
      </SectionCard>
    </div>

    <div id="reference-demo" data-region="reference-demo" data-family="reference-demo" data-reveal="">
      <ComponentCanvas
        title="reference"
        stage="fill"
        description="The resolution matrix under one numbering domain: an equation, a numbered section, an unnumbered section, and a missing id."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/reference/reference.svelte"
        files={canvasFiles}
      >
        <div data-doc-demo-scope="headings-ok">
        <NumberingProvider>
          <SectionCard numbering="decimal" title="Results" headerRegion="results">
            <div class={cx(rt.col16, rt.text135)}>
              <p>the momentum balance of <Reference to="eq-r" /> holds</p>
              <p>the procedure lives in <Reference to="sec-methods" /></p>
              <p>for notation see <Reference to="sec-unnumbered" /></p>
              <p class={cx(rt.inkMuted)}>a broken one renders <Reference to="eq-nope" /> loudly</p>
              <Figure kind="equation" id="eq-r" caption="the momentum balance">
                <CodeBlock code="p = m · v" lang="ts" meta="eq r" />
              </Figure>
              <SectionCard id="sec-methods" title="Methods" headerRegion="methods">the procedure</SectionCard>
              <SectionCard id="sec-unnumbered" title="Notation" headerRegion="notation">the glossary</SectionCard>
            </div>
          </SectionCard>
        </NumberingProvider>
        </div>
        {#snippet playground()}
          <p class={cx(rt.text12, rt.inkMuted)}>
            static demo — the missing-id reference keeps its ??(eq-nope) marker and warns in the
            console once settled; production renders the marker too.
          </p>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="law" data-reveal="">
      <SectionCard
        family="law"
        headerRegion="law"
        eyebrow="law"
        title="The edge-emission state machine"
        summary="Not yet registered is not nonexistent: the forward edge stays claimed until settle proves the target dead — then the marker goes loud, the edge is released, and the warn fires once per episode."
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
    <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Postures" summary="One anchor, four postures: equation, numbered section, unnumbered section, and the children escape hatch."><div class={cx(rt.col16)}><NumberingProvider><SectionCard numbering="decimal" title="Postures" headerRegion="postures"><Figure kind="equation" id="eq-postures" caption="the postures demo"><CodeBlock code="E = m·c²" lang="ts" meta="eq postures" /></Figure><div class={cx(rt.col12, rt.text135)}><p>the equation: <Reference to="eq-postures" /></p><p>the children escape hatch: <Reference to="eq-postures">上式</Reference></p></div></SectionCard></NumberingProvider></div></SectionCard></div>

    <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage" summary="Address by explicit id; the children snippet replaces the anchor's label text while href semantics remain."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>

    <div id="api" data-reveal="">
      <SectionCard
        family="api"
        headerRegion="api"
        eyebrow="api"
        title="API"
        summary="Two contract rows over the eight-lane surface (the first-time W3-D2 contract, all no-own): the target id and the label escape hatch. There is no rest spread and no paint surface — everything visual is inherited from the context."
      >
        <PropsTable
          universal
          props={[
            { name: 'to', type: 'string', required: true, description: 'The target\u0027s explicit id — resolved through the route-page target registry; referenceable targets are numbered Figures and Sections (numbered or not).' },
            { name: 'children', type: 'Snippet', default: '—', description: 'Escape hatch: replaces the anchor\u0027s label text (author copy such as connectives); the href and data-ref-to semantics remain.' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="axes" data-reveal="">
      <SectionCard
        family="axes"
        headerRegion="axes"
        eyebrow="axes"
        title="The eight axes on reference"
        summary="The fleet's inheritance pole (the first-time W3-D2 contract, all no-own): the family ships no atoms and no css, the preflight's color: inherit anchor law makes ink and size chain from the context, and the §11 size stamp consumes exactly through that inheritance — the kbd contrast's other pole. Density is the one stamp with scope semantics (the children escape hatch's re-scoping); theme is a bridge to nothing (measured: a scoped dark island moves neither ink nor ground); everything else stamps-and-supplies."
      >
        <div class={cx(rt.col20)}>
          <PropsTable props={axisRows} title="" />
          <div class={cx(rt.mt20)}>
            <TokenTable tokens={axisTokens} />
          </div>
          <div class={cx(rt.mt20)}>
            <ComponentCanvas id="axes" title="reference · the measured axes" files={axesFiles} stage="fill">
              <div class={cx(rt.gridSm2, rt.wFull)}>
                <div class={cx(rt.panel)} data-probe="ref-ambient">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>ambient — the context's voice, inherited</p>
                  <NumberingProvider>
                    <SectionCard numbering="decimal" title="Ambient" headerRegion="ax-a">
                      <Figure kind="equation" id="eq-ax-a" caption="ambient"><CodeBlock code="a = 1" lang="ts" meta="ax a" /></Figure>
                      <p class={cx(rt.text135)}>see <Reference to="eq-ax-a" /></p>
                    </SectionCard>
                  </NumberingProvider>
                </div>
                <div class={cx(rt.panel)} data-probe="ref-size">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>size={18} — consumed through inheritance</p>
                  <NumberingProvider>
                    <SectionCard numbering="decimal" title="Size" headerRegion="ax-b">
                      <Figure kind="equation" id="eq-ax-b" caption="size lane"><CodeBlock code="a = 2" lang="ts" meta="ax b" /></Figure>
                      <p>see <Reference to="eq-ax-b" size={18} /></p>
                    </SectionCard>
                  </NumberingProvider>
                </div>
                <div class={cx(rt.panel)} data-probe="ref-density">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>density="small" — the scope stamp, voice unchanged</p>
                  <NumberingProvider>
                    <SectionCard numbering="decimal" title="Density" headerRegion="ax-c">
                      <Figure kind="equation" id="eq-ax-c" caption="density lane"><CodeBlock code="a = 3" lang="ts" meta="ax c" /></Figure>
                      <p>see <Reference to="eq-ax-c" density="small" /></p>
                    </SectionCard>
                  </NumberingProvider>
                </div>
                <div class={cx(rt.panel)} data-probe="ref-missing">
                  <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>settled missing — the loud span, edge released</p>
                  <NumberingProvider>
                    <SectionCard numbering="decimal" title="Missing" headerRegion="ax-d">
                      <p>the broken one: <Reference to="eq-never" /></p>
                    </SectionCard>
                  </NumberingProvider>
                </div>
              </div>
            </ComponentCanvas>
          </div>
          <div class={cx(rt.mt20)}>
            <CodeBlock code={queryUsage} lang="svelte" meta="one real query() case" />
            <ComponentCanvas title="reference · query()" files={queryFiles}>
              <div data-probe="ref-query" class={cx(rt.text135)}>
                <NumberingProvider>
                  <SectionCard numbering="decimal" title="Query" headerRegion="ax-q">
                    <Figure kind="equation" id="eq-ax-q" caption="query"><CodeBlock code="q = 4" lang="ts" meta="ax q" /></Figure>
                    <p>see <Reference to="eq-ax-q" size={responsiveSize} /></p>
                  </SectionCard>
                </NumberingProvider>
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
        summary="The platform owns everything: a native fragment anchor for the living edge, a plain span for the dead one — no synthetic tabindex, no role, no state."
      >
        <A11yTable
          keys={[
            { key: 'Enter', action: 'Activates the native fragment link — the platform scrolls to the target; no key handling exists in the family' },
          ]}
          aria={[
            { name: 'a[href]', value: 'native anchor', description: 'Keyboard focus and activation ride the platform; no synthetic tabindex or role.' },
            { name: 'data-ref-to', value: 'the edge claim', description: 'Carried on every living anchor for the static harvester — released the moment settle proves the target dead.' },
            { name: 'span (missing)', value: 'not navigable', description: 'A dead target degrades to a visible ??(id) marker — no interaction affordance for a broken edge.' },
            { name: 'children', value: 'the label contract', description: 'A children override replaces the label text only — the href stays; announce-worthy copy is the author\u0027s to write.' },
          ]}
        />
      </SectionCard>
    </div>

    <div id="see-also" data-reveal="">
      <DocsSeeAlso name="reference" />
    </div>
  </div>
</div>
