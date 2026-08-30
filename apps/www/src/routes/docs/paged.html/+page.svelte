<script lang="ts">
  // /docs/paged.html — the paged-doc-family PILOT PAGE (Owner
  // acceptance surface, 2026-08-30): press-button's documentation
  // rendered as a publication document.
  //
  // Everything below the toolbar is ONE PagedDoc tree. Web mode is the
  // pageless immersive flow (measure + margin notes); pagination is
  // its print-media projection. The toolbar is page chrome (hidden
  // under print via the audited hide verb) and drives the real API
  // surface: columns / page size / running header / the sim preview
  // (the screen print preview — the fourth consumer) / print.
  //
  // The skeleton keeps the staged docs shape: Intro (one h1) →
  // Install → Usage → Examples → API (PropsTable) → See Also, in
  // order, even though this route lives under /docs/ (not the lint's
  // scanned /docs/components/).
  //
  // Print behavior of the embedded workbench (freeze-as-readout, the
  // synthesis §4 B protocol): the canvas subtree carries
  // data-jx-print="freeze" (same DOM, halted — the CSS half pauses
  // animations), the page-owned control strip carries
  // data-jx-print="hide", and the readout rows persist as the value
  // projection (the output readout is the page's own composition —
  // the "v1 manual" seam the design records).
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import ComponentCanvas, {
    controlsFor,
    type ControlRow,
    type TreeFile,
  } from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import PressButton, {
    pulse,
    rainbow,
    ripple,
    shimmer,
    type PressEffect,
  } from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import { annotations, meta } from '$lib/meta/press-button.meta';
  import { registrySourceUrl } from '$lib/registry-source';
  import { toJSONSchema } from '$lib/schema/lower';
  import { withAnnotations, type ComponentMeta } from '$lib/schema/ir';
  // PRINT-PROJECTION ORDER LAW: lib/paged loads AFTER the canvas/code
  // imports so print-projection.css (unlayered :where() whitelist)
  // follows component-canvas.css's own unlayered scroll rule in the
  // bundle — equal layer, equal specificity, source order decides.
  import {
    PagedAside,
    PagedBlock,
    PagedCode,
    PagedDoc,
    PagedFigure,
    PagedRef,
    PagedSection,
    PagedTable,
    PagedToC,
  } from '$lib/paged';
  import pressButtonSource from '$lib/ui/press-button/press-button.svelte?raw';

  // A literal closing-script tag inside a template literal would
  // terminate this component's own script tag — splice it.
  const close = '</' + 'script>';

  // ---- the toolbar state (page-owned; PagedDoc consumes) ---------------
  let columns = $state<'auto' | '1' | 'wide'>('auto');
  let pageSize = $state<'A4' | 'Letter'>('A4');
  let wantRunning = $state(false);
  let sim = $state(false);
  const pageMargin = '18mm 16mm';

  function print(): void {
    window.print();
  }

  // ---- the schema pipeline (canvas-schema-pipeline reuse) --------------
  // The generated meta is the structure source of truth; the effect
  // enum lives PAGE-SIDE (builders are module functions, not prop
  // values — the enum speaks names, the seam maps them), exactly the
  // press-button docs page's pattern. One lowering feeds the control
  // strip AND the exported schema figure.
  type Variant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
  type EffectName = 'none' | 'shimmer' | 'pulse' | 'rainbow' | 'ripple';
  const effectBuilders = {
    none: undefined,
    shimmer: () => shimmer(),
    pulse: () => pulse(),
    rainbow: () => rainbow(),
    ripple: () => ripple(),
  } as const;
  const metaWithEffect: ComponentMeta = {
    ...meta,
    props: {
      ...meta.props,
      effect: {
        kind: 'enum',
        values: ['none', 'shimmer', 'pulse', 'rainbow', 'ripple'],
        default: 'none',
      },
    },
  };
  const schema = toJSONSchema(withAnnotations(metaWithEffect, annotations));
  const controlRows: ControlRow[] = controlsFor(schema);
  const schemaJson = JSON.stringify(schema, null, 2);

  type CanvasValues = { variant: Variant; effect: EffectName; loading: boolean };
  let canvasValues = $state<Record<string, unknown>>({
    variant: 'fill',
    effect: 'none',
    loading: false,
  });
  const v = $derived(canvasValues as CanvasValues);
  let effectValue: PressEffect | undefined = $state(undefined);
  function onControlValue(key: string, value: unknown): void {
    if (key === 'effect') {
      effectValue = value === 'none' ? undefined : effectBuilders[value as EffectName]();
    }
  }
  function setControl(key: string, value: string | boolean): void {
    canvasValues = { ...canvasValues, [key]: value };
    onControlValue(key, value);
  }

  // ---- the usage sample (same-source: head/tail one template) ----------
  const usageHead = `<script lang="ts">
  import PressButton, { shimmer, pulse, rainbow, ripple } from '@ui/press-button.svelte';
${close}

<!-- one physics for every variant: hover grows the shadow, active presses -->`;
  const usageTail = `
<PressButton variant="tonal" class="jx-hue-neutral">invite</PressButton>
<PressButton variant="outline">cancel</PressButton>
<PressButton variant="ghost">dismiss</PressButton>
<!-- destructive ACTION = fill + the destructive pair (statuses inject --jx-error) -->
<PressButton variant="fill" class="jx-pair-destructive">delete</PressButton>

<!-- one opt-in effect loop per button — typed builders from the module script -->
<PressButton variant="fill" effect={shimmer()}>deploy</PressButton>
<PressButton variant="fill" effect={ripple({ duration: 800 })}>deploy</PressButton>

<!-- href renders an anchor instead; hrefs outside "/" open a new tab -->
<PressButton variant="fill" href="/docs.html">read the docs</PressButton>`;
  const usage = `${usageHead}
<PressButton variant="fill">deploy</PressButton>${usageTail}`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/press-button/press-button.svelte', content: pressButtonSource },
    { name: 'src/lib/ui/press-button-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ---- the freeze-B glue: canvas chrome leaves under print -------------
  // The page owns which parts of the embedded workbench are
  // interactive-only. A mount action stamps the audited `hide` VERB on
  // the canvas's interactive chrome (code bar + stage toggles) — the
  // vocabulary stays pure (attribute + whitelist); no CSS fights any
  // utility because the whitelist is the one unlayered authority.
  function hideCanvasChromeInPrint(node: HTMLElement): { destroy(): void } {
    const stamp = (selector: string): void => {
      node.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.setAttribute('data-jx-print', 'hide');
      });
    };
    stamp('[data-jx-canvas-code-bar]');
    stamp('[data-jx-canvas-theme-seg]');
    stamp('[data-jx-canvas-density-seg]');
    return { destroy() {} };
  }

  // ---- static publication data (the SPEC shape of the prototype) -------
  const badges = [
    { label: 'registry:ui', tone: true },
    { label: 'since v0.1' },
    { label: 'MIT' },
    { label: 'hook: data-jx-press', tone: true },
    { label: 'zero deps' },
  ];

  const anatomyTree = `<button data-jx-press-button={variant} class="jx-press {variant}">
  {#if leading}<span data-jx-slot="leading">{@render leading()}</span>{/if}
  {@render children()}          <!-- the ONE label -->
  {#if trailing}<span data-jx-slot="trailing">{@render trailing()}</span>{/if}
</button>`;

  const parts = [
    { part: 'root', el: 'button', role: 'button (native)', hook: 'data-jx-press-button · .jx-press' },
    { part: 'leading / trailing', el: 'span[data-jx-slot]', role: 'decorative (aria-hidden)', hook: 'data-jx-slot' },
    { part: 'spinner (loading)', el: 'span', role: 'decorative', hook: 'data-jx-press-spin' },
  ];

  const ladder: {
    dim: string;
    cells: { p: { variant: Variant; density?: 'sm' | 'xs' }; l: string }[];
  }[] = [
    {
      dim: 'variant',
      cells: [
        { p: { variant: 'fill' }, l: 'fill — solid ground, inverted ink' },
        { p: { variant: 'tonal' }, l: 'tonal — 12% tint' },
        { p: { variant: 'outline' }, l: 'outline (default) — structural' },
        { p: { variant: 'ghost' }, l: 'ghost — transparent rest' },
      ],
    },
    {
      dim: 'density',
      cells: [
        { p: { variant: 'fill', density: 'xs' }, l: 'xs — the compact lane' },
        { p: { variant: 'fill' }, l: 'default (42px hit lane)' },
        { p: { variant: 'fill', density: 'sm' }, l: 'sm — between rungs' },
      ],
    },
  ];

  const states: { l: string; note: string; p: { variant: Variant; loading?: boolean } }[] = [
    { l: 'rest', note: 'the shadow is the affordance', p: { variant: 'tonal' as Variant } },
    { l: 'loading', note: 'aria-disabled; the press law still holds', p: { variant: 'tonal' as Variant, loading: true } },
    { l: 'link', note: 'the interaction exception (R1)', p: { variant: 'link' as Variant } },
  ];

  const tokens = [
    { token: '--jx-press-shadow', def: 'var(--shadow-2xs)', desc: 'rest pose' },
    { token: '--jx-press-shadow-hover', def: 'var(--shadow-xs)', desc: 'hover grows the shadow only' },
    { token: '--jx-press-shadow-active', def: 'var(--shadow-xs-press)', desc: 'counter-shrunk press' },
    { token: '--jx-fill / --jx-fill-ink', def: 'brand hue pair', desc: 'fill ground + ink' },
    { token: '--jx-tonal / --jx-outline', def: '12% / 45% recipe', desc: 'hue injection targets' },
    { token: '--jx-hit', def: '42px', desc: 'control hit lane at default density' },
  ];

  const a11yRows = [
    { k: 'Enter / Space', act: 'native click; suppressed while loading' },
    { k: 'Tab', act: 'single stop; focus-visible paints the inset ring' },
    { k: 'href pose', act: 'renders <a> — Enter navigates, Space no-ops' },
  ];

  const rulings = [
    { kind: 'do', b: 'DO inject hue through the slots', t: 'destructive ACTIONS inject the pair (--jx-fill/--jx-fill-ink); copy feedback = tonal + success.' },
    { kind: 'dont', b: "DON'T add a destructive variant", t: 'semantic color names retired with variant-grammar (R1, 2026-08-27) — hue is injected, never named.' },
    { kind: 'divergence', b: 'recorded: link is not a surface rung', t: 'it changes element semantics — an interaction affordance outside the ladder.' },
    { kind: 'divergence', b: 'recorded: density reads the environment', t: 'the lane derives from the ambient density context; an explicit stage stamp cuts inheritance (fleet law).' },
  ];

  const verbs = [
    { verb: 'hide', meaning: 'excluded from print', status: 'whitelisted — display:none defeats any display utility' },
    { verb: 'freeze', meaning: 'same DOM, halted at current state', status: 'CSS half live (animations pause); snapshot serializer is a followup change' },
    { verb: 'static', meaning: 'replaced by a static equivalent node', status: 'vocabulary — consumers author the static node' },
    { verb: 'flatten', meaning: 'structural re-layout (scrollports open)', status: 'whitelisted — overflow visible + max-block-size none' },
  ];

  const whitelist = [
    { selector: '[data-jx-print="hide"]', forced: 'display: none' },
    { selector: '[data-jx-print="flatten"]', forced: 'overflow: visible; max-block-size: none' },
    { selector: '[data-jx-canvas-scroll]', forced: 'overflow: visible; max-block-size: none' },
    { selector: '[data-jx-code-card-pre]', forced: 'overflow: visible; max-block-size: none' },
    { selector: '[data-jx-props-table-scroll]', forced: 'overflow: visible; max-block-size: none' },
  ];

  // the live API readout under the head (driven by the toolbar)
  const apiRead = $derived(
    `&lt;PagedDoc flow="web" columns="${columns}" page={{ size: "${pageSize}", margin: "${pageMargin}" }}${wantRunning ? ' runningHeader={RunningTitle}' : ''} engine="native" /&gt;`,
  );
</script>

<!-- ===================== page chrome (excluded from print) ============ -->
<div data-jx-print="hide" class="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border bg-card/40 px-4 py-2.5 font-mono text-[11.5px] text-muted-foreground">
  <span class="font-semibold text-foreground">PagedDoc <em class="text-primary not-italic">· native engine</em></span>
  <label class="inline-flex cursor-pointer items-center gap-1.5">
    列宽
    <select
      class="cursor-pointer border border-border bg-background px-2 py-0.5 text-foreground"
      value={columns}
      onchange={(e) => (columns = e.currentTarget.value as typeof columns)}
    >
      <option value="auto">自适应（宽列 + 边注栏）</option>
      <option value="1">单列（边注沉降）</option>
      <option value="wide">强制宽列</option>
    </select>
  </label>
  <label class="inline-flex cursor-pointer items-center gap-1.5">
    页面
    <select
      class="cursor-pointer border border-border bg-background px-2 py-0.5 text-foreground"
      value={pageSize}
      onchange={(e) => (pageSize = e.currentTarget.value as typeof pageSize)}
    >
      <option value="A4">A4 · 18mm 16mm</option>
      <option value="Letter">Letter · 18mm 16mm</option>
    </select>
  </label>
  <label class="inline-flex cursor-pointer items-center gap-1.5">
    <input type="checkbox" class="accent-primary" bind:checked={wantRunning} />
    打印页眉（fixed 尽力而为）
  </label>
  <span class="flex-1"></span>
  <button
    type="button"
    class="jx-press cursor-pointer border border-primary px-2.5 py-0.5 text-primary [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
    aria-pressed={sim}
    onclick={() => (sim = !sim)}
  >{sim ? '退出打印预览' : '打印预览（sim）'}</button>
  <button
    type="button"
    class="jx-press cursor-pointer border border-border bg-background px-2.5 py-0.5 text-foreground [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]"
    onclick={() => print()}
  >打印 / 导出 PDF</button>
</div>

<!-- the running header snippet (top-level scope so the PagedDoc open
     tag can hand it to the runningHeader prop — Chromium-only
     projection, see paged.css) -->
{#snippet runningTitle()}
  <span>press-button · jixoai-ui</span>
  <span>PagedDoc 原生引擎</span>
{/snippet}

<!-- ===================== the publication document ===================== -->
<PagedDoc
  flow="web"
  {columns}
  page={{ size: pageSize, margin: pageMargin }}
  orphans={2}
  widows={2}
  runningHeader={wantRunning ? runningTitle : undefined}
  engine="native"
  bind:sim
>

  <!-- the document head (unnumbered) -->
  <header class="mb-11">
    <p class="m-0 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">General · registry:ui — the publication projection</p>
    <h1 class="mt-2 text-[2.15rem] font-semibold leading-[1.25]">
      press-button
      <em class="mt-1 block text-[1.05rem] font-normal text-muted-foreground">the press-law button</em>
    </h1>
    <p class="mt-3 max-w-[62ch] text-[1rem] leading-[1.7]">
      Hover grows the shadow only; active presses the body +1px into the page while the shadow
      offsets counter-shrink —— 阴影绘制锚定不动，无伪层。变体阶梯 fill / tonal / outline（默认）/ ghost，hue 注入而不命名。
    </p>
    <div class="mt-4 flex flex-wrap gap-2 font-mono text-[11.5px]">
      {#each badges as b (b.label)}
        <span
          class="border bg-background px-2 py-0.5 {b.tone ? 'border-primary text-primary' : 'border-border text-muted-foreground'}"
        >{b.label}</span>
      {/each}
    </div>
    <!-- the live API readout: what the toolbar is really driving -->
    <p data-jx-paged-api-read class="mt-4 overflow-auto border border-dashed border-border bg-background px-3 py-1.5 font-mono text-[11.5px] whitespace-nowrap text-muted-foreground">
      {@html apiRead}<span class="text-muted-foreground/60"> · bleed / marks 词汇占位 —— pagedjs 引擎档才消费</span>
    </p>
  </header>

  <PagedToC label="contents" />

  <PagedSection id="install" title="Install">
    <DocsInstall name="press-button" />
  </PagedSection>

  <PagedSection id="usage" title="Usage">
    {#snippet lede()}一段 usage 就是全部：变体是形态学阶梯，效果环是可选的注意力回路。{/snippet}
    <PagedCode code={usage} />
    <PagedAside><b>同一份源</b> —— 代码抽屉与这段 usage 来自同一模板；本页的 CodeCard/`?raw` 导入遵守 same-source 法则。</PagedAside>
  </PagedSection>

  <PagedSection id="examples" title="Examples — the live workbench">
    {#snippet lede()}控制条与舞台同源于一份 jsonSchema —— schema2form 的出版化呈现。变体全阶梯见<PagedRef target="variants" />，状态带见<PagedRef target="states" />。{/snippet}
    <PagedFigure id="fig-workbench" caption="press-button 的活体工作台 —— 行控件由 lowered schema 生成，舞台实时消费同一份值；打印时冻结为读出行。">
      <!-- freeze-as-readout (synthesis §4, protocol B): the canvas
           subtree freezes (same DOM, halted); the page-owned control
           strip hides; the readout below persists as the projection -->
      <div data-jx-print="freeze" use:hideCanvasChromeInPrint>
        <ComponentCanvas
          title="press-button"
          description="the press-law button — one physics for every rung"
          sourceUrl={registrySourceUrl('press-button')}
          install="press-button"
          {files}
        >
          <PressButton variant={v.variant} effect={effectValue} loading={v.loading}>deploy</PressButton>
        </ComponentCanvas>
      </div>
      <!-- the control strip (from the same lowered schema; interactive
           chrome — excluded from print via the audited verb) -->
      <div data-jx-print="hide" class="mt-3 border border-border bg-background">
        <p class="m-0 border-b border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">controls · from schema</p>
        <div class="flex flex-col gap-2.5 p-3">
          {#each controlRows as row (row.key)}
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1" data-jx-paged-control-row data-control={row.control}>
              <label class="font-mono text-[12.5px] font-semibold text-foreground" for={`paged-ctl-${row.key}`}>{row.label}</label>
              {#if row.control === 'toggle'}
                <input
                  id={`paged-ctl-${row.key}`}
                  type="checkbox"
                  class="size-4 accent-primary"
                  checked={Boolean(canvasValues[row.key] ?? row.default)}
                  onchange={(e) => setControl(row.key, e.currentTarget.checked)}
                />
              {:else}
                <span class="inline-flex border border-border bg-background" role="group" aria-label={row.label}>
                  {#each row.values ?? [] as option (option)}
                    <button
                      type="button"
                      class="jx-press cursor-pointer px-2.5 py-1 font-mono text-[11.5px] [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none] {String(canvasValues[row.key] ?? row.default) === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}"
                      aria-pressed={String(canvasValues[row.key] ?? row.default) === option}
                      onclick={() => setControl(row.key, option)}
                    >{option}</button>
                  {/each}
                </span>
              {/if}
              {#if row.description}
                <p class="m-0 w-full text-[11px] leading-[1.5] text-muted-foreground/80">{row.description}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <!-- the readout projection: persists under print -->
      <dl data-jx-paged-readout class="mt-3 flex flex-col gap-1 font-mono text-[11.5px]">
        {#each [['variant', v.variant], ['effect', v.effect], ['loading', v.loading]] as [label, value] (label)}
          <div class="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3 border border-border/60 bg-muted/30 px-3 py-1">
            <dt class="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
            <dd class="m-0 text-foreground">{String(value)}</dd>
          </div>
        {/each}
      </dl>
    </PagedFigure>
    <PagedAside><b>SvelteCanvas 隔离</b> —— 实例级 context（getter 背书的响应式对象），同一页面可挂多块画布互不串扰；破功条件是模块级单例。</PagedAside>
  </PagedSection>

  <PagedSection id="schema" title="Schema — the structure export">
    {#snippet lede()}IR 经 lowering 序列化的标准 jsonSchema —— 结构词汇进，规范关键词出。{/snippet}
    <PagedFigure caption="面板行与这份导出来自同一 IR —— 导出即消费，承诺可审计。">
      <CodeCard filename="press-button.schema.json" lang="json" code={schemaJson} />
    </PagedFigure>
    <PagedAside><b>零依赖</b> —— IR 是普通对象；zod 只是可选前门（fromZod 适配器），生产中由 component-metadata-gen 从 .svelte 静态提取。</PagedAside>
  </PagedSection>

  <PagedSection id="anatomy" title="Anatomy">
    {#snippet lede()}Composition is a plain &lt;button&gt; —— 无包装元素，钩子即契约。{/snippet}
    <PagedCode code={anatomyTree} caption="the whole tree" />
    <PagedTable class="mt-4">
      <thead>
        <tr><th>part</th><th>element</th><th>role</th><th>hook</th></tr>
      </thead>
      <tbody>
        {#each parts as p (p.part)}
          <tr><td>{p.part}</td><td>{p.el}</td><td>{p.role}</td><td>{p.hook}</td></tr>
        {/each}
      </tbody>
    </PagedTable>
  </PagedSection>

  <PagedSection id="variants" title="Variants — the ladder">
    {#snippet lede()}活体阶梯 —— 每格都是真组件，不是截图。{/snippet}
    <PagedFigure caption="variant × size 两维 —— hue 不在维上，见注入。">
      <div class="flex flex-col border border-border bg-background">
        {#each ladder as row (row.dim)}
          <div class="grid grid-cols-[5.5rem_minmax(0,1fr)] border-b border-border last:border-b-0">
            <div class="border-r border-border p-3 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">{row.dim}</div>
            <div class="flex flex-wrap">
              {#each row.cells as cell, i (cell.l)}
                <span class="flex {i > 0 ? 'border-l border-border' : ''} min-w-[9.5rem] flex-1 flex-col items-start gap-2 p-3.5">
                  <PressButton variant={cell.p.variant} density={cell.p.density}>deploy</PressButton>
                  <small class="text-[11.5px] leading-[1.5] text-muted-foreground">{cell.l}</small>
                </span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </PagedFigure>
    <PagedAside><b>R1 · 2026-08-27</b> —— 语义色名退役：变体只保留形态学（fill/tonal/outline/ghost），语义色经 --jx-* 对注入。</PagedAside>
  </PagedSection>

  <PagedSection id="states" title="States">
    {#snippet lede()}消费者要样式化对抗的状态集 —— 可活体呈现的在此，hover/active/focus 的物理法则见<PagedRef target="usage" />。{/snippet}
    <PagedFigure caption="可停驻状态活体渲染；hover 只长阴影、active 下压 1px 的法则在任何姿态下都成立。">
      <div class="flex flex-wrap border border-border bg-background">
        {#each states as st, i (st.l)}
          <span class="flex {i > 0 ? 'border-l border-border' : ''} min-w-[12rem] flex-1 flex-col items-center gap-2.5 bg-muted/20 p-4">
            <PressButton variant={st.p.variant} loading={st.p.loading}>deploy</PressButton>
            <small class="text-[11px] text-muted-foreground">{st.l} — {st.note}</small>
          </span>
        {/each}
      </div>
    </PagedFigure>
  </PagedSection>

  <PagedSection id="props" title="API — props">
    {#snippet lede()}本表由 jsonSchema 反向生成（generated view）—— 密度的档位见<PagedRef target="density" />。{/snippet}
    <PropsTable meta={withAnnotations(metaWithEffect, annotations)} title="press-button props" />
    <PagedAside><b>generated view</b> —— 手写 props 表必与 schema 漂移；此表与控制条、导出同源。打印时包装层经 data-jx-props-table-scroll 解绑横向滚动。</PagedAside>
  </PagedSection>

  <PagedSection id="tokens" title="Tokens">
    {#snippet lede()}组件从样式表读取什么。注入胜于配置。{/snippet}
    <PagedTable>
      <thead><tr><th>token</th><th>default</th><th>description</th></tr></thead>
      <tbody>
        {#each tokens as t (t.token)}
          <tr><td>{t.token}</td><td>{t.def}</td><td>{t.desc}</td></tr>
        {/each}
      </tbody>
    </PagedTable>
  </PagedSection>

  <PagedSection id="a11y" title="Accessibility">
    {#snippet lede()}原生元素承载语义；组件不得重造它们。{/snippet}
    <PagedTable>
      <thead><tr><th>key / context</th><th>behavior</th></tr></thead>
      <tbody>
        {#each a11yRows as r (r.k)}
          <tr><td><kbd class="border border-border bg-background px-1.5 py-0.5 font-mono text-[11.5px]">{r.k}</kbd></td><td>{r.act}</td></tr>
        {/each}
      </tbody>
    </PagedTable>
    <ul class="mt-3 list-disc pl-5 text-[13.5px] leading-[1.7] text-muted-foreground">
      <li>leading/trailing 字形 aria-hidden —— label 车道是唯一的可访问名。</li>
      <li>loading 置 aria-disabled（仍可聚焦）—— 永不用 disabled，那会丢掉 tab 停靠。</li>
      <li>forced-colors：ButtonFace/ButtonText 退化由 press 法则继承。</li>
    </ul>
  </PagedSection>

  <PagedSection id="rulings" title="Rulings">
    {#snippet lede()}批次评审给出的、对本组件有约束力的决定。{/snippet}
    <div class="grid gap-3 sm:grid-cols-2">
      {#each rulings as r (r.b)}
        <PagedBlock avoid>
          <div class="border border-border bg-background p-3 text-[13px] leading-[1.6] {r.kind === 'do' ? 'border-l-[3px] border-l-green-700' : r.kind === 'dont' ? 'border-l-[3px] border-l-red-700' : 'border-l-[3px] border-l-amber-600'}">
            <b class="mb-1 block font-mono text-[12px] {r.kind === 'do' ? 'text-green-700' : r.kind === 'dont' ? 'text-red-700' : 'text-amber-600'}">{r.b}</b>
            {r.t}
          </div>
        </PagedBlock>
      {/each}
    </div>
  </PagedSection>

  <PagedSection id="density" title="Density">
    {#snippet lede()}车道随环境内核缩放 —— 舞台不显式盖章时继承环境。{/snippet}
    <PagedFigure caption="同一变体在 comfortable 与 compact 下的命中车道。">
      <div class="flex flex-wrap border border-border bg-background">
        <span class="flex min-w-[12rem] flex-1 flex-col items-center gap-2.5 bg-muted/20 p-4">
          <PressButton variant="tonal">deploy</PressButton>
          <small class="text-[11px] text-muted-foreground">comfortable (--jx-hit: 42px)</small>
        </span>
        <span class="flex min-w-[12rem] flex-1 flex-col items-center gap-2.5 border-l border-border bg-muted/20 p-4">
          <PressButton variant="tonal" density="sm">deploy</PressButton>
          <small class="text-[11px] text-muted-foreground">compact (density sm)</small>
        </span>
      </div>
    </PagedFigure>
    <PagedAside><b>fleet law · 2026-08-28</b> —— density 读环境内核；显式盖章切断继承，仅舞台级允许。</PagedAside>
  </PagedSection>

  <PagedSection id="print" title="Print — the projection law" break="section">
    {#snippet lede()}打印是文档树的<b>投影</b>，不是另一棵树。四个正交动词 + 一张受审计的白名单表；本节同时是 verify-print 探针的活体 fixture。{/snippet}

    <PagedTable>
      <thead><tr><th>verb</th><th>meaning</th><th>status</th></tr></thead>
      <tbody>
        {#each verbs as vb (vb.verb)}
          <tr><td><code class="font-mono">{vb.verb}</code></td><td>{vb.meaning}</td><td>{vb.status}</td></tr>
        {/each}
      </tbody>
    </PagedTable>

    <PagedFigure caption="白名单的 live fixture：每个节点同时携带 display:flex、overflow:auto 与 max-block-size:min(32rem,60vh) 三个 utility —— print/sim 投影下白名单必须全部胜出。">
      <!-- THE PROBE STRIP — the audited whitelist against three
           utilities at once (verify-print.mjs targets these nodes;
           the classes must stay authored here so tw4 emits them) -->
      <div data-jx-print-probe class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-print="hide" data-jx-print-probe-item="hide">
          <code class="font-mono text-[11.5px]">hide</code>
          <span class="text-[12px] text-muted-foreground">screen 可见；print/sim 投影下 display:none 胜过 flex</span>
        </div>
        <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-print="flatten" data-jx-print-probe-item="flatten">
          <code class="font-mono text-[11.5px]">flatten</code>
          <span class="text-[12px] text-muted-foreground">print/sim 下 overflow:visible + max-block-size:none</span>
        </div>
        <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-canvas-scroll data-jx-print-probe-item="canvas-scroll">
          <code class="font-mono text-[11.5px]">canvas-scroll</code>
          <span class="text-[12px] text-muted-foreground">既有 hook：画布滚动层解绑（含 32rem/60vh 上限）</span>
        </div>
        <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-code-card-pre data-jx-print-probe-item="code-card-pre">
          <code class="font-mono text-[11.5px]">code-card-pre</code>
          <span class="text-[12px] text-muted-foreground">既有 hook：CodeCard 的滚动口</span>
        </div>
        <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-props-table-scroll data-jx-print-probe-item="props-table-scroll">
          <code class="font-mono text-[11.5px]">props-table-scroll</code>
          <span class="text-[12px] text-muted-foreground">新增 markup 合同：PropsTable 包装层强制输出</span>
        </div>
      </div>
    </PagedFigure>

    <PagedAside><b>sim 排他</b> —— 「打印预览」戳 data-jx-print-sim；sim 投影包在 @media not print 里，真实打印时整体退出，@media print 产物独占权威。</PagedAside>

    <PagedFigure caption="freeze 的 CSS 半边：print/sim 投影下旋转姿态暂停（animation-play-state: paused）。">
      <div data-jx-print="freeze" class="flex items-center gap-3 p-2">
        <PressButton variant="tonal" loading>deploy</PressButton>
        <span class="text-[12px] text-muted-foreground">loading 姿态在投影中冻结为当前帧</span>
      </div>
    </PagedFigure>

    <PagedTable class="mt-4">
      <thead><tr><th>whitelisted selector</th><th>forced result</th></tr></thead>
      <tbody>
        {#each whitelist as w (w.selector)}
          <tr><td><code class="font-mono">{w.selector}</code></td><td><code class="font-mono">{w.forced}</code></td></tr>
        {/each}
      </tbody>
    </PagedTable>
  </PagedSection>

  <DocsSeeAlso name="press-button" />
</PagedDoc>
