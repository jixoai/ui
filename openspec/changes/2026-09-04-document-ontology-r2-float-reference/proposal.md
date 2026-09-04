# Proposal: document-ontology R2 — 浮+引（Figure 计数与 Reference 解析）

## Why

本体设计轨（openspec/changes/2026-09-02-document-ontology/，活动
change，本仓裁决基座）§7 排定的第二实施轮：**R2 = 浮+引**——
Float 章域计数器；Reference 编号解析与反链。工具书/教材页立即
受益；这是退役 PagedRef 的未尽事宜的正式收口（folio 回填特例
之外，编号引用一直没有本体归属）。

R2 裁决会话（grill，2026-09-04，全部 Owner 拍板）：

| # | 裁决 |
| --- | --- |
| Q3 | **计数域由 Section 显式声明**（`numbering`），无隐式 depth 嗅探；域是结构事实，归属线原语；R5 面预设只改默认方案 |
| Q4 | **全机制一次成型**：节十进制树（3 → 3.2 → 3.2.1）+ 浮章域计数 + 引对节/浮双解析；未声明 `numbering` 的节逐字节不变 |
| Q5 | **默认章域计数**；`scope="document"` 全篇连续是显式例外（ASME 式号惯例）；scope 挂在域级声明的 kind 轴上，禁止逐 Float 实例声明 |
| Q6 | **`<Figure>` 包装原语**（新家族 ui/figure/）：线承载结构（编号/锚/图注），点嵌内容槽；CodeCard 裸 figure 形状不动 |
| Q6a | 组件名 **`Figure`**——渲染 `<figure>` 元素，组件名 = DOM 契约；kind 轴承载图/表/式/清单区分；本体词条「浮」留在 specs |
| Q7 | **引的目标自述语法**：Reference 零语法知识，解析完全跟随目标（Figure→`Eq (4.5)`；编号节→`§ 3.2.1`；无编号→目标标题）；children 槽为显式逃生门 |
| Q8 | **反链自动态仅收割**（refids[] 倒排派生，组件不渲染、无反向注册机件）；`Figure` 另设 **`citedIn` 手动标注槽**（显式声明即渲染于图注尾 + 同步发射），代码注释必须说明缺口与回归条件 |
| P1-4（Codex R4 轮裁决，2026-09-05） | **收割两趟预扫描（A）**：第一趟建全文档目标索引（所有 data-number id），第二趟投影 data-ref-to——前向引用的 SSR 回退态携带边主张，静态语料完整；真死边由收割侧索引过滤 |

## What Changes

1. **Section 编号树**（section-card 家族）：`numbering` 声明——声明
   节即编号子树根 + 浮计数域；`floatScope` 配置各 kind 的计数
   连续性（默认全 chapter）。**不在任何域子树内的节 = 今日行为
   逐字节不变**；域内后代节无需声明、自动承受编号。
2. **Figure 家族**（新，ui/figure/）：`kind`（figure|table|equation|
   listing）+ 图注槽 + DOM 顺序计数（显示货币法则：换序重排、id 不
   动）+ `citedIn` 手动反链标注（缺口注释）。
3. **Reference 家族**（新，ui/reference/）：`to` 寻址 + 目标自述
   解析 + children 逃生门 + 缺失 id 的响亮回退（console.warn，
   渲染可见标记，永不阻塞）。
4. **收割发射与消费**：figure 的 `number`、引用点块的 `refids[]`、
   section 的 `number` 进收割合同（骑 R1 的 data 标记车道——
   role/ordering 的发射与收割消费已在 main 落地）。**消费侧是本轮
   交付**：search-corpus.mjs 读 data 标记 → 语料字段（加性扩展，
   旧语料不重写；sha 基线随批重生成），specs/search-corpus delta
   随实施落档。
5. **打印零特判**：编号是 DOM 顺序的显示货币，已在 DOM 内，打印
   管线原样捕获；folio（页码）仍归布局事实，永不预收割（§5 法则 2）。

## Impact

- 新家族 figure/**reference**（均含镜像、registry 登记、manifest、
  catalog 接线）；registryDependencies 双边登记：section-card →
  figure（floatScope 的 FigureKind）、reference → figure（显示词
  映射与注册表 key 单源）；section-card 增 props 向后兼容；code-card
  不动。
- specs delta：component-authoring（线词汇扩展 + family-context
  例外/composition-first 窄例外的 MODIFIED）+ search-corpus（收割
  字段与五分支投影细则）+ **paged-docs（CSS counters/PagedRef 退役
  的 MODIFIED）**——三份 delta 均已随 change 开档；目标注册表挂
  路由页面根 provider（TargetRegistry 实例 API，design §1.2 可编译
  签名块；DomainRecord 带 parentDomain，章序数仅计顶层根）；批次 0
  接口冻结于 `ui/figure/numbering.svelte.ts`。
- 依赖：R1 的标记车道（section role/ordering）已在 main；figure 的
  kind/number/refids 发射沿用同一语法族。
- R5（面预设）后向依赖本轮的 scope/kind 轴——预设只改默认，不改机制。
