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

## 锚点解析（实施修正：放弃 id 烘焙）

- 整页 HTML 重写会危及 SvelteKit 水合标记——改为收割侧寻址：
  标题自身 id → **最近带 id 祖先**（injectTocNav 的既有锚点法
  则，站点包装 div 即真实目标）→ slug 回退（slugOf 移植，与
  运行时 deriveTocOutline 收敛，等价 spec 锁定）。
- 实测：试点页六节 id = 包装 div id（transaction/animation/…），
  e2e 跳转锚点命中。

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
