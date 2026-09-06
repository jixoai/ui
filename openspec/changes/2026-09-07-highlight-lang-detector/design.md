# highlight-lang-detector — Design

r1 评审（Codex 5.5/10 REVISE）八阻塞已消化：D1 补常量与命名空间、
D2 重构为 context-seam 接线 + 完整决策表、D3.2 冻结规范化伪码与
阈值、D4 冻结通道 A 与 KiB 预算律、D5 修正 registry 边活性与内核侧
归属、新增 D7 hljs detector 语义冻结。

## D1 — LanguageDetector 契约（core item，零 npm 依赖）

```ts
// registry/files/lib/highlight/lang-detector.ts（随 highlight core 发行）
export const AUTO_LANG = 'auto';   // lang 哨兵：trim 后全等比较，大小写敏感

export type DetectSource =
  | 'filename'    // DLD L1：扩展名/basename 表
  | 'shebang'     // DLD L2：解释器表 / modeline
  | 'structure'   // DLD L3：结构探针
  | 'statistical' // DLD L4：betlang wasm
  | 'engine';     // 引擎自带（hljs highlightAuto）

export interface DetectResult {
  lang: string;            // 本仓库 canonical id（单一命名空间，见下）
  source: DetectSource;
  confidence?: number;     // 0..1；betlang 校准概率直传；表/结构/engine 层缺省
}

export interface DetectInput {
  code: string;
  filename?: string;       // 卡片 filename prop 原样透传（可能含路径）
}

export interface LanguageDetector {
  id: string;              // 'dld' | 'betlang' | 'hljs-auto' | 消费者自定义
  detect(input: DetectInput): Promise<DetectResult | null>;
}
```

裁决记录：

- **单一 canonical 命名空间**：检测器返回的 lang 与卡片 `lang` prop
  同域（本仓库 canonical id，如 `typescript`/`python`）。检测器内部
  完成标签收敛（betlang 的 `TypeScript` → `typescript`），卡片侧零
  翻译逻辑；canonical id 随后走 backend 自己的别名表与 curated 集
  （backend 的 reject 法则原样适用）。
- **Promise 返回**：同步层（L1-L3）也包 Promise——wasm 层天然异步，
  契约不允许双态。
- **`filename` 只透传**：文件名归属检测器（DLD L1 取扩展名 + 精确
    basename；自定义 detector 可读全名做特判）。
- **`AUTO_LANG` 常量而非联合类型**：`lang` prop 保持 `string`（存量
  调用零破坏）；哨兵值以导出常量 + 运行时 guard（trim 后全等
  `'auto'`，大小写敏感，其余含 "AUTO"/" auto " 的值一律按普通 lang
  处理并走 reject 法则）。

## D2 — 解析链、null 级联与接线模型

### D2.1 链与存在判据（完整决策表）

`lang === AUTO_LANG` 时按序解析检测器，每环"存在"判据如下：

| 环 | 存在判据 | 不存在时 |
|---|---|---|
| ① prop | `langDetector !== undefined` | 进② |
| ② context | `getContext(HIGHLIGHT_DETECT_KEY)` 返回对象且 `.detector` 为函数（组件窗口内） | 进③ |
| ③ backend | `backend.detector` 为函数 | 进④ |
| ④ 兜底 | **无第四环** | 运行时 reject：报"lang='auto' 需要检测器"，给出安装命令 + 一行接线指引 |

**null 级联法则**：某环 detector resolve 为 `null` = 该环无意见 →
**级联下一环**（"不冲突、互相补充"）；某环 reject/throw = 终态 →
纯文本回退 + console warn（报出该环 id 与错误）。四环皆 null（或
链尾前皆无意见且无③④可用）→ 纯文本回退 + warn（报出各环 id 与
"no language detected"）。

**链的语义推论**：prop 写了但返回 null，context/backend 仍有机会
（互补）；插件把 betlang 配成 context 默认后，betlang null 时 hljs
自带 detector 仍兜底。

### D2.2 接线模型（r1-B1 修正：零静态 import）

卡片与 core **不 import DLD 的任何 specifier**（动态也不行——
Vite/Rollup 在构建期解析静态字符串 specifier，裸消费者缺文件直接
构建失败，"运行时才 reject"不可实现）。

DLD 作为"默认检测器"的落地形态 = **context 默认值**：

- DLD item 发行 `<HighlightDetectDefault />`（~8 行 Svelte 组件：
  `setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() })`，
  仅用 registry-safe key，无内核依赖）。消费者在任意子树根 wrap 一行，
  该子树所有 `lang="auto"` 卡片吃到 DLD。
- 未装 DLD / 未接线：构建图零 DLD 字节；`lang="auto"` 运行时 reject
  （安装命令 + 接线指引进报错文本）。
- 文档站 dogfood：+layout 接线，playground 双 demo 走真实链路。

### D2.3 SSR / prerender / 检测时机

检测是异步运行时行为：预渲染产物恒为纯文本（渐进增强地板），
hydration 后首次 paint 才 resolveDetector → detect → 高亮。context
在 SSR 窗口内可用（Svelte context 法则），但 detect 永不跑在服务端。

## D3 — DLD 四层瀑布（每层独立懒模块）

```
defaultLangDetector()  ── 命中即短路，层层 fallback（层内 null 交上层瀑布语义）
  L1 filename   ext-table.ts      扩展名表 + 精确 basename 表（多行字符串）
  L2 shebang    shebang-table.ts  解释器表 + emacs 首行 modeline（多行字符串）
  L3 structure  structure.ts      纯 TS 探针（D3.2 冻结判据）
  L4 statistical betlang.ts       wasm 懒加载 + 48 标签映射表
```

### D3.1 表格式（Owner 指定：多行字符串）

```ts
// ext-table.ts —— 数据源 linguist languages.yml（commit SHA 见下）∩ canonical 集
// 歧义扩展名（heuristics.yml 138 组消解块内）不在此表，留给 L4
// mined-from: github-linguist/linguist@<commit-sha> lib/linguist/languages.yml
const EXT_TABLE = `
ts typescript
tsx tsx
py python
rb ruby
`;
// basename 表（linguist filenames 字段 ∩ canonical 支持集；精确全等，大小写敏感）
const BASENAME_TABLE = `
Dockerfile dockerfile
Makefile make
CMakeLists.txt cmake
`;
```

- 单空格分隔、换行分隔条目；`#` 起注释行。首次使用才 parse 成 Map，
  进程级缓存（多卡片共享）。basename 精确全等（`Makefile.old` 不命中）；
  扩展名取最后一个 `.` 后缀、小写化。
- shebang 表同构（解释器 basename → lang：`python3 python`）。挖掘时
  的 linguist commit SHA 落表头注释（再挖掘是手动动作，SHA 即数据版本）。

### D3.2 结构层冻结判据（r1-B8 修正：可验收伪码 + 阈值）

```
normalize(text):
  strip UTF-8 BOM；body = text.trim()；
  L1 = 第一个非空行（trim-start）；
  H  = body 前 512 字符；
  lines = body 非空行数组；n = lines.length

guard_Markdown（最高优先，命中则本层整体弃权 return null）:
  body 含 ``` 围栏（/^```/m 或 /^~~~/m）
  或 ≥2 行匹配标题 /^ {0,3}#{1,6}\s+\S/

P_JSON:  JSON.parse(body) 成功 → json                     // 硬判据，最先
P_SVG:   /^<svg[\s>]/.test(L1) → svg
         或 /^<\?xml[^>]*\?>\s*<svg[\s>]/.test(H) → svg    // SVG 优先于 XML
P_XML:   L1 以 '<?xml' 开头（大小写敏感，XML 声明规范如此）→ xml
P_HTML:  /^<!doctype\s+html/i.test(L1) → html
P_YAML:  n ≥ 3 且 lines[0] === '---'
         且 body 中 /^\s*[A-Za-z_][\w.-]*:(\s|$)/m 命中行占比 ≥ 60%（排除 '---' 分隔行）
P_TOML:  n ≥ 3 且 ≥1 行整行匹配 /^\[[A-Za-z0-9_.$-]+\]$/
         且 ≥2 行匹配 /^[A-Za-z_][\w.-]*\s=\s\S/（= 两侧有空格）
         且 lines[0] !== '---'
P_INI:   n ≥ 3 且 ≥1 行整行匹配 /^\[[A-Za-z0-9_.$ -]+\]\s*$/
         且 ≥2 行匹配 /^[A-Za-z_][\w.-]*=[^=]/（= 无左侧空格）
         且 P_TOML 未命中（TOML 优先：空格 = 是 TOML 的强标记）
顺序：guard_Markdown → P_JSON → P_SVG → P_XML → P_HTML → P_YAML → P_TOML → P_INI → null
```

- **Markdown 守卫优先于一切结构声明**（Owner 的干扰担忧工程化）：
  围栏或标题密度出现 → 本层弃权，样本穿透到 L4。
- front-matter 边界：`---` + YAML keys + `---` + 含 Markdown 标记的
  正文 → guard 弃权（判为 markdown 语境）；纯 `---`+keys+`---`+keys
  多文档无 md 标记 → yaml。正负样本矩阵锁死该边界。
- `[title](url)` 类 markdown 链接不触发 section 判据（section 要求
  整行匹配 `^\[…\]$`）。
- **本层永不做编程语言指纹**：Rust/Go/Kotlin/Swift 指纹样本必须穿透
  到 L4（负样本矩阵固定项）。

### D3.3 层间短路与懒加载

- 每层一个模块，`defaultLangDetector()` 闭包内逐层 `await import()`：
  L1 命中后 L2-L4 模块零字节加载。
- 表 parse 结果模块级缓存。
- `betlangDetector()` 独立导出：直连 L4 统计检测器（插件配默认 /
  显式 prop 用，跳过 L1-L3）。

## D4 — betlang wasm 通道（r1-B6/B7 修正：通道冻结 + KiB 预算律）

**探测结论（evidence/betlang-probe-2026-09-07.md）**：lean 绑定 raw
97.7KiB / gzip 57.1KiB —— betlang 进 DLD L4 作默认统计层。

**发行通道（冻结为 A，删除 B 的规范地位）**：自建
`@jixoai/betlang-wasm` npm 包，仓库位置 `packages/betlang-wasm/`：

- 构建源：Cargo.toml 钉死 `betlang = "=0.1.1"`，Cargo.lock 入库，
  `.github/workflows/betlang-wasm-release.yml`（rustup toolchain +
  wasm32-unknown-unknown target + `--locked` 构建 + npm provenance
  发布）。
- 包内容：wasm + 手写 ~40 行 JS 装载器（线性内存 UTF-8 ABI，无
  wasm-bindgen 胶水——bindgen 使 raw 增约 3-8KB 可能越线）+ `.d.ts`
  + MIT/上游归属。首版 `0.1.1`（镜像 crate 版本）。
- 完整性：发布物 sha256（wasm + tarball）、构建工具链版本（rustc/
  LLVM）、字节精确尺寸入 `packages/betlang-wasm/ARTIFACT.md`；
  `scripts/verify-betlang-pin.mjs` 核验 sha256 + magic bytes
  (`\0asm`) + 双预算。

**KiB 预算律（字节精确，KiB=1024B）**：

| 口径 | 预算 | 实测（lean probe） | 余量 |
|---|---|---|---|
| raw | ≤ 100 KiB（102,400 B） | 97.7 KiB | 2.3 KiB |
| gzip（Node zlib.gzipSync level 9，算法冻结） | ≤ 70 KiB（71,680 B） | 57.1 KiB | 12.9 KiB |
| 预警线 raw | 98 KiB（100,352 B） | — | 余 0.3 KiB |

**降级预案（Owner 预案冻结）**：最终发行物（真实装载器导出 + 全
entry）raw 越预警线 → betlang 转**非默认** detector item（手动启用/
插件配置），DLD 收缩三层，本变更相应改写 L4 章后再送审；linguist
heuristics 完整移植维持 Non-Goal。任务 4.1 以最终发行物复测为验收。

**公共法则**：二进制不入 git、不入 registry payload（ghostty 法则
原文沿用）；npm 是唯一发行通道（供应链 = 消费者 lockfile，tree-sitter
法则延续）。

**wasm 装载 seam（tree-sitter 四象限同构）**：`wasmLoader(asset) →
{ url } | { bytes }`；浏览器 `?url`（vite 资产发射）/ Node·vitest
`createRequire + readFile` bytes —— 测试跑真实 wasm，不 mock。

**标签映射**：48 标签全表 → canonical id 内嵌多行字符串（含 betlang
版本绑定注释）；无对应标签（`gemfile`/`gemspec`/`vba`/`verilog` 等）
→ null + 一次性 warn（Set 缓存，每标签每进程至多一条）。低置信度
（校准概率分裂）：仍返回 top1 + confidence 原值，消费者自行取舍。

## D5 — registry 结构与边活性

```
highlight (core)            + lang-detector.ts（契约 + AUTO_LANG；零 npm 依赖）
                            context-key.ts + HIGHLIGHT_DETECT_KEY（registry-safe 身份）
highlight-lang-detector     新 item：L1-L3 纯 TS + betlang 通道 + <HighlightDetectDefault/>
                              deps: @jixoai/highlight, @jixoai/betlang-wasm
                              runtime import HIGHLIGHT_DETECT_KEY（接线组件）——边活性真实
highlight-highlightjs       + detector 槽位接线（D7 语义）
code-card                   + langDetector prop、AUTO_LANG 路径
```

- DLD 对 core 的依赖是**真实 runtime import**（接线组件 import
  `HIGHLIGHT_DETECT_KEY` 与 `AUTO_LANG` 常量）——verify-deps 跳过
  `import type`，纯类型边会判 dead（r1-B4）。
- `verify:shadcn-add` 派生**双 case**：裸 code-card（构建零 DLD 字节
  断言 + 运行时 reject）与 code-card+DLD（一行接线 + `lang="auto"`
  端到端）。
- `HIGHLIGHT_DETECT_DEF` + `createHighlightDetectContext` 为
  **site-only**（`lib/highlight/context.svelte.ts`，与 HIGHLIGHT_DEF
  同法——context-key.ts 头注释的既有二分：registry-safe 身份随 core，
  内核编排属站点）。context.svelte.ts 增补 def 时镜像两树同步。

## D6 — 显式不做（Non-Goals）

- 不做检测缓存层（同 code 跨卡片复用）——后续有真实需求再立项。
- 不做 linguist heuristics 的完整 JS 移植（138 组）——仅作 L1 排除表
  来源与 B 方案储备（betlang 降级时也不自动启用，另立项）。
- 不做 betlang 之外的统计引擎抽象（第二个实现出现时再抽公共）。
- 不改 `lang` prop 的联合类型（AUTO_LANG 常量 + guard）。
- 不做 confidence 的卡片侧行为（v1 透传，消费者/插件自行取舍）。

## D7 — hljs detector 语义冻结（r1-B5）

```
highlightJs({ langs }).detector:
  detect({ code })                      // filename 被忽略
    langs 集（factory 闭包，canonical）为空 → null（无候选，不级联误报）
    否则：懒加载并注册该集到【本实例私有 lib/core】（与其他实例、
          全局注册表零串扰）→ highlightAuto(code) 跑且仅跑已注册集
    命中 → { lang: 实例别名表收敛为 canonical, source: 'engine' }（无 confidence）
    无命中 / 部分注册失败 → null（级联语义交还链）
```

测试锁死：空 langs → null；双实例不同 allowlist 互不可见（A 注册
ts、B 注册 css；A 的 detector 检不出 css 样本）；无命中 → null；
构造不 paint 时 detector 不预注册（零额外加载直到首次 detect）。
