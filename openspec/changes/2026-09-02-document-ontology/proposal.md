# Proposal: document-ontology — 点线面文档组件本体（设计轨）

## Why

Owner 本体裁决（2026-09-02）：文档组件族按三层本体建模——

- **点 = CodeBlock**（行业表达原子：今日 code；后续
  math/music/摄影/旅行/商业/理化生逐轮落地）；
- **线 = SectionCard**（跨行业提取的**结构原语最小集**——「像
  Markdown 被发明出来的那样」，不逐行业造组件，只提结构公因数）；
- **面 = PrintDoc**（体裁预设：漫画/乐谱/字典/小说/史书/工科工具书…）。

Paged* 退役（print-pipeline 收编）后幸存谱系收敛为三件：
`lib/print/`（面）、`lib/ui/section-card/`（线）、
`lib/code-block.svelte`（点）。

研究问题（Owner 原话）：**「假如你是创作者，你需要什么样的结构化
表达？」**——词典学家天然想的是「词头/词性/分义号/书证」，作曲家想的
是「乐章/小节/排练标记」，史家在纪传/编年/纪事本末三体之间做的其实是
**结构模式选择**。今日的 web 文档只给他们 heading + code block；本体
论把各体裁的母语还给创作者。结构是创作者思考的形状，组件应说他们的
语法——这正是 Markdown 之于写作者的历史：几个记号换来整个写作 Web
（20% 词汇覆盖 80% 结构，paged-doc-family 的本源经济学）。

**首个消费者是收割合同**：并行的 search-corpus change（2026-09-02）
已按点线面建模语料 schema（blocks.kind=点、sections=线、doc 级
preset 预留=面），并把组件族实施显式推迟给本变更。本设计轨定下
「点线面必须发射什么」的合同，使逐轮落地时搜索 / llms.txt / 打印
ToC 自动变准、零返工（其 Q2 双轨决策的兑现面）。

## What Changes

**设计轨（design-only）：零实现任务、零 specs deltas**——specs delta
在各实施轮开档时落。本 change 仅产出两份文档，承载：

1. **体裁结构普查**（design §1）：漫画/音乐/字典/小说/史书/工科
   工具书六体裁 + 横切件（前言后记/注释/引用/编号/习题），中西传统
   并陈，来源可溯。
2. **A 线最小集**（§2）：**7 个结构原语**——节 Section / 条 Entry /
   列 Sequence / 浮 Float / 注 Note / 引 Reference / 断 Break；每个
   ≥2 体裁共同需要；史书三体恰好分解为条/列/节三个原语，构成最小集
   非平凡性的交叉验证。
3. **B 点矩阵**（§3）：各行业表达原子与机器语义字段（可收割面）；
   合成法则：**线承载结构（地址/编号/锚），点承载行业语义（字段），
   面填槽**。
4. **C 面预设**（§4）：各体裁 PrintDoc 的文档级组合规则——页面语法/
   编号方案/running heads/结构排序约束（字典=字部严格线性；编年体=
   时间轴线性；纪事本末=事件完备分节；工具书=十进制树序…）。
5. **D 收割合同 v1**（§5）：block/section/document 三层字段 + 五条
   法则，逐条对照 toc-outline / injectTocNav / search-corpus v1
   先例校验。
6. **E 今日已供 vs 升级增量**（§6）：三件幸存组件今天各自发射什么、
   每轮升级各加什么。
7. **未来实施轮次**（§7）：R1–R6，优先级排序，各自独立可发布；
   R1（收割合同标记）先行——search-corpus 正在等它。

## Impact

- 只新增 proposal.md + design.md；不触任何代码、specs、registry。
- 下游定锚：search-corpus 的 `blocks.kind` / `preset` 预留字段由
  §3/§5 定锚；后续每轮实施开档时引用本 design 对应节作为裁决基座。
- Paged* 时代裁决「编号是 DOM 顺序的显示货币，稳定寻址靠显式 id」
  升格为本体层通用法则（§5 法则 2）。
- 线词汇是对 SectionCard 家族的**前向扩展承诺**：7 原语中 5 个在
  今日 SectionCard 形状上有直接映射（§2 表），无一项要求推翻现状。
