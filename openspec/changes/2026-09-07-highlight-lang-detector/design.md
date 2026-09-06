# highlight-lang-detector — Design

## D1 — LanguageDetector 契约（core item，零 npm 依赖）

```ts
// registry/files/lib/highlight/lang-detector.ts（随 highlight core 发行）
export type DetectSource =
  | 'filename'    // DLD L1：扩展名表
  | 'shebang'     // DLD L2：解释器表
  | 'structure'   // DLD L3：结构探针
  | 'statistical' // DLD L4：betlang wasm
  | 'engine';     // 引擎自带（hljs highlightAuto）

export interface DetectResult {
  lang: string;            // canonical id（或待别名解析的 id）
  source: DetectSource;
  confidence?: number;     // 0..1；betlang 校准概率直传；表/结构层缺省
}

export interface DetectInput {
  code: string;
  filename?: string;       // 卡片的 filename prop 原样透传
}

export interface LanguageDetector {
  id: string;              // 'dld' | 'betlang' | 'hljs-auto' | 消费者自定义
  detect(input: DetectInput): Promise<DetectResult | null>;
}
```

裁决记录：

- **返回 canonical id 而非检测原标签**：检测器内完成标签收敛（betlang
  的 `TypeScript` → `typescript`），卡片侧零翻译逻辑。映射不到的检测
  结果返回 `null`，走纯文本回退 + console warn（失败法则原文沿用：
  报出检测到了什么、为何不渲染）。
- **Promise 返回**：L1-L3 同步实现也包 Promise——wasm 层天然异步，
  契约不允许双态。
- **`filename` 只透传不解析**：文件名归属检测器（DLD L1 只取扩展名；
  消费者自定义 detector 可读全名做 `.dockerfile`/`Makefile` 类特判）。

## D2 — 解析链与卡片接线

```
lang !== 'auto'  →  现行路径逐字节不变（别名 → curated → reject/回退）
lang === 'auto'  →  resolveDetector():
    langDetector prop            （显式，最高）
      → context HIGHLIGHT_DETECT_KEY   （插件/子树默认，可配 betlang）
        → backend.detector             （hljs 自带 highlightAuto）
          → DLD                        （懒 import，未装则 reject 提示）
    → detect({ code, filename }) → lang → 既有高亮链
```

裁决记录：

- **context 环节排序高于 backend.detector**：站点经插件显式配置默认
  detector 即为全站意志（"betlang 配为默认项"要能压过 hljs 自带）；
  环节内仍是 prop > context > backend > DLD 的就近优先。
- **DLD 是动态 import 兜底**：`import('$lib/highlight/lang-detector')`
  仅在链尾且 lang="auto" 时发生——不装该 item 的消费者构建图里没有
  这条边，未装而触发 → reject 报错信息给出安装命令（与引擎矩阵
  "集外 lang" 提示同构）。
- **SSR/prerender**：检测是异步运行时行为；预渲染产物恒为纯文本
  （渐进增强地板不变）。hydration 后首次 paint 才检测 + 上色。
- **`lang` prop 类型**：`string`（含 `'auto'`）。不引入联合类型破坏
  存量调用；`'auto'` 是运行时哨兵值，文档明示。

## D3 — DLD 四层瀑布（每层独立懒模块）

```
defaultLangDetector()  ── 命中即短路，层层 fallback
  L1 filename/ext   ext-table.ts      多行字符串表 → 首次 parse 成 Map
  L2 shebang        shebang-table.ts  多行字符串表（读 code 首行解释器）
  L3 structure      structure.ts      纯 TS 探针（见 D3.3）
  L4 statistical    betlang.ts        wasm 懒加载 + 标签映射表
```

### D3.1 表格式（Owner 指定：多行字符串）

```ts
// ext-table.ts —— 数据源 linguist languages.yml ∩ canonical 集
// 歧义扩展名（heuristics.yml 138 组消解块内）不在此表，留给 L4
const EXT_TABLE = `
ts typescript
tsx tsx
py python
rb ruby
hs haskell
`;
```

- 单空格分隔、换行分隔条目；`#` 起注释行（保留数据出处与排除说明
  的书写位）。体积密度高于 JSON/对象字面量，parse 一次缓存 Map。
- shebang 表同构：解释器 basename → lang（`python3 python`）。

### D3.2 结构层法则（Owner 原话的工程化）

只做"开头或全篇即可确判"的探针，**禁止编程语言指纹**：

| 目标 | 探针 | 判据 |
|---|---|---|
| XML | 首行 `<?xml` | 字面量前缀 |
| HTML | 首行 `<!doctype html`（大小写不敏感） | 字面量前缀 |
| SVG | 首行 `<svg` 或 `<?xml` 后随 `<svg` | 根元素判据 |
| JSON | `JSON.parse` 全文 | 硬判据；解析失败但首字符 `{`/`[` **不**声明 |
| YAML / TOML / INI | 保守正则组 | 只在**互斥标记**确判时声明（`---` 文档头 + `key: value` 密度 → YAML；`[section]` + `key = value` 带空格 → TOML；`[section]` + `key=value` 无空格 → INI）；歧义即放弃 |

负样本测试锁死 Markdown 干扰：含 Rust/Go/Kotlin/Swift 指纹的样本在
无 filename/shebang 时**必须**落到 L4，L3 永不捕获。

### D3.3 层间短路与懒加载

- 每层一个模块，`defaultLangDetector()` 闭包内逐层 `await import()`：
  L2 模块在 L1 命中时**零字节加载**，依此类推。
- 表 parse 结果模块级缓存（进程级，多卡片共享）。
- `betlangDetector()` 独立导出：直连 L4 的统计检测器（插件配默认 /
  消费者显式 prop 用，跳过 L1-L3）。

## D4 — betlang wasm 通道（本变更最重的裁决）

**探测结论（evidence/betlang-probe-2026-09-07.md）**：lean 绑定
raw 97.7KB / gzip 57.1KB，双口径 ≤ 100KB —— **betlang 进 DLD L4，
作为默认统计层**（无需退到 linguist heuristics B 方案；linguist 数据
仍服务 L1/L2 表与排除表）。

**发行通道**（npm 无官方 wasm 包；npm `betlang@0.0.0` 为占位空包）：

- **A（首选）：自建 `@jixoai/betlang-wasm` npm 包** —— 内容 = CI 从
  钉死的 crates.io `betlang = "=0.1.1"` 构建的 wasm + 手写 ~40 行
  JS 装载器（线性内存 UTF-8 进出，无 wasm-bindgen 胶水，与 lean
  探针同构）+ `.d.ts` + MIT 归属。供应链 = 消费者 lockfile，与
  tree-sitter 法则同构（"供应链即 lockfile"）。仓库内 `scripts/
  verify-betlang-pin.mjs` 核验包内 wasm 的 sha256 + magic bytes +
  双口径尺寸预算（raw ≤ 100KB / gzip ≤ 70KB；实测 97.7/57.1）。
- **B（备选）：GitHub release 资产 + pin manifest** —— ghostty 法则
  原样平移（pin.json + 域白名单 + sha256 + 尺寸帽 + 构建信息）。
  消费者 DX 差一档（vite 插件需下载/复制步骤），仅在 npm 通道受阻
  时启用。
- **公共法则**：两条通道下**二进制都不入 git**（ghostty 法则原文：
  binaries never enter git; the pin manifest is the only supply-chain
  artifact）。

**wasm 装载 seam（与 tree-sitter 四象限同构）**：`wasmLoader(asset) →
{ url } | { bytes }`；浏览器 `?url`（vite 资产发射）/ Node·vitest
`createRequire + readFile` bytes —— 测试跑**真实 wasm**，不 mock，
`file://` 不作为浏览器证据（tree-sitter 法则原文沿用）。

**标签映射**：betlang 48 标签 → canonical id 内嵌映射表（`typescript
typescript\njavascript javascript\n…`，多行字符串同 D3.1）；无对应
（如 `gemfile`/`gemspec`/`vba`/`verilog`）→ null + warn。

## D5 — registry 结构

```
highlight (core)            + lang-detector.ts（契约 + HIGHLIGHT_DETECT_KEY seam；仍零 npm 依赖）
highlight-lang-detector     新 item：DLD 四层（L1-L3 纯 TS）+ betlang 通道
                              deps: @jixoai/highlight, @jixoai/betlang-wasm（若 D4-A）
                              exports: defaultLangDetector() / betlangDetector()
highlight-highlightjs       + detector 槽位接线（highlightAuto over 已注册 langs）
code-card                   + langDetector prop、lang="auto" 路径
```

- `verify:shadcn-add` 从 registry.json 自动派生 `highlight-lang-
  detector` 隔离 case（引擎矩阵门禁的既有机制平移；probe 模板新增）。
- `HIGHLIGHT_DETECT_DEF` 落站点内核侧 `lib/highlight/context.svelte.ts`
  （HIGHLIGHT_DEF 同构），插件经 definePlugin targets 投影。

## D6 — 显式不做（Non-Goals）

- 不做检测缓存层（同 code 跨卡片复用）——首次检测毫秒级，缓存复杂
  度不值；后续有真实需求再立项。
- 不做 linguist heuristics 的完整 JS 移植（138 组 Ruby 正则兼容块）
  ——仅作 L1 排除表来源与 betlang 不可用时的 B 方案储备。
- 不做 betlang 之外的统计引擎抽象（接口留 `LanguageDetector`，第二个
  实现出现时再抽公共）。
- 不改 `lang` prop 的联合类型（`'auto'` 保持 string 哨兵）。
