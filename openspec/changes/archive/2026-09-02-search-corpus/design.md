# Design: search-corpus

## 决策依据（grilling 2026-09-02 四问 + 对抗评审修正）

- 丢弃 defineBuildPlugin 新内核（与 build-plugins spec 的 `jxoai()`
  伞面撞名、零消费者收益）；采用 llms-txt 先例：**核心函数 +
  编排站直调**。
- llms-txt 本轮零接触；收割器 import 其**已导出** tokenizer。
- 引擎可拔插 = 语料中立 + 客户端适配器（VitePress 的 loadAsync
  JSON → 浏览器建索引同款拓扑）；builder 因此保持零依赖单文件。
- id 烘焙解决静态产物锚点缺失（对抗评审 F4：收割只读不造 id）。

## page-semantics 语料 schema（点线面建模，v1）

```jsonc
{
  "generator": "jixoai search-corpus 1",
  "generatedAt": "<iso8601>",        // 唯一非确定字段
  "pages": [{
    "url": "/docs/paged.html",
    "title": "…",                     // h1 优先，title 回退
    "description": "…",               // meta description
    "preset": null,                   // 面维度预留（PrintDoc 体裁）
    "sections": [{                    // 线维度（heading 树 + extents）
      "id": "transaction",            // 烘焙后的标题 id（只读不造）
      "heading": "The transaction",
      "level": 2,
      "summary": "…",                 // SectionCard 的 :scope > p 先例
      "blocks": [{                    // 点维度
        "kind": "prose" | "code" | "table" | "callout",
        "text": "…",                  // 收割文本（已剥 chrome）
        "meta": { "lang": "ts", "label": "the layer, assembled" }
                                         // code: figcaption/data-lang
      }]
    }],
    "noindex": false                  // 恒 false（true 的页不入语料）
  }]
}
```

- `blocks.kind` 是**开放枚举**：点线面组件族落地新行业点
  （math/music/…）时扩展 kind 与 meta 字段，收割层不 breaking。
- `sections` 派生 = toc-outline 同法则（levels [2,3]、
  data-toc-skip 跳过、extent 到下一同级）；summary =
  injectTocNav 的 `:scope > p` 先例。
- 字节确定：除 generatedAt 外全排序；generatedAt 恒定后整文件
  sha 稳定（门禁锁）。

## 锚点解析（v2：祖先步退役，r8 修复轮）

- v1（实施修正：放弃 id 烘焙）采用 标题自身 id → 最近带 id 祖先
  （injectTocNav 先例）→ slug 回退。全管线冒烟暴露盲区：去重集混
  入祖先 id（chip/press-button 等页 wrapper div id="usage"×2），
  后续同名标题的 slug 被推成 `usage-2`，而运行时盖章器
  （deriveTocOutline）的去重集只认自身 id + 已盖 slug——盖章
  `usage`，`usage-2` 无人持有 → 5 个死锚点（832 中）。
- v2 法则：收割与盖章严格同律——**标题自身 id → slug**（去重仅计
  已发射 id），祖先 id 完全不参与。根布局（routes/+layout.svelte）
  成为唯一盖章权威：`$effect` 依赖 `page.url.pathname`（layout 跨
  客户端导航持久，无依赖只跑一次），每次换页后对新 DOM 幂等盖章
  （既有 id 恒胜）。语料覆盖的全部页面（docs + 顶层 3 页）的
  fragment 从此都有活体目标。
- 验证：夹具级（等价 spec 新增 wrapper 盲区夹具：id 祖先不参与
  寻址与去重）+ 活体级（corpus spec 新增 live 门禁：build 产物在
  时，832 sections × 99 页与真 deriveTocOutline 输出逐一相等；
  fresh clone 无 build 自动 skip）。

## 分词与引擎（客户端，site-only 先行）

- `segment(text): string[]`：`Intl.Segmenter('zh', {granularity:
  'word'})` 词级切分 + 小写化；拉丁词整词、CJK 按词（不做 bigram
  ——标准分词器优先，Query 侧同源）。
- minisearch 适配器：fields=[title^3, heading^2, summary, text]，
  prefix+fuzzy(1)；懒 fetch corpus → `MiniSearch.loadJSON` 同构
  （内存建索引，构建零依赖）。
- UI：命令面板（⌘K / 搜索框），分组=sections，命中高亮 snippet
  取自 block text；既有 docs 导航标题过滤维持不动（fuzzysort 导航
  计划的合并留给后续轮）。

## 构建接线（build-site.mjs）

- 阶段顺序（顺序是承载性的）：… → generateLlmsTxt（6/7）→
  **bakeHeadingIds(public/)** → **generateSearchCorpus(public/,
  config)** → 既有 mdExpectations 自检。
- config：exclude 与 llms-txt 相同清单 + `search: { include,
  exclude, maxBytes }` 透传位。
- 失败语义：fail-loud（与 build-site 既有 die() 一致）。

## 测试面

- corpus 生成：确定性（两次生成 sha 一致）、noindex/exclude 排
  除、结构派生（SectionCard/CodeBlock 夹具的 sections/blocks 形
  状）、id 只读不造。
- id 收敛：夹具页 build-slug === runtime-slug。
- 客户端：分词器（中英混排）、面板交互（打开/查询/键盘导航/跳
  转锚点）。
