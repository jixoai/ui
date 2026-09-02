# Proposal: nav-fuzzy-filter — 左轨模糊过滤升级 + 全站 ⌘K 修活（Owner N1/N2）

## Why

Owner 两项决策（2026-09-02 grill 会话）：

1. **N1 引入 fuzzysort**：左轨 substring（`includes`）过滤升级为
   模糊匹配。引擎选 fuzzysort（ledger 摸底记 v4 / 0 依赖 / MIT /
   ESM；落地以 npm 最新稳定为准），包在
   `apps/www/src/lib/search/nav-filter.ts` 内核——适配器模式
   （`engine-minisearch.ts` 先例），引擎可替换；兼容
   `command.svelte` 冻结契约 `CommandMatch =
   (item:{label,keywords?},query)=>boolean`（隐藏不重排、可插
   拔）。不进 registry。
2. **N2 顶部搜索面收敛**：SearchPalette 挂**根布局**，修活全站
   ⌘K——现状只挂 docs 子树布局，非 docs 页头部搜索按钮是死按钮
   （事件无监听者）。megaGrid 悬停面板**不加**内嵌输入（本决策
   覆盖 r1-ledger 摸底裁决「顶栏 megaGrid 加过滤输入」）：顶部
   过滤职责统一归 ⌘K，左轨负责浏览中过滤。

排序用 fuzzysort 原生、不手工调参——不触发「算法任务升级规
则」；未来若调参须走 Codex 评分闭环（记录在案）。

## What Changes

1. **nav-filter 内核**：`lib/search/nav-filter.ts`——fuzzysort
   包装；输入 `docsSections`/`docsComponentGroups` 结构，输出
   保持分组序 + 每页高亮索引；空查询 = 恒等；导出
   CommandMatch 兼容出口。
2. **左轨升级**：`docs-sections-nav.svelte` 的
   `needle/visibleSections` substring 逻辑换内核；既有行为全保
   留（分组保持、空节隐藏、空态文案、Escape 清除 +
   stopPropagation、宽轨/移动栏双输入位）；匹配字符高亮渲染。
3. **spec 重写**：`docs-nav-filter.spec.ts` 真值表按 fuzzy 语义
   重写（substring 断言如 `'jx'→仅 jx-pure` 在 fuzzy 下超集
   化）+ 高亮断言 + nav-filter 内核单测。
4. **⌘K 修活**：SearchPalette 挂根 `+layout.svelte`；docs 子树
   布局去重（避免双监听）；corpus 静态产物全站可用性核对
   （`/search/corpus.json` 站根路径，打开时 fetch）。
5. **依赖**：apps/www 增 fuzzysort（共享文件，ZCode 落盘）。

## Out of Scope（记录在案的回访条件）

- megaGrid 面板内嵌过滤输入（N2 裁决不做）；
- ⌘K 面板本体交互升级（search-corpus change 的保留项）；
- fuzzysort 排序调参（触发算法复核规则时另立）；
- icons 文档页（并行 change `2026-09-02-icons-docs` 承载）。
