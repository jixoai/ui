# Design: document-ontology R2 — 浮+引

裁决基座：openspec/changes/2026-09-02-document-ontology/design.md
（§2 原语、§3 合成法则、§5 收割合同、§7 轮次）+ 2026-09-04 grill
裁决（proposal 决策表）。本文落 API 形状、运行时机制与法则映射。

对抗审核修订（2026-09-04，三视角轮）：机制层补写（§1.1/§3.1）、
scenario 量词收窄、收割消费批次补齐、context 法则例外认领。

## 1. Section 编号树（Q3 + Q4 + Q5）

```svelte
<!-- 声明即三重身份：编号子树根 + 浮计数域 + 深层节计数重置点 -->
<Section numbering="decimal">…</Section>
<Section numbering="decimal" floatScope={{ equation: 'document' }}>…</Section>
```

- `numbering?: 'decimal'`（本期唯一 scheme；值域扩展归 R5 预设轮）。
  声明节获得章序数；**后代节无需再声明**，在域内自动续十进制树
  （3 → 3.1 → 3.2 → 3.2.1）——「未声明 = 逐字节今日行为」的现状门
  量词因此收窄为：**不在任何 numbering 域子树内的节**。域内未声明
  的后代节是编号的承受者，不是豁免者。
- `floatScope?: Partial<Record<FigureKind, 'chapter' | 'document'>>`
  ——默认全 kind `'chapter'`；`'document'` 是 ASME 式号惯例的显式
  例外。**scope 只在域级声明**（Q5：逐 Float 声明会造成计数器身份
  不可判定，禁止形状）。`floatScope` 脱离 `numbering` 单独出现 =
  无效形状，dev warn 后忽略。**document-scope 计数器身份**：该 kind
  的计数器以文档为单位唯一，只遍历「其所在域为该 kind 声明了
  document」的 Figure，起点为首个参与域的首个 Figure；混合态（部分
  域 chapter、部分域 document）下两类计数器并行存在、互不相加。
- **嵌套域**：内层再声明 `numbering` 的节，其子树构成新域——内层
  后代节编号在内层树内续（外层编号前缀不再延伸），内层子树内的
  Figure 归属**最近祖先声明域**（内层），外层浮计数不越界。
- 编号 = DOM 顺序的显示货币：换序自动重排；寻址恒走显式 `id`，
  编号永不充当地址。

### 1.1 计数解析机制（唯一许可实现）

- (a) 声明 `numbering` 的 Section 持响应式注册表；Figure 挂载注册
  `{ el, kind, id? }`、卸载注销。**注册顺序永不赋序。**
- (b) 序数是 `$derived`：读域的 `revision` $state，按
  `compareDocumentPosition` 对同域同类已注册元素排序取位次；
  `revision` 仅由域根的 MutationObserver（childList + subtree）
  bump——**DOM 增删移是重编号的唯一信号源**；effect 依赖 DOM
  位置、setTimeout 轮询均禁止。嵌套域下外层 observer 会观察到
  内层域的全部增删（双层 bump）——这是**冗余重算而非误信号**
  （Figure 归属最近域、外层序数是对 DOM 位置的纯函数，内层元素
  不在外层注册表，重算结果不变）；不要按 mutation target 过滤
  域去「修」这个不存在的 bug。
- (c) **禁止 CSS counter 方案**：pagedjs 的 Counters handler 会
  重写作者 counter 规则（本仓 verify-print 的 jx-print-line 实证：
  多块时从 −N 起算），且 counter 计算值不在 DOM、收割器读不到
  （基座 §5 法则 4）。编号必须双落为 DOM 文本 + `data-number`。
- (d) SSR 期无 MutationObserver，退化为实例化序（= 模板序 = 静态
  文档的 DOM 序）；水合首帧解析必须与 SSR 输出一致（mismatch 即
  测试失败）。CSR-only（无 SSR）场景：首帧可短暂无编号（注册序
  永不赋序的原则下，编号等 observer 首批微任务交付后解析），
  settle 后与 DOM 序一致——记档立场，不设门。
- (e) 打印时序约束：编号解析在 effect flush 级完成，禁止混入
  setTimeout/requestIdleCallback/字体 readiness gate——冻结捕获
  （DOM-commit barrier → settleTransitions → clone）时刻的编号
  ≡ live DOM 编号。

### 1.2 context 机件与法则认领

- 计数域 context：`Symbol.for('jx-numbering-domain')`，**key 由
  figure 家族持有并 module 导出**（PRESS_TEXTURE_KEY 同律）；section
  只提供，figure 消费。payload = 注册表 + `revision` 信号。
- **法则认领**：component-authoring 既有法则「State-sharing context
  SHALL carry state and behavior only — never membership order」的
  DOM-derived AUTO modes 例外（auto modes only）——Figure 编号与
  Reference 解析**声明为该例外管辖的 auto 模式**（序数派生自 DOM
  位置，非人为注册序），不新开例外口。
- 新 props（numbering/floatScope/kind/citedIn/to）均为本体/结构轴，
  **不入 Defaults、无 exemptions 条目**（对照 physics 轴写法；
  context-coverage 词表实测不含这些词，门禁无冲突）。
- `FigureKind` 类型由 figure 家族导出；section-card 的 `floatScope`
  类型引用之——registry 依赖边 section-card → figure（registryDependencies
  登记）。**reference → figure 同边登记**：显示词映射表与文档
  注册表 key 均由 figure 家族导出，Reference 消费不自建（单源，
  禁止 Reference 侧复制 kind→显示词映射）。
- **接口先行（tasks 批次 0）**：域 context key、文档注册表、
  显示词映射三件的模块落盘在 figure 家族文件夹，由整合者统一
  落盘并冻结导出签名后，批次 1/2/3 才并行——子代理不触碰该
  共享文件。

## 2. Figure 家族（Q6 + Q6a + Q8）

```svelte
<Figure kind="table" id="tbl-results" caption="实测与预测对照" citedIn={['§ 3.1']}>
  <CodeCard lang="ts">…</CodeCard>   <!-- 内容槽：任意点；R6 起逐轮落地 -->
</Figure>
```

- 渲染 `<figure data-jx-figure={kind} id?>` + `<figcaption>`：标签
  （kind 显示词，本期硬编码英文默认：Figure/Table/Equation/Listing；
  **显示词/locale/编号显示格式的定制轴归 R5 编号方案**，§6 记档）+
  解析编号 + caption 槽。
- `kind: 'figure' | 'table' | 'equation' | 'listing'`（本期四值；
  值域是收割面 registry，开放给 R6 扩展）。
- `id` 可选——无 id 仍编号（显示货币），但不可被引/不可寻址（寻址
  法则在 prop 文档注明）。**盖章器不处理 figure**（现状只盖章
  heading，不扩展）：figure 寻址只认显式 id，无 id 即不可引。
- **裸用（不在任何域内）**：不编号 + dev warn（「Figure 逃逸计数域」）
  ——与 Q3「显式声明、无隐式嗅探」一致；Tier-1 家族独立可用性 =
  可渲染、可收割 kind，只是无编号。
- **`citedIn?: string[]`（Q8 手动标注槽）**：显式声明的显示串原样
  渲染于图注尾 + 发射 `data-cited-in`（**JSON 数组序列化**，收割器
  可解析）。**缺口注释（必须落在组件头）**：自动反链渲染机件刻意
  缺席——反链的自动态只存在于收割层（引用点 refids[] 的倒排）；
  静态串不随重排更新（`§ 3.1` 换序后可能腐化——腐化压力正是回归
  动因）；回归条件 = 某体裁真要上纸面「被引清单」（届时反向注册
  context + Figure 读取，纯增量）。
- **嵌套 figure 记档**：内容槽里的 CodeCard 自带 `<figure>`+
  figcaption（文件名栏），被 Figure 包裹形成嵌套——**本期接受为
  合法形状**（CodeCard 的 figcaption 是文件名 chrome 不是图注；
  外层 Figure 拥有编号图注语义）。裸模式抑制留待消费者实证再议。
- CodeCard 的裸 figure/figcaption 形状不动（未包 Figure = 今日行为）。

## 3. Reference 家族（Q7）

```svelte
<Reference to="eq-bernoulli" />               <!-- → "Eq (4.5)" -->
<Reference to="eq-bernoulli">上式</Reference>  <!-- children 逃生门：文案换、链接留 -->
```

- **目标自述语法**：解析跟随目标——`Figure` 按其 kind 渲染
  （`Eq (4.5)` / `Fig 2-3` / `Table 6-1` / `Listing 3`），编号节
  渲染 `§ 3.2.1`，无编号目标降级渲染其**标题**（仅标题本体，无
  「参见」连接词——连接词是作者文案，走 children 逃生门）。
- **目标注册表（文档级）**：`Symbol.for` key，根布局 `setContext`；
  注册项 `{ id, kind: 'figure' | 'section', number, title }`（title
  取 Section 的 title prop；**number 是 getter/派生值引用，禁止
  注册时快照**——目标换号，引用自动跟随，这是引用跟随法则的
  机件前提）。域 context 只服务计数，**寻址一律走文档注册表**
  （跨域引用可达）。Reference 的显示形态 `$derived` 自注册表——
  前向目标后注册 → 自动跟随。**可引目标类型域**：Figure（必有
  编号——裸用无编号 Figure **不可引**，等同缺失 id 的响亮回退）∪
  编号/未编号 Section；任意裸 id 元素**本期不可引**（同前）。
- **「尚未注册」≠「不存在」**：注册表响应式——水合后目标出现即
  自动解析；**warn 仅在 settle 后目标仍缺席时触发**（避免前向引用
  的误报风暴）。
- **SSR/prerender 形态裁决**：单趟渲染期前向目标必然未注册 →
  前向引用的 SSR 形态 = `??(to)` 回退标记（同缺失态），客户端水合
  后跟随为正确形态。反向引用（目标在前）SSR 即完备。此形态差是
  显示货币法则在单向渲染下的诚实代价，spec 以 scenario 固化。
- **响亮回退语义**：缺失 id → `console.warn`（不 DEV 门控——
  prerender 走 prod build，坏引用须在产物上可见）+ 渲染 `??(to)`
  可见标记（**生产也渲染**：打印捕获的是生产 DOM，坏引用上纸面
  优于静默）；永不抛错。**缺失目标不发射 `data-ref-to`**（死锚是
  本仓已立案的 bug 类，基座 §5 法则 3）。
- 发射 `data-ref-to`（正向面：本引用点 → 目标 id）。

## 4. 收割发射与消费（R1 车道）

- 发射：figure `data-jx-figure={kind}` + `data-number` +
  `data-cited-in?`；引用点 `data-ref-to`；节 `data-jx-section`（已在）
  + `data-number`。
- **taxonomy 优先级**：被包点保留自身 kind 标记（如 CodeCard 的
  `data-kind="code"`，R1 registry）；`data-jx-figure` 标记包裹层。
  收割投影：**`number` 挂到被包块的 `block.number`**（基座 §3 推论
  1——线承载结构、点承载语义，编号随点入语料），figure 包裹层
  不单独成块。
- **消费（本轮交付）**：search-corpus.mjs 读 `data-number` /
  `data-ref-to` / `data-jx-figure` / `data-cited-in` →
  `block.number` / `block.refids[]` / `block.citedIn` / section
  `number`；行内 Reference（data-ref-to 在段落内）的 refids 挂
  **最近块根**（prose 块或点块），块级裸 Reference 不被流式遍历
  静默穿过；**tag-shape fallback 前显式排除 `data-jx-figure`
  包裹层**（裸 pre 直接子元素的误判边角）；Figure 内容槽无可投影
  子块（纯文本）时不投影 number——记档。corpus schema **加性扩展**
  （旧语料不重写），语料 sha 稳定门禁的基线随本批重生成。
  specs/search-corpus delta 随实施落档。

## 5. 测试门（design §7 R2 行）

- **「编号=显示货币」法则门**：换序后编号重排、id 不动——figure
  与 section 双夹具；**换序必须由 keyed `{#each}` 数组换序驱动**
  （`items.reverse()`）——静态标签换位是卸载重挂载的弱夹具，真实
  keyed 场景（实例保留、仅移 DOM）才是法则门的靶子；禁止使用。
- 现状门：不在域子树内的 section，DOM 逐字节等价——**基线先行**
  （实现前落 fixture 输出快照），实现后断言 outerHTML 全等 +
  无 `data-number` + 无编号文本节点。
- 解析矩阵：kind×scope×域嵌套的编号值表（含嵌套域遮蔽、document
  混合态、**多根并列域**——兄弟章节各声明根域，章序数按文档序
  递增）；引的目标自述矩阵**五态**（equation/section/无编号/
  缺失 id/前向引用 SSR 形态；无编号 Figure 与裸 id 元素同归缺失
  态）。法则门补断言：**换序后所有 Reference 显示值跟随新号**
  （引用跟随法则 + 注册项非快照的可断言证明）。
- citedIn 渲染 + JSON 发射；收割消费夹具（number/refids 进语料 +
  sha 基线重生成）；镜像逐字节；打印探针（冻结捕获编号 ≡ live DOM
  编号，含前引后浮用例）。

## 6. 范围外（记档不做）

- 反链自动渲染机件（缺口，见 §2 citedIn）；Jump 子类型（D.S. al
  coda，§8 开放问题，等 R6·music 实证）；书目引（无 bibliography
  机件）；**指向条（Entry）的引用形态归 R4**（扩展 Reference 目标
  类型域）；scheme 值域扩展与**显示词/locale/编号显示格式定制轴
  （本期硬编码英文默认）归 R5 预设**；裸 id 元素可引性（本期不可引）。
