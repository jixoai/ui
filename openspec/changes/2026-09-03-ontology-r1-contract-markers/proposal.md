# Proposal: ontology-r1-contract-markers — 收割合同标记（R1 实施轮）

## Why

document-ontology 设计轨（2026-09-02，§5 收割合同 v1 + §7 轮次表）定下
「点线面必须发射什么」；本 change 是其 **R1 实施轮**：让组件**亮明身份**，
收割器**读标记而非猜形状**。首个消费者 search-corpus（2026-09-02 上线）
今日全靠结构派生 + 启发式回退：

- 线：heading 树派生 + 「父级第一个 `<p>` 当摘要」的 SectionCard 形状
  猜测；role/ordering 完全缺席（合同字段无法上线）；
- 点：`pre`/`table`/`figure>pre` 标签形状定 kind；行业点扩展无注册语法。

R1 之后：线的 role/ordering 与点的 kind 以 data 标记出厂（DOM 可见，
法则 4），收割器 declared-mode 优先消费标记，形状猜测降为未标记页的
回退——**回退逐页退役**，后续轮次（R2 浮引 / R4 条列 / R6 行业点）
每落一个 kind/role 即少一类猜测。

## What Changes

1. **线标记（SectionCard）**：新 props `role`（七原语枚举
   `'section'|'entry'|'sequence'|'float'|'note'|'ref'|'break'`，默认
   `'section'` **总是发射** `data-role`）与 `ordering`
   （`'linear'|'alpha'|'timeline'|'tree'`，仅显式传入时发射
   `data-ordering`）。落在 host `[data-jx-section]` 上。
2. **点标记（CodeCard）**：figure 根出厂发射 `data-kind="code"`——
   kind registry 的第一个注册项；`data-lang`/figcaption 字段不变。
   code-block.svelte（wrapper）零改动即继承。
3. **收割器 declared-mode**（search-corpus.mjs）：
   - 块：`data-kind` 存在则直接采用，标签形状仅作未标记块的回退；
   - 线：heading 的最近 `[data-jx-section]` 祖先存在 → role/ordering
     读自 host，summary 读自 `[data-jx-section-header]` 内最后一个
     `<p>`（eyebrow 在前、summary 在后的既定 DOM 序）——「父级第一个
     p」猜测对该 heading 退役；
   - `sections[].role` / `sections[].ordering` 上线（开放枚举，非
     breaking，旧语料不重写——法则 5）。
4. **夹具门**：扩展 search-corpus 既有 spec——declared 页逐字段保真
   断言（role/ordering/summary/kind/lang/label）+ 回退页行为不变断言
   （零标记 → 今日输出逐字段等价）。

## Impact

- 组件：section-card.svelte（+2 props）、code-card.svelte（+1 attr）；
  收割器 search-corpus.mjs（declared-mode 分支）；镜像/manifest 随同步。
- 语料：`/search/corpus.json` 的 sections 增两字段，blocks.kind 语义
  不变（code 由标记与形状双路得出同值）。
- 不做：Entry/Sequence 的字段定型（R4）、Float 计数（R2）、面 preset
  （R5）、行业点 kind（R6）——本轮只立合同语法与消费优先级。
- 裁决基座：document-ontology design §2（七原语）、§5（合同字段与
  五法则：DOM 序即语义序 / 编号显示货币 / 收敛寻址 / DOM 可见 /
  开放枚举）、§7 R1 行。
