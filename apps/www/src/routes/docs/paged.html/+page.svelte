<!--
  /docs/paged.html — the print-pipeline capability page
  (print-pipeline, 2026-08-30). REDONE as a NORMAL docs page: the
  retired Paged* publication family is gone, this page is a standard
  staged-docs page (SectionCard sections + CodeBlock) that DOCUMENTS
  the print layer and EATS IT (the whole content root rides inside
  PrintDoc; the controls bar drives the real pipeline).

  The page doubles as the verify-print fixture surface:
  - the dual-slot CSS animation fixture (two named animations,
    non-zero original delays, distinct currentTimes — the per-slot
    frame-transfer probe),
  - the pre-paused / alternate / finished / WAAPI fixtures (the six
    diagnostic codes' continue-not-reject surface),
  - the audited whitelist probe strip (three utilities riding one
    node — flex + overflow-auto + max-block-size),
  - the plain <pre> (the clone-side line splitting + gutter),
  - h2[id] sections (the injected ToC page's entries).
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';

  // the long sample: enough lines to force real pagination (the ToC's
  // target-counter numbers only mean something across page breaks)
  const longSample = Array.from({ length: 56 }, (_, i) =>
    `${String(i + 1).padStart(2, '0')} · print is a projection of the document tree — freeze, clone, chunk`,
  ).join('\n');

  const transactionSample = `import { PrintDoc, PrintControls } from '$lib/print';

<!-- the source root: medium + plugin root + the pipeline -->
<PrintDoc>
  <div data-jx-print="hide"><PrintControls /></div>
  <section id="usage"><h2>Usage</h2> … </section>
</PrintDoc>

// the controls drive TWO exits over ONE artifact:
//   sim          stamp → prepareSnapshot → preview → paper overlay
//   direct print prepareSnapshot → preview → window.print() → afterprint`;

  const configSample = `const page: PrintPageConfig = {
  size: 'A4',                                            // or { width, length, unit }
  margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' },
  marks: undefined,                                      // 'crop' | 'cross' | 'both'
  footer: { 'bottom-left': 'counter(page)',
            'bottom-right': 'counter(pages)' },
};
// parsePageConfig(page) validates (negatives, unknown units, illegal
// enums rejected — no @page rule emitted); compilePageCss(page)
// emits the kernel stylesheet. No string concatenation anywhere.`;

  // the TALL CodeBlock (Owner r7): a card taller than one page — the
  // fragmentability fixture. The card's figure is flex on screen (the
  // site's figure law); the projection returns it to block flow so
  // pagedjs can split the body and the tail never vanishes behind the
  // sheet's overflow clip
  const tallSample = Array.from({ length: 120 }, (_, i) => {
    const kind = i % 3;
    const body =
      kind === 0
        ? `function shard${i}(doc: Node): Node { return doc; }`
        : kind === 1
          ? `const page${i} = await render(chunk, { size: 'A4' });`
          : `// line ${i}: the fragment flows to the next sheet, nothing swallowed`;
    return body.padEnd(64, ' ');
  }).join('\n');

  // the WAAPI fixture: element.animate is not transferable — the
  // transaction continues with a structured diagnostic row
  let waapiHost = $state<HTMLElement | undefined>(undefined);
  $effect(() => {
    const host = waapiHost;
    if (!host || typeof host.animate !== 'function') return;
    const anim = host.animate(
      [
        { opacity: 0.25, transform: 'translateX(0)' },
        { opacity: 1, transform: 'translateX(10px)' },
      ],
      { duration: 2400, iterations: Infinity },
    );
    return () => anim.cancel();
  });
</script>

<svelte:head>
  <title>Paged Print · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai-ui print pipeline: one prepareSnapshot transaction (scoped animation capture, DOM-commit barrier, readiness gate, deep clone, per-slot CSS frame transfer), one paged.js artifact serving both exits — the sim preview and direct print — with kernel-real margin boxes and ToC page numbers, and the audited print-verb whitelist migrated into kernel-print.css."
  />
</svelte:head>

<!-- The print layer lives in routes/docs/+layout.svelte (ONE PrintDoc
     + the controls strip for every docs page); this page ships CONTENT
     and its page grammar as +page.ts data (printConfig). The page
     still eats its own dog food — the layer above wraps these very
     fixtures. -->
<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <!-- Intro -->
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="docs · print"
        title="paged print — one pipeline, two exits, zero web change"
        summary="打印不是另一棵树。现有文档页的网页流原样不动；打印层把内容根冻结成一份快照（live 干预 → 动画暂停 → 深克隆），把这份脱离 live tree 的克隆交给 paged.js 内核——sim 预览与直接打印共用同一份完成产物。"
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">prepareSnapshot 事务</span>
          <span class="pill">per-slot 帧转移</span>
          <span class="pill">kernel-real 页码</span>
          <span class="pill">懒加载 · SSR 零 pagedjs</span>
          <span class="pill">白名单正式迁转</span>
        </div>
      </SectionCard>
    </div>

    <!-- The transaction -->
    <div id="transaction" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="The transaction"
        summary="prepareSnapshot 是一个事务：预备媒介信号（sim 开关盖章 / 直接打印按所有权盖章）→ 插件干预落 live（density→sm、hue→钉缺省）→ 作用域动画捕获（只枚举 source 根 subtree，仅暂停 running 项）→ double-rAF 的 DOM-commit 屏障（断言干预 stamp 已落，失败 fail-loud）→ readiness 门（字体/图片/懒加载解除，超时预算带进度与取消）→ 深克隆 → 只染克隆的变换 → 幂等 restore token 恢复 live 动画。"
      >
        <CodeBlock code={transactionSample} lang="svelte" meta="the layer, assembled" />
      </SectionCard>
    </div>

    <!-- Animation protocol -->
    <div id="animation" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="protocol"
        title="Animation protocol"
        summary="CSS 动画的相位按槽位转移到克隆上：delay′ = (c < d) ? (d − c) : −((c − d) mod D)——c 是捕获的 currentTime，d/D 是该槽的 computed delay/duration；写入 animation-play-state: paused + 逐槽组合的 animation-delay。WAAPI/JS 不可转移：结构化诊断行（sim 渲染 / 直接打印记 artifact metadata + console），事务继续不拒绝。"
      >
        <div class="flex flex-col gap-3">
          <!-- THE DUAL-SLOT FIXTURE: ONE element carrying TWO named
               animations (non-zero original delays, distinct
               durations → distinct currentTimes) — the verify-print
               per-slot computed-phase probe reads this node (do not
               split the animations onto separate elements) -->
          <div
            data-jx-print-fx="dual"
            class="flex items-center gap-3 border border-border bg-background p-3"
          >
            <span class="size-3 rounded-full bg-primary" data-jx-print-fx-dot="a"></span>
            <span class="size-3 rounded-full bg-primary/60" data-jx-print-fx-dot="b"></span>
            <code class="font-mono text-[11.5px]">dual-slot fixture — jx-fx-a −0.8s/4s · jx-fx-b −2.7s/6.5s</code>
          </div>
          <div class="flex flex-wrap gap-3">
            <!-- pre-paused: never touched, never resumed -->
            <div
              data-jx-print-fx="prepaused"
              class="flex items-center gap-2 border border-border bg-background px-3 py-2"
            >
              <span class="size-2.5 rounded-full bg-muted-foreground" data-jx-print-fx-dot="paused"></span>
              <code class="font-mono text-[11px]">pre-paused — currentTime 不被扰动</code>
            </div>
            <!-- alternate: phase formula does not model direction flips -->
            <div
              data-jx-print-fx="alternate"
              class="flex items-center gap-2 border border-border bg-background px-3 py-2"
            >
              <span class="size-2.5 rounded-full bg-muted-foreground/70" data-jx-print-fx-dot="alt"></span>
              <code class="font-mono text-[11px]">alternate — 诊断行</code>
            </div>
            <!-- finished: c ≥ d + D·N -->
            <div
              data-jx-print-fx="finished"
              class="flex items-center gap-2 border border-border bg-background px-3 py-2"
            >
              <span class="size-2.5 rounded-full bg-border" data-jx-print-fx-dot="fin"></span>
              <code class="font-mono text-[11px]">finished — 诊断行</code>
            </div>
            <!-- WAAPI: element.animate, not transferable -->
            <div
              bind:this={waapiHost}
              data-jx-print-fx="waapi"
              class="flex items-center gap-2 border border-border bg-background px-3 py-2"
            >
              <code class="font-mono text-[11px]">WAAPI — 诊断行（不 throw）</code>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Stylesheet separation -->
    <div id="stylesheet" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="stylesheets"
        title="Three sources, one kernel"
        summary="kernel-print.css 是唯一喂给内核的站点样式（白名单表 + 意图头 + 代码换行/行号 + 目录页规则）；@page 规则由 PrintPageConfig 编译；sim-shell.css 是文档侧的另一半（sim 纸张 chrome、standby 离屏、真打印时隐藏 app 根）——绝不出现在 preview() 入参里（AST gate + runtime spy 双检）。"
      >
        <CodeBlock code={configSample} lang="ts" meta="the page grammar" />
      </SectionCard>
    </div>

    <!-- Verbs + whitelist -->
    <div id="verbs" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="projection"
        title="Print verbs & the audited whitelist"
        summary="hide / flatten 是受审计的白名单动词——unlayered :where() 零特异性、位置在 utilities 层之外，胜过同节点上的任何 utility。下面的探针条同时携带 display:flex、overflow:auto 与 max-block-size 三个 utility，分页产物里白名单必须全部胜出。"
      >
        <!-- THE PROBE STRIP — the audited whitelist against three
             utilities at once (verify-print targets these nodes; the
             classes must stay authored here so tw4 emits them) -->
        <div data-jx-print-probe class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-print="hide" data-jx-print-probe-item="hide">
            <code class="font-mono text-[11.5px]">hide</code>
            <span class="text-[12px] text-muted-foreground">screen 可见；分页产物中 display:none 胜过 flex</span>
          </div>
          <div class="flex items-center gap-2 overflow-auto [max-block-size:min(32rem,60vh)]" data-jx-print="flatten" data-jx-print-probe-item="flatten">
            <code class="font-mono text-[11.5px]">flatten</code>
            <span class="text-[12px] text-muted-foreground">产物中 overflow:visible + max-block-size:none</span>
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
            <span class="text-[12px] text-muted-foreground">markup 合同：PropsTable 包装层强制输出</span>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Code + gutter -->
    <div id="gutter" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="code"
        title="Line wrapping & the numbered gutter"
        summary="克隆变换把纯文本 pre 拆成行 span（活 DOM 零接触）；内核样式表让行换行并携带行号槽——lineNumbers 配置位随事务走。这段长样本同时 forcing 分页，让目录页的 target-counter 页码落在真页码上。"
      >
        <pre data-jx-print-sample class="overflow-auto border border-border bg-background p-3 font-mono text-[11.5px] leading-[1.6]"><code>{longSample}</code></pre>
        <p class="text-[13px] leading-[1.7] text-muted-foreground">
          下面这张卡超过一页：屏幕上 figure 是 flex 列，投影把它放回块流——分页引擎能在卡身内断开，溢出的行流到下一页，不会被页盒裁掉。
        </p>
        <CodeBlock code={tallSample} lang="ts" meta="the tall card — fragmentability fixture" />
      </SectionCard>
    </div>

    <!-- The ToC page -->
    <div id="toc" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="toc"
        title="The injected ToC page"
        summary="web 目录是站点自己的；打印目录由克隆变换注入——nav 条目 = h2[id] 序，页码经 target-counter 由内核回填为真页码。sim 态点击行为被接管（滚动到对应页），不依赖原生锚点（id 在源与产物间重复）。"
      >
        <p class="text-[13.5px] leading-[1.7] text-muted-foreground">
          打开「打印预览」后，产物首页的目录列出了本页全部小节与其真实页码——它们是分页引擎算出来的，不是估算。
        </p>
      </SectionCard>
    </div>
  </div>
</div>

<style>
  /* THE ANIMATION FIXTURES — verify-print's computed-phase probe reads
     these exact slots. ONE host carrying TWO named animations
     (non-zero original delays, distinct durations → distinct
     currentTimes) — the per-slot transfer writes a two-entry
     animation-delay list on this element's clone. */
  [data-jx-print-fx='dual'] {
    animation: jx-fx-a 4s linear -800ms infinite, jx-fx-b 6.5s linear -2.7s infinite;
  }
  [data-jx-print-fx='prepaused'] [data-jx-print-fx-dot='paused'] {
    animation: jx-fx-a 3s linear -1.2s infinite;
    animation-play-state: paused;
  }
  [data-jx-print-fx='alternate'] [data-jx-print-fx-dot='alt'] {
    animation: jx-fx-a 3s ease-in-out -1s infinite alternate;
  }
  [data-jx-print-fx='finished'] [data-jx-print-fx-dot='fin'] {
    animation: jx-fx-c 0.4s linear 100ms 2 forwards;
  }
  @keyframes jx-fx-a {
    0%,
    100% {
      opacity: 0.25;
      transform: scale(0.75);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  @keyframes jx-fx-b {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(8px);
    }
  }
  @keyframes jx-fx-c {
    from {
      opacity: 0.2;
    }
    to {
      opacity: 0.9;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    /* the fixtures still run: they are probe surface, not ambient
       motion — the print transaction freezes them at capture */
  }
</style>
