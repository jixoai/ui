# highlight-lang-detector — 语言检测能力：LanguageDetector 抽象 + DLD 四层探测器

## Why

Owner 需求（2026-09-07，引擎矩阵收尾四问之 Q4 的正式立项）：

> 新增一个 langDetector 属性，我们将 backend 进一步抽象出 langDetector
> 能力。highlightjs 默认使用自带的（highlightAuto）。我们则是提供一个
> 轻量级的 fallback 方案。backend 本身可能携带 detector，LanguageDetector
> 则是明确使用某种 detector，它们不冲突，但是互相补充。后续我们称默认
> detector（fallback 方案）为 DLD（defaultLangDetector）。
>
> 1. DLD 按需加载，默认不引入；DLD 本身是多层，每层也是按需加载
> 2. 提供 `lang="auto"` 属性启用检测；langDetector 属性指向一个
>    LanguageDetector 检测器，默认值就是我们内置的检测器
> 3. filename/ext：DLD 检测的第一道门槛，extension mapping 表用高效
>    结构表达（体积不小，整理成多行字符串）
> 4. shebang/meta：`#!/usr/bin/env python3` 类内容，需要 shebang 表
> 5. 特殊结构识别：XML/HTML/SVG（首行特征）/ JSON（直接 parse）/
>    YAML/TOML/INI（正则特征碰撞）——本层**不做编程语言检测**（哪怕
>    Rust/Go/Kotlin/Swift 指纹明显），因为 Markdown 干扰太重；只做
>    开头或全篇即可确判的特征，可靠性高、代价轻
> 6. 统计式语言识别：参考 betlang（编译 wasm 测体积，≤100KB 可用）；
>    否则参考 linguist 的 languages.yml + heuristics.yml。betlang 若
>    超标可作为非默认 detector 供手动启用（plugin 可配为默认项）

现状（2026-09-06 `highlight-engine-matrix` 已归档）：六引擎矩阵、
`HighlightBackend` 契约、`prop → context → DEFAULT_SHIKI_BACKEND` 解析链、
失败法则（reject 带提示 → 纯文本回退）全部就位。检测是横切能力，不在
任何引擎内部。

## What Changes

**L1 — LanguageDetector 契约与解析链（core item 扩展）**

- `lib/highlight/lang-detector.ts`（随 `highlight` core item 发行，保持
  零 npm 依赖）：`LanguageDetector` 接口 + `DetectResult`（lang +
  source 分层标记 + 可选 confidence）+ `HIGHLIGHT_DETECT_KEY` context
  seam（context-key.ts 同款零依赖 seam；站点内核侧 `HIGHLIGHT_DETECT_DEF`
  供插件投影默认 detector —— betlang 可经 plugin 配为全站默认）。
- `HighlightBackend` 增加可选 `detector?: LanguageDetector` 槽位：
  引擎自带检测能力（highlight.js 的 highlightAuto）经此暴露，不与
  显式 detector 冲突。
- `code-card` 新增 `langDetector` prop；`lang="auto"` 触发检测。
  解析链：**`langDetector` prop → context 默认（插件可配）→
  backend.detector → DLD（懒加载兜底）**。
- 检测产物 lang 走既有别名/curated/reject 法则 —— 检测只负责"给出
  lang"，高亮边界一寸不动。

**L2 — DLD（defaultLangDetector）：四层瀑布，层层按需**

新 registry item `highlight-lang-detector`（`defaultLangDetector()` 工厂
+ `betlangDetector()` 直连导出）。每层独立懒模块，前一层命中即短路：

1. **filename/ext**：扩展名映射表，多行字符串常量（`"ts typescript\n
   tsx tsx\n…"`），首次使用才 parse 成 Map。数据源 = linguist
   languages.yml 的 extensions ∩ 我们 canonical 集；歧义扩展名
   （heuristics.yml 的 138 组消解块命中的）**不进 L1**，留给 L4。
2. **shebang**：解释器映射表（同样多行字符串），`python3 → python`、
   `node → javascript`、`zsh → bash`…。数据源 = languages.yml 的
   interpreters 字段。
3. **特殊结构**：`<?xml` / `<!DOCTYPE html` / `<svg` 根元素首行探针；
   JSON 全文 parse 探针；YAML/TOML/INI 保守正则特征碰撞（只在互斥
   标记确判时声明）。**本层不做编程语言指纹**（Markdown 干扰法则，
   Owner 原话）。纯 TS 零依赖。
4. **统计式（betlang）**：wasm 探测实证**过门槛**（见
   evidence/betlang-probe-2026-09-07.md）：lean 绑定 raw 97.7KB /
   gzip 57.1KB（含 47.8KB 内嵌模型；opt-level=z + lto + panic=abort），
   双口径均 ≤ 100KB；48 输出标签；held-out 准确率 94.2%；8/8 样本
   实测全对。48 标签 → canonical id 映射表内嵌，映射不到的标签按
   null 处理（纯文本法则）。
   wasm 通道裁决（design D4）：无官方 npm wasm 包（npm 的 betlang@
   0.0.0 为占位空包）——首选**自建 `@jixoai/betlang-wasm` npm 通道**
   （tree-sitter 的 lockfile 供应链法则延续：CI 从钉死的 crates.io
   版本构建，sha256 + 尺寸门禁核验）；备选 GitHub release 资产 +
   pin manifest（ghostty 法则延续）。**二进制不入 git** 在两条通道
   下都成立。

**L3 — highlight.js 自带 detector 接线**

`highlight-highlightjs` item：backend 工厂挂 `detector`（highlightAuto
跑该实例**已注册**的 langs 集 —— 检测范围即 langs 子集，与瘦身选项
天然联动）。其余五引擎无内建检测，天然落到 DLD。

**L4 — 门禁与文档**

- 契约测试：四层各层命中/未命中短路、解析链四环、hljs detector 注册
  集边界、`lang="auto"` + filename 端到端上色、Markdown 干扰负样本。
- betlang wasm 门禁：sha256 + magic bytes + 双口径尺寸预算（raw 与
  gzip 各自预算门禁，raw 100KB / gzip 70KB，实测 97.7/57.1 留余量）。
- verify:shadcn-add 自动派生新 item 隔离 case；code-card 文档页新增
  lang="auto" 段落与 playground 实演；registry docs 同步。

## 破坏性变更

无。全部增量：新 prop、新可选槽位、新 item；存量卡片行为逐字节不变
（lang 默认 'ts'，不写 auto 永不触发检测路径）。

## 依据与探测（evidence/）

- `betlang-probe-2026-09-07.md` —— wasm 构建命令、尺寸矩阵（朴素
  114.5KB→lean 97.7KB raw / 62.8→57.1KB gzip）、8 样本检测全对、
  fearless_simd 需 rustup 工具链（Homebrew rust 缺 wasm std 的坑）、
  官方 npm 渠道缺失结论。
- linguist 盘点 —— languages.yml 165KB / 2069 语言（extensions +
  interpreters 字段为 L1/L2 数据源）；heuristics.yml 40KB / 138 组
  扩展名歧义消解块（L1 排除表 + betlang 不可用时的 B 方案数据源）。
