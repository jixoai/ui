# Tasks: search-corpus

## 1. 语料生成器 [P]

- [x] 1.1 `registry/files/search-corpus/search-corpus.mjs`：零依赖
      单文件——收割（llms-txt 导出的 tokenizer + STRIP 分类学 +
      语义标记键控 + 启发式回退）→ page-semantics v1 schema →
      `/search/corpus.json` 字节确定输出；noindex/exclude 尊重；
      registry.json 的 registry-distribution 形态（同 llms-txt 先
      例：single-file 声明）。
- [x] 1.2 slug 共享法则：`slugOf` 移植 + 收割/运行时等价测试 + 最近 id 祖先寻址（烘焙方案因水合风险弃用，见 design 修正）。
- [x] 1.3 `scripts/build-site.mjs`：7.5 阶段 generateSearchCorpus（声明式、fail-loud、产物存在断言）。

## 2. 客户端（site-only 先行）[P]

- [x] 2.1 `Intl.Segmenter` 分词器（中英混排单测）。
- [x] 2.2 minisearch 适配器（懒加载语料、字段加权、prefix+
      fuzzy）+ `search-ui` 命令面板组件（⌘K、分组、键盘导航、
      锚点跳转）+ docs 布局接线。
- [x] 2.3 apps/www devDeps：minisearch（仅客户端，builder 零依赖
      不受影响）。

## 3. 门禁与集成 [I]

- [x] 3.1 corpus spec（确定性/排除/结构保真/id 只读）。
- [x] 3.2 面板交互 spec + 分词 spec。
- [ ] 3.3 verify-all 接线（corpus 生成冒烟）+ 全量回归 + openspec
      strict。
