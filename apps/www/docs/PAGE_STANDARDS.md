<!--
  jixoai-ui 文档站 · 组件文档页标准（PAGE_STANDARDS）
  意图列表（正交意图 ≤5，含原始需求与时间戳）：
  1. [2026-08-22 用户反馈] "有些子页面没有引入 ToC"（55/58 页缺）→ ToC 升级为必选项。
  2. [2026-08-22] 组件文档页的统一开发最佳实践（hero / canvas / 同源法则 / a11y / 响应式 / 一致性）。
  3. [2026-08-22] 100 分制评分体系：6 维度可打分 checklist + A/B/C/D 分级，供逐页评审。
  4. [2026-08-22] 记录已实现惯例：二级导航当前路由高亮（+layout.svelte catalog 派生）。
  事实基线（2026-08-22 扫描）：59 个路由页；56 页用 ComponentCanvas；52 页带 playground；
  57 页含 ?raw 导入；页面级 ToC rail 仅 form.html / toc.html（scaffold-float 为 demo 内嵌，
  anchor 仅文案提及）——即用户反馈的 "55/58 页缺 ToC"。
-->

# 组件文档页 · 开发最佳实践 + 评分体系

适用范围：`src/routes/components/*.html/+page.svelte`（registry 组件页 + overview/recipes 指南页）。
基准实现：`form.html`（最完整：ToC + 多 canvas + live usage）、`tabs.html` / `tour.html`（近期标准单页）、`popover.html`（中期过渡形态）。

---

## 1. 页面解剖图

```
.jx-shell (website-scaffold, h-100dvh)
└─ .jx-shell-body                    ← 页面真正的滚动容器（overlay shell）
   └─ main#main
      └─ 页面容器 (max-w-[90rem] mx-auto)
         │
         │  ┌─ 无 ToC 页（不合规形态，仅对照）────────────────────┐
         │  │ <div class="mx-auto flex w-full max-w-[90rem]      │
         │  │   flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">      │
         │  └────────────────────────────────────────────────────┘
         │
         └─ ┌─ 标准形态（ToC 必选）──────────────────────────────────┐
            │ <div class="mx-auto w-full max-w-[90rem] px-4 py-10   │
            │   sm:px-6 lg:grid                                      │
            │   lg:grid-cols-[minmax(0,1fr)_15rem]  ← 桌面右列 rail  │
            │   lg:items-start lg:gap-10 lg:px-8">                   │
            │                                                        │
            │  ① <aside class="jx-toc-aside lg:order-2"              │
            │        aria-label="On this page">        ┌─────────┐   │
            │     <Toc sections={tocSections}          │ ToC rail │   │
            │       title="on this page"               │ ≥900px  │   │
            │       scrollRoot=".jx-shell-body" />     └─────────┘   │
            │     （DOM 先于正文；移动端 = header 下玻璃条）          │
            │                                                        │
            │  ② 内容列 <div class="flex min-w-0 flex-col gap-8      │
            │        max-lg:pt-[68px] lg:order-1">  ← 移动端 rail 净高│
            │  ┌──────────────────────────────────────────────────┐ │
            │  │ ③ HERO  <div data-reveal use:reveal>             │ │
            │  │    SectionCard headingLevel={1} tone="hero"      │ │
            │  │      eyebrow="registry:ui · <Category>"          │ │
            │  │      title="<name> — <一句话主张>"               │ │
            │  │      summary="<3-6 句工程叙事>"                   │ │
            │  │      children: pills ×3-5                        │ │
            │  └──────────────────────────────────────────────────┘ │
            │  ┌──────────────────────────────────────────────────┐ │
            │  │ ④ WORKBENCH  ComponentCanvas（≥1 个）            │ │
            │  │    header:  title + description + Source 按钮     │ │
            │  │    stage:   children snippet = LIVE 实例          │ │
            │  │    pane:    playground snippet（控件 + help）      │ │
            │  │             + echo 状态页脚 + reset                 │ │
            │  │    drawer:  tree-view + code-card（?raw 同源）      │ │
            │  └──────────────────────────────────────────────────┘ │
            │  ┌──────────────────────────────────────────────────┐ │
            │  │ ⑤ DEMO×N  <div id="<slug>" data-reveal>           │ │
            │  │    SectionCard family/headerRegion="<slug>"       │ │
            │  │      eyebrow="demo" + 变体矩阵 + CodeBlock usage   │ │
            │  └──────────────────────────────────────────────────┘ │
            │  ┌──────────────────────────────────────────────────┐ │
            │  │ ⑥ LAW 收尾  SectionCard eyebrow="law"             │ │
            │  │    （或 "NativeHTML 基座"：平台给了什么/我们加了什么）│ │
            │  └──────────────────────────────────────────────────┘ │
            └────────────────────────────────────────────────────────┘
```

配套（页面顶部）：

```
<svelte:head>
  <title><Name> · jixoai-ui</title>
  <meta name="description" content="<组件一句话 + 关键特性关键词>" />
</svelte:head>
```

---

## 2. 模板骨架（可直接复制）

```svelte
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import Thing from '$lib/ui/thing.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // ---- 同源法则：drawer 展示本站正在运行的同一份 registry 源码 ----
  import thingSource from '$lib/ui/thing.svelte?raw';

  // 模板字符串里的字面 </script> 会终止本组件自身的 script 扫描 —— 拼接它
  const close = '</' + 'script>';

  // ---- ToC 大纲：与正文 id 一一对应，按页面顺序 ----
  const tocSections = [
    { id: '<slug>', label: '<人类可读标题>' },
    // ...
  ];

  // ---- usage 片段：页面只维护这一份 const（多处引用，禁止复制粘贴）----
  const usage = `<script lang="ts">
  import Thing from '@ui/thing.svelte';
${close}

<Thing prop="value" />`;

  const files: TreeFile[] = [
    { name: 'registry/files/ui/thing.svelte', content: thingSource },
    { name: 'src/lib/ui/thing-usage/thing-usage.svelte', content: usage },
  ];

  // ---- playground 协议：页面拥有状态；canvas 只回调 ----
  const canvasInitial = { prop: 'value' as string };
  let canvasProp = $state(canvasInitial.prop);
  function resetCanvas(): void {
    canvasProp = canvasInitial.prop;
  }
  // 免费文本必须经 q() 转成合法字符串字面量（引号/撇号/换行都安全）
  const q = (value: string): string => JSON.stringify(value);
  const usageLive = $derived(`<Thing prop=${q(canvasProp)} />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<svelte:head>
  <title>Thing · jixoai-ui</title>
  <meta name="description" content="…" />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail：DOM 先于正文；桌面 sticky 右列，移动端玻璃条（height:0，见 toc.css） -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
    <!-- ① hero -->
    <div data-reveal="" use:reveal>
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · <Category>"
        title="thing — <一句话主张>"
        summary="<3-6 句：做什么、边界在哪、为什么这样设计>"
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">capability a</span>
          <span class="pill">capability b</span>
          <span class="pill">capability c</span>
        </div>
      </SectionCard>
    </div>

    <!-- ② workbench -->
    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="thing"
        description="<一行：演示什么、评审者该操作什么>"
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/thing.svelte"
        {files}
        onreset={resetCanvas}
        echo={[{ label: 'prop', value: canvasProp || '—' }]}
        resolveFileContent={resolveUsage}
      >
        <Thing prop={canvasProp} />
        {#snippet playground()}
          <div class="jx-play-fields">
            <div class="jx-play-field"><!-- jixoai 表单基座控件 --></div>
            <p class="jx-play-help"><!-- 引导文案：键盘路径/边界行为 --></p>
          </div>
        {/snippet}
      </ComponentCanvas>
    </div>

    <!-- ③ demo × N：id（锚点）+ family/headerRegion（ToC 区段）三位同名 -->
    <div id="<slug>" data-reveal="" use:reveal>
      <SectionCard
        family="<slug>"
        headerRegion="<slug>"
        eyebrow="demo"
        title="<变体/场景标题>"
        summary="<这一段演示什么>"
      >
        <!-- 变体矩阵 + <CodeBlock code={usage} lang="svelte" meta="usage" /> -->
      </SectionCard>
    </div>

    <!-- ④ law 收尾 -->
    <div data-reveal="" use:reveal>
      <SectionCard headerRegion="<slug>" eyebrow="law" title="<设计法则>">
        <!-- 平台给了什么 / 我们加了什么 -->
      </SectionCard>
    </div>
  </div>
</div>
```

复合组件页（form.html 形态）：② 区为每个核心控件一个 canvas（各自独立的 state + reset + echo + live usage），③ 区保持 SectionCard 目录。多个同名 canvas 必须传显式 `id` prop 防止 slug 撞车。

---

## 3. ToC 集成规范（必选项）

### 3.1 数据结构

```ts
// toc.svelte 契约
interface TocSection { id: string; label: string; children?: TocChild[] }
interface TocChild  { id: string; label: string }
```

- `sections` 按页面渲染顺序排列；`label` 用人类可读标题（非 slug）。
- 二级导航（站头 mega menu）**不在此处** —— 它由 `+layout.svelte` 的 `catalogByGroup()` 派生，`active` 字段按 normalized pathname 精确匹配（`normalized === entry.href…`），当前路由高亮已实现且由 catalog 单一信源保证：新页面只要进 catalog，菜单与高亮自动跟上。此为已定惯例，页面侧零工作。

### 3.2 data-region / data-family 标注规则（toc-engine 契约）

```
正文标记                     ToC 大纲                 引擎行为
─────────────────────────────────────────────────────────────────
data-region="<id>"     ↔    { id }          叶子：非重叠的 heading→heading 块
data-family="<id>"     ↔    { id }（父级）    家族：覆盖整个父区段的外延
                                          （供 spine/刻度面使用）
```

- **叶子必须非重叠**：`SectionCard` 的 `headerRegion` prop 只在 header 块上打 data-region（当 body 内还有子 region 时，按构造即非重叠）；`region` prop 在整个 section 根上打（body 无子 region 时用）。
- **三位同名**：外层 `<div id="<slug>">`（锚点着陆）= `family="<slug>"` = `headerRegion="<slug>"` = `sections[i].id`。命名一律 kebab-case，与 section 标题对应。
- 线算法（margin-downward law）：落在两块之间 margin 的线属于下方块；越到最后一个 region 后，最后 region 保持标记。锚点 `scroll-margin-top` 由 ToC 发布的 `--jx-toc-line` 对齐 —— 页面不要另写 scroll-margin。

### 3.3 scrollRoot 场景（overlay shell）

本站是 `.jx-shell-body` 内滚（不是 window 滚动）的 overlay 架构，**必须**：

```svelte
<Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
```

漏传 scrollRoot 的症状：进度脊线不动、pick 永远停第一项（引擎监听 window scroll 而实际滚动发生在 shell body）。

### 3.4 布局强制项

| 项 | 值 | 原因 |
|---|---|---|
| aside 位置 | DOM 先于正文，`class="jx-toc-aside lg:order-2"` | 移动端玻璃条需在内容前渲染；桌面 order 归位右列 |
| 页面网格 | `lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10` | rail 15rem 定宽列 |
| 内容列补偿 | `max-lg:pt-[68px]` | 移动端 header 下 44px 玻璃条 + 间距；漏掉则首屏内容被 rail 盖住 |
| aside aria | `aria-label="On this page"` | 组件内已有 nav label，aside 层补语境 |

⚠️ 已知耦合：`max-lg:pt-[68px]` 与 `toc.css` 的 44px 行高 + scaffold header 几何联动，是魔数。改 header/rail 高度时须全局搜 `pt-[68px]` 同步。

---

## 4. ComponentCanvas 使用规范

### 4.1 Props 速查

| Prop | 必填 | 说明 |
|---|---|---|
| `title` | ✓ | canvas 头部组件名（h2，slug 派生 aria id 的种子） |
| `description` | 建议 | 一行演示说明（62ch 上限自动折行） |
| `sourceUrl` | 建议 | GitHub `registry/files/ui/` 真实文件链接（Source 外链按钮） |
| `files` | ✓ | `TreeFile[]` 扁平列表，name 带 `/` 即成目录树 |
| `children` | ✓ | LIVE 舞台：渲染真实组件实例 |
| `playground` | 大多数页 | 控件面板 snippet（`.jx-play-fields/-field/-help` 布局契约类） |
| `onreset` | 配 playground | 页面拥有的重置回调；出现即渲染 reset 按钮 |
| `echo` | 配状态 | 只读终端式 key/value 页脚，替代手写 "bound value" 说明行 |
| `resolveFileContent` | 配 live usage | drawer 内容解析器，让 usage 文件实时跟随 playground 状态 |
| `id` | 撞车时 | 同页两个 canvas title slug 化相同时显式传 |

### 4.2 何时用 / 不用 playground

```
用 playground：
  · 组件有可变 props（variant/label/size/开关…）→ 控件直改真实 props
  · 需要键盘路径/边界行为引导 → .jx-play-help 文案（tour.html 即纯 help 形态）
不用 playground（仍要有 canvas）：
  · 组件完全静态（纯展示）→ 仅 stage + files
  · 多 canvas 复合页里非核心控件的次级展示
```

### 4.3 Playground 协议（P1，页面拥有状态）

```ts
const canvasInitial = { … };            // ① 初始快照（const，可整体对照）
let x = $state(canvasInitial.x);        // ② 状态全在页面
function resetCanvas() { x = canvasInitial.x; }   // ③ reset 回写快照
const q = (v: string) => JSON.stringify(v);       // ④ 免费文本 → 合法字面量
const usageLive = $derived(`…${q(x)}…`);          // ⑤ live usage（读当前状态）
const resolve = (f: TreeFile) =>                    // ⑥ 命名 resolver：惰性读
  f.name.endsWith('usage.svelte') ? usageLive : f.content;
```

- echo 是**只读投影**、刻意不做 live region（Range/input 逐帧刷会淹没读屏）；需要播报的状态走组件自身语义。
- `usageLive` 必须经 `q()` 注入用户输入，杜绝 `O'Reilly`/引号打断生成源码。

### 4.4 files 同源法则

```
✔ files = [
    { name: 'registry/files/ui/thing.svelte',  content: thingSource },  // ?raw 导入
    { name: 'src/lib/ui/thing-usage/thing-usage.svelte',   content: usage },        // 页面维护的唯一样本
  ]
✘ 手抄一份组件源码放进 drawer（与站点运行的代码漂移）
✘ usage 字符串复制两份分别喂 canvas 和 CodeBlock
```

- **同源**约束的是组件源码：必须 `import thingSource from '$lib/ui/thing.svelte?raw'`，name 用 `registry/files/ui/…` 前缀。
- **单源**约束的是 usage 样本：页面只维护一个 const；CodeBlock 与 canvas 复用同一引用（press-button.html 为正例）。
- usage 文件名以 `-usage.svelte` 结尾：drawer 默认选中它（canvas 内置偏好）。
- 含 `<script>` 的模板串必须用 `const close = '</' + 'script>';` 拼接（否则 HTML 层扫描提前终止本组件 script）。
- 例外：`recipes.html` 等指南页展示的是模式而非组件本体，允许纯手写样本，但每段须可运行。

---

## 5. 评分体系（100 分制）

逐页打分：每项按"全得 / 半得 / 零得"计，证据必须是源码行或运行行为，不接受"应该有"。

### S1 结构完整（24 分）

| # | 检查项 | 分 |
|---|---|---|
| S1.1 | hero 为 `SectionCard headingLevel={1} tone="hero"`，含 eyebrow（`registry:ui · <Category>`）+ title + 3-6 句 summary | 4 |
| S1.2 | hero children 内 pills 行（3-5 个 `<span class="pill">`） | 2 |
| S1.3 | **ToC 存在**：`Toc` 挂 `aside.jx-toc-aside`（DOM 先于正文）+ `scrollRoot=".jx-shell-body"` + 内容列 `max-lg:pt-[68px]` + 15rem 右列网格 | 6 |
| S1.4 | `sections` 与正文 `id`/`data-region(headerRegion)`/`data-family` 一一对应且顺序一致，叶子非重叠，三位同名 | 4 |
| S1.5 | ≥1 个 `ComponentCanvas`（复合组件页：每个核心控件一个） | 4 |
| S1.6 | `svelte:head` 含 `<title>` 与 meta description（描述含组件关键词） | 2 |
| S1.7 | 页尾有 law/基座收尾段（`eyebrow="law"` 或 "NativeHTML 基座"：平台给出 vs 我们增加） | 2 |

### S2 交互演示质量（20 分）

| # | 检查项 | 分 |
|---|---|---|
| S2.1 | stage 为 LIVE 组件实例（非截图、非纯代码、非"假按钮"） | 4 |
| S2.2 | playground snippet 存在且控件直改真实 props（静态组件改为 help 引导形态） | 4 |
| S2.3 | 页面拥有状态：`canvasInitial` 快照 + reset 函数 + `onreset` 接线 | 4 |
| S2.4 | `echo` 投影就位；正文无手写 "bound value: …" 说明行（被 echo 取代的旧写法） | 4 |
| S2.5 | live usage：`$derived` 生成 + `q()` 转义 + `resolveFileContent` 惰性接线（无 playground 的静态页改为静态 usage const） | 4 |

### S3 代码同源（16 分）

| # | 检查项 | 分 |
|---|---|---|
| S3.1 | 组件源码走 `?raw` 导入，TreeFile name 用 `registry/files/ui/` 前缀 | 4 |
| S3.2 | usage 文件以 `-usage.svelte` 结尾（drawer 默认打开它） | 2 |
| S3.3 | 无手抄组件源码副本；usage 样本全页仅一份 const，多处复用引用 | 4 |
| S3.4 | 含 `</script>` 的模板串用 `close` 拼接技巧 | 2 |
| S3.5 | `sourceUrl` 指向仓库真实文件路径 | 2 |
| S3.6 | CodeBlock 仅放 usage/契约说明，不重复 drawer 已有内容 | 2 |

### S4 可访问性（16 分）

| # | 检查项 | 分 |
|---|---|---|
| S4.1 | heading 层级：全页唯一 `<h1>`（hero）；SectionCard 默认 h2；正文小节 h3 —— 无跳级、无靠样式造标题 | 4 |
| S4.2 | demo 全键盘可达：Tab 序完整、弹层关贳后焦点归还、focus-visible 未被摘除 | 4 |
| S4.3 | aria 卫生：装饰符/图标 `aria-hidden="true"`；canvas/组件内置 aria（aria-expanded/controls/labelledby）未被页面破坏 | 4 |
| S4.4 | 动效尊重 `prefers-reduced-motion`（组件/reveal 已内置即可；页面不得新增无减免动画） | 4 |

### S5 响应式（12 分）

| # | 检查项 | 分 |
|---|---|---|
| S5.1 | ToC 双形态可用：桌面 rail 不溢出、移动玻璃条不盖内容（3.4 布局强制项全对） | 4 |
| S5.2 | demo 内容自适应：`flex-wrap` / `min-[760px]:grid-cols-*` / 容器查询思维，不写死像素宽 | 4 |
| S5.3 | 页面容器标准：`max-w-[90rem]` + `px-4 sm:px-6 lg:px-8`；ToC 页网格列参数与模板一致 | 4 |

### S6 一致性（12 分）

| # | 检查项 | 分 |
|---|---|---|
| S6.1 | eyebrow 措辞符合词表：hero `registry:ui · <Category>`；正文 `demo` / `law` / `composition` | 4 |
| S6.2 | pills 措辞：小写、能力式（capability）短语，非营销词；标点用 `·` 分隔子句 | 2 |
| S6.3 | 区段命名一致：section id = family = headerRegion = ToC id（kebab-case） | 2 |
| S6.4 | 每个顶层块 `data-reveal="" use:reveal` 包裹；正文小节 h3 措辞样式统一（`font-nav` 或既有 h3 惯例二选一，全页一种） | 2 |
| S6.5 | 语言惯例：正文英文；法则段允许中文标题（如 "NativeHTML 基座"） | 2 |

### 分级

```
A  90-100  示范级   —— 可作为新页参考实现；截图进 showcase
B  75-89   达标     —— 合入；遗留项记 TODO
C  60-74   需改进   —— 限期补齐 ToC/canvas/同源硬项后再评
D  <60     必须重写 —— 按模板骨架重建
```

一票否决（直接 C 封顶）：缺 ToC rail（S1.3 零得）、stage 非真实实例、组件源码为手抄副本。

---

## 6. 常见反模式（本仓实测）

| 反模式 | 实测 | 正解 |
|---|---|---|
| **缺 ToC** | 59 页中仅 form/toc 有页面级 rail（scaffold-float 为 demo 内嵌、anchor 仅文案提及）；即用户反馈的 55/58 缺失 —— 本标准的直接起因 | 模板骨架 §2 ① 区整块引入 |
| 漏 `scrollRoot=".jx-shell-body"` | 最易漏的 ToC 参数 | §3.3；症状是 pick 不动 |
| 手写 "value: …/last action: …" 说明行 | press-button / tabs 的 stage 内 | 换 `echo` 投影（S2.4） |
| usage 快照不随 playground | 无 `resolveFileContent` 的页面 drawer 显示初始值 | §4.3 五步协议 |
| 免费文本直拼模板串 | `O'Reilly`/引号即产出非法源码 | 一律 `q()` = `JSON.stringify` |
| heading 层级错 | 页面自造 `<h3 class="font-bold …">`（form.html 正文小节 `text-[15px] font-bold` vs popover 页 `font-nav text-[13px]` 两种风格并存） | 统一 h3 惯例（S6.4），层级 1→2→3 不跳 |
| 无 canvas 的纯 CodeBlock 页 | 尚未出现（56/59 已有 canvas），守门 | S1.5 必选项 |
| 同一 usage 复制多份 | 早期页面曾复制 | 单 const 多引用（S3.3） |
| `</script>` 字面量写进模板串 | 会终止组件自身 script 扫描 | `const close = '</' + 'script>';` |
| canvas slug 撞车 | 同页同 title 两 canvas → aria id 冲突 | 显式 `id` prop |
| 移动端内容被 ToC 玻璃条遮盖 | 漏 `max-lg:pt-[68px]` | §3.4 表格 |
| 菜单与页面脱节 | 历史问题，已修复 | 挂 `catalogByGroup()` 单信源（+layout.svelte），页面只需存在于 catalog |

---

## 7. 评审流程（30 秒/页速查）

```
1. grep ToC        → S1.3 有无 rail + scrollRoot
2. grep ComponentCanvas / ?raw → S1.5 / S3.1
3. 看 hero 块      → S1.1/S1.2/S6.1
4. 数 <h1>         → S4.1
5. 开页面 Tab 一遍  → S2/S4.2
6. 缩到 <900px     → S5.1
7. 对照表格逐项打分 → A/B/C/D
```

证据留存：评审结论附在页面 PR 描述，格式 `S1.3 ✗ (无 scrollRoot) · S2.4 ✗ (手写 value 行) → 68/C`。
