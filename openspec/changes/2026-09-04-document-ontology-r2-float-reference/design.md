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
- (b) 序数是 `$derived`：读域的 `domainRevision` $state，按
  `compareDocumentPosition` 对同域同类已注册元素排序取位次。

### 1.1b Section 编号算法（P1-1 冻结）

- **记录形状**：域内注册表收 `SectionRecord { el }` 与
  `FigureRecord { el, kind, id? }` 两类；**文档级域注册表**收
  `DomainRecord { el, parentDomain: DomainRecord | null }`（每个
  声明 `numbering` 的根各一条；顶层根 `parentDomain = null`，
  嵌套域指向其外层域）。
- **`deriveSectionNumber()`（唯一算法）**：
  1. 根域章序数 = 该域的 `DomainRecord` 在文档级域注册表中**仅
     过滤 `parentDomain === null` 的顶层根**、按
     `compareDocumentPosition` 的位次（多根并列即文档序递增；
     嵌套域虽登记但不参与章序数——这是「兄弟根为 2」与「每个
     声明根各一条」同时成立的闭合规则）；
  2. 后代节编号 = `根章序数` + `.` + **结构路径**——结构父级 =
     最近祖先 **Section 宿主元素**（section-card 的根元素，非
     heading；heading 是显示，不承载结构）；
  3. 同一结构父级下的子节位次 = 同父级已注册 SectionRecord 按
     `compareDocumentPosition` 的位次（深度优先等价于文档序）；
  4. 嵌套声明域（**数值裁决**）：内层根编号 = **局部重新起算的
     `1`**（不取文档 registry 位次），后代 `1.1`、`1.2`；内层根
     **不登记进外层的 SectionRecord 集合**（它是根，不是外层
     后代——外层其余子节点的位次不受内层存在影响）；内层子树
     Figure 归内层。数值样例：外层根 `1`（子 `1.1` = 嵌套根
     `1`，孙 `1.1`），外层根后的兄弟根 = `2`（按文档级 registry
     位次；嵌套域不消耗兄弟根序数）。
- **document-scope 的域发现**：全篇连续 kind 的参与域迭代走
  **文档级域注册表**（不是各自域根的 observer）——遍历**所有**
  为该 kind 声明了 `document` 的域（顶层与嵌套都算，各自声明
  各自参与），参与域内的 Figure 按文档序连续计数；跨兄弟域的
  全局顺序由此表唯一决定。
- **跨域移动唯一模型（提升到线原语层，Section/Figure/Reference
  同律）**：跨 numbering 域的移动**只经 Svelte 实例销毁重建发生**
  ——卸载即 disposer 注销（旧域注册表即时移除、不再计数；目标
  注册表 entry 即时消失），重挂载即在新域重注册（新域立即计数）。
  observer bump 只驱动序数重算，**不负责注册表归属迁移**；纯
  DOM `adoptNode` 式搬移不在模型内（记档）。A→B 夹具断言：旧
  域不计数、新域立即计数、目标注册表仅存一个活动 entry。
- **更新信号（两级矩阵，与 §1.1b 的 revision 命名一致）**：
  域根 observer（childList + subtree）只 bump `domainRevision`
  （域内 Section/Figure 成员与位置）；文档级域注册表的 observer
  只 bump `documentRevision`（DomainRecord 顺序与 document-scope
  参与域）。**DOM 增删移是重编号的唯一信号源**；effect 依赖
  DOM 位置、setTimeout 轮询均禁止。嵌套域下外层 observer 会
  观察到内层域的全部增删（双层 bump）——这是**冗余重算而非
  误信号**（Figure 归属最近域、外层序数是对 DOM 位置的纯函数，
  内层元素不在外层注册表，重算结果不变）；不要按 mutation target 过滤
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

### 1.1c 可见 DOM 形状（P1-4 冻结——byte snapshot 与收割定位的锚）

- **Section**：`data-number` 属性挂 **section-card 根元素**（收割
  锚点，与 data-jx-section 同元素）；显示编号是现有 header 标题
  节内的**前置专用节点**：
  `<h…>…<span data-jx-number>3.2</span>&nbsp;标题文本…</h…>`
  ——编号**不** aria-hidden（「3.2 方法」是可访问标题文本的
  自然部分）；无编号时该节点**完全不存在**（域外节的逐字节
  等价因此成立）。前缀词：无（裸 `3.2`；`§` 属引用形态）。
- **Figure**：`data-number` 属性挂 `<figure>` 根；图注最小形状：
  `<figcaption><span data-jx-figure-label>Table</span> <span
  data-jx-number>6-1</span> <span>实测与预测对照</span><span
  data-cited-in> · 被引于 § 3.1</span></figcaption>`——label 与
  number 以单空格连写（`Table 6-1`），caption 文本后置，citedIn
  尾以「 · 」引导、无 citedIn 时该节点不存在。
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
- **接口先行（tasks 批次 0，冻结到可编译签名）**：模块
  **`ui/figure/numbering.svelte.ts`**，导出面冻结为：

  ```ts
  export type FigureKind = 'figure' | 'table' | 'equation' | 'listing';
  export const FIGURE_LABELS: Record<FigureKind,
    { caption: string; reference: string }>;   // 图注全词 / 引用短词

  export const NUMBERING_DOMAIN_KEY = Symbol.for('jx-numbering-domain');
  export const DOCUMENT_TARGETS_KEY = Symbol.for('jx-document-targets');

  // 真可辨识联合；派生字段统一以 accessor thunk 注册（读即现值，
  // 在 $derived 内调用即响应式——禁止快照）：
  export type FigureTargetEntry = {
    id: string; kind: 'figure';
    readonly number: () => string;      // 可引 figure 必有编号
    readonly title: null;               // 图注不是标题
  };
  export type SectionTargetEntry = {
    id: string; kind: 'section';
    readonly number: () => string | null;  // 未编号节为 null
    readonly title: () => string;          // title prop 活读
  };
  export type TargetEntry = FigureTargetEntry | SectionTargetEntry;

  // 路由作用域实例 API——模块级函数不持有任何全局状态：
  export interface TargetRegistry {
    registerTarget(entry: TargetEntry): () => void; // 幂等 disposer
    getTarget(id: string): TargetEntry | undefined; // $state 直读
  }
  export function createTargetRegistry(): TargetRegistry;
  // 页面根 provider 用 createTargetRegistry() 建实例 +
  // setContext(DOCUMENT_TARGETS_KEY, registry)；消费者经：
  export function targetRegistryFromContext(): TargetRegistry | undefined;
  ```

  实例归属唯一：`registerTarget`/`getTarget` 都是 **registry 实例
  的方法**（无模块级全局表）——路由页面各建各的实例，跨页零共享。
  实例内部持 `SvelteMap<string, TargetEntry[]>`（同 id 多条按注册
  时序；**active winner = 首条存活项**）。**胜者晋升与终态**：
  winner 注销时最早存活候选**即时晋升**（同 settle 内 Reference
  跟随）；最后一条也注销后 `getTarget` 返回 undefined——目标
  回到缺失态，warning 按各 Reference 的 settle 口径重新触发。
  由整合者统一落盘并冻结后，批次 1/2/3 才并行——子代理不触碰
  该共享文件。
  **文档身份（一页多 PagedDoc）**：document-scope 计数与目标
  注册表均以**路由页面 provider 实例**为单位——同页多个 PagedDoc
  共享一个注册表与一套 document-scope 计数（它们是同一「文档」
  的不同面；Section 根的文档序跨 PagedDoc DOM 边界连续计算），
  跨页不共享；provider 销毁时所有 Reference 收束为缺失态（无
  悬挂 warning）；fixture 断言之。

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
  可解析）。**composition-first 定位（P1-6 窄例外，living spec 记
  档）**：citedIn 是**值域元数据 payload**（显示货币的镜像串），
  不是 caller-defined repeated structure——串原样渲染、无逐项
  内容主权（无 per-item 布局/油漆/槽），故不适用「payload 须带
  snippet escape」条款；该窄例外随本 change 以 MODIFIED 回写
  composition-first 法则。**缺口注释（必须落在组件头）**：自动
  反链渲染机件刻意缺席——反链的自动态只存在于收割层（引用点
  refids[] 的倒排）；静态串不随重排更新（`§ 3.1` 换序后可能
  腐化——腐化压力正是回归动因）；回归条件 = 某体裁真要上纸面
  「被引清单」（届时反向注册 context + Figure 读取，纯增量）。
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
  **显示词单源表（0.1 导出，Figure 与 Reference 共消费）**：每
  kind 两列——图注列用全词（`Figure`/`Table`/`Equation`/
  `Listing`），引用列用短词（`Fig`/`Table`/`Eq`/`Listing`）；
  前缀规则同表钉死：chapter-scope = 短词 + `章.序`（`Eq (4.5)`、
  `Fig 2-3`），document-scope = 短词 + 裸序（`Eq (12)`，ASME
  连续式号无章前缀）。
- **DOM 契约（P1-3 冻结）**：成功态渲染 `<a href="#${to}"
  data-ref-to>`——原生 fragment 锚点，键盘焦点/ARIA 全走原生
  anchor，无合成 tabindex/role；children 逃生门替换的是**锚点
  的标签文本**，锚点语义与 href 恒在。缺失态渲染 `<span>` +
  `??(to)` 标记（不可导航即不是锚点——坏目标不提供交互假象）。
  真实 click/fragment 跳转/SSR-hydrate 形态各有夹具。
- **目标注册表（文档级，形状冻结于 §1.2 的可编译签名）**：
  `registerTarget()` 返回**幂等 disposer**，组件卸载必调。
  **重复 id**：dev warn + 首条存活项为 winner；winner 注销时
  最早存活候选**即时晋升**（§1.2 晋升规则）。**reparent**：
  Svelte 模板内的跨域移动必然走实例销毁重建（keyed each/key/
  snippet move 均如此），注册随生命周期自然迁移——这是**唯一
  允许的跨域移动模型**；纯 DOM `adoptNode` 式搬移不在模型内
  （记档）。**路由/文档边界**：注册表实例由**路由页面根**
  （+page 渲染树）的 provider 创建，SvelteKit 路由切换销毁页面
  组件即整表回收——**不放 root/docs layout**（它们跨路由长存，
  会泄漏前页 id；「前页 id 在后页不可解析」是测试断言）。域
  context 只服务计数，**寻址一律走文档注册表**（跨域引用可达）。
  Reference 的显示形态 `$derived` 自注册表——前向目标后注册 →
  自动跟随。**可引目标类型域**：Figure（必有编号——裸用无编号
  Figure **不可引**，等同缺失 id 的响亮回退）∪ 编号/未编号
  Section；任意裸 id 元素**本期不可引**（同前）。
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
  `number`。**投影 JSON 形状（P1-5 冻结）**：`sections[].number`
  与 `block.number` 均 **optional**（缺省 = 未编号，不写 null）；
  `refids[]` **去重保首现序**（同块多次引同一目标合并为一条）；
  `citedIn` = JSON 数组原序保留。**行内 Reference 落点**：
  data-ref-to 在段落/点块内 → 挂该块；**裸 Reference**（直接位于
  section body、无最近块根）→ 挂**最近前驱流项**（同 section 内
  之前最近的段落/点块），section 内无前驱流项时 dev-warn + 跳过
  （记档，非静默丢失）。**tag-shape fallback 前显式排除
  `data-jx-figure` 包裹层**（裸 pre 直接子元素的误判边角）；
  Figure 内容槽无可投影子块（纯文本）时不投影 number——记档；
  多子块 Figure：number 投到**首个点块**，其余子块不重复携带。
  corpus schema **加性扩展**（旧语料不重写），语料 sha 稳定门禁
  的基线随本批重生成。specs/search-corpus delta 已随 change 落档。

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
