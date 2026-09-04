# Proposal: search-corpus — 面向结构化语料的可拔插搜索构建（Owner r8）

## Why

Owner r8 指令 + 四项 grilling 决策（2026-09-02）：

1. 搜索必须**面向结构化内容构建**，而非对最终 HTML 做启发式猜
   测——这是准确性的来源，也是与 llms.txt 现状（面向渲染 HTML 的
   自带 tokenizer + 启发式）的本质差异。
2. **引擎可拔插**：构建产物是格式中立的结构化语料
   （page-semantics 模型），引擎适配器消费它（minisearch 首个，
   fuse 等后续）——「索引文件几 MB 的负担」这类取舍交给用户。
3. **分发级能力**：registry/files 单文件零依赖模块（llms-txt 同款
   分发先例 + 同源法则），本站接线是 build-site 新阶段。
4. **中文必须支持**，分词用 `Intl.Segmenter`（标准 API）。

语料 schema 直接按 Owner 的**点线面本体**建模：block 带 `kind` +
行业元数据（点）、section 是结构线（线）、doc 级预留 `preset` 字段
（面）——组件族逐轮落地时收割自动变准，无需返工（Q2 双轨决策）。

## What Changes

1. **`registry/files/search-corpus/search-corpus.mjs`**（新增，单文件
   零依赖）：`generateSearchCorpus(distDir, config)`——收割最终产物
   HTML，产出 page-semantics 语料：
   - 结构派生键控**语义标记**（heading 树法则、SectionCard 的
     eyebrow/title/summary 形状、figure/figcaption、data-family/
     data-region），未结构化页回退启发式（main→body，llms-txt
     先例）；
   - tokenizer 复用 `llms-txt.mjs` 的**已导出**
     `parseFragment/decodeEntities`（不复制、不改 llms-txt——
     581 行保真锁面前零风险）；chrome 剥离沿用其
     STRIP_ELEMENTS 分类学；
   - 语料 JSON **字节确定**（键序/词条序排序）；尊重 noindex 与
     exclude 配置（与 llms.txt 同一语义）；
   - 输出走**顶层声明路径** `/search/corpus.json`——不进 `/r/`
     （registry 命名空间，docs-site spec 法则）。
2. **标题 id 烘焙**：build-site 后处理阶段给 `public/**/*.html` 的
   outline 级标题（h2/h3）盖上 id——slug 法则与运行时
   `toc-outline.ts` 的 `slugOf` **收敛**（共享法则测试锁等价；
   运行时对既有 id 幂等）。副产品：静态产物锚点成立、llms.txt
   的 .md 镜像可带锚点、SEO。
3. **build-site.mjs 新阶段**：llms-txt 之后（同一「终产物扫描」
   位面）声明式调用；`/search/` 目录唯一写入者是本阶段（一处生
   成点法则的泛化）。
4. **客户端（site-only 先行）**：`Intl.Segmenter` 分词器（构建/
   查询同源）+ minisearch 引擎适配器（apps/www 依赖，懒加载语
   料、浏览器端建索引——builder 保持零依赖单文件）+ 命令面板式
   搜索 UI（⌘K；默认形态，Q4 保留项）。
5. **门禁**：语料确定性、noindex/exclude 排除、id 收敛等价、
   结构派生保真（SectionCard/CodeBlock 页面夹具）各配 spec。

## Out of Scope（记录在案的回访条件）

- **llms.txt 改接语料模型**：仅当出现具体缺陷案例（如 SectionCard
  summary 优于 meta description）+ 字节 diff 门禁时回访——本轮
  零接触（对抗评审 F2）。
- **`jxoai()` 伞面 feature 位**（`jxoai({ search })`）：等第二个
  真实消费者站点出现（Q3 决策）。
- **fuse 适配器**、搜索 UI 终形态、CJK bigram 之外的分词策略。
- **点线面组件族实施**：设计轨独立变更
  `2026-09-02-document-ontology` 承载。
